import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  CardGiftcard as BonusIcon,
} from '@mui/icons-material';
import { EmployerGuard } from '../components/RoleGuard';
import { EmployeeManagement } from '../components/EmployeeManagement';
import { BonusDistribution } from '../components/BonusDistribution';
import { useWalletContext } from '../contexts/WalletContext';
import { usePayrollContract } from '../hooks/usePayrollContract';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`employer-tabpanel-${index}`}
      aria-labelledby={`employer-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export const EmployerDashboard: React.FC = () => {
  const { walletState, provider, signer } = useWalletContext();
  const { getActiveEmployeeCount } = usePayrollContract(provider || undefined, signer || undefined);
  
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    totalPayroll: 0,
    avgSalary: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, [walletState.address]);

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const activeCount = await getActiveEmployeeCount();
      
      setStats({
        totalEmployees: activeCount,
        activeEmployees: activeCount,
        totalPayroll: 0, // Would be calculated from encrypted values
        avgSalary: 0, // Would be calculated from encrypted values
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (isLoading) {
    return (
      <EmployerGuard>
        <Box display="flex" justifyContent="center" alignItems="center" p={8}>
          <CircularProgress size={60} />
          <Typography variant="h6" ml={2}>
            Loading employer dashboard...
          </Typography>
        </Box>
      </EmployerGuard>
    );
  }

  return (
    <EmployerGuard>
      <Box>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3, backgroundColor: 'secondary.main', color: 'secondary.contrastText' }}>
          <Box display="flex" justifyContent="between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Employer Dashboard
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Manage employees and distribute bonuses with full privacy
              </Typography>
            </Box>
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <PeopleIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Employees</Typography>
                </Box>
                <Typography variant="h4" color="primary.main">
                  {stats.totalEmployees}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active employees
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <BusinessIcon color="secondary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Active Staff</Typography>
                </Box>
                <Typography variant="h4" color="secondary.main">
                  {stats.activeEmployees}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Currently employed
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <MoneyIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">Payroll Budget</Typography>
                </Box>
                <Typography variant="h4" color="success.main">
                  🔒 Encrypted
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total monthly budget
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <TrendingUpIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="h6">Avg. Salary</Typography>
                </Box>
                <Typography variant="h4" color="info.main">
                  🔒 Encrypted
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average compensation
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs for different functions */}
        <Paper sx={{ mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab 
              label="Employee Management" 
              icon={<PeopleIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Bonus Distribution" 
              icon={<BonusIcon />} 
              iconPosition="start"
            />
          </Tabs>

          <TabPanel value={activeTab} index={0}>
            <EmployeeManagement onEmployeeChange={fetchDashboardStats} />
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <BonusDistribution />
          </TabPanel>
        </Paper>

        {/* Quick Actions */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<AddIcon />}
                onClick={() => setActiveTab(0)}
              >
                Add Employee
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<BonusIcon />}
                onClick={() => setActiveTab(1)}
              >
                Distribute Bonus
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<TrendingUpIcon />}
                disabled
              >
                View Analytics
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<PeopleIcon />}
                disabled
              >
                Generate Report
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Privacy Notice */}
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Privacy Notice:</strong> All employee salary information is encrypted using Fully Homomorphic Encryption (FHE). 
            As an employer, you can manage employees and distribute bonuses without seeing individual salary details.
          </Typography>
        </Alert>
      </Box>
    </EmployerGuard>
  );
};