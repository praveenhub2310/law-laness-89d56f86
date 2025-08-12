import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator } from 'lucide-react';

const TrustAccounting = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Calculator className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Trust Accounting</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Client Trust Account Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Manage client trust accounts and escrow funds.</p>
          {/* This will be populated with actual trust accounting functionality */}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrustAccounting;