import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Chip,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle as AccountIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Dashboard as DashboardIcon,
  ExitToApp as ExitIcon,
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useWalletContext } from '../contexts/WalletContext';
import { useAuthContext } from '../contexts/AuthContext';
import { useThemeContext } from '../contexts/ThemeContext';
import { formatAddress } from '../utils/formatters';
import { UserRole } from '../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { walletState, disconnect } = useWalletContext();
  const { user, getRoleDisplayName, getRoleColor, getDefaultRoute } = useAuthContext();
  const { mode, toggleTheme } = useThemeContext();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Redirect to appropriate dashboard if on root dashboard route
    if (location.pathname === '/dashboard' && user) {
      navigate(getDefaultRoute());
    }
  }, [location.pathname, user, navigate, getDefaultRoute]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    disconnect();
    navigate('/login');
    handleMenuClose();
  };

  const getDashboardOptions = () => {
    if (!user) return [];

    const options = [];

    switch (user.role) {
      case UserRole.ADMIN:
        options.push(
          { path: '/dashboard/admin', label: 'Admin Panel', primary: true },
          { path: '/dashboard/employer', label: 'Employer View' },
          { path: '/dashboard/employee', label: 'Employee View' }
        );
        break;
      case UserRole.EMPLOYER:
        options.push(
          { path: '/dashboard/employer', label: 'Employer Dashboard', primary: true },
          { path: '/dashboard/employee', label: 'Employee View' }
        );
        break;
      case UserRole.AUDITOR:
        options.push(
          { path: '/dashboard/auditor', label: 'Auditor Dashboard', primary: true }
        );
        break;
      case UserRole.EMPLOYEE:
      default:
        options.push(
          { path: '/dashboard/employee', label: 'Employee Dashboard', primary: true }
        );
        break;
    }

    return options;
  };

  const currentDashboard = getDashboardOptions().find(option => 
    location.pathname.startsWith(option.path)
  );

  if (!walletState.isConnected) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Please connect your wallet
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            You need to connect your wallet to access the dashboard.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/login')}
          >
            Go to Login
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Loading user information...
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* App Bar */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <DashboardIcon sx={{ mr: 2 }} />
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Confidential Payroll - {currentDashboard?.label || 'Dashboard'}
          </Typography>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
            {getDashboardOptions().map((option) => (
              <Button
                key={option.path}
                color="inherit"
                variant={location.pathname.startsWith(option.path) ? 'outlined' : 'text'}
                onClick={() => navigate(option.path)}
                size="small"
              >
                {option.label}
              </Button>
            ))}
            
            <Divider orientation="vertical" flexItem sx={{ mx: 1, backgroundColor: 'rgba(255,255,255,0.2)' }} />
            
            <IconButton color="inherit" onClick={toggleTheme}>
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            
            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                label={getRoleDisplayName()}
                size="small"
                color={getRoleColor() as any}
                variant="outlined"
                sx={{ 
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                }}
              />
              <IconButton color="inherit" onClick={handleMenuOpen}>
                <AccountIcon />
              </IconButton>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <Paper sx={{ display: { md: 'none' } }}>
          <Box sx={{ p: 2 }}>
            {getDashboardOptions().map((option) => (
              <Button
                key={option.path}
                fullWidth
                variant={location.pathname.startsWith(option.path) ? 'contained' : 'text'}
                onClick={() => {
                  navigate(option.path);
                  setMobileMenuOpen(false);
                }}
                sx={{ mb: 1 }}
              >
                {option.label}
              </Button>
            ))}
          </Box>
        </Paper>
      )}

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleMenuClose}>
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">
              {formatAddress(walletState.address!)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {getRoleDisplayName()} • Connected
            </Typography>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem onClick={toggleTheme}>
          {mode === 'dark' ? <LightModeIcon sx={{ mr: 2 }} /> : <DarkModeIcon sx={{ mr: 2 }} />}
          Toggle {mode === 'dark' ? 'Light' : 'Dark'} Mode
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ExitIcon sx={{ mr: 2 }} />
          Disconnect Wallet
        </MenuItem>
      </Menu>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </Box>
  );
};