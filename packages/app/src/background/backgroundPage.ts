import { IRequestHandler } from "@cryptkeeperzk/types";
import log from "loglevel";
import browser, { type Runtime } from "webextension-polyfill";

import "@src/background/appInit";
import CryptKeeperController from "@src/background/cryptKeeper";
import { sendReadyMessageToTabs } from "@src/background/shared/browser";
import { createChromeOffscreen, deferredPromise, getBrowserPlatform } from "@src/background/shared/utils";
import { isDebugMode } from "@src/config/env";
import { BrowserPlatform } from "@src/constants";

log.setDefaultLevel(isDebugMode() ? "debug" : "info");

const {
  promise: isInitialized,
  resolve: resolveInitialization,
  reject: rejectInitialization,
} = deferredPromise<unknown>();

browser.runtime.onInstalled.addListener(async () => {
  log.debug("CryptKeeper onInstalled Event, initializing...");
  await isInitialized;
  log.debug("CryptKeeper onInstalled Event, initializing completed...");
});

browser.runtime.onConnect.addListener(async () => {
  log.debug("CryptKeeper onConnect Event, initializing...");
  await isInitialized;
  log.debug("CryptKeeper onConnect Event, initializing completed...");
});

const SAVE_TIMESTAMP_INTERVAL_MS = 2 * 1000;

function saveTimestamp() {
  const timestamp = new Date().toISOString();

  browser.storage.session.set({ timestamp });
}

let intervalId: NodeJS.Timeout | undefined;

const initialize = async () => {
  clearInterval(intervalId);
  saveTimestamp();
  intervalId = setInterval(saveTimestamp, SAVE_TIMESTAMP_INTERVAL_MS);

  try {
    const browserPlatform = getBrowserPlatform();
    const app = new CryptKeeperController();

    app.initialize();

    browser.runtime.onMessage.addListener(async (request: IRequestHandler, sender: Runtime.MessageSender) => {
      log.debug("Background: request: ", request);

      if (browserPlatform !== BrowserPlatform.Firefox && request.source === "offscreen") {
        await createChromeOffscreen();
      }

      try {
        const response = await app.handle(request, sender);
        log.debug("Background: response: ", response);
        return [null, response];
      } catch (e) {
        return [(e as Error).message, null];
      }
    });

    await sendReadyMessageToTabs();

    resolveInitialization?.(true);
  } catch (error) {
    rejectInitialization?.(error);
  }
};

initialize()
  .then(() => {
    log.debug("CryptKeeper initialization complete.");
  })
  .catch(() => {
    log.warn("CryptKeeper initialization error.");
  });
