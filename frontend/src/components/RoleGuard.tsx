import React from 'react';
import type { ReactNode } from 'react';
import {
  Box,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  Lock as LockIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useAuthContext } from '../contexts/AuthContext';
import { useWalletContext } from '../contexts/WalletContext';
import { UserRole } from '../types';
import { WalletConnect } from './WalletConnect';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requiredPermissions?: string[];
  fallback?: ReactNode;
  requireWallet?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  requiredPermissions,
  fallback,
  requireWallet = true,
}) => {
  const { walletState } = useWalletContext();
  const { user, isLoading, hasPermission } = useAuthContext();

  // Loading state
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
        <Typography variant="body1" ml={2}>
          Loading user permissions...
        </Typography>
      </Box>
    );
  }

  // Wallet connection required but not connected
  if (requireWallet && !walletState.isConnected) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 500, mx: 'auto', mt: 4 }}>
        <WarningIcon color="warning" sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Wallet Connection Required
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          Please connect your wallet to access this feature.
        </Typography>
        <WalletConnect showCard={false} />
      </Paper>
    );
  }

  // No user found
  if (requireWallet && !user) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 500, mx: 'auto', mt: 4 }}>
        <LockIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          User Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          Unable to determine user role. Please ensure you have the required permissions.
        </Typography>
        <Button 
          variant="outlined" 
          onClick={() => window.location.reload()}
        >
          Reload Page
        </Button>
      </Paper>
    );
  }

  // Check role permissions
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    const unauthorizedContent = (
      <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 500, mx: 'auto', mt: 4 }}>
        <LockIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={2}>
          You don't have permission to access this resource.
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Required roles: {allowedRoles.map(role => role.charAt(0).toUpperCase() + role.slice(1)).join(', ')}
        </Typography>
        <Alert severity="info" sx={{ textAlign: 'left' }}>
          Your current role: <strong>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</strong>
        </Alert>
      </Paper>
    );

    return fallback ? <>{fallback}</> : unauthorizedContent;
  }

  // Check specific permissions
  if (requiredPermissions && user) {
    const hasAllPermissions = requiredPermissions.every(permission => 
      hasPermission(permission)
    );

    if (!hasAllPermissions) {
      const unauthorizedContent = (
        <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 500, mx: 'auto', mt: 4 }}>
          <LockIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Insufficient Permissions
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={2}>
            You don't have the required permissions to access this feature.
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Required permissions: {requiredPermissions.join(', ')}
          </Typography>
          <Alert severity="info" sx={{ textAlign: 'left' }}>
            Your current role: <strong>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</strong>
          </Alert>
        </Paper>
      );

      return fallback ? <>{fallback}</> : unauthorizedContent;
    }
  }

  // All checks passed, render children
  return <>{children}</>;
};

// Convenience components for specific roles
export const EmployeeGuard: React.FC<Omit<RoleGuardProps, 'allowedRoles'>> = (props) => (
  <RoleGuard {...props} allowedRoles={[UserRole.EMPLOYEE, UserRole.EMPLOYER, UserRole.ADMIN]} />
);

export const EmployerGuard: React.FC<Omit<RoleGuardProps, 'allowedRoles'>> = (props) => (
  <RoleGuard {...props} allowedRoles={[UserRole.EMPLOYER, UserRole.ADMIN]} />
);

export const AdminGuard: React.FC<Omit<RoleGuardProps, 'allowedRoles'>> = (props) => (
  <RoleGuard {...props} allowedRoles={[UserRole.ADMIN]} />
);

export const AuditorGuard: React.FC<Omit<RoleGuardProps, 'allowedRoles'>> = (props) => (
  <RoleGuard {...props} allowedRoles={[UserRole.AUDITOR, UserRole.ADMIN]} />
);