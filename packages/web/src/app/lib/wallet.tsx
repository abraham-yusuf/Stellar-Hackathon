"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  Networks,
  StellarWalletsKit,
} from "@creit.tech/stellar-wallets-kit";
import { FREIGHTER_ID } from "@creit.tech/stellar-wallets-kit/modules/freighter";
import { defaultModules } from "@creit.tech/stellar-wallets-kit/modules/utils";

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

let walletKitInitialized = false;

function initWalletKit() {
  if (walletKitInitialized) return;
  StellarWalletsKit.init({
    network: Networks.TESTNET,
    selectedWalletId: FREIGHTER_ID,
    modules: defaultModules(),
  });
  walletKitInitialized = true;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  initWalletKit();

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
      const [addressResult, networkResult] = await Promise.all([
        StellarWalletsKit.getAddress(),
        StellarWalletsKit.getNetwork(),
      ]);

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
      StellarWalletsKit.setWallet(FREIGHTER_ID);
      await StellarWalletsKit.authModal();

      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wallet connection failed.");
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const disconnect = useCallback(() => {
    void StellarWalletsKit.disconnect().catch(() => undefined);
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

      const signed = await StellarWalletsKit.signTransaction(xdr, {
        networkPassphrase: networkPassphrase ?? undefined,
        address,
      });
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
