import type { Page } from "@playwright/test";

import { CRYPT_KEEPER_PASSWORD } from "../constants";
import { type TestExtension, expect } from "../fixtures";
import { CryptKeeper } from "../pages";

export async function createAccount({ app }: TestExtension): Promise<void> {
  const cryptKeeper = await connectCryptKeeper(app);

  await cryptKeeper.createAccount(CRYPT_KEEPER_PASSWORD);
  await cryptKeeper.approve();

  await cryptKeeper.close();
}

export async function lockAccount({ app, cryptKeeperExtensionId }: TestExtension): Promise<void> {
  const cryptKeeper = new CryptKeeper(app);
  await cryptKeeper.openPopup(cryptKeeperExtensionId);

  await cryptKeeper.lock();
}

export async function connectWallet({ app, cryptKeeperExtensionId }: TestExtension): Promise<void> {
  const cryptKeeper = new CryptKeeper(app);
  await cryptKeeper.openPopup(cryptKeeperExtensionId);

  await cryptKeeper.connectWallet();
}

export async function unlockAccount({ app, cryptKeeperExtensionId }: TestExtension): Promise<void> {
  const cryptKeeper = new CryptKeeper(app);
  await cryptKeeper.openPopup(cryptKeeperExtensionId);

  await cryptKeeper.unlock(CRYPT_KEEPER_PASSWORD);
}

const CRYPT_KEEPER_CONNECT_TIMEOUT_MS = 3000;

async function connectCryptKeeper(app: Page): Promise<CryptKeeper> {
  await expect(app).toHaveTitle(/Crypt-keeper Extension demo/);
  await expect(app.getByText(/Please connect to Crypt-Keeper to continue./)).toBeVisible();

  const [popup] = await Promise.all([
    app.context().waitForEvent("page"),
    app.getByText("Connect", { exact: true }).click(),
    app.waitForTimeout(CRYPT_KEEPER_CONNECT_TIMEOUT_MS),
  ]);

  return new CryptKeeper(popup);
}
