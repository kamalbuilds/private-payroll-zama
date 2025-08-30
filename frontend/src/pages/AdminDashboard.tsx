import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
  Grid,
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Payment as PaymentIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { AdminGuard } from '../components/RoleGuard';

export const AdminDashboard: React.FC = () => {
  return (
    <AdminGuard>
      <Box>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3, backgroundColor: 'error.main', color: 'error.contrastText' }}>
          <Box display="flex" alignItems="center">
            <AdminIcon sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Administrator Panel
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                System administration and payroll processing
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Admin Functions */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <PaymentIcon color="primary" sx={{ mr: 2 }} />
                  <Typography variant="h6">
                    Payroll Processing
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Process payroll for all employees with encrypted calculations
                </Typography>
                <Button variant="contained" fullWidth>
                  Process Payroll
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <SettingsIcon color="secondary" sx={{ mr: 2 }} />
                  <Typography variant="h6">
                    System Settings
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Configure system parameters and permissions
                </Typography>
                <Button variant="outlined" fullWidth>
                  Manage Settings
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <SecurityIcon color="error" sx={{ mr: 2 }} />
                  <Typography variant="h6">
                    Security & Access Control
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Manage user roles and system security
                </Typography>
                <Alert severity="info">
                  Admin dashboard functionality will be implemented in the next phase
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </AdminGuard>
  );
};