import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  FileText, 
  Users, 
  ExternalLink, 
  Plus,
  Search,
  Filter,
  CalendarDays
} from 'lucide-react';

interface Hearing {
  id: string;
  hearing_number: string;
  case_id?: string;
  client_id: string;
  lawyer_id: string;
  title: string;
  description?: string;
  hearing_date: string;
  hearing_time?: string;
  duration?: any;
  court_name: string;
  court_room?: string;
  judge_name?: string;
  hearing_type?: string;
  status: 'scheduled' | 'confirmed' | 'postponed' | 'completed' | 'cancelled';
  outcome?: string;
  notes?: string;
  created_at: string;
  client_profile?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  case_details?: {
    case_number: string;
    title: string;
  };
}

const ViewHearings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [clients, setClients] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);

  const [newHearing, setNewHearing] = useState({
    title: '',
    description: '',
    client_id: '',
    case_id: '',
    hearing_date: '',
    hearing_time: '',
    court_name: '',
    court_room: '',
    judge_name: '',
    hearing_type: '',
    notes: ''
  });

  // Fetch hearings with real-time updates
  useEffect(() => {
    if (!user) return;

    const fetchHearings = async () => {
      try {
        const { data, error } = await supabase
          .from('hearings')
          .select(`
            *,
            client_profile:profiles!hearings_client_id_fkey(
              first_name,
              last_name,
              email
            ),
            case_details:projects(
              case_number,
              title
            )
          `)
          .order('hearing_date', { ascending: true });

        if (error) throw error;
        setHearings(data || []);
      } catch (error) {
        console.error('Error fetching hearings:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch hearings',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    // Fetch clients and cases for dropdowns
    const fetchData = async () => {
      const [clientsResult, casesResult] = await Promise.all([
        supabase.from('profiles').select('id, first_name, last_name, email').eq('role', 'client'),
        supabase.from('projects').select('id, case_number, title, client_id')
      ]);
      
      setClients(clientsResult.data || []);
      setCases(casesResult.data || []);
    };

    fetchHearings();
    fetchData();

    // Real-time subscription
    const channel = supabase
      .channel('hearings_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'hearings'
      }, () => {
        fetchHearings();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, toast]);

  const handleCreateHearing = async () => {
    try {
      const hearingNumber = `HRG-${Date.now()}`;
      
      const { error } = await supabase
        .from('hearings')
        .insert([{
          hearing_number: hearingNumber,
          title: newHearing.title,
          description: newHearing.description,
          client_id: newHearing.client_id,
          lawyer_id: user?.id,
          case_id: newHearing.case_id || null,
          hearing_date: newHearing.hearing_date,
          hearing_time: newHearing.hearing_time || null,
          court_name: newHearing.court_name,
          court_room: newHearing.court_room || null,
          judge_name: newHearing.judge_name || null,
          hearing_type: newHearing.hearing_type || null,
          notes: newHearing.notes || null,
          status: 'scheduled'
        }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Hearing scheduled successfully'
      });

      setIsCreateModalOpen(false);
      setNewHearing({
        title: '',
        description: '',
        client_id: '',
        case_id: '',
        hearing_date: '',
        hearing_time: '',
        court_name: '',
        court_room: '',
        judge_name: '',
        hearing_type: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error creating hearing:', error);
      toast({
        title: 'Error',
        description: 'Failed to schedule hearing',
        variant: 'destructive'
      });
    }
  };

  const filteredHearings = hearings.filter(hearing => {
    const matchesSearch = hearing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hearing.court_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (hearing.client_profile?.first_name + ' ' + hearing.client_profile?.last_name).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || hearing.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'postponed': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const upcomingHearings = filteredHearings.filter(h => new Date(h.hearing_date) >= new Date());
  const completedHearings = filteredHearings.filter(h => h.status === 'completed');

  if (loading) {
    return <div className="p-6">Loading hearings...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">View Hearings</h1>
          <p className="text-muted-foreground">Manage and track all court hearings</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            List View
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            onClick={() => setViewMode('calendar')}
          >
            <CalendarDays className="h-4 w-4 mr-2" />
            Calendar
          </Button>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Hearing
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule New Hearing</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Hearing Title</Label>
                    <Input
                      id="title"
                      value={newHearing.title}
                      onChange={(e) => setNewHearing({...newHearing, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Hearing Type</Label>
                    <Input
                      id="type"
                      value={newHearing.hearing_type}
                      onChange={(e) => setNewHearing({...newHearing, hearing_type: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newHearing.description}
                    onChange={(e) => setNewHearing({...newHearing, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client">Client</Label>
                    <Select value={newHearing.client_id} onValueChange={(value) => setNewHearing({...newHearing, client_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.first_name} {client.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="case">Case (Optional)</Label>
                    <Select value={newHearing.case_id} onValueChange={(value) => setNewHearing({...newHearing, case_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select case (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No Case</SelectItem>
                        {cases
                          .filter(c => !newHearing.client_id || c.client_id === newHearing.client_id)
                          .map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.case_number} - {c.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Hearing Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newHearing.hearing_date}
                      onChange={(e) => setNewHearing({...newHearing, hearing_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Hearing Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newHearing.hearing_time}
                      onChange={(e) => setNewHearing({...newHearing, hearing_time: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="court">Court Name</Label>
                    <Input
                      id="court"
                      value={newHearing.court_name}
                      onChange={(e) => setNewHearing({...newHearing, court_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="room">Court Room</Label>
                    <Input
                      id="room"
                      value={newHearing.court_room}
                      onChange={(e) => setNewHearing({...newHearing, court_room: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="judge">Judge Name</Label>
                  <Input
                    id="judge"
                    value={newHearing.judge_name}
                    onChange={(e) => setNewHearing({...newHearing, judge_name: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newHearing.notes}
                    onChange={(e) => setNewHearing({...newHearing, notes: e.target.value})}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateHearing}>
                    Schedule Hearing
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Hearings</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{upcomingHearings.length}</div>
            <p className="text-xs text-muted-foreground">Scheduled hearings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Hearings</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedHearings.length}</div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search hearings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="postponed">Postponed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Hearings List */}
      <div className="grid gap-6">
        {filteredHearings.map((hearing) => (
          <Card key={hearing.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {hearing.title}
                    <Badge className={getStatusColor(hearing.status)}>
                      {hearing.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{hearing.description}</CardDescription>
                </div>
                {hearing.hearing_type && (
                  <Badge variant="outline">{hearing.hearing_type}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  {hearing.case_details && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>Case:</strong> {hearing.case_details.case_number}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Client:</strong> {hearing.client_profile?.first_name} {hearing.client_profile?.last_name}
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
                  {hearing.hearing_time && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>Time:</strong> {hearing.hearing_time}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Court:</strong> {hearing.court_name}
                      {hearing.court_room && ` - ${hearing.court_room}`}
                    </span>
                  </div>
                  {hearing.judge_name && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>Judge:</strong> {hearing.judge_name}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {hearing.notes && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <strong>Notes:</strong> {hearing.notes}
                </div>
              )}

              <div className="flex gap-2 mt-6">
                <Button variant="default" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Add to Calendar
                </Button>
                {hearing.case_details && (
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Case Documents
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredHearings.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No hearings found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ViewHearings;