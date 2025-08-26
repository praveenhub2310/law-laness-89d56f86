
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
    select: `
      *,
      client:client_id(first_name, last_name),
      lawyer:lawyer_id(first_name, last_name),
      processed_by_user:processed_by(first_name, last_name)
    `,
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
      filterOptions: ['payment', 'expense', 'refund', 'transfer'],
      render: (value: string) => {
        const colors = {
          'payment': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
          'expense': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
          'refund': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
          'transfer': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
        };
        return (
          <Badge className={colors[value as keyof typeof colors]}>
            {value?.charAt(0).toUpperCase() + value?.slice(1)}
          </Badge>
        );
      }
    },
    {
      key: 'client',
      label: 'Client',
      sortable: true,
      filterable: true,
      render: (value: any) => value ? `${value.first_name} ${value.last_name}` : 'N/A'
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
      filterOptions: ['card', 'netbanking', 'wallet', 'upi', 'bank_transfer', 'check', 'cash']
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: ['pending', 'completed', 'failed', 'cancelled'],
      render: (value: string) => {
        const colors = {
          'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
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
      key: 'processed_by_user',
      label: 'Processed By',
      sortable: true,
      filterable: true,
      render: (value: any) => value ? `${value.first_name} ${value.last_name}` : 'System'
    }
  ];

  const fields = [
    { 
      key: 'transaction_type', 
      label: 'Transaction Type', 
      type: 'select' as const,
      options: ['payment', 'expense', 'refund', 'transfer'],
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
      options: ['card', 'netbanking', 'wallet', 'upi', 'bank_transfer', 'check', 'cash'],
      required: true 
    },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'select' as const,
      options: ['pending', 'completed', 'failed', 'cancelled'],
      required: true 
    },
    { key: 'payment_gateway_id', label: 'Payment Gateway ID', type: 'text' as const },
    { key: 'description', label: 'Description', type: 'textarea' as const }
  ];

  const exportData = () => {
    // Export functionality can be added here
    console.log('Exporting transaction data...');
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
    <div className="p-6">
      <DataTable
        title="Financial Transactions"
        columns={columns}
        data={data}
        fields={fields}
        searchPlaceholder="Search transactions by ID, client, or amount..."
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
