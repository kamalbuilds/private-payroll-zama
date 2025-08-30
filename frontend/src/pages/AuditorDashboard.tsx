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
  Assessment as AuditIcon,
  BarChart as ChartIcon,
  Description as ReportIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { AuditorGuard } from '../components/RoleGuard';

export const AuditorDashboard: React.FC = () => {
  return (
    <AuditorGuard>
      <Box>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3, backgroundColor: 'info.main', color: 'info.contrastText' }}>
          <Box display="flex" alignItems="center">
            <AuditIcon sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Auditor Dashboard
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Compliance reporting and encrypted analytics
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Auditor Functions */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <ReportIcon color="primary" sx={{ mr: 2 }} />
                  <Typography variant="h6">
                    Compliance Reports
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Generate regulatory reports without exposing individual data
                </Typography>
                <Button variant="contained" fullWidth>
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <ChartIcon color="secondary" sx={{ mr: 2 }} />
                  <Typography variant="h6">
                    Aggregated Analytics
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  View company-wide statistics with privacy preservation
                </Typography>
                <Button variant="outlined" fullWidth>
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <ViewIcon color="info" sx={{ mr: 2 }} />
                  <Typography variant="h6">
                    Audit Trail
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Review system activity and transaction history
                </Typography>
                <Alert severity="info">
                  Auditor dashboard functionality will be implemented in the next phase
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </AuditorGuard>
  );
};