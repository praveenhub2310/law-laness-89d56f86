
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

const TimeTracker = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Clock className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Time Tracker</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Track Your Time</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Log and track time spent on different cases and activities.</p>
          {/* This will be populated with actual time tracking functionality */}
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeTracker;
