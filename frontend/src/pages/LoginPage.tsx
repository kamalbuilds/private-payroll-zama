import React, { useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Alert,
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  AdminPanelSettings as AdminIcon,
  Assessment as AuditIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useWalletContext } from '../contexts/WalletContext';
import { useAuthContext } from '../contexts/AuthContext';
import { WalletConnect } from '../components/WalletConnect';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { walletState, isChainSupported } = useWalletContext();
  const { user, getDefaultRoute } = useAuthContext();

  useEffect(() => {
    // Redirect to dashboard if user is already authenticated
    if (walletState.isConnected && user && isChainSupported) {
      navigate(getDefaultRoute());
    }
  }, [walletState.isConnected, user, isChainSupported, navigate, getDefaultRoute]);

  const roleCards = [
    {
      role: UserRole.EMPLOYEE,
      title: 'Employee Portal',
      description: 'View your encrypted salary, payment history, and tax information with complete privacy.',
      icon: <PersonIcon sx={{ fontSize: 40 }} />,
      features: [
        'View encrypted salary',
        'Payment history',
        'Tax summaries',
        'Personal dashboard',
      ],
      color: 'primary',
    },
    {
      role: UserRole.EMPLOYER,
      title: 'Employer Dashboard',
      description: 'Manage employees and distribute bonuses while maintaining confidentiality.',
      icon: <BusinessIcon sx={{ fontSize: 40 }} />,
      features: [
        'Add/remove employees',
        'Distribute bonuses',
        'Company overview',
        'Employee management',
      ],
      color: 'secondary',
    },
    {
      role: UserRole.ADMIN,
      title: 'Administrator Panel',
      description: 'Process payroll and manage system settings with encrypted operations.',
      icon: <AdminIcon sx={{ fontSize: 40 }} />,
      features: [
        'Process payroll',
        'System settings',
        'User management',
        'Security controls',
      ],
      color: 'error',
    },
    {
      role: UserRole.AUDITOR,
      title: 'Auditor Interface',
      description: 'Generate compliance reports and analyze aggregated data without exposing individual information.',
      icon: <AuditIcon sx={{ fontSize: 40 }} />,
      features: [
        'Compliance reports',
        'Audit trails',
        'Aggregated analytics',
        'Regulatory tools',
      ],
      color: 'info',
    },
  ] as const;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper 
        sx={{ 
          p: 4, 
          mb: 4, 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="center" gap={2} mb={2}>
          <LockIcon sx={{ fontSize: 48 }} />
          <Typography variant="h3" fontWeight="bold">
            Confidential Payroll System
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Privacy-preserving payroll management with fully homomorphic encryption
        </Typography>
      </Paper>

      {/* Wallet Connection */}
      <Box mb={4}>
        {!walletState.isConnected ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Connect Your Wallet to Continue
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              Please connect your MetaMask wallet to access the payroll system.
            </Typography>
            <WalletConnect showCard={false} />
          </Paper>
        ) : !isChainSupported ? (
          <Alert severity="warning">
            Please switch to a supported network to continue.
          </Alert>
        ) : (
          <Alert severity="success">
            Wallet connected successfully! Your role will be automatically detected.
          </Alert>
        )}
      </Box>

      {/* Role Information */}
      <Typography variant="h4" gutterBottom align="center" mb={4}>
        System Roles & Features
      </Typography>
      
      <Grid container spacing={3}>
        {roleCards.map((roleCard) => (
          <Grid size={{ xs: 12, md: 6 }} key={roleCard.role}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) => theme.shadows[8],
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Box 
                    sx={{ 
                      p: 1, 
                      borderRadius: 2, 
                      backgroundColor: `${roleCard.color}.light`,
                      color: `${roleCard.color}.contrastText`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {roleCard.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {roleCard.title}
                    </Typography>
                    <Chip 
                      label={roleCard.role.charAt(0).toUpperCase() + roleCard.role.slice(1)}
                      size="small"
                      color={roleCard.color}
                      variant="outlined"
                    />
                  </Box>
                </Box>
                
                <Typography variant="body1" color="text.secondary" mb={2}>
                  {roleCard.description}
                </Typography>
                
                <Typography variant="subtitle2" gutterBottom>
                  Key Features:
                </Typography>
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                  {roleCard.features.map((feature, index) => (
                    <Typography 
                      key={index}
                      component="li" 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      {feature}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
              
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button 
                  variant="outlined" 
                  fullWidth
                  color={roleCard.color}
                  disabled={!walletState.isConnected || !isChainSupported}
                  startIcon={<LockIcon />}
                >
                  {walletState.isConnected && isChainSupported 
                    ? 'Access Granted'
                    : 'Connect Wallet to Access'
                  }
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Security Features */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom align="center">
          Privacy & Security Features
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box textAlign="center">
              <LockIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="subtitle2">End-to-End Encryption</Typography>
              <Typography variant="body2" color="text.secondary">
                All salary data encrypted with FHE
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box textAlign="center">
              <AdminIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="subtitle2">Role-Based Access</Typography>
              <Typography variant="body2" color="text.secondary">
                Granular permissions for each user type
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box textAlign="center">
              <BusinessIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="subtitle2">Zero-Knowledge Compliance</Typography>
              <Typography variant="body2" color="text.secondary">
                Generate reports without exposing data
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box textAlign="center">
              <AuditIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="subtitle2">Audit Trail</Typography>
              <Typography variant="body2" color="text.secondary">
                Complete transaction history
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};