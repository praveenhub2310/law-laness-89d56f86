import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, User, FileText, ExternalLink, MessageSquare } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface HearingWithDetails {
  id: string;
  hearing_number: string;
  title: string;
  description: string;
  hearing_date: string;
  hearing_time?: string;
  court_name: string;
  court_room?: string;
  judge_name?: string;
  hearing_type?: string;
  status: string;
  case_id?: string;
  case?: {
    case_number: string;
    title: string;
  };
  lawyer?: {
    first_name: string;
    last_name: string;
  };
}

const ClientHearings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch client's hearings
  const { data: hearings, loading, refetch } = useSupabaseData<HearingWithDetails>({
    table: 'hearings',
    select: `
      *,
      case:projects!hearings_case_id_fkey(case_number, title),
      lawyer:profiles!hearings_lawyer_id_fkey(first_name, last_name)
    `,
    filters: user?.id ? [{ column: 'client_id', operator: 'eq', value: user.id }] : undefined,
    orderBy: { column: 'hearing_date', ascending: true },
    realtime: true
  });

  const getStatusColor = (status: string): "default" | "destructive" | "secondary" | "outline" => {
    const colors: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
      'scheduled': 'default',
      'confirmed': 'default', 
      'postponed': 'destructive',
      'completed': 'secondary',
      'cancelled': 'outline'
    };
    return colors[status] || 'outline';
  };

  const handleContactLawyer = () => {
    toast.success('Opening Messages', {
      description: 'Redirecting to contact your lawyer...'
    });
    navigate('/dashboard/messages');
  };

  const handleAddToCalendar = (hearing: HearingWithDetails) => {
    const startDate = new Date(`${hearing.hearing_date} ${hearing.hearing_time || '00:00'}`);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour default
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(hearing.title)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(hearing.description || '')}&location=${encodeURIComponent(hearing.court_name)}`;
    
    window.open(calendarUrl, '_blank');
    toast.success('Calendar Event Created', {
      description: 'Opening Google Calendar...'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Hearing Details</h1>
          <p className="text-muted-foreground mt-2">Your upcoming court hearings with case information</p>
        </div>
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!hearings || hearings.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Hearing Details</h1>
          <p className="text-muted-foreground mt-2">Your upcoming court hearings with case information</p>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Scheduled Hearings</h3>
            <p className="text-gray-600">You don't have any scheduled court hearings at this time.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Hearing Details</h1>
        <p className="text-muted-foreground mt-2">Your upcoming court hearings with case information</p>
      </div>

      <div className="grid gap-6">
        {hearings.map((hearing) => (
          <Card key={hearing.id} className={`${
            new Date(hearing.hearing_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && 
            hearing.status === 'scheduled' ? 'border-orange-200 bg-orange-50' : ''
          }`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {hearing.title}
                    <Badge variant={getStatusColor(hearing.status)}>{hearing.status}</Badge>
                  </CardTitle>
                  <CardDescription>{hearing.description}</CardDescription>
                </div>
                <Badge variant="outline">{hearing.hearing_type || 'Hearing'}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Case:</strong> {hearing.case?.case_number || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Your Lawyer:</strong> {hearing.lawyer ? 
                        `${hearing.lawyer.first_name} ${hearing.lawyer.last_name}` : 
                        'Not assigned'
                      }
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Date:</strong> {new Date(hearing.hearing_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Time:</strong> {hearing.hearing_time ? 
                        new Date(`2000-01-01 ${hearing.hearing_time}`).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit',
                          hour12: true 
                        }) : 'TBD'
                      }
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Venue:</strong> {hearing.court_room ? 
                        `${hearing.court_name} ${hearing.court_room}` : 
                        hearing.court_name
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Judge:</strong> {hearing.judge_name || 'TBD'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hearing Status Indicator */}
              {new Date(hearing.hearing_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && 
               hearing.status === 'scheduled' && (
                <div className="bg-orange-100 border border-orange-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    <div>
                      <h4 className="font-semibold text-orange-900">Upcoming Hearing</h4>
                      <p className="text-sm text-orange-700">
                        This hearing is scheduled within the next 7 days. Please prepare accordingly.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Preparation Guidelines</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 bg-primary rounded-full"></div>
                    Review case documents
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 bg-primary rounded-full"></div>
                    Arrive 15 minutes early
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 bg-primary rounded-full"></div>
                    Bring valid ID
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button 
                  size="sm" 
                  asChild
                  className="cursor-pointer pointer-events-auto"
                >
                  <a href="/dashboard/case-status">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Case Details
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleAddToCalendar(hearing)}
                  className="cursor-pointer pointer-events-auto"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Add to Calendar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleContactLawyer}
                  className="cursor-pointer pointer-events-auto"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Lawyer
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  asChild
                  className="cursor-pointer pointer-events-auto"
                >
                  <a 
                    href={`https://maps.google.com/maps?q=${encodeURIComponent(hearing.court_name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Get Directions
                  </a>
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