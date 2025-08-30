import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CardGiftcard as BonusIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useWalletContext } from '../contexts/WalletContext';
import { usePayrollContract } from '../hooks/usePayrollContract';
import { isValidEthereumAddress, isValidAmount, formatAddress, formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';

interface BonusRecipient {
  address: string;
  name: string;
  amount: number;
}

export const BonusDistribution: React.FC = () => {
  const { provider, signer } = useWalletContext();
  const { distributeBonus } = usePayrollContract(provider || undefined, signer || undefined);
  
  const [recipients, setRecipients] = useState<BonusRecipient[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    name: '',
    amount: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.address.trim()) {
      newErrors.address = 'Employee address is required';
    } else if (!isValidEthereumAddress(formData.address)) {
      newErrors.address = 'Please enter a valid Ethereum address';
    } else if (recipients.some(r => r.address.toLowerCase() === formData.address.toLowerCase())) {
      newErrors.address = 'This employee is already in the list';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Employee name is required';
    }

    if (!formData.amount.trim()) {
      newErrors.amount = 'Bonus amount is required';
    } else if (!isValidAmount(formData.amount)) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Bonus amount must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddRecipient = () => {
    if (!validateForm()) return;

    const newRecipient: BonusRecipient = {
      address: formData.address.trim(),
      name: formData.name.trim(),
      amount: parseFloat(formData.amount),
    };

    setRecipients(prev => [...prev, newRecipient]);
    setFormData({ address: '', name: '', amount: '' });
    setIsAddDialogOpen(false);
    setErrors({});
    toast.success('Recipient added to bonus distribution list');
  };

  const handleRemoveRecipient = (index: number) => {
    setRecipients(prev => prev.filter((_, i) => i !== index));
    toast.success('Recipient removed from list');
  };

  const handleDistributeBonuses = async () => {
    if (recipients.length === 0) {
      toast.error('Please add at least one recipient');
      return;
    }

    setIsLoading(true);
    try {
      const addresses = recipients.map(r => r.address);
      const amounts = recipients.map(r => Math.round(r.amount * 100)); // Convert to cents
      
      const success = await distributeBonus(addresses, amounts);
      
      if (success) {
        toast.success(`Bonuses distributed to ${recipients.length} employees!`);
        setRecipients([]);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to distribute bonuses');
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalBonus = () => {
    return recipients.reduce((sum, recipient) => sum + recipient.amount, 0);
  };

  const handleCloseDialog = () => {
    if (!isLoading) {
      setIsAddDialogOpen(false);
      setFormData({ address: '', name: '', amount: '' });
      setErrors({});
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Bonus Recipients
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setIsAddDialogOpen(true)}
                  size="small"
                >
                  Add Recipient
                </Button>
              </Box>
              
              {recipients.length === 0 ? (
                <Alert severity="info">
                  No recipients added yet. Click "Add Recipient" to start building your bonus distribution list.
                </Alert>
              ) : (
                <List>
                  {recipients.map((recipient, index) => (
                    <ListItem key={index} divider>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1" fontWeight={500}>
                              {recipient.name}
                            </Typography>
                            <Chip 
                              label={formatCurrency(recipient.amount)}
                              color="primary"
                              size="small"
                            />
                          </Box>
                        }
                        secondary={formatAddress(recipient.address)}
                      />
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          onClick={() => handleRemoveRecipient(index)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <BonusIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Distribution Summary
                </Typography>
              </Box>
              
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Recipients
                </Typography>
                <Typography variant="h4" color="primary.main">
                  {recipients.length}
                </Typography>
              </Box>
              
              <Box mb={3}>
                <Typography variant="body2" color="text.secondary">
                  Total Amount
                </Typography>
                <Typography variant="h5" color="success.main">
                  {formatCurrency(getTotalBonus())}
                </Typography>
              </Box>
              
              <Button
                variant="contained"
                fullWidth
                startIcon={isLoading ? <CircularProgress size={16} /> : <SendIcon />}
                onClick={handleDistributeBonuses}
                disabled={isLoading || recipients.length === 0}
                size="large"
              >
                {isLoading ? 'Distributing...' : 'Distribute Bonuses'}
              </Button>
              
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Bonus amounts will be encrypted before distribution. Each employee will only be able to decrypt their own bonus.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Recipient Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Add Bonus Recipient
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              label="Employee Wallet Address"
              fullWidth
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              error={!!errors.address}
              helperText={errors.address || 'The employee Ethereum wallet address'}
              margin="normal"
              placeholder="0x..."
            />
            
            <TextField
              label="Employee Name"
              fullWidth
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name || 'Employee name for identification'}
              margin="normal"
            />
            
            <TextField
              label="Bonus Amount (USD)"
              fullWidth
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              error={!!errors.amount}
              helperText={errors.amount || 'Bonus amount in USD'}
              margin="normal"
              type="number"
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Cancel
          </Button>
          <Button
            onClick={handleAddRecipient}
            variant="contained"
            startIcon={<AddIcon />}
          >
            Add Recipient
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};