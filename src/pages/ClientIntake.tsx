import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUp } from 'lucide-react';

const ClientIntake = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <FileUp className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Client Intake Forms</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Client Intake Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Manage client intake forms and onboarding process.</p>
          {/* This will be populated with actual intake form functionality */}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientIntake;