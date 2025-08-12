import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, FileText, User, Bell, CheckCircle } from 'lucide-react';

const ClientCaseStatus = () => {
  const [caseDetails] = useState({
    caseNumber: 'CS-2024-001',
    title: 'Contract Dispute Resolution',
    status: 'Discovery Phase',
    progress: 45,
    lastUpdated: '2024-01-10',
    nextHearing: '2024-01-25',
    assignedLawyer: 'Sarah Johnson',
    courtName: 'District Court',
    estimatedCompletion: '2024-06-15'
  });

  const [updates] = useState([
    {
      date: '2024-01-10',
      title: 'Discovery Documents Submitted',
      description: 'All requested documents have been submitted to the court for review.',
      type: 'filing',
      status: 'completed'
    },
    {
      date: '2024-01-08',
      title: 'Motion Hearing Scheduled',
      description: 'Motion hearing scheduled for January 25, 2024 at 2:00 PM.',
      type: 'hearing',
      status: 'scheduled'
    },
    {
      date: '2024-01-05',
      title: 'Expert Witness Testimony',
      description: 'Expert witness deposition completed. Testimony supports our position.',
      type: 'testimony',
      status: 'completed'
    },
    {
      date: '2024-01-03',
      title: 'Settlement Negotiations',
      description: 'Initial settlement discussions with opposing counsel initiated.',
      type: 'negotiation',
      status: 'ongoing'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'scheduled': return 'secondary';
      case 'ongoing': return 'outline';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'filing': return <FileText className="h-4 w-4" />;
      case 'hearing': return <Calendar className="h-4 w-4" />;
      case 'testimony': return <User className="h-4 w-4" />;
      case 'negotiation': return <Bell className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Case Status Updates</h1>
        <p className="text-muted-foreground mt-2">Real-time updates from court cause list</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{caseDetails.title}</CardTitle>
                <CardDescription>Case Number: {caseDetails.caseNumber}</CardDescription>
              </div>
              <Badge variant="outline">{caseDetails.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Case Progress</span>
                  <span className="text-sm text-muted-foreground">{caseDetails.progress}%</span>
                </div>
                <Progress value={caseDetails.progress} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Lawyer:</strong> {caseDetails.assignedLawyer}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Next Hearing:</strong> {caseDetails.nextHearing}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Court:</strong> {caseDetails.courtName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Est. Completion:</strong> {caseDetails.estimatedCompletion}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button size="sm">Contact Lawyer</Button>
                <Button variant="outline" size="sm">View Documents</Button>
                <Button variant="outline" size="sm">Case Timeline</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full">
              <Bell className="h-4 w-4 mr-2" />
              Enable Notifications
            </Button>
            <Button variant="outline" className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
            <Button variant="outline" className="w-full">
              <FileText className="h-4 w-4 mr-2" />
              Upload Documents
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Updates</CardTitle>
          <CardDescription>Latest developments in your case</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {updates.map((update, index) => (
              <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  {getTypeIcon(update.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium">{update.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(update.status)} className="text-xs">
                        {update.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{update.date}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{update.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientCaseStatus;