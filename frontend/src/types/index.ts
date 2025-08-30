export interface User {
  address: string;
  role: UserRole;
  name?: string;
  employeeId?: string;
}

export type UserRole = 'employee' | 'employer' | 'admin' | 'auditor';

export const UserRole = {
  EMPLOYEE: 'employee' as const,
  EMPLOYER: 'employer' as const,
  ADMIN: 'admin' as const,
  AUDITOR: 'auditor' as const,
} as const;

export interface EncryptedValue {
  data: string;
  isEncrypted: boolean;
  canDecrypt: boolean;
}

export interface Employee {
  id: string;
  address: string;
  name: string;
  position: string;
  baseSalary: EncryptedValue;
  isActive: boolean;
  hireDate: string;
}

export interface PayrollEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  baseSalary: EncryptedValue;
  bonus: EncryptedValue;
  deductions: EncryptedValue;
  netPay: EncryptedValue;
  payPeriod: string;
  processedAt: string;
  transactionHash?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface ComplianceReport {
  id: string;
  reportType: 'tax' | 'audit' | 'compliance';
  period: string;
  totalEmployees: number;
  totalPayroll: EncryptedValue;
  averageSalary: EncryptedValue;
  generatedAt: string;
  generatedBy: string;
}

export interface PaymentHistory {
  id: string;
  amount: EncryptedValue;
  type: 'salary' | 'bonus' | 'deduction';
  date: string;
  transactionHash: string;
  description: string;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  isConnecting: boolean;
  error: string | null;
}

export interface ContractAddresses {
  payrollContract: string;
  fhevm: string;
  gateway: string;
}

export interface EncryptionContext {
  publicKey: string | null;
  isInitialized: boolean;
  error: string | null;
}