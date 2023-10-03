import { IIdentityData } from "@cryptkeeperzk/types";
import { getLinkPreview } from "link-preview-js";
import { type SyntheticEvent, useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";
import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import {
  connectIdentity,
  fetchIdentities,
  useConnectedIdentity,
  useLinkedIdentities,
  useUnlinkedIdentities,
} from "@src/ui/ducks/identities";

export interface IUseConnectIdentityData {
  urlOrigin: string;
  faviconUrl: string;
  selectedTab: EConnectIdentityTabs;
  linkedIdentities: IIdentityData[];
  unlinkedIdentities: IIdentityData[];
  selectedIdentityCommitment?: string;
  onTabChange: (event: SyntheticEvent, value: EConnectIdentityTabs) => void;
  onSelectIdentity: (identityCommitment: string) => void;
  onReject: () => void;
  onConnect: () => void;
}

export enum EConnectIdentityTabs {
  LINKED,
  UNLINKED,
}

export const useConnectIdentity = (): IUseConnectIdentityData => {
  const { searchParams } = new URL(window.location.href.replace("#", ""));
  const urlOrigin = useMemo(() => searchParams.get("urlOrigin")!, [searchParams.toString()]);

  const connectedIdentity = useConnectedIdentity();
  const linkedIdentities = useLinkedIdentities(urlOrigin);
  const unlinkedIdentities = useUnlinkedIdentities();

  const [faviconUrl, setFaviconUrl] = useState("");
  const [selectedTab, setSelectedTab] = useState<EConnectIdentityTabs>(EConnectIdentityTabs.LINKED);
  const [selectedIdentityCommitment, setSelectedIdentityCommitment] = useState<string>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const onTabChange = useCallback(
    (_: SyntheticEvent, value: EConnectIdentityTabs) => {
      setSelectedTab(value);
    },
    [setSelectedTab],
  );

  const onSelectIdentity = useCallback(
    (identityCommitment: string) => {
      setSelectedIdentityCommitment(identityCommitment);
    },
    [setSelectedIdentityCommitment],
  );

  const onReject = useCallback(() => {
    dispatch(closePopup()).then(() => {
      console.log("Inside Connect Identity reject")
      navigate(Paths.HOME);
    });
  }, [dispatch, navigate]);

  const onConnect = useCallback(async () => {
    await dispatch(connectIdentity({ identityCommitment: selectedIdentityCommitment!, urlOrigin }));
    await dispatch(closePopup()).then(() => {
      console.log("Inside Connect Identity connect")
      navigate(Paths.HOME);
    });
  }, [selectedIdentityCommitment, urlOrigin, dispatch]);

  useEffect(() => {
    console.log("Inside Connect Identity page")
    dispatch(fetchIdentities());
  }, [dispatch]);

  useEffect(() => {
    if (connectedIdentity?.commitment) {
      setSelectedIdentityCommitment(connectedIdentity.commitment);
    }
  }, [connectedIdentity?.commitment]);

  useEffect(() => {
    if (unlinkedIdentities.length === 0) {
      setSelectedTab(EConnectIdentityTabs.LINKED);
    } else if (linkedIdentities.length === 0) {
      setSelectedTab(EConnectIdentityTabs.UNLINKED);
    }
  }, [linkedIdentities.length, unlinkedIdentities.length, setSelectedTab]);

  useEffect(() => {
    getLinkPreview(urlOrigin)
      .then((data) => {
        const [favicon] = data.favicons;
        setFaviconUrl(favicon);
      })
      .catch(() => undefined);
  }, [urlOrigin]);

  return {
    urlOrigin,
    faviconUrl,
    selectedTab,
    linkedIdentities,
    unlinkedIdentities,
    selectedIdentityCommitment,
    onTabChange,
    onReject,
    onConnect,
    onSelectIdentity,
  };
};
