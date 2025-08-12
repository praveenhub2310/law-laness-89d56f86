import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, User, FileText, ExternalLink } from 'lucide-react';

const ClientHearings = () => {
  const [hearings] = useState([
    {
      id: 1,
      title: 'Contract Dispute Motion Hearing',
      caseNumber: 'CS-2024-001',
      date: '2024-01-25',
      time: '2:00 PM',
      venue: 'District Court Room 3',
      judge: 'Hon. Sarah Williams',
      lawyer: 'John Lawyer',
      status: 'scheduled',
      type: 'Motion Hearing',
      description: 'Hearing for summary judgment motion in contract dispute case.',
      preparation: [
        'Review contract documents',
        'Prepare supporting evidence',
        'Coordinate with legal team'
      ]
    },
    {
      id: 2,
      title: 'Final Settlement Conference',
      caseNumber: 'CS-2024-001',
      date: '2024-02-10',
      time: '10:00 AM',
      venue: 'Mediation Center Room B',
      judge: 'Hon. Michael Brown',
      lawyer: 'John Lawyer',
      status: 'confirmed',
      type: 'Settlement Conference',
      description: 'Final attempt at settlement before trial proceedings.',
      preparation: [
        'Review settlement offers',
        'Prepare financial documents',
        'Discuss strategy with lawyer'
      ]
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'default';
      case 'confirmed': return 'default';
      case 'postponed': return 'destructive';
      case 'completed': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Hearing Details</h1>
        <p className="text-muted-foreground mt-2">Your upcoming court hearings with case information</p>
      </div>

      <div className="grid gap-6">
        {hearings.map((hearing) => (
          <Card key={hearing.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {hearing.title}
                    <Badge variant={getStatusColor(hearing.status)}>{hearing.status}</Badge>
                  </CardTitle>
                  <CardDescription>{hearing.description}</CardDescription>
                </div>
                <Badge variant="outline">{hearing.type}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Case:</strong> {hearing.caseNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Your Lawyer:</strong> {hearing.lawyer}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Date:</strong> {hearing.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Time:</strong> {hearing.time}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Venue:</strong> {hearing.venue}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Judge:</strong> {hearing.judge}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Preparation Checklist</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
                  {hearing.preparation.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="h-2 w-2 bg-primary rounded-full"></div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Case Details
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Add to Calendar
                </Button>
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Contact Lawyer
                </Button>
                <Button variant="outline" size="sm">
                  <MapPin className="h-4 w-4 mr-2" />
                  Get Directions
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ClientHearings;