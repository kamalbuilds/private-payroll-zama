import React, { useState } from 'react';
import {
  Box,
  Chip,
  Typography,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  OpenInNew as OpenIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import type { PayrollEntry } from '../types';
import { EncryptedDataDisplay } from './EncryptedDataDisplay';
import { formatDate, formatDateTime, formatTransactionHash } from '../utils/formatters';

interface PaymentHistoryProps {
  payments: PayrollEntry[];
  showEmployeeColumn?: boolean;
  currentUserAddress?: string;
  onViewDetails?: (payment: PayrollEntry) => void;
  onDownloadReceipt?: (payment: PayrollEntry) => void;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  payments,
  showEmployeeColumn = true,
  currentUserAddress: _currentUserAddress,
  onViewDetails,
  onDownloadReceipt,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Removed unused handlers for pagination

  const getStatusColor = (status: PayrollEntry['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'warning';
      case 'pending':
        return 'info';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'payPeriod',
      headerName: 'Pay Period',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {formatDate(params.value)}
        </Typography>
      ),
    },
    ...(showEmployeeColumn ? [{
      field: 'employeeName',
      headerName: 'Employee',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {params.value || 'Unknown'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatTransactionHash(params.row.employeeId)}
          </Typography>
        </Box>
      ),
    }] : []),
    {
      field: 'baseSalary',
      headerName: 'Base Salary',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <EncryptedDataDisplay
          encryptedValue={params.value}
          variant="currency"
          size="small"
          showToggle={false}
          placeholder="••••"
        />
      ),
    },
    {
      field: 'bonus',
      headerName: 'Bonus',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <EncryptedDataDisplay
          encryptedValue={params.value}
          variant="currency"
          size="small"
          showToggle={false}
          placeholder="$0.00"
        />
      ),
    },
    {
      field: 'netPay',
      headerName: 'Net Pay',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <EncryptedDataDisplay
          encryptedValue={params.value}
          variant="currency"
          size="small"
          showToggle={true}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          color={getStatusColor(params.value)}
          variant="outlined"
        />
      ),
    },
    {
      field: 'processedAt',
      headerName: 'Date Processed',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {formatDateTime(params.value)}
        </Typography>
      ),
    },
    {
      field: 'transactionHash',
      headerName: 'Transaction',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          {params.value ? (
            <Tooltip title="View on explorer">
              <IconButton
                size="small"
                onClick={() => {
                  // Open transaction in block explorer
                  window.open(`https://explorer.zama.ai/tx/${params.value}`, '_blank');
                }}
              >
                <OpenIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Typography variant="caption" color="text.secondary">
              Pending
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          {onViewDetails && (
            <Tooltip title="View details">
              <IconButton
                size="small"
                onClick={() => onViewDetails(params.row)}
              >
                <ReceiptIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onDownloadReceipt && (
            <Tooltip title="Download receipt">
              <IconButton
                size="small"
                onClick={() => onDownloadReceipt(params.row)}
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  if (payments.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No payment history available. Payments will appear here once processed.
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        rows={payments}
        columns={columns}
        paginationModel={{ page, pageSize: rowsPerPage }}
        onPaginationModelChange={(model) => {
          setPage(model.page);
          setRowsPerPage(model.pageSize);
        }}
        pageSizeOptions={[5, 10, 25, 50]}
        disableRowSelectionOnClick
        autoHeight
        sx={{
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid',
            borderBottomColor: 'divider',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'grey.50',
            borderBottom: '2px solid',
            borderBottomColor: 'divider',
          },
        }}
      />
    </Box>
  );
};