import { useState, useEffect, useCallback } from 'react';
import { UserRole } from '../types';
import type { User } from '../types';
import { ROLE_PERMISSIONS } from '../utils/constants';
import { usePayrollContract } from './usePayrollContract';
import { ethers } from 'ethers';

export const useRole = (provider?: ethers.Provider, userAddress?: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getUserRole } = usePayrollContract(provider);

  useEffect(() => {
    if (userAddress) {
      fetchUserRole();
    } else {
      setUser(null);
    }
  }, [userAddress]);

  const fetchUserRole = useCallback(async () => {
    if (!userAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      const role = await getUserRole(userAddress);
      if (role) {
        setUser({
          address: userAddress,
          role,
          // Additional user data would be fetched from contract or database
        });
      } else {
        // Default to employee role if not set
        setUser({
          address: userAddress,
          role: UserRole.EMPLOYEE,
        });
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch user role';
      setError(errorMessage);
      console.error('Failed to fetch user role:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userAddress, getUserRole]);

  const hasPermission = useCallback((permission: keyof typeof ROLE_PERMISSIONS[UserRole]) => {
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role][permission] || false;
  }, [user]);

  const isEmployee = useCallback(() => {
    return user?.role === UserRole.EMPLOYEE;
  }, [user]);

  const isEmployer = useCallback(() => {
    return user?.role === UserRole.EMPLOYER;
  }, [user]);

  const isAdmin = useCallback(() => {
    return user?.role === UserRole.ADMIN;
  }, [user]);

  const isAuditor = useCallback(() => {
    return user?.role === UserRole.AUDITOR;
  }, [user]);

  const canViewOwnSalary = useCallback(() => {
    return hasPermission('canViewOwnSalary');
  }, [hasPermission]);

  const canViewOwnHistory = useCallback(() => {
    return hasPermission('canViewOwnHistory');
  }, [hasPermission]);

  const canViewCompanyData = useCallback(() => {
    return hasPermission('canViewCompanyData');
  }, [hasPermission]);

  const canManageEmployees = useCallback(() => {
    return hasPermission('canManageEmployees');
  }, [hasPermission]);

  const canProcessPayroll = useCallback(() => {
    return hasPermission('canProcessPayroll');
  }, [hasPermission]);

  const canGenerateReports = useCallback(() => {
    return hasPermission('canGenerateReports');
  }, [hasPermission]);

  const getRoleDisplayName = useCallback((role?: UserRole) => {
    const roleToDisplay = role || user?.role;
    switch (roleToDisplay) {
      case UserRole.EMPLOYEE:
        return 'Employee';
      case UserRole.EMPLOYER:
        return 'Employer';
      case UserRole.ADMIN:
        return 'Administrator';
      case UserRole.AUDITOR:
        return 'Auditor';
      default:
        return 'Unknown';
    }
  }, [user]);

  const getRoleColor = useCallback((role?: UserRole) => {
    const roleToColor = role || user?.role;
    switch (roleToColor) {
      case UserRole.EMPLOYEE:
        return 'primary';
      case UserRole.EMPLOYER:
        return 'secondary';
      case UserRole.ADMIN:
        return 'error';
      case UserRole.AUDITOR:
        return 'info';
      default:
        return 'default';
    }
  }, [user]);

  const getAvailableRoles = useCallback((): UserRole[] => {
    if (!user) return [];

    // Admin can assign any role
    if (user.role === UserRole.ADMIN) {
      return Object.values(UserRole);
    }

    // Employer can assign employee and employer roles
    if (user.role === UserRole.EMPLOYER) {
      return [UserRole.EMPLOYEE, UserRole.EMPLOYER];
    }

    // Others cannot assign roles
    return [];
  }, [user]);

  const getAccessibleRoutes = useCallback(() => {
    if (!user) return [];

    const routes = ['/dashboard'];

    switch (user.role) {
      case UserRole.EMPLOYEE:
        routes.push('/dashboard/employee');
        break;
      case UserRole.EMPLOYER:
        routes.push('/dashboard/employer', '/dashboard/employee');
        break;
      case UserRole.ADMIN:
        routes.push(
          '/dashboard/admin',
          '/dashboard/employer',
          '/dashboard/employee'
        );
        break;
      case UserRole.AUDITOR:
        routes.push('/dashboard/auditor');
        break;
    }

    return routes;
  }, [user]);

  const getDefaultRoute = useCallback(() => {
    if (!user) return '/login';

    switch (user.role) {
      case UserRole.EMPLOYEE:
        return '/dashboard/employee';
      case UserRole.EMPLOYER:
        return '/dashboard/employer';
      case UserRole.ADMIN:
        return '/dashboard/admin';
      case UserRole.AUDITOR:
        return '/dashboard/auditor';
      default:
        return '/dashboard';
    }
  }, [user]);

  const refreshRole = useCallback(() => {
    fetchUserRole();
  }, [fetchUserRole]);

  return {
    user,
    isLoading,
    error,
    // Role checks
    hasPermission,
    isEmployee,
    isEmployer,
    isAdmin,
    isAuditor,
    // Permission checks
    canViewOwnSalary,
    canViewOwnHistory,
    canViewCompanyData,
    canManageEmployees,
    canProcessPayroll,
    canGenerateReports,
    // Utility functions
    getRoleDisplayName,
    getRoleColor,
    getAvailableRoles,
    getAccessibleRoutes,
    getDefaultRoute,
    refreshRole,
  };
};