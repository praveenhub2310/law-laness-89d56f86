import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Banknote } from 'lucide-react';

const Payroll = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Banknote className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Payroll Management</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Employee Payroll</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Manage employee payroll and compensation.</p>
          {/* This will be populated with actual payroll functionality */}
        </CardContent>
      </Card>
    </div>
  );
};

export default Payroll;