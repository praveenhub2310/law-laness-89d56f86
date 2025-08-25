import React from 'react';
import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const TrustAccounting = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Mock data for trust accounts until we create the proper table
  const mockTrustData = [
    {
      id: 'TA-001',
      client_name: 'John Smith',
      account_number: 'TA-001-2024',
      balance: 5000.00,
      deposit_date: '2024-01-15',
      description: 'Retainer for legal services',
      status: 'active',
      interest_earned: 25.50,
      last_transaction: '2024-01-20'
    },
    {
      id: 'TA-002',
      client_name: 'ABC Corporation',
      account_number: 'TA-002-2024',
      balance: 15000.00,
      deposit_date: '2024-01-10',
      description: 'Settlement funds',
      status: 'active',
      interest_earned: 75.25,
      last_transaction: '2024-01-18'
    },
    {
      id: 'TA-003',
      client_name: 'Maria Rodriguez',
      account_number: 'TA-003-2024',
      balance: 0.00,
      deposit_date: '2024-01-05',
      description: 'Estate settlement - disbursed',
      status: 'closed',
      interest_earned: 12.75,
      last_transaction: '2024-01-22'
    }
  ];

  // Calculate summary statistics
  const totalBalance = mockTrustData
    .filter(account => account.status === 'active')
    .reduce((sum, account) => sum + account.balance, 0);
  
  const totalInterest = mockTrustData.reduce((sum, account) => sum + account.interest_earned, 0);
  const activeAccounts = mockTrustData.filter(account => account.status === 'active').length;

  // Format data for display
  const formattedData = mockTrustData.map(account => {
    const parseDate = (dateString: string) => {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    };

    const depositDate = parseDate(account.deposit_date);
    const lastTransactionDate = parseDate(account.last_transaction);

    return {
      ...account,
      formattedBalance: `$${account.balance.toFixed(2)}`,
      formattedInterest: `$${account.interest_earned.toFixed(2)}`,
      formattedDepositDate: depositDate ? depositDate.toLocaleDateString() : 'N/A',
      formattedLastTransaction: lastTransactionDate ? lastTransactionDate.toLocaleDateString() : 'N/A'
    };
  });

  const columns = [
    {
      key: 'account_number',
      label: 'Account Number',
      sortable: true,
      filterable: true
    },
    {
      key: 'client_name',
      label: 'Client',
      sortable: true,
      filterable: true
    },
    {
      key: 'formattedBalance',
      label: 'Balance',
      sortable: true,
      render: (value: string, row: any) => (
        <span className={`font-semibold ${row.balance > 0 ? 'text-green-600' : 'text-gray-500'}`}>
          {value}
        </span>
      )
    },
    {
      key: 'formattedDepositDate',
      label: 'Deposit Date',
      sortable: true,
      filterable: true
    },
    {
      key: 'formattedLastTransaction',
      label: 'Last Transaction',
      sortable: true,
      filterable: true
    },
    {
      key: 'formattedInterest',
      label: 'Interest Earned',
      sortable: true,
      render: (value: string) => (
        <span className="text-blue-600 font-medium">{value}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: ['active', 'closed', 'pending'],
      render: (value: string) => {
        const colors = {
          'active': 'bg-green-100 text-green-800',
          'closed': 'bg-gray-100 text-gray-800',
          'pending': 'bg-yellow-100 text-yellow-800'
        };
        return (
          <Badge className={colors[value as keyof typeof colors]}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Badge>
        );
      }
    }
  ];

  const fields = [
    { key: 'client_name', label: 'Client Name', type: 'text' as const, required: true },
    { key: 'account_number', label: 'Account Number', type: 'text' as const, required: true },
    { key: 'balance', label: 'Initial Balance ($)', type: 'number' as const, required: true },
    { key: 'deposit_date', label: 'Deposit Date', type: 'date' as const, required: true },
    { key: 'description', label: 'Description', type: 'textarea' as const, required: true },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'select' as const,
      options: ['active', 'closed', 'pending'],
      required: true 
    }
  ];

  const handleAdd = (formData: any) => {
    toast({
      title: 'Trust Account Created',
      description: 'New trust account has been set up successfully.',
    });
  };

  const handleUpdate = (id: string, formData: any) => {
    toast({
      title: 'Account Updated',
      description: 'Trust account has been updated successfully.',
    });
  };

  const handleDelete = (id: string) => {
    toast({
      title: 'Account Deleted',
      description: 'Trust account has been removed.',
    });
  };

  const handleExport = () => {
    const csvData = formattedData.map(account => ({
      'Account Number': account.account_number,
      'Client Name': account.client_name,
      'Balance': account.formattedBalance,
      'Deposit Date': account.formattedDepositDate,
      'Last Transaction': account.formattedLastTransaction,
      'Interest Earned': account.formattedInterest,
      'Status': account.status,
      'Description': account.description
    }));
    
    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trust-accounts.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Calculator className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Trust Accounting</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trust Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all active accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAccounts}</div>
            <p className="text-xs text-muted-foreground">Currently managing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interest Earned</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${totalInterest.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total accumulated</p>
          </CardContent>
        </Card>
      </div>

      {/* Trust Accounts Table */}
      <DataTable
        title="Client Trust Accounts"
        columns={columns}
        data={formattedData}
        fields={fields}
        searchPlaceholder="Search trust accounts by client, account number, or status..."
        onAdd={handleAdd}
        onEdit={handleUpdate}
        onDelete={handleDelete}
        onExport={handleExport}
        entityName="Trust Account"
      />

      {/* Compliance Notice */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-yellow-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Compliance Notice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-yellow-700">
            Trust account management must comply with state bar regulations. Ensure proper segregation of client funds, 
            maintain detailed records, and perform regular reconciliations. Interest earned may need to be allocated 
            according to IOLTA requirements.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrustAccounting;