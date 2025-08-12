
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';

const MyCases = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Briefcase className="h-6 w-6" />
        <h1 className="text-3xl font-bold">My Cases</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Case Status & Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Track the progress of your legal cases.</p>
          {/* This will be populated with actual case data */}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyCases;
