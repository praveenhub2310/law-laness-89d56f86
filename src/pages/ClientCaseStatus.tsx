import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, FileText, User, Bell, CheckCircle, MessageSquare, ExternalLink, AlertCircle } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface CaseUpdate {
  id: string;
  case_id: string;
  title: string;
  description: string;
  update_type: string;
  old_status?: string;
  new_status?: string;
  created_at: string;
  updated_at: string;
}

interface CaseWithDetails {
  id: string;
  case_number: string;
  title: string;
  description: string;
  status: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  created_at: string;
  updated_at: string;
  client_id?: string;
  lawyer_id?: string;
  lawyer?: {
    first_name: string;
    last_name: string;
  };
}

const ClientCaseStatus = () => {
  const { user } = useAuth();

  // Fetch client's cases
  const { data: cases, loading: casesLoading, refetch: refetchCases } = useSupabaseData<CaseWithDetails>({
    table: 'projects',
    select: `
      *,
      lawyer:profiles!projects_lawyer_id_fkey(first_name, last_name)
    `,
    filters: user?.id ? [{ column: 'client_id', operator: 'eq', value: user.id }] : undefined,
    orderBy: { column: 'updated_at', ascending: false },
    realtime: true
  });

  // Fetch hearings for client
  const { data: hearings, loading: hearingsLoading } = useSupabaseData({
    table: 'hearings',
    select: '*',
    filters: user?.id ? [{ column: 'client_id', operator: 'eq', value: user.id }] : undefined,
    orderBy: { column: 'hearing_date', ascending: true },
    realtime: true
  });

  // Fetch case updates
  const { data: updates, loading: updatesLoading } = useSupabaseData<CaseUpdate>({
    table: 'case_updates',
    select: `
      *,
      case:projects!case_updates_case_id_fkey(case_number, title)
    `,
    orderBy: { column: 'created_at', ascending: false },
    realtime: true
  });

  // Get the most active case (most recent)
  const activeCase = cases?.[0];

  // Get next hearing
  const nextHearing = hearings?.find(h => 
    new Date(h.hearing_date) >= new Date() && h.status === 'scheduled'
  );

  // Calculate case progress (simple estimation based on status and time)
  const calculateProgress = (caseData: CaseWithDetails) => {
    if (!caseData.status) return 0;
    
    const statusProgress = {
      'active': 25,
      'discovery': 45,
      'negotiation': 65,
      'trial': 85,
      'closed': 100
    };
    
    return statusProgress[caseData.status as keyof typeof statusProgress] || 25;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'default';
      case 'scheduled': return 'secondary';
      case 'ongoing': return 'outline';
      case 'urgent': return 'destructive';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'filing': return <FileText className="h-4 w-4" />;
      case 'hearing': return <Calendar className="h-4 w-4" />;
      case 'testimony': return <User className="h-4 w-4" />;
      case 'negotiation': return <Bell className="h-4 w-4" />;
      case 'status_change': return <AlertCircle className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const handleContactLawyer = () => {
    toast.info('Contact feature will be implemented soon');
  };

  const handleViewDocuments = () => {
    toast.info('Document viewing feature will be implemented soon');
  };

  if (casesLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!cases || cases.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Case Status Updates</h1>
          <p className="text-muted-foreground mt-2">Real-time updates from your legal cases</p>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Active Cases</h3>
            <p className="text-gray-600">You don't have any active legal cases at this time.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Case Status Updates</h1>
        <p className="text-muted-foreground mt-2">Real-time updates from your legal cases</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{activeCase?.title}</CardTitle>
                <CardDescription>Case Number: {activeCase?.case_number}</CardDescription>
              </div>
              <Badge variant="outline">{activeCase?.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Case Progress</span>
                  <span className="text-sm text-muted-foreground">{calculateProgress(activeCase)}%</span>
                </div>
                <Progress value={calculateProgress(activeCase)} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Lawyer:</strong> {activeCase?.lawyer ? 
                      `${activeCase.lawyer.first_name} ${activeCase.lawyer.last_name}` : 
                      'Not assigned'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Next Hearing:</strong> {nextHearing?.hearing_date ? 
                      new Date(nextHearing.hearing_date).toLocaleDateString() : 
                      'Not scheduled'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Court:</strong> {nextHearing?.court_name || 'TBD'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Est. Completion:</strong> {activeCase?.end_date ? 
                      new Date(activeCase.end_date).toLocaleDateString() : 
                      'TBD'
                    }
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button size="sm" onClick={handleContactLawyer}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Lawyer
                </Button>
                <Button variant="outline" size="sm" onClick={handleViewDocuments}>
                  <FileText className="h-4 w-4 mr-2" />
                  View Documents
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="/dashboard/client-hearings">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Hearings
                  </a>
                </Button>
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
            <Button variant="outline" className="w-full" onClick={handleContactLawyer}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <a href="/dashboard/document-upload">
                <FileText className="h-4 w-4 mr-2" />
                Upload Documents
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Updates</CardTitle>
          <CardDescription>Latest developments in your cases</CardDescription>
        </CardHeader>
        <CardContent>
          {updatesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : updates && updates.length > 0 ? (
            <div className="space-y-4">
              {updates.map((update) => (
                <div key={update.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    {getTypeIcon(update.update_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{update.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={getStatusColor(update.new_status || update.update_type)} 
                          className="text-xs"
                        >
                          {update.new_status || update.update_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(update.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{update.description}</p>
                    {update.old_status && update.new_status && (
                      <p className="text-xs text-blue-600 mt-1">
                        Status changed from "{update.old_status}" to "{update.new_status}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No recent updates for your cases.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientCaseStatus;