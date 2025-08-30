import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Divider,
  Button,
  Grid,
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  History as HistoryIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { EmployeeGuard } from '../components/RoleGuard';
import { EncryptedDataDisplay } from '../components/EncryptedDataDisplay';
import { PaymentHistory } from '../components/PaymentHistory';
import { useWalletContext } from '../contexts/WalletContext';
import { useAuthContext } from '../contexts/AuthContext';
import { usePayrollContract } from '../hooks/usePayrollContract';
import type { Employee, PayrollEntry } from '../types';
import { formatDate } from '../utils/formatters';

export const EmployeeDashboard: React.FC = () => {
  const { walletState, provider, signer } = useWalletContext();
  const { user: _user } = useAuthContext();
  const { getEmployeeInfo, getPaymentHistory } = usePayrollContract(provider || undefined, signer || undefined);
  
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PayrollEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    if (walletState.address) {
      fetchEmployeeData();
    }
  }, [walletState.address]);

  const fetchEmployeeData = async () => {
    if (!walletState.address) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch employee information
      const employeeInfo = await getEmployeeInfo(walletState.address, walletState.address);
      if (employeeInfo) {
        setEmployee(employeeInfo);
      }

      // Fetch payment history
      const history = await getPaymentHistory(walletState.address, walletState.address);
      setPaymentHistory(history);
      
      setLastRefresh(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to fetch employee data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchEmployeeData();
  };

  const calculateYTDEarnings = (): number => {
    const currentYear = new Date().getFullYear();
    return paymentHistory
      .filter(payment => new Date(payment.processedAt).getFullYear() === currentYear)
      .length; // Mock calculation - in real app would sum decrypted amounts
  };

  if (isLoading) {
    return (
      <EmployeeGuard>
        <Box display="flex" justifyContent="center" alignItems="center" p={8}>
          <CircularProgress size={60} />
          <Typography variant="h6" ml={2}>
            Loading your dashboard...
          </Typography>
        </Box>
      </EmployeeGuard>
    );
  }

  return (
    <EmployeeGuard>
      <Box>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3, backgroundColor: 'primary.main', color: 'primary.contrastText' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Welcome, {employee?.name || 'Employee'}
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Employee Dashboard - Your confidential payroll information
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{ 
                color: 'white', 
                borderColor: 'rgba(255,255,255,0.3)',
                '&:hover': { borderColor: 'white' }
              }}
            >
              Refresh
            </Button>
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <WalletIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Current Salary</Typography>
                </Box>
                {employee && (
                  <EncryptedDataDisplay
                    encryptedValue={employee.baseSalary}
                    label="Monthly Base Salary"
                    size="large"
                    autoDecrypt={true}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <HistoryIcon color="secondary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Payment Count</Typography>
                </Box>
                <Typography variant="h4" color="secondary.main">
                  {paymentHistory.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total payments received
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">YTD Payments</Typography>
                </Box>
                <Typography variant="h4" color="success.main">
                  {calculateYTDEarnings()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Payments this year
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <ReceiptIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="h6">Employment</Typography>
                </Box>
                <Typography variant="h6" color="info.main">
                  {employee?.position || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Since {employee ? formatDate(employee.hireDate) : 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Employee Information */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Employee Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box display="flex" justifyContent="space-between" py={1}>
                <Typography variant="body2" color="text.secondary">
                  Name:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {employee?.name || 'Not available'}
                </Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between" py={1}>
                <Typography variant="body2" color="text.secondary">
                  Position:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {employee?.position || 'Not available'}
                </Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between" py={1}>
                <Typography variant="body2" color="text.secondary">
                  Employee ID:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {employee?.id || 'Not available'}
                </Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between" py={1}>
                <Typography variant="body2" color="text.secondary">
                  Hire Date:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {employee ? formatDate(employee.hireDate) : 'Not available'}
                </Typography>
              </Box>
              
              <Box display="flex" justifyContent="space-between" py={1}>
                <Typography variant="body2" color="text.secondary">
                  Status:
                </Typography>
                <Typography 
                  variant="body2" 
                  fontWeight={500}
                  color={employee?.isActive ? 'success.main' : 'error.main'}
                >
                  {employee?.isActive ? 'Active' : 'Inactive'}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Compensation Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {employee && (
                <Box>
                  <EncryptedDataDisplay
                    encryptedValue={employee.baseSalary}
                    label="Base Salary (Monthly)"
                    variant="currency"
                    size="medium"
                    showToggle={true}
                  />
                  
                  <Box mt={3}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Privacy Notice:
                    </Typography>
                    <Typography variant="body2">
                      Your salary information is encrypted using Fully Homomorphic Encryption (FHE). 
                      Only you can decrypt and view your compensation details.
                    </Typography>
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Payment History */}
        <Paper sx={{ mt: 3 }}>
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              Payment History
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Your complete payment history with encrypted amounts
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <PaymentHistory 
              payments={paymentHistory}
              showEmployeeColumn={false}
              currentUserAddress={walletState.address || undefined}
            />
          </Box>
        </Paper>

        {/* Footer Info */}
        <Paper sx={{ p: 2, mt: 3, backgroundColor: 'grey.50' }}>
          <Typography variant="caption" color="text.secondary">
            Last updated: {lastRefresh.toLocaleString()} • 
            Data is encrypted and visible only to you • 
            Connected: {walletState.address}
          </Typography>
        </Paper>
      </Box>
    </EmployeeGuard>
  );
};