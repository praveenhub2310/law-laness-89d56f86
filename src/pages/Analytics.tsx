import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

const Analytics = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Business Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">View firm performance metrics and analytics.</p>
          {/* This will be populated with actual analytics functionality */}
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;