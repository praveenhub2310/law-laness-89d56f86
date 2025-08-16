
import React from 'react';
import { Calendar } from 'lucide-react';
import CourtCalendarComponent from '@/components/CourtCalendar';

const CourtCalendar = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Calendar className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Court Calendar</h1>
      </div>
      
      <CourtCalendarComponent />
    </div>
  );
};

export default CourtCalendar;
