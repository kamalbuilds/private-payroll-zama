import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import type { WalletState } from '../types';
import { SUPPORTED_CHAINS } from '../utils/constants';
import toast from 'react-hot-toast';

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    isConnecting: false,
    error: null,
  });

  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

  // Check if wallet is already connected
  useEffect(() => {
    checkConnection();
  }, []);

  // Listen to account and network changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          setWalletState(prev => ({
            ...prev,
            address: accounts[0],
            isConnected: true,
          }));
        }
      };

      const handleChainChanged = (chainId: string) => {
        const newChainId = parseInt(chainId, 16);
        setWalletState(prev => ({
          ...prev,
          chainId: newChainId,
        }));
        
        if (!isChainSupported(newChainId)) {
          toast.error('Please switch to a supported network');
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const checkConnection = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const network = await provider.getNetwork();
          const signer = await provider.getSigner();
          
          setProvider(provider);
          setSigner(signer);
          setWalletState({
            isConnected: true,
            address: accounts[0].address,
            chainId: Number(network.chainId),
            isConnecting: false,
            error: null,
          });
        }
      }
    } catch (error) {
      console.error('Failed to check wallet connection:', error);
    }
  };

  const connect = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      const error = 'MetaMask not detected. Please install MetaMask.';
      setWalletState(prev => ({ ...prev, error }));
      toast.error(error);
      return;
    }

    setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setProvider(provider);
      setSigner(signer);
      
      setWalletState({
        isConnected: true,
        address,
        chainId: Number(network.chainId),
        isConnecting: false,
        error: null,
      });

      if (!isChainSupported(Number(network.chainId))) {
        toast.error('Please switch to a supported network');
      } else {
        toast.success('Wallet connected successfully!');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to connect wallet';
      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }));
      toast.error(errorMessage);
    }
  }, []);

  const disconnect = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setWalletState({
      isConnected: false,
      address: null,
      chainId: null,
      isConnecting: false,
      error: null,
    });
    toast.success('Wallet disconnected');
  }, []);

  const switchNetwork = useCallback(async (chainId: number) => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      // If the network is not added to the user's wallet
      if (error.code === 4902) {
        try {
          await addNetwork(chainId);
        } catch (addError) {
          toast.error('Failed to add network');
        }
      } else {
        toast.error('Failed to switch network');
      }
    }
  }, []);

  const addNetwork = async (chainId: number) => {
    if (!window.ethereum) return;

    const networkConfig = getNetworkConfig(chainId);
    if (!networkConfig) {
      toast.error('Network configuration not found');
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [networkConfig],
      });
    } catch (error) {
      throw error;
    }
  };

  const isChainSupported = (chainId: number): boolean => {
    return Object.values(SUPPORTED_CHAINS).includes(chainId);
  };

  const getNetworkConfig = (chainId: number) => {
    const configs: Record<number, any> = {
      [SUPPORTED_CHAINS.ZAMA_DEVNET]: {
        chainId: `0x${SUPPORTED_CHAINS.ZAMA_DEVNET.toString(16)}`,
        chainName: 'Zama Devnet',
        nativeCurrency: {
          name: 'ZAMA',
          symbol: 'ZAMA',
          decimals: 18,
        },
        rpcUrls: ['https://devnet.zama.ai'],
        blockExplorerUrls: ['https://explorer.devnet.zama.ai'],
      },
      [SUPPORTED_CHAINS.ZAMA_TESTNET]: {
        chainId: `0x${SUPPORTED_CHAINS.ZAMA_TESTNET.toString(16)}`,
        chainName: 'Zama Testnet',
        nativeCurrency: {
          name: 'ZAMA',
          symbol: 'ZAMA',
          decimals: 18,
        },
        rpcUrls: ['https://testnet.zama.ai'],
        blockExplorerUrls: ['https://explorer.testnet.zama.ai'],
      },
    };

    return configs[chainId];
  };

  return {
    ...walletState,
    provider,
    signer,
    connect,
    disconnect,
    switchNetwork,
    isChainSupported: walletState.chainId ? isChainSupported(walletState.chainId) : false,
  };
};

// Extend window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}