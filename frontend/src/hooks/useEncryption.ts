import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { FHEManager, getFHEManager } from '../utils/encryption';
import type { EncryptionContext } from '../types';
import toast from 'react-hot-toast';

export const useEncryption = (provider?: ethers.Provider) => {
  const [context, setContext] = useState<EncryptionContext>({
    publicKey: null,
    isInitialized: false,
    error: null,
  });

  const [fheManager, setFheManager] = useState<FHEManager | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    if (provider) {
      initializeEncryption();
    }
  }, [provider]);

  const initializeEncryption = useCallback(async () => {
    if (isInitializing) return;
    
    setIsInitializing(true);
    setContext(prev => ({ ...prev, error: null }));

    try {
      const manager = getFHEManager(provider);
      await manager.initialize();
      
      setFheManager(manager);
      setContext({
        publicKey: manager.getPublicKey(),
        isInitialized: true,
        error: null,
      });
      
      toast.success('Encryption initialized successfully');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to initialize encryption';
      setContext(prev => ({
        ...prev,
        error: errorMessage,
      }));
      toast.error(errorMessage);
    } finally {
      setIsInitializing(false);
    }
  }, [provider, isInitializing]);

  const encryptValue = useCallback(async (value: number | bigint): Promise<string> => {
    if (!fheManager || !context.isInitialized) {
      throw new Error('Encryption not initialized');
    }

    try {
      return await fheManager.encryptUint64(value);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to encrypt value';
      toast.error(errorMessage);
      throw error;
    }
  }, [fheManager, context.isInitialized]);

  const decryptValue = useCallback(async (
    encryptedValue: string,
    userAddress: string
  ): Promise<bigint> => {
    if (!fheManager || !context.isInitialized) {
      throw new Error('Encryption not initialized');
    }

    try {
      return await fheManager.decryptUint64(encryptedValue, userAddress);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to decrypt value';
      toast.error(errorMessage);
      throw error;
    }
  }, [fheManager, context.isInitialized]);

  const canDecryptValue = useCallback((
    userAddress: string,
    encryptedValue: string
  ): boolean => {
    if (!fheManager || !context.isInitialized) {
      return false;
    }

    return fheManager.canDecrypt(userAddress, encryptedValue);
  }, [fheManager, context.isInitialized]);

  const encryptSalary = useCallback(async (salaryInCents: number): Promise<string> => {
    if (salaryInCents <= 0) {
      throw new Error('Salary must be greater than 0');
    }

    return await encryptValue(salaryInCents);
  }, [encryptValue]);

  const encryptBonus = useCallback(async (bonusInCents: number): Promise<string> => {
    if (bonusInCents < 0) {
      throw new Error('Bonus cannot be negative');
    }

    return await encryptValue(bonusInCents);
  }, [encryptValue]);

  const decryptSalary = useCallback(async (
    encryptedSalary: string,
    userAddress: string
  ): Promise<number> => {
    const decryptedValue = await decryptValue(encryptedSalary, userAddress);
    return Number(decryptedValue);
  }, [decryptValue]);

  const decryptBonus = useCallback(async (
    encryptedBonus: string,
    userAddress: string
  ): Promise<number> => {
    const decryptedValue = await decryptValue(encryptedBonus, userAddress);
    return Number(decryptedValue);
  }, [decryptValue]);

  const createEncryptedValue = useCallback(async (
    value: number | bigint,
    userAddress: string
  ) => {
    const encryptedData = await encryptValue(value);
    const canDecrypt = canDecryptValue(userAddress, encryptedData);
    
    return {
      data: encryptedData,
      isEncrypted: true,
      canDecrypt,
    };
  }, [encryptValue, canDecryptValue]);

  const batchEncrypt = useCallback(async (
    values: (number | bigint)[]
  ): Promise<string[]> => {
    if (!fheManager || !context.isInitialized) {
      throw new Error('Encryption not initialized');
    }

    try {
      const encryptedValues = await Promise.all(
        values.map(value => encryptValue(value))
      );
      return encryptedValues;
    } catch (error: any) {
      toast.error('Failed to encrypt batch values');
      throw error;
    }
  }, [fheManager, context.isInitialized, encryptValue]);

  const validateEncryptedValue = useCallback((encryptedValue: string): boolean => {
    return encryptedValue.startsWith('0xenc_') && encryptedValue.length > 10;
  }, []);

  const reset = useCallback(() => {
    setFheManager(null);
    setContext({
      publicKey: null,
      isInitialized: false,
      error: null,
    });
  }, []);

  return {
    ...context,
    isInitializing,
    fheManager,
    initializeEncryption,
    encryptValue,
    decryptValue,
    canDecryptValue,
    encryptSalary,
    encryptBonus,
    decryptSalary,
    decryptBonus,
    createEncryptedValue,
    batchEncrypt,
    validateEncryptedValue,
    reset,
  };
};