
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

const CourtCalendar = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Calendar className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Court Calendar</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Court Dates</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">View and manage your court appearances and hearings.</p>
          {/* This will be populated with actual calendar functionality */}
        </CardContent>
      </Card>
    </div>
  );
};

export default CourtCalendar;
