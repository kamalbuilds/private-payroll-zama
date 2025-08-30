import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { PAYROLL_ABI } from '../contracts/PayrollABI';
import { CONTRACT_ADDRESSES } from '../utils/constants';
import { UserRole } from '../types';
import type { Employee, PayrollEntry, ComplianceReport } from '../types';
import { useEncryption } from './useEncryption';
import toast from 'react-hot-toast';

export const usePayrollContract = (provider?: ethers.Provider, signer?: ethers.Signer) => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { encryptValue, decryptValue, canDecryptValue } = useEncryption(provider);

  useEffect(() => {
    if (provider && CONTRACT_ADDRESSES.payrollContract !== '0x0000000000000000000000000000000000000000') {
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESSES.payrollContract,
        PAYROLL_ABI,
        signer || provider
      );
      setContract(contractInstance);
    }
  }, [provider, signer]);

  const handleContractCall = async <T,>(
    operation: string,
    contractCall: () => Promise<T>
  ): Promise<T | null> => {
    if (!contract) {
      const error = 'Contract not initialized';
      setError(error);
      toast.error(error);
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await contractCall();
      toast.success(`${operation} completed successfully`);
      return result;
    } catch (error: any) {
      const errorMessage = error.reason || error.message || `Failed to ${operation.toLowerCase()}`;
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Employee Management
  const addEmployee = useCallback(async (
    employeeAddress: string,
    name: string,
    position: string,
    salaryInCents: number
  ): Promise<boolean> => {
    if (!signer) {
      toast.error('Signer required for transactions');
      return false;
    }

    const result = await handleContractCall('Add Employee', async () => {
      const encryptedSalary = await encryptValue(salaryInCents);
      const tx = await contract!.addEmployee(employeeAddress, name, position, encryptedSalary);
      await tx.wait();
      return true;
    });

    return result || false;
  }, [contract, signer, encryptValue]);

  const removeEmployee = useCallback(async (employeeAddress: string): Promise<boolean> => {
    if (!signer) {
      toast.error('Signer required for transactions');
      return false;
    }

    const result = await handleContractCall('Remove Employee', async () => {
      const tx = await contract!.removeEmployee(employeeAddress);
      await tx.wait();
      return true;
    });

    return result || false;
  }, [contract, signer]);

  const getEmployeeInfo = useCallback(async (
    employeeAddress: string,
    currentUserAddress: string
  ): Promise<Employee | null> => {
    const result = await handleContractCall('Get Employee Info', async () => {
      const [name, position, isActive, hireDate] = await contract!.getEmployeeInfo(employeeAddress);
      const encryptedSalary = await contract!.getEncryptedSalary(employeeAddress);
      
      const canDecrypt = canDecryptValue(currentUserAddress, encryptedSalary);
      
      return {
        id: employeeAddress,
        address: employeeAddress,
        name,
        position,
        baseSalary: {
          data: encryptedSalary,
          isEncrypted: true,
          canDecrypt,
        },
        isActive,
        hireDate: new Date(Number(hireDate) * 1000).toISOString(),
      };
    });

    return result;
  }, [contract, canDecryptValue]);

  // Payroll Processing
  const processPayroll = useCallback(async (employeeAddresses: string[]): Promise<boolean> => {
    if (!signer) {
      toast.error('Signer required for transactions');
      return false;
    }

    const result = await handleContractCall('Process Payroll', async () => {
      const tx = await contract!.processPayroll(employeeAddresses);
      await tx.wait();
      return true;
    });

    return result || false;
  }, [contract, signer]);

  const distributeBonus = useCallback(async (
    employeeAddresses: string[],
    bonusAmountsInCents: number[]
  ): Promise<boolean> => {
    if (!signer) {
      toast.error('Signer required for transactions');
      return false;
    }

    if (employeeAddresses.length !== bonusAmountsInCents.length) {
      toast.error('Employee addresses and bonus amounts must match');
      return false;
    }

    const result = await handleContractCall('Distribute Bonus', async () => {
      const encryptedBonuses = await Promise.all(
        bonusAmountsInCents.map(amount => encryptValue(amount))
      );
      
      const tx = await contract!.distributeBonus(employeeAddresses, encryptedBonuses);
      await tx.wait();
      return true;
    });

    return result || false;
  }, [contract, signer, encryptValue]);

  // Payment History
  const getPaymentHistory = useCallback(async (
    employeeAddress: string,
    currentUserAddress: string
  ): Promise<PayrollEntry[]> => {
    const result = await handleContractCall('Get Payment History', async () => {
      const paymentCount = await contract!.getPaymentCount(employeeAddress);
      const payments: PayrollEntry[] = [];
      
      for (let i = 0; i < Number(paymentCount); i++) {
        const [encryptedAmount, timestamp, _paymentType] = await contract!.getPaymentHistory(employeeAddress, i);
        
        const canDecrypt = canDecryptValue(currentUserAddress, encryptedAmount);
        
        payments.push({
          id: `${employeeAddress}-${i}`,
          employeeId: employeeAddress,
          employeeName: '', // Would need to get from employee info
          baseSalary: {
            data: encryptedAmount,
            isEncrypted: true,
            canDecrypt,
          },
          bonus: {
            data: '0',
            isEncrypted: false,
            canDecrypt: false,
          },
          deductions: {
            data: '0',
            isEncrypted: false,
            canDecrypt: false,
          },
          netPay: {
            data: encryptedAmount,
            isEncrypted: true,
            canDecrypt,
          },
          payPeriod: new Date(Number(timestamp) * 1000).toISOString().slice(0, 7),
          processedAt: new Date(Number(timestamp) * 1000).toISOString(),
          status: 'completed',
        });
      }
      
      return payments;
    });

    return result || [];
  }, [contract, canDecryptValue]);

  // Role Management
  const getUserRole = useCallback(async (userAddress: string): Promise<UserRole | null> => {
    const result = await handleContractCall('Get User Role', async () => {
      const roleNumber = await contract!.getUserRole(userAddress);
      const roles = [UserRole.EMPLOYEE, UserRole.EMPLOYER, UserRole.ADMIN, UserRole.AUDITOR];
      return roles[Number(roleNumber)] || UserRole.EMPLOYEE;
    });

    return result;
  }, [contract]);

  const setUserRole = useCallback(async (
    userAddress: string,
    role: UserRole
  ): Promise<boolean> => {
    if (!signer) {
      toast.error('Signer required for transactions');
      return false;
    }

    const result = await handleContractCall('Set User Role', async () => {
      const roleMapping = {
        [UserRole.EMPLOYEE]: 0,
        [UserRole.EMPLOYER]: 1,
        [UserRole.ADMIN]: 2,
        [UserRole.AUDITOR]: 3,
      };
      
      const tx = await contract!.setUserRole(userAddress, roleMapping[role]);
      await tx.wait();
      return true;
    });

    return result || false;
  }, [contract, signer]);

  // Compliance & Reporting
  const generateComplianceReport = useCallback(async (
    reportType: string,
    period: string,
    currentUserAddress: string
  ): Promise<ComplianceReport | null> => {
    const result = await handleContractCall('Generate Compliance Report', async () => {
      const [encryptedTotalPayroll, encryptedAverageSalary, employeeCount] = 
        await contract!.generateComplianceReport(reportType, period);
      
      const canDecryptTotal = canDecryptValue(currentUserAddress, encryptedTotalPayroll);
      const canDecryptAverage = canDecryptValue(currentUserAddress, encryptedAverageSalary);
      
      return {
        id: `${reportType}-${period}-${Date.now()}`,
        reportType: reportType as 'tax' | 'audit' | 'compliance',
        period,
        totalEmployees: Number(employeeCount),
        totalPayroll: {
          data: encryptedTotalPayroll,
          isEncrypted: true,
          canDecrypt: canDecryptTotal,
        },
        averageSalary: {
          data: encryptedAverageSalary,
          isEncrypted: true,
          canDecrypt: canDecryptAverage,
        },
        generatedAt: new Date().toISOString(),
        generatedBy: currentUserAddress,
      };
    });

    return result;
  }, [contract, canDecryptValue]);

  // Utility Functions
  const getActiveEmployeeCount = useCallback(async (): Promise<number> => {
    const result = await handleContractCall('Get Active Employee Count', async () => {
      const count = await contract!.getActiveEmployeeCount();
      return Number(count);
    });

    return result || 0;
  }, [contract]);

  const decryptSalaryForUser = useCallback(async (
    encryptedSalary: string,
    userAddress: string
  ): Promise<number | null> => {
    try {
      const decryptedValue = await decryptValue(encryptedSalary, userAddress);
      return Number(decryptedValue);
    } catch (error) {
      console.error('Failed to decrypt salary:', error);
      return null;
    }
  }, [decryptValue]);

  // Contract Events
  const subscribeToEvents = useCallback((eventCallbacks: {
    onEmployeeAdded?: (employee: string, name: string) => void;
    onEmployeeRemoved?: (employee: string) => void;
    onPaymentProcessed?: (employee: string, amount: string, type: string) => void;
    onPayrollProcessed?: (employeeCount: number, timestamp: number) => void;
  }) => {
    if (!contract) return;

    if (eventCallbacks.onEmployeeAdded) {
      contract.on('EmployeeAdded', eventCallbacks.onEmployeeAdded);
    }
    if (eventCallbacks.onEmployeeRemoved) {
      contract.on('EmployeeRemoved', eventCallbacks.onEmployeeRemoved);
    }
    if (eventCallbacks.onPaymentProcessed) {
      contract.on('PaymentProcessed', eventCallbacks.onPaymentProcessed);
    }
    if (eventCallbacks.onPayrollProcessed) {
      contract.on('PayrollProcessed', eventCallbacks.onPayrollProcessed);
    }

    return () => {
      contract.removeAllListeners();
    };
  }, [contract]);

  return {
    contract,
    isLoading,
    error,
    // Employee Management
    addEmployee,
    removeEmployee,
    getEmployeeInfo,
    // Payroll Processing
    processPayroll,
    distributeBonus,
    // Payment History
    getPaymentHistory,
    // Role Management
    getUserRole,
    setUserRole,
    // Compliance
    generateComplianceReport,
    // Utilities
    getActiveEmployeeCount,
    decryptSalaryForUser,
    subscribeToEvents,
  };
};