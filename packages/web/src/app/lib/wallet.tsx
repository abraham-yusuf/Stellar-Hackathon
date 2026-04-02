"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  getAddress,
  getNetworkDetails,
  isAllowed,
  isConnected,
  setAllowed,
  signTransaction,
} from "@stellar/freighter-api";

type WalletState = {
  connected: boolean;
  loading: boolean;
  address: string | null;
  networkPassphrase: string | null;
  networkName: string | null;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  refresh: () => Promise<void>;
  signXdr: (xdr: string) => Promise<string>;
};

const WalletContext = createContext<WalletState | null>(null);

function extractFreighterErrorMessage(result: { error?: { message?: string } } | null | undefined): string | null {
  return result?.error?.message ?? null;
}

function withFreighterError(result: { error?: { message?: string } }, fallback: string): void {
  const message = extractFreighterErrorMessage(result);
  if (message !== null) {
    throw new Error(message || fallback);
  }
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState<string | null>(null);
  const [networkPassphrase, setNetworkPassphrase] = useState<string | null>(null);
  const [networkName, setNetworkName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const connectedResult = await isConnected();
      withFreighterError(connectedResult, "Unable to detect Freighter.");

      if (!connectedResult.isConnected) {
        setConnected(false);
        setAddress(null);
        setNetworkPassphrase(null);
        setNetworkName(null);
        return;
      }

      const allowedResult = await isAllowed();
      withFreighterError(allowedResult, "Unable to check wallet permissions.");

      if (!allowedResult.isAllowed) {
        setConnected(false);
        setAddress(null);
        setNetworkPassphrase(null);
        setNetworkName(null);
        return;
      }

      const [addressResult, networkResult] = await Promise.all([getAddress(), getNetworkDetails()]);
      withFreighterError(addressResult, "Unable to read wallet address.");
      withFreighterError(networkResult, "Unable to read wallet network.");

      setConnected(true);
      setAddress(addressResult.address);
      setNetworkPassphrase(networkResult.networkPassphrase);
      setNetworkName(networkResult.network);
    } catch (err) {
      setConnected(false);
      setAddress(null);
      setNetworkPassphrase(null);
      setNetworkName(null);
      setError(err instanceof Error ? err.message : "Wallet connection failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const connect = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const connectedResult = await isConnected();
      withFreighterError(connectedResult, "Unable to detect Freighter.");

      if (!connectedResult.isConnected) {
        throw new Error("Freighter extension not detected. Install it from freighter.app.");
      }

      const allowResult = await setAllowed();
      withFreighterError(allowResult, "Wallet permission request failed.");

      if (!allowResult.isAllowed) {
        throw new Error("Wallet access was not granted.");
      }

      await refresh();
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const disconnect = useCallback(() => {
    setConnected(false);
    setAddress(null);
    setNetworkPassphrase(null);
    setNetworkName(null);
    setError(null);
  }, []);

  const signXdr = useCallback(
    async (xdr: string) => {
      if (!connected || !address) {
        throw new Error("Connect your wallet before signing.");
      }

      const signed = await signTransaction(xdr, {
        networkPassphrase: networkPassphrase ?? undefined,
        address,
      });

      withFreighterError(signed, "Transaction signing failed.");
      return signed.signedTxXdr;
    },
    [address, connected, networkPassphrase],
  );

  const value = useMemo<WalletState>(
    () => ({
      connected,
      loading,
      address,
      networkPassphrase,
      networkName,
      error,
      connect,
      disconnect,
      refresh,
      signXdr,
    }),
    [address, connect, connected, disconnect, error, loading, networkName, networkPassphrase, refresh, signXdr],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletState {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used inside WalletProvider");
  }
  return context;
}
