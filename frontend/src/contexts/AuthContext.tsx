import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useRole } from '../hooks/useRole';
import { useWalletContext } from './WalletContext';
import { UserRole } from '../types';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  // Role checks
  hasPermission: (permission: string) => boolean;
  isEmployee: () => boolean;
  isEmployer: () => boolean;
  isAdmin: () => boolean;
  isAuditor: () => boolean;
  // Permission checks
  canViewOwnSalary: () => boolean;
  canViewOwnHistory: () => boolean;
  canViewCompanyData: () => boolean;
  canManageEmployees: () => boolean;
  canProcessPayroll: () => boolean;
  canGenerateReports: () => boolean;
  // Utility functions
  getRoleDisplayName: (role?: UserRole) => string;
  getRoleColor: (role?: UserRole) => string;
  getAvailableRoles: () => UserRole[];
  getAccessibleRoutes: () => string[];
  getDefaultRoute: () => string;
  refreshRole: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { provider, walletState } = useWalletContext();
  const roleHook = useRole(provider || undefined, walletState.address || undefined);

  const value: AuthContextType = {
    user: roleHook.user,
    isLoading: roleHook.isLoading,
    error: roleHook.error,
    // Role checks
    hasPermission: (permission: string) => roleHook.hasPermission(permission as any),
    isEmployee: roleHook.isEmployee,
    isEmployer: roleHook.isEmployer,
    isAdmin: roleHook.isAdmin,
    isAuditor: roleHook.isAuditor,
    // Permission checks
    canViewOwnSalary: roleHook.canViewOwnSalary,
    canViewOwnHistory: roleHook.canViewOwnHistory,
    canViewCompanyData: roleHook.canViewCompanyData,
    canManageEmployees: roleHook.canManageEmployees,
    canProcessPayroll: roleHook.canProcessPayroll,
    canGenerateReports: roleHook.canGenerateReports,
    // Utility functions
    getRoleDisplayName: roleHook.getRoleDisplayName,
    getRoleColor: roleHook.getRoleColor,
    getAvailableRoles: roleHook.getAvailableRoles,
    getAccessibleRoutes: roleHook.getAccessibleRoutes,
    getDefaultRoute: roleHook.getDefaultRoute,
    refreshRole: roleHook.refreshRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};