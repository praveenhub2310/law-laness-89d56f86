
import React from 'react';
import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { format } from 'date-fns';

const Transactions = () => {
  const {
    data,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem
  } = useSupabaseData({
    table: 'transactions',
    select: '*',
    orderBy: { column: 'created_at', ascending: false },
    realtime: true
  });

  const columns = [
    {
      key: 'transaction_number',
      label: 'Transaction ID',
      sortable: true,
      filterable: true
    },
    {
      key: 'created_at',
      label: 'Date',
      sortable: true,
      filterable: true,
      render: (value: string) => format(new Date(value), 'MMM dd, yyyy')
    },
    {
      key: 'created_at',
      label: 'Time',
      sortable: true,
      filterable: true,
      render: (value: string) => format(new Date(value), 'hh:mm a')
    },
    {
      key: 'transaction_type',
      label: 'Type',
      sortable: true,
      filterable: true,
      filterOptions: ['payment', 'refund', 'adjustment'],
      render: (value: string) => {
        const colors = {
          'payment': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
          'adjustment': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
          'refund': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
        };
        return (
          <Badge className={colors[value as keyof typeof colors]}>
            {value?.charAt(0).toUpperCase() + value?.slice(1)}
          </Badge>
        );
      }
    },
    {
      key: 'client_id',
      label: 'Client',
      sortable: true,
      filterable: true,
      render: (value: string) => value || 'N/A'
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      filterable: true,
      render: (value: number, row: any) => (
        <span className="font-semibold">
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: row.currency || 'USD'
          }).format(value)}
        </span>
      )
    },
    {
      key: 'method',
      label: 'Payment Method',
      sortable: true,
      filterable: true,
      filterOptions: ['razorpay', 'upi', 'bank_transfer', 'cash', 'check', 'card']
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: ['success', 'failed', 'pending', 'cancelled'],
      render: (value: string) => {
        const colors = {
          'success': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
          'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
          'failed': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
          'cancelled': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
        };
        return (
          <Badge className={colors[value as keyof typeof colors]}>
            {value?.charAt(0).toUpperCase() + value?.slice(1)}
          </Badge>
        );
      }
    },
    {
      key: 'processed_by',
      label: 'Processed By',
      sortable: true,
      filterable: true,
      render: (value: string) => value || 'System'
    }
  ];

  const fields = [
    { 
      key: 'transaction_type', 
      label: 'Transaction Type', 
      type: 'select' as const,
      options: ['payment', 'refund', 'adjustment'],
      required: true 
    },
    { key: 'amount', label: 'Amount', type: 'number' as const, required: true },
    { 
      key: 'currency', 
      label: 'Currency', 
      type: 'select' as const,
      options: ['USD', 'INR', 'EUR', 'GBP'],
      required: true 
    },
    { 
      key: 'method', 
      label: 'Payment Method', 
      type: 'select' as const,
      options: ['razorpay', 'upi', 'bank_transfer', 'cash', 'check', 'card'],
      required: true 
    },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'select' as const,
      options: ['success', 'failed', 'pending', 'cancelled'],
      required: true 
    },
    { key: 'payment_gateway_id', label: 'Payment Gateway ID', type: 'text' as const },
    { key: 'description', label: 'Description', type: 'textarea' as const }
  ];

  const exportToCSV = () => {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    // Define CSV headers
    const headers = [
      'Transaction ID',
      'Date',
      'Time',
      'Type',
      'Client ID',
      'Amount',
      'Currency',
      'Payment Method',
      'Status',
      'Processed By',
      'Description'
    ];

    // Convert data to CSV rows
    const rows = data.map(item => [
      item.transaction_number || '',
      format(new Date(item.created_at), 'MMM dd, yyyy'),
      format(new Date(item.created_at), 'hh:mm a'),
      item.transaction_type || '',
      item.client_id || 'N/A',
      item.amount || 0,
      item.currency || 'USD',
      item.method || '',
      item.status || '',
      item.processed_by || 'System',
      item.description || ''
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('CSV export completed successfully');
  };

  const exportData = () => {
    exportToCSV();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          Error loading transactions: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <DataTable
        title="Financial Transactions"
        columns={columns}
        data={data}
        fields={fields}
        searchPlaceholder="Search transactions..."
        onAdd={addItem}
        onEdit={updateItem}
        onDelete={deleteItem}
        onExport={exportData}
        entityName="Transaction"
      />
    </div>
  );
};

export default Transactions;
