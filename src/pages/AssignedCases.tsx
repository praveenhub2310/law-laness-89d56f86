
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';

const AssignedCases = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Briefcase className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Assigned Cases</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Active Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">View and manage cases assigned to you.</p>
          {/* This will be populated with actual case data */}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignedCases;
