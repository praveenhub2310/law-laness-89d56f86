import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';

const Subscription = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <CreditCard className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Subscription Plan</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Manage your subscription plan and billing.</p>
          {/* This will be populated with actual subscription functionality */}
        </CardContent>
      </Card>
    </div>
  );
};

export default Subscription;