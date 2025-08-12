
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Plus } from 'lucide-react';

const CourtCalendar = () => {
  const [hearings] = useState([
    {
      id: 1,
      title: "Johnson vs Insurance Co. - Mediation",
      case: "CASE-2024-001",
      date: "2024-01-18",
      time: "10:00 AM",
      duration: "2 hours",
      location: "Superior Court Room 3",
      type: "Mediation",
      status: "scheduled"
    },
    {
      id: 2,
      title: "Smith Property Dispute - Hearing",
      case: "CASE-2024-002", 
      date: "2024-01-22",
      time: "2:00 PM",
      duration: "1 hour",
      location: "District Court Room 1",
      type: "Hearing",
      status: "confirmed"
    },
    {
      id: 3,
      title: "Corporate Contract - Settlement Conference",
      case: "CASE-2024-003",
      date: "2024-01-25",
      time: "9:00 AM",
      duration: "3 hours",
      location: "Downtown Office",
      type: "Settlement",
      status: "tentative"
    },
    {
      id: 4,
      title: "Miller Divorce Case - Final Hearing",
      case: "CASE-2024-004",
      date: "2024-01-28",
      time: "11:00 AM",
      duration: "4 hours",
      location: "Family Court Room 2",
      type: "Final Hearing",
      status: "confirmed"
    },
    {
      id: 5,
      title: "ABC Corp Merger - Regulatory Review",
      case: "CASE-2024-005",
      date: "2024-02-02",
      time: "1:00 PM",
      duration: "2 hours",
      location: "Federal Building",
      type: "Regulatory",
      status: "scheduled"
    }
  ]);

  const getStatusBadge = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      tentative: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || colors.scheduled;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Court Calendar
            </CardTitle>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Hearing
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hearings.map((hearing) => (
              <div key={hearing.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{hearing.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{hearing.case}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{hearing.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{hearing.time} ({hearing.duration})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{hearing.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getStatusBadge(hearing.status)}>
                      {hearing.status.charAt(0).toUpperCase() + hearing.status.slice(1)}
                    </Badge>
                    <Badge variant="outline">
                      {hearing.type}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                  <Button size="sm" variant="outline">
                    Reschedule
                  </Button>
                  <Button size="sm" variant="outline">
                    Add to Calendar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourtCalendar;
