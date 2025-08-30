import { UserRole } from '../types';

// Contract addresses - Update these with deployed contract addresses
export const CONTRACT_ADDRESSES = {
  payrollContract:  '0x4e763f42227DF08696389d4fcA2Df0b5Fe33f246',
  fhevm:  '0x4e763f42227DF08696389d4fcA2Df0b5Fe33f246',
  gateway: '0x4e763f42227DF08696389d4fcA2Df0b5Fe33f246',
};

// Supported chain IDs
export const SUPPORTED_CHAINS = {
  ZAMA_DEVNET: 8009,
  ZAMA_TESTNET: 9000,
  LOCAL: 31337,
};

// Role permissions
export const ROLE_PERMISSIONS = {
  [UserRole.EMPLOYEE]: {
    canViewOwnSalary: true,
    canViewOwnHistory: true,
    canViewCompanyData: false,
    canManageEmployees: false,
    canProcessPayroll: false,
    canGenerateReports: false,
  },
  [UserRole.EMPLOYER]: {
    canViewOwnSalary: true,
    canViewOwnHistory: true,
    canViewCompanyData: true,
    canManageEmployees: true,
    canProcessPayroll: false,
    canGenerateReports: false,
  },
  [UserRole.ADMIN]: {
    canViewOwnSalary: true,
    canViewOwnHistory: true,
    canViewCompanyData: true,
    canManageEmployees: true,
    canProcessPayroll: true,
    canGenerateReports: true,
  },
  [UserRole.AUDITOR]: {
    canViewOwnSalary: false,
    canViewOwnHistory: false,
    canViewCompanyData: true,
    canManageEmployees: false,
    canProcessPayroll: false,
    canGenerateReports: true,
  },
};

// Encryption constants
export const ENCRYPTION_CONFIG = {
  FHEVM_VERSION: '0.4.0',
  ENCRYPTION_TYPE: 'fheuint64',
  MAX_ENCRYPTED_VALUE: BigInt('18446744073709551615'), // 2^64 - 1
};

// UI constants
export const UI_CONSTANTS = {
  ITEMS_PER_PAGE: 10,
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 4000,
  POLLING_INTERVAL: 5000,
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  EMPLOYEE_DASHBOARD: '/dashboard/employee',
  EMPLOYER_DASHBOARD: '/dashboard/employer',
  ADMIN_DASHBOARD: '/dashboard/admin',
  AUDITOR_DASHBOARD: '/dashboard/auditor',
};

// Error messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet to continue',
  NETWORK_NOT_SUPPORTED: 'Please switch to a supported network',
  ENCRYPTION_FAILED: 'Failed to encrypt data',
  DECRYPTION_FAILED: 'Failed to decrypt data',
  TRANSACTION_FAILED: 'Transaction failed',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  INVALID_INPUT: 'Please enter valid input',
};