import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useWallet } from '../hooks/useWallet';
import type { WalletState } from '../types';
import { ethers } from 'ethers';

interface WalletContextType {
  walletState: WalletState;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  isChainSupported: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const walletHook = useWallet();

  const value: WalletContextType = {
    walletState: {
      isConnected: walletHook.isConnected,
      address: walletHook.address,
      chainId: walletHook.chainId,
      isConnecting: walletHook.isConnecting,
      error: walletHook.error,
    },
    provider: walletHook.provider,
    signer: walletHook.signer,
    connect: walletHook.connect,
    disconnect: walletHook.disconnect,
    switchNetwork: walletHook.switchNetwork,
    isChainSupported: walletHook.isChainSupported,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
};