
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  Plus, 
  Receipt, 
  FileText, 
  Car, 
  Coffee, 
  Phone, 
  Plane,
  Calendar,
  Edit,
  Trash2,
  Download,
  Upload,
  Filter
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Expense {
  id: string;
  caseNumber: string;
  caseName: string;
  description: string;
  amount: number;
  category: 'travel' | 'meals' | 'communication' | 'research' | 'filing' | 'other';
  date: string;
  billable: boolean;
  reimbursable: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'reimbursed';
  receipt?: string;
  notes?: string;
}

const ExpenseTracker = () => {
  const { userProfile } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showNewExpenseForm, setShowNewExpenseForm] = useState(false);
  const [newExpense, setNewExpense] = useState({
    caseNumber: '',
    caseName: '',
    description: '',
    amount: 0,
    category: 'other' as const,
    billable: true,
    reimbursable: true,
    notes: ''
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockExpenses: Expense[] = [
      {
        id: '1',
        caseNumber: 'CS-2024-001',
        caseName: 'Tech Solutions Contract Dispute',
        description: 'Taxi to courthouse for hearing',
        amount: 45.50,
        category: 'travel',
        date: '2024-01-10',
        billable: true,
        reimbursable: true,
        status: 'approved',
        notes: 'Emergency taxi due to traffic delay'
      },
      {
        id: '2',
        caseNumber: 'EM-2024-012',
        caseName: 'Employment Termination Case',
        description: 'Client lunch meeting',
        amount: 125.75,
        category: 'meals',
        date: '2024-01-09',
        billable: true,
        reimbursable: false,
        status: 'pending'
      },
      {
        id: '3',
        caseNumber: 'PR-2024-005',
        caseName: 'Property Rights Dispute',
        description: 'Long distance calls to expert witnesses',
        amount: 89.25,
        category: 'communication',
        date: '2024-01-08',
        billable: true,
        reimbursable: true,
        status: 'reimbursed'
      },
      {
        id: '4',
        caseNumber: 'PI-2024-008',
        caseName: 'Personal Injury Claim',
        description: 'Flight to deposition in another state',
        amount: 650.00,
        category: 'travel',
        date: '2024-01-05',
        billable: true,
        reimbursable: true,
        status: 'approved'
      }
    ];
    setExpenses(mockExpenses);
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'travel': return <Car className="h-4 w-4" />;
      case 'meals': return <Coffee className="h-4 w-4" />;
      case 'communication': return <Phone className="h-4 w-4" />;
      case 'research': return <FileText className="h-4 w-4" />;
      case 'filing': return <Receipt className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'approved': return 'secondary';
      case 'rejected': return 'destructive';
      case 'reimbursed': return 'outline';
      default: return 'default';
    }
  };

  const addExpense = () => {
    if (!newExpense.caseNumber || !newExpense.description || newExpense.amount <= 0) return;

    const expense: Expense = {
      id: Date.now().toString(),
      caseNumber: newExpense.caseNumber,
      caseName: newExpense.caseName,
      description: newExpense.description,
      amount: newExpense.amount,
      category: newExpense.category,
      date: new Date().toISOString().split('T')[0],
      billable: newExpense.billable,
      reimbursable: newExpense.reimbursable,
      status: 'pending',
      notes: newExpense.notes
    };

    setExpenses(prev => [expense, ...prev]);
    setShowNewExpenseForm(false);
    setNewExpense({
      caseNumber: '',
      caseName: '',
      description: '',
      amount: 0,
      category: 'other',
      billable: true,
      reimbursable: true,
      notes: ''
    });
  };

  const deleteExpense = (expenseId: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
  };

  const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
  const billableExpenses = expenses.filter(e => e.billable).reduce((total, expense) => total + expense.amount, 0);
  const reimbursableExpenses = expenses.filter(e => e.reimbursable).reduce((total, expense) => total + expense.amount, 0);
  const pendingExpenses = expenses.filter(e => e.status === 'pending').reduce((total, expense) => total + expense.amount, 0);

  const expensesByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Expense Tracker</h1>
        </div>
        <Button onClick={() => setShowNewExpenseForm(!showNewExpenseForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold">${totalExpenses.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Billable</p>
                <p className="text-2xl font-bold">${billableExpenses.toFixed(2)}</p>
              </div>
              <Receipt className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reimbursable</p>
                <p className="text-2xl font-bold">${reimbursableExpenses.toFixed(2)}</p>
              </div>
              <Download className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">${pendingExpenses.toFixed(2)}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Expense Form */}
      {showNewExpenseForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Expense</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Case Number</label>
                <Input
                  placeholder="e.g., CS-2024-001"
                  value={newExpense.caseNumber}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, caseNumber: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Case Name</label>
                <Input
                  placeholder="Brief case description"
                  value={newExpense.caseName}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, caseName: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                placeholder="Describe the expense..."
                value={newExpense.description}
                onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Amount ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, amount: Number(e.target.value) }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="travel">Travel</option>
                  <option value="meals">Meals & Entertainment</option>
                  <option value="communication">Communication</option>
                  <option value="research">Research</option>
                  <option value="filing">Filing Fees</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex items-center space-x-4 pt-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="billable"
                    checked={newExpense.billable}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, billable: e.target.checked }))}
                  />
                  <label htmlFor="billable" className="text-sm">Billable</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="reimbursable"
                    checked={newExpense.reimbursable}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, reimbursable: e.target.checked }))}
                  />
                  <label htmlFor="reimbursable" className="text-sm">Reimbursable</label>
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Notes (Optional)</label>
              <Textarea
                placeholder="Additional notes about this expense..."
                value={newExpense.notes}
                onChange={(e) => setNewExpense(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={addExpense}>
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
              <Button variant="outline" onClick={() => setShowNewExpenseForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expenses List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Expenses</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="reimbursed">Reimbursed</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {expenses.map((expense) => (
            <Card key={expense.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getCategoryIcon(expense.category)}
                      <Badge variant="outline">{expense.caseNumber}</Badge>
                      <Badge variant={getStatusColor(expense.status)}>{expense.status}</Badge>
                      {expense.billable && <Badge>Billable</Badge>}
                      {expense.reimbursable && <Badge variant="secondary">Reimbursable</Badge>}
                    </div>
                    <h4 className="font-medium">{expense.description}</h4>
                    <p className="text-sm text-gray-600">{expense.caseName}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                      <span>Date: {expense.date}</span>
                      <span>Category: {expense.category}</span>
                      {expense.notes && <span>Notes: {expense.notes}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold">${expense.amount.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteExpense(expense.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {['pending', 'approved', 'reimbursed'].map(status => (
          <TabsContent key={status} value={status} className="space-y-4">
            {expenses
              .filter(expense => expense.status === status)
              .map((expense) => (
                <Card key={expense.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getCategoryIcon(expense.category)}
                          <Badge variant="outline">{expense.caseNumber}</Badge>
                          <Badge variant={getStatusColor(expense.status)}>{expense.status}</Badge>
                          {expense.billable && <Badge>Billable</Badge>}
                          {expense.reimbursable && <Badge variant="secondary">Reimbursable</Badge>}
                        </div>
                        <h4 className="font-medium">{expense.description}</h4>
                        <p className="text-sm text-gray-600">{expense.caseName}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                          <span>Date: {expense.date}</span>
                          <span>Category: {expense.category}</span>
                          {expense.notes && <span>Notes: {expense.notes}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold">${expense.amount.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => deleteExpense(expense.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        ))}

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(expensesByCategory).map(([category, amount]) => (
              <Card key={category}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(category)}
                      <span className="font-medium capitalize">{category}</span>
                    </div>
                    <span className="text-lg font-bold">${amount.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExpenseTracker;
