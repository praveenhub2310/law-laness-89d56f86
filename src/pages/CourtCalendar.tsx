
import React from 'react';
import { Calendar } from 'lucide-react';
import EnhancedCourtCalendar from '@/components/EnhancedCourtCalendar';

const CourtCalendar = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Calendar className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Court Calendar & Hearings</h1>
        <p className="text-muted-foreground ml-4">
          Unified calendar view with Google/Outlook sync
        </p>
      </div>
      
      <EnhancedCourtCalendar />
    </div>
  );
};

export default CourtCalendar;
