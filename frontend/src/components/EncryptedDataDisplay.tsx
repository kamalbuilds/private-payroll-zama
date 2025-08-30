import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Chip,
  Alert,
} from '@mui/material';
import {
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import type { EncryptedValue } from '../types';
import { formatCurrency } from '../utils/formatters';
import { useEncryption } from '../hooks/useEncryption';
import { useWalletContext } from '../contexts/WalletContext';

interface EncryptedDataDisplayProps {
  encryptedValue: EncryptedValue;
  label?: string;
  variant?: 'currency' | 'number' | 'text';
  currency?: string;
  size?: 'small' | 'medium' | 'large';
  showToggle?: boolean;
  autoDecrypt?: boolean;
  placeholder?: string;
}

export const EncryptedDataDisplay: React.FC<EncryptedDataDisplayProps> = ({
  encryptedValue,
  label,
  variant = 'currency',
  currency = 'USD',
  size = 'medium',
  showToggle = true,
  autoDecrypt = false,
  placeholder = '••••••••',
}) => {
  const [isVisible, setIsVisible] = useState(autoDecrypt);
  const [decryptedValue, setDecryptedValue] = useState<number | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { decryptValue } = useEncryption();
  const { walletState } = useWalletContext();

  const canDecrypt = encryptedValue.canDecrypt && walletState.address;

  useEffect(() => {
    if (isVisible && canDecrypt && !decryptedValue && !isDecrypting) {
      handleDecrypt();
    }
  }, [isVisible, canDecrypt]);

  const handleDecrypt = async () => {
    if (!canDecrypt || !walletState.address || isDecrypting) return;

    setIsDecrypting(true);
    setError(null);

    try {
      const result = await decryptValue(encryptedValue.data, walletState.address);
      setDecryptedValue(Number(result));
    } catch (err: any) {
      setError(err.message || 'Failed to decrypt value');
      setIsVisible(false);
    } finally {
      setIsDecrypting(false);
    }
  };

  const toggleVisibility = () => {
    if (!canDecrypt) return;
    setIsVisible(!isVisible);
  };

  const refreshDecryption = () => {
    setDecryptedValue(null);
    setError(null);
    if (isVisible && canDecrypt) {
      handleDecrypt();
    }
  };

  const formatValue = (value: number): string => {
    switch (variant) {
      case 'currency':
        return formatCurrency(value, currency);
      case 'number':
        return value.toLocaleString();
      case 'text':
      default:
        return value.toString();
    }
  };

  const getDisplayValue = (): React.ReactNode => {
    if (!canDecrypt) {
      return (
        <Box display="flex" alignItems="center" gap={1}>
          <LockIcon 
            color="disabled" 
            fontSize={size === 'small' ? 'small' : 'medium'} 
          />
          <Typography 
            variant={size === 'small' ? 'body2' : 'body1'} 
            color="text.disabled"
          >
            Encrypted
          </Typography>
        </Box>
      );
    }

    if (!isVisible) {
      return (
        <Typography 
          variant={size === 'small' ? 'body2' : 'body1'}
          sx={{ fontFamily: 'monospace' }}
        >
          {placeholder}
        </Typography>
      );
    }

    if (isDecrypting) {
      return (
        <Box display="flex" alignItems="center" gap={1}>
          <CircularProgress size={16} />
          <Typography 
            variant={size === 'small' ? 'body2' : 'body1'} 
            color="text.secondary"
          >
            Decrypting...
          </Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Box display="flex" alignItems="center" gap={1}>
          <Typography 
            variant={size === 'small' ? 'body2' : 'body1'} 
            color="error"
          >
            Decryption failed
          </Typography>
          <Tooltip title="Retry decryption">
            <IconButton size="small" onClick={refreshDecryption}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      );
    }

    if (decryptedValue !== null) {
      return (
        <Typography 
          variant={size === 'small' ? 'body2' : 'body1'}
          fontWeight={500}
          color="text.primary"
        >
          {formatValue(decryptedValue)}
        </Typography>
      );
    }

    return null;
  };

  return (
    <Box>
      {label && (
        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Chip
            label={encryptedValue.isEncrypted ? 'Encrypted' : 'Plaintext'}
            size="small"
            variant="outlined"
            color={encryptedValue.isEncrypted ? 'primary' : 'default'}
            icon={encryptedValue.isEncrypted ? <LockIcon /> : <LockOpenIcon />}
          />
        </Box>
      )}
      
      <Box display="flex" alignItems="center" gap={1}>
        {getDisplayValue()}
        
        {showToggle && canDecrypt && (
          <Tooltip title={isVisible ? 'Hide value' : 'Show value'}>
            <IconButton size="small" onClick={toggleVisibility}>
              {isVisible ? (
                <VisibilityOffIcon fontSize="small" />
              ) : (
                <VisibilityIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        )}
        
        {isVisible && decryptedValue !== null && (
          <Tooltip title="Refresh value">
            <IconButton size="small" onClick={refreshDecryption}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};