import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  Add as AddIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useWalletContext } from '../contexts/WalletContext';
import { usePayrollContract } from '../hooks/usePayrollContract';
import { isValidEthereumAddress, isValidAmount } from '../utils/formatters';
import toast from 'react-hot-toast';

interface EmployeeManagementProps {
  onEmployeeChange?: () => void;
}

export const EmployeeManagement: React.FC<EmployeeManagementProps> = ({ onEmployeeChange }) => {
  const { provider, signer } = useWalletContext();
  const { addEmployee } = usePayrollContract(provider || undefined, signer || undefined);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    name: '',
    position: '',
    salary: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.address.trim()) {
      newErrors.address = 'Employee address is required';
    } else if (!isValidEthereumAddress(formData.address)) {
      newErrors.address = 'Please enter a valid Ethereum address';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Employee name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    }

    if (!formData.salary.trim()) {
      newErrors.salary = 'Salary is required';
    } else if (!isValidAmount(formData.salary)) {
      newErrors.salary = 'Please enter a valid salary amount';
    } else if (parseFloat(formData.salary) <= 0) {
      newErrors.salary = 'Salary must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddEmployee = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const salaryInCents = Math.round(parseFloat(formData.salary) * 100);
      
      const success = await addEmployee(
        formData.address,
        formData.name.trim(),
        formData.position.trim(),
        salaryInCents
      );

      if (success) {
        toast.success('Employee added successfully!');
        setFormData({ address: '', name: '', position: '', salary: '' });
        setIsAddDialogOpen(false);
        onEmployeeChange?.();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add employee');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseDialog = () => {
    if (!isLoading) {
      setIsAddDialogOpen(false);
      setFormData({ address: '', name: '', position: '', salary: '' });
      setErrors({});
    }
  };

  return (
    <Box>
      {/* Add Employee Card */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PersonIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6">
                  Add New Employee
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Add a new employee to the payroll system. Their salary will be encrypted automatically.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsAddDialogOpen(true)}
                fullWidth
              >
                Add Employee
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Employee Management
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Manage your workforce with encrypted salary protection.
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2">
                • Salaries are encrypted using FHE<br />
                • Only employees can decrypt their own data<br />
                • Full audit trail maintained<br />
                • GDPR compliant operations
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Employee Dialog */}
      <Dialog 
        open={isAddDialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Add New Employee
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
              label="Full Name"
              fullWidth
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name || 'Employee full name'}
              margin="normal"
            />
            
            <TextField
              label="Position/Title"
              fullWidth
              value={formData.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
              error={!!errors.position}
              helperText={errors.position || 'Job title or position'}
              margin="normal"
            />
            
            <TextField
              label="Monthly Salary (USD)"
              fullWidth
              value={formData.salary}
              onChange={(e) => handleInputChange('salary', e.target.value)}
              error={!!errors.salary}
              helperText={errors.salary || 'Monthly salary amount in USD'}
              margin="normal"
              type="number"
              inputProps={{ min: 0, step: 0.01 }}
            />

            <Alert severity="info" sx={{ mt: 2 }}>
              The salary amount will be encrypted using Fully Homomorphic Encryption (FHE) 
              before being stored on the blockchain. Only the employee will be able to decrypt 
              and view their salary information.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDialog} 
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddEmployee}
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : <AddIcon />}
          >
            {isLoading ? 'Adding...' : 'Add Employee'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};