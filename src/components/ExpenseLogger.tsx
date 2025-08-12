
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Receipt, Plus, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ExpenseLogger = () => {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState([
    { id: 1, case: 'Johnson vs Insurance Co.', description: 'Court Filing Fee', amount: 150, category: 'Court Fees', date: '2024-01-15', billable: true, approved: true },
    { id: 2, case: 'Smith Property Dispute', description: 'Client Meeting Lunch', amount: 45, category: 'Meals', date: '2024-01-14', billable: true, approved: false },
    { id: 3, case: 'Corporate Contract Review', description: 'Legal Research Books', amount: 125, category: 'Office Supplies', date: '2024-01-13', billable: false, approved: true },
    { id: 4, case: 'Miller Divorce Case', description: 'Travel to Court', amount: 35, category: 'Travel', date: '2024-01-12', billable: true, approved: true },
    { id: 5, case: 'ABC Corp Merger', description: 'Expert Witness Fee', amount: 500, category: 'Professional Services', date: '2024-01-11', billable: true, approved: true },
    { id: 6, case: 'Davis Criminal Defense', description: 'Document Printing', amount: 25, category: 'Office Supplies', date: '2024-01-10', billable: true, approved: false }
  ]);

  const [newExpense, setNewExpense] = useState({
    case: '',
    description: '',
    amount: '',
    category: '',
    billable: true
  });

  const handleAddExpense = () => {
    if (!newExpense.description || !newExpense.amount || !newExpense.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const expense = {
      id: expenses.length + 1,
      case: newExpense.case,
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      category: newExpense.category,
      date: new Date().toISOString().split('T')[0],
      billable: newExpense.billable,
      approved: false
    };

    setExpenses([expense, ...expenses]);
    setNewExpense({ case: '', description: '', amount: '', category: '', billable: true });
    
    toast({
      title: "Expense Added",
      description: "Your expense has been logged successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Add New Expense
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="case">Case</Label>
              <Input
                id="case"
                value={newExpense.case}
                onChange={(e) => setNewExpense({ ...newExpense, case: e.target.value })}
                placeholder="Select or enter case..."
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              placeholder="Enter expense description..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select value={newExpense.category} onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Travel">Travel</SelectItem>
                  <SelectItem value="Meals">Meals</SelectItem>
                  <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                  <SelectItem value="Court Fees">Court Fees</SelectItem>
                  <SelectItem value="Professional Services">Professional Services</SelectItem>
                  <SelectItem value="Communication">Communication</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddExpense} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{expense.description}</h4>
                  <p className="text-sm text-gray-600">{expense.case || 'General'}</p>
                  <p className="text-xs text-gray-500">{expense.date} • {expense.category}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-medium">${expense.amount}</p>
                  <div className="flex gap-1">
                    <Badge variant={expense.billable ? 'default' : 'secondary'}>
                      {expense.billable ? 'Billable' : 'Non-billable'}
                    </Badge>
                    <Badge variant={expense.approved ? 'default' : 'destructive'}>
                      {expense.approved ? 'Approved' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseLogger;
