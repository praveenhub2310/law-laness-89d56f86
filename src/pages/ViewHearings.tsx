import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, FileText, Users, ExternalLink, Plus } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ViewHearings = () => {
  const navigate = useNavigate();
  const { data: hearings, loading, error } = useSupabaseData({
    table: 'hearings',
    select: `
      *,
      case:projects(case_number, title),
      client:profiles!client_id(first_name, last_name)
    `,
    orderBy: { column: 'hearing_date', ascending: true },
    realtime: true
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'default';
      case 'confirmed': return 'default';
      case 'postponed': return 'destructive';
      case 'completed': return 'secondary';
      default: return 'default';
    }
  };

  const handleAddToCalendar = (hearing: any) => {
    const startDate = new Date(`${hearing.hearing_date} ${hearing.hearing_time || '00:00'}`);
    const endDate = new Date(startDate.getTime() + (hearing.duration ? 60 * 60 * 1000 : 60 * 60 * 1000));
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(hearing.title)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(hearing.description || '')}&location=${encodeURIComponent(hearing.court_name || '')}`;
    
    window.open(calendarUrl, '_blank');
  };

  const handleViewCaseDetails = (hearing: any) => {
    if (hearing.case_id) {
      navigate(`/case-details/${hearing.case_id}`);
    } else {
      toast.error('Case details not available');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return 'Time TBD';
    const time = new Date(`2000-01-01 ${timeStr}`);
    return time.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">View Hearings</h1>
          <p className="text-muted-foreground mt-2">Loading hearings...</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">View Hearings</h1>
          <p className="text-destructive mt-2">Error loading hearings: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">View Hearings</h1>
          <p className="text-muted-foreground mt-2">Upcoming hearings with linked case details</p>
        </div>
        <Button onClick={() => navigate('/hearings')} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Hearing
        </Button>
      </div>

      {hearings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hearings scheduled yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start by scheduling your first hearing to keep track of court appearances and important dates.
            </p>
            <Button onClick={() => navigate('/hearings')} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Schedule First Hearing
            </Button>
          </CardContent>
        </Card>
      ) : (
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
                    <CardDescription>{hearing.description || 'No description provided'}</CardDescription>
                  </div>
                  <Badge variant="outline">{hearing.hearing_type || 'General'}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>Case:</strong> {hearing.case?.case_number || hearing.hearing_number || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>Client:</strong> {hearing.client ? `${hearing.client.first_name} ${hearing.client.last_name}` : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>Date:</strong> {formatDate(hearing.hearing_date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>Time:</strong> {formatTime(hearing.hearing_time)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>Venue:</strong> {hearing.court_name}
                        {hearing.court_room && `, ${hearing.court_room}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>Judge:</strong> {hearing.judge_name || 'TBD'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => handleViewCaseDetails(hearing)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Case Details
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleAddToCalendar(hearing)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Add to Calendar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/documents?case=${hearing.case_id}`)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Case Documents
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewHearings;