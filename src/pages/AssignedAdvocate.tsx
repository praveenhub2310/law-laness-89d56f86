import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck } from 'lucide-react';

const AssignedAdvocate = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <UserCheck className="h-6 w-6" />
        <h1 className="text-3xl font-bold">My Lawyer</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Assigned Legal Counsel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">View your assigned lawyer details and contact information.</p>
          {/* This will be populated with actual lawyer information */}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignedAdvocate;