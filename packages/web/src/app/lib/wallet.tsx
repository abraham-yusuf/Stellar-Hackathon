"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
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
let walletKitInitError: string | null = null;

const networkByName: Record<string, Networks> = {
  testnet: Networks.TESTNET,
  public: Networks.PUBLIC,
  mainnet: Networks.PUBLIC,
  futurenet: Networks.FUTURENET,
  sandbox: Networks.SANDBOX,
  standalone: Networks.STANDALONE,
};

function initializeWalletKit() {
  if (walletKitInitialized || walletKitInitError !== null || typeof window === "undefined") return;

  try {
    const configuredNetwork = process.env.NEXT_PUBLIC_STELLAR_NETWORK?.toLowerCase() ?? "testnet";
    const walletNetwork = networkByName[configuredNetwork] ?? Networks.TESTNET;

    StellarWalletsKit.init({
      network: walletNetwork,
      selectedWalletId: FREIGHTER_ID,
      modules: defaultModules(),
    });
    walletKitInitialized = true;
  } catch (err) {
    walletKitInitError = err instanceof Error ? err.message : "Wallet toolkit initialization failed.";
  }
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const isMountedRef = useRef(true);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState<string | null>(null);
  const [networkPassphrase, setNetworkPassphrase] = useState<string | null>(null);
  const [networkName, setNetworkName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeWalletKit();
    if (walletKitInitError !== null) {
      setLoading(false);
      setError(`Wallet initialization failed. ${walletKitInitError}`);
    }
  }, []);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (walletKitInitError !== null) {
      setLoading(false);
      setError(`Wallet initialization failed. ${walletKitInitError}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [addressResult, networkResult] = await Promise.all([
        StellarWalletsKit.getAddress(),
        StellarWalletsKit.getNetwork(),
      ]);
      if (!addressResult.address) {
        throw new Error("Wallet returned no address.");
      }
      if (!networkResult.networkPassphrase || !networkResult.network) {
        throw new Error("Wallet returned incomplete network details.");
      }

      setConnected(true);
      setAddress(addressResult.address);
      setNetworkPassphrase(networkResult.networkPassphrase);
      setNetworkName(networkResult.network);
    } catch (err) {
      setConnected(false);
      setAddress(null);
      setNetworkPassphrase(null);
      setNetworkName(null);
      setError(
        err instanceof Error
          ? err.message
          : "Wallet connection failed. Please ensure your wallet extension is installed and enabled.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const connect = useCallback(async () => {
    if (walletKitInitError !== null) {
      setError(`Wallet initialization failed. ${walletKitInitError}`);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      StellarWalletsKit.setWallet(FREIGHTER_ID);
      await StellarWalletsKit.authModal();

      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      const isCancellation = /cancel|declin|denied|rejected|closed/i.test(message);
      setError(
        isCancellation
          ? "Wallet connection was cancelled."
          : err instanceof Error
            ? err.message
            : "Wallet connection failed. Please ensure your wallet extension is installed and enabled.",
      );
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const disconnect = useCallback(() => {
    void StellarWalletsKit.disconnect().catch((err) => {
      // Keep local disconnect state while surfacing wallet disconnect errors.
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : "Local disconnect succeeded but wallet cleanup failed.");
      }
    });
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
      if (!signed.signedTxXdr) {
        throw new Error("Wallet returned an invalid signed transaction response.");
      }
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
