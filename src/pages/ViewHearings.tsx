import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, FileText, Users, ExternalLink } from 'lucide-react';

const ViewHearings = () => {
  const [hearings] = useState([
    {
      id: 1,
      title: 'Contract Dispute Hearing',
      caseNumber: 'CS-2024-001',
      clientName: 'Acme Corporation',
      date: '2024-01-15',
      time: '10:30 AM',
      venue: 'District Court Room 3',
      judge: 'Hon. Sarah Williams',
      status: 'scheduled',
      type: 'Civil',
      description: 'Motion hearing for contract breach case'
    },
    {
      id: 2,
      title: 'Employment Termination Case',
      caseNumber: 'EM-2024-012',
      clientName: 'John Smith',
      date: '2024-01-18',
      time: '2:00 PM',
      venue: 'Labor Court Room 1',
      judge: 'Hon. Michael Brown',
      status: 'confirmed',
      type: 'Employment',
      description: 'Final hearing for wrongful termination claim'
    },
    {
      id: 3,
      title: 'Property Rights Dispute',
      caseNumber: 'PR-2024-005',
      clientName: 'Green Valley LLC',
      date: '2024-01-22',
      time: '11:00 AM',
      venue: 'High Court Room 7',
      judge: 'Hon. Emily Chen',
      status: 'postponed',
      type: 'Property',
      description: 'Land acquisition dispute hearing'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'default';
      case 'confirmed': return 'default';
      case 'postponed': return 'destructive';
      case 'completed': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">View Hearings</h1>
        <p className="text-muted-foreground mt-2">Upcoming hearings with linked case details</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Case:</strong> {hearing.caseNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Client:</strong> {hearing.clientName}
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
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Judge:</strong> {hearing.judge}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button variant="default" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Case Details
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Add to Calendar
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Case Documents
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ViewHearings;