import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';

const CaseAssignment = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <UserPlus className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Assign Lawyers</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Case-Lawyer Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Assign lawyers to cases and manage case assignments.</p>
          {/* This will be populated with actual assignment functionality */}
        </CardContent>
      </Card>
    </div>
  );
};

export default CaseAssignment;