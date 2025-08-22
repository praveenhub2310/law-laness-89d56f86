import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Search, Filter, CreditCard, TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface Transaction {
  id: string;
  transaction_number: string;
  invoice_id?: string;
  client_id: string;
  lawyer_id: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  transaction_type: 'payment' | 'refund' | 'adjustment';
  description?: string;
  created_at: string;
  client_profile?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  invoice?: {
    invoice_number: string;
  };
}

const Transactions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [clients, setClients] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  const [newTransaction, setNewTransaction] = useState({
    client_id: '',
    invoice_id: '',
    amount: 0,
    method: 'bank_transfer',
    transaction_type: 'payment' as 'payment' | 'refund' | 'adjustment',
    description: ''
  });

  // Fetch transactions with real-time updates
  useEffect(() => {
    if (!user) return;

    const fetchTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select(`
            *,
            client_profile:profiles!transactions_client_id_fkey(
              first_name,
              last_name,
              email
            ),
            invoice:invoices(
              invoice_number
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTransactions(data || []);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch transactions',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    // Fetch clients and invoices for dropdowns
    const fetchData = async () => {
      const [clientsResult, invoicesResult] = await Promise.all([
        supabase.from('profiles').select('id, first_name, last_name, email').eq('role', 'client'),
        supabase.from('invoices').select('id, invoice_number, client_id').eq('status', 'unpaid')
      ]);
      
      setClients(clientsResult.data || []);
      setInvoices(invoicesResult.data || []);
    };

    fetchTransactions();
    fetchData();

    // Real-time subscription
    const channel = supabase
      .channel('transactions_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transactions'
      }, () => {
        fetchTransactions();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, toast]);

  const handleCreateTransaction = async () => {
    try {
      const transactionNumber = `TXN-${Date.now()}`;
      
      const { error } = await supabase
        .from('transactions')
        .insert([{
          transaction_number: transactionNumber,
          client_id: newTransaction.client_id,
          lawyer_id: user?.id,
          invoice_id: newTransaction.invoice_id || null,
          amount: newTransaction.amount,
          method: newTransaction.method,
          transaction_type: newTransaction.transaction_type,
          description: newTransaction.description,
          status: 'pending',
          processed_by: user?.id
        }]);

      if (error) throw error;

      // If this is an invoice payment, update invoice status
      if (newTransaction.invoice_id && newTransaction.transaction_type === 'payment') {
        const { data: invoice } = await supabase
          .from('invoices')
          .select('total_amount')
          .eq('id', newTransaction.invoice_id)
          .single();

        if (invoice) {
          const newStatus = newTransaction.amount >= invoice.total_amount ? 'paid' : 'partial';
          await supabase
            .from('invoices')
            .update({ 
              status: newStatus,
              payment_date: newStatus === 'paid' ? new Date().toISOString().split('T')[0] : null
            })
            .eq('id', newTransaction.invoice_id);
        }
      }

      toast({
        title: 'Success',
        description: 'Transaction created successfully'
      });

      setIsCreateModalOpen(false);
      setNewTransaction({
        client_id: '',
        invoice_id: '',
        amount: 0,
        method: 'bank_transfer',
        transaction_type: 'payment',
        description: ''
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to create transaction',
        variant: 'destructive'
      });
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.transaction_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.client_profile?.first_name + ' ' + transaction.client_profile?.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesType = typeFilter === 'all' || transaction.transaction_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'refund': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'adjustment': return <CreditCard className="h-4 w-4 text-blue-600" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  const getMethodDisplay = (method: string) => {
    const methods = {
      'razorpay': 'Razorpay',
      'upi': 'UPI',
      'bank_transfer': 'Bank Transfer',
      'cash': 'Cash',
      'check': 'Check',
      'card': 'Card'
    };
    return methods[method as keyof typeof methods] || method;
  };

  // Calculate summary stats
  const totalSuccess = filteredTransactions
    .filter(t => t.status === 'success')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPending = filteredTransactions
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return <div className="p-6">Loading transactions...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">Track all payment transactions and history</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Transaction</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="client">Client</Label>
                <Select value={newTransaction.client_id} onValueChange={(value) => setNewTransaction({...newTransaction, client_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.first_name} {client.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="invoice">Invoice (Optional)</Label>
                <Select value={newTransaction.invoice_id} onValueChange={(value) => setNewTransaction({...newTransaction, invoice_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select invoice (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Invoice</SelectItem>
                    {invoices
                      .filter(invoice => !newTransaction.client_id || invoice.client_id === newTransaction.client_id)
                      .map(invoice => (
                      <SelectItem key={invoice.id} value={invoice.id}>
                        {invoice.invoice_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({...newTransaction, amount: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={newTransaction.transaction_type} onValueChange={(value: any) => setNewTransaction({...newTransaction, transaction_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="refund">Refund</SelectItem>
                      <SelectItem value="adjustment">Adjustment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="method">Payment Method</Label>
                <Select value={newTransaction.method} onValueChange={(value) => setNewTransaction({...newTransaction, method: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="razorpay">Razorpay</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTransaction}>
                  Create Transaction
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalSuccess.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredTransactions.filter(t => t.status === 'success').length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Transactions</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">${totalPending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredTransactions.filter(t => t.status === 'pending').length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredTransactions.length}</div>
            <p className="text-xs text-muted-foreground">All transaction records</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="payment">Payment</SelectItem>
            <SelectItem value="refund">Refund</SelectItem>
            <SelectItem value="adjustment">Adjustment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transactions List */}
      <div className="grid gap-4">
        {filteredTransactions.map((transaction) => (
          <Card key={transaction.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeIcon(transaction.transaction_type)}
                    <span className="font-semibold">{transaction.transaction_number}</span>
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Client</div>
                      <div>{transaction.client_profile?.first_name} {transaction.client_profile?.last_name}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Method</div>
                      <div>{getMethodDisplay(transaction.method)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Type</div>
                      <div className="capitalize">{transaction.transaction_type}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Date</div>
                      <div>{new Date(transaction.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  {transaction.invoice && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Invoice: {transaction.invoice.invoice_number}
                    </div>
                  )}
                  {transaction.description && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      {transaction.description}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    ${transaction.amount}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {transaction.currency}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTransactions.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No transactions found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Transactions;