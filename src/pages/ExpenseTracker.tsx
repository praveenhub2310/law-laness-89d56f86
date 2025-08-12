
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

const ExpenseTracker = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <DollarSign className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Expense Tracker</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Track Your Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Record and categorize case-related expenses and reimbursements.</p>
          {/* This will be populated with actual expense tracking functionality */}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseTracker;
