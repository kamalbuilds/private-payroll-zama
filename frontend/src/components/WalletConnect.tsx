import React from 'react';
import {
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  Logout as LogoutIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useWalletContext } from '../contexts/WalletContext';
import { formatAddress } from '../utils/formatters';
import { SUPPORTED_CHAINS } from '../utils/constants';

interface WalletConnectProps {
  showCard?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ 
  showCard = true, 
  size = 'medium' 
}) => {
  const {
    walletState,
    connect,
    disconnect,
    switchNetwork,
    isChainSupported,
  } = useWalletContext();

  const getNetworkName = (chainId: number): string => {
    switch (chainId) {
      case SUPPORTED_CHAINS.ZAMA_DEVNET:
        return 'Zama Devnet';
      case SUPPORTED_CHAINS.ZAMA_TESTNET:
        return 'Zama Testnet';
      case SUPPORTED_CHAINS.LOCAL:
        return 'Local Network';
      default:
        return `Chain ${chainId}`;
    }
  };

  const handleNetworkSwitch = () => {
    if (walletState.chainId && !isChainSupported) {
      switchNetwork(SUPPORTED_CHAINS.ZAMA_DEVNET);
    }
  };

  const ConnectedWallet = () => (
    <Box display="flex" alignItems="center" gap={1}>
      <WalletIcon color="primary" />
      <Box>
        <Typography variant={size === 'small' ? 'body2' : 'body1'} fontWeight={500}>
          {formatAddress(walletState.address!)}
        </Typography>
        {walletState.chainId && (
          <Box display="flex" alignItems="center" gap={1} mt={0.5}>
            <Chip
              label={getNetworkName(walletState.chainId)}
              size="small"
              color={isChainSupported ? 'success' : 'warning'}
              variant="outlined"
            />
            {!isChainSupported && (
              <Tooltip title="Switch to supported network">
                <IconButton size="small" onClick={handleNetworkSwitch}>
                  <WarningIcon color="warning" fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </Box>
      <Tooltip title="Disconnect wallet">
        <IconButton onClick={disconnect} size="small">
          <LogoutIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );

  const ConnectButton = () => (
    <Button
      variant="contained"
      startIcon={walletState.isConnecting ? <CircularProgress size={16} /> : <WalletIcon />}
      onClick={connect}
      disabled={walletState.isConnecting}
      size={size}
    >
      {walletState.isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );

  const content = (
    <Box>
      {walletState.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {walletState.error}
        </Alert>
      )}
      
      {!isChainSupported && walletState.isConnected && (
        <Alert 
          severity="warning" 
          sx={{ mb: 2 }}
          action={
            <Button size="small" onClick={handleNetworkSwitch}>
              Switch Network
            </Button>
          }
        >
          Please connect to a supported network to use the application.
        </Alert>
      )}

      {walletState.isConnected ? <ConnectedWallet /> : <ConnectButton />}
    </Box>
  );

  if (!showCard) {
    return content;
  }

  return (
    <Card sx={{ maxWidth: 400, mx: 'auto' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom align="center">
          Wallet Connection
        </Typography>
        {content}
      </CardContent>
    </Card>
  );
};