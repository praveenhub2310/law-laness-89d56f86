import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';

const InvoicesPayments = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <CreditCard className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Invoices & Payments</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">View and pay your legal service invoices.</p>
          {/* This will be populated with actual invoices functionality */}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoicesPayments;