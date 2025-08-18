import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  DollarSign, 
  Receipt, 
  TrendingUp, 
  FileText, 
  Car, 
  Coffee, 
  Phone, 
  Briefcase,
  Plus,
  Edit,
  Trash2,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { format } from 'date-fns';

interface Expense {
  id: string;
  case_id?: string;
  expense_title: string;
  amount: number;
  currency: string;
  expense_date: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Project {
  id: string;
  case_number: string;
  title: string;
}

const ExpenseTracker = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    case_id: '',
    expense_title: '',
    amount: '',
    currency: 'USD',
    expense_date: new Date().toISOString().split('T')[0],
    description: '',
    status: 'pending'
  });

  // Fetch expenses with real-time updates
  const {
    data: expenses,
    loading,
    addItem,
    updateItem,
    deleteItem
  } = useSupabaseData<Expense>({
    table: 'expenses',
    orderBy: { column: 'expense_date', ascending: false },
    realtime: true
  });

  // Fetch projects for case selection
  const { data: projects } = useSupabaseData<Project>({
    table: 'projects',
    select: 'id, case_number, title',
    orderBy: { column: 'created_at', ascending: false }
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'default';
      case 'approved': return 'secondary';
      case 'rejected': return 'destructive';
      case 'reimbursed': return 'outline';
      default: return 'default';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.expense_title || !formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields with valid values.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        case_id: formData.case_id || null
      };

      if (editingEntry) {
        await updateItem(editingEntry.id, expenseData);
        toast({
          title: 'Success',
          description: 'Expense updated successfully.'
        });
      } else {
        await addItem(expenseData);
        toast({
          title: 'Success',
          description: 'Expense added successfully.'
        });
      }
      
      setIsDialogOpen(false);
      setEditingEntry(null);
      setFormData({
        case_id: '',
        expense_title: '',
        amount: '',
        currency: 'USD',
        expense_date: new Date().toISOString().split('T')[0],
        description: '',
        status: 'pending'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save expense. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingEntry(expense);
    setFormData({
      case_id: expense.case_id || '',
      expense_title: expense.expense_title,
      amount: expense.amount.toString(),
      currency: expense.currency,
      expense_date: expense.expense_date,
      description: expense.description || '',
      status: expense.status
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteItem(id);
        toast({
          title: 'Success',
          description: 'Expense deleted successfully.'
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete expense.',
          variant: 'destructive'
        });
      }
    }
  };

  // Calculate metrics
  const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
  const pendingExpenses = expenses.filter(e => e.status === 'pending').reduce((total, expense) => total + expense.amount, 0);
  const approvedExpenses = expenses.filter(e => e.status === 'approved').reduce((total, expense) => total + expense.amount, 0);
  const reimbursedExpenses = expenses.filter(e => e.status === 'reimbursed').reduce((total, expense) => total + expense.amount, 0);

  const filterExpensesByStatus = (status: string) => {
    return expenses.filter(expense => expense.status === status);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <DollarSign className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Expense Tracker</h1>
        </div>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Expense Tracker</h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingEntry(null);
              setFormData({
                case_id: '',
                expense_title: '',
                amount: '',
                currency: 'USD',
                expense_date: new Date().toISOString().split('T')[0],
                description: '',
                status: 'pending'
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingEntry ? 'Edit Expense' : 'Add New Expense'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="case_id">Case (Optional)</Label>
                <Select value={formData.case_id} onValueChange={(value) => setFormData({...formData, case_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a case" />
                  </SelectTrigger>
                    <SelectContent>
                      {projects && projects.length > 0 ? (
                        projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.case_number} - {project.title}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>No cases available</SelectItem>
                      )}
                    </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="expense_title">Expense Title *</Label>
                <Input
                  id="expense_title"
                  value={formData.expense_title}
                  onChange={(e) => setFormData({...formData, expense_title: e.target.value})}
                  placeholder="e.g., Travel to courthouse"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="INR">INR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="expense_date">Date *</Label>
                <Input
                  id="expense_date"
                  type="date"
                  value={formData.expense_date}
                  onChange={(e) => setFormData({...formData, expense_date: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="reimbursed">Reimbursed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Additional details about the expense"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingEntry ? 'Update Expense' : 'Add Expense'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold">${totalExpenses.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">${pendingExpenses.toFixed(2)}</p>
              </div>
              <Receipt className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">${approvedExpenses.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reimbursed</p>
                <p className="text-2xl font-bold">${reimbursedExpenses.toFixed(2)}</p>
              </div>
              <Download className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expenses List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Expenses</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="reimbursed">Reimbursed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {expenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No expenses recorded</p>
              <p className="text-sm">Click "Add Expense" to record your first expense</p>
            </div>
          ) : (
            expenses.map((expense) => {
              const selectedCase = projects.find(p => p.id === expense.case_id);
              
              return (
                <Card key={expense.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {selectedCase && (
                            <Badge variant="outline">
                              {selectedCase.case_number}
                            </Badge>
                          )}
                          <Badge variant={getStatusColor(expense.status)}>
                            {expense.status}
                          </Badge>
                        </div>
                        <h4 className="font-medium">{expense.expense_title}</h4>
                        {selectedCase && (
                          <p className="text-sm text-muted-foreground">
                            {selectedCase.title}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                          <span>Date: {format(new Date(expense.expense_date), 'PPP')}</span>
                          <span>Currency: {expense.currency}</span>
                        </div>
                        {expense.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {expense.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            {expense.currency} {expense.amount.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(expense)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(expense.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {['pending', 'approved', 'rejected', 'reimbursed'].map(status => (
          <TabsContent key={status} value={status} className="space-y-4">
            {filterExpensesByStatus(status).map((expense) => {
              const selectedCase = projects.find(p => p.id === expense.case_id);
              
              return (
                <Card key={expense.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {selectedCase && (
                            <Badge variant="outline">
                              {selectedCase.case_number}
                            </Badge>
                          )}
                          <Badge variant={getStatusColor(expense.status)}>
                            {expense.status}
                          </Badge>
                        </div>
                        <h4 className="font-medium">{expense.expense_title}</h4>
                        {selectedCase && (
                          <p className="text-sm text-muted-foreground">
                            {selectedCase.title}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                          <span>Date: {format(new Date(expense.expense_date), 'PPP')}</span>
                          <span>Currency: {expense.currency}</span>
                        </div>
                        {expense.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {expense.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            {expense.currency} {expense.amount.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(expense)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(expense.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ExpenseTracker;