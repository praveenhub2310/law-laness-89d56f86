import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, MapPin, Plus, Edit, Trash2, CalendarPlus, RotateCcw } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface CourtCalendarEntry {
  id: string;
  case_id?: string;
  title: string;
  description?: string;
  court_name?: string;
  hearing_date: string;
  start_time?: string;
  duration?: string;
  location?: string;
  status: string;
  type?: string;
  created_at: string;
  updated_at: string;
}

interface Project {
  id: string;
  case_number: string;
  title: string;
}

const CourtCalendar = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CourtCalendarEntry | null>(null);
  const [reschedulingEntry, setReschedulingEntry] = useState<CourtCalendarEntry | null>(null);
  const [formData, setFormData] = useState({
    case_id: '',
    title: '',
    description: '',
    court_name: '',
    hearing_date: '',
    start_time: '',
    duration: '',
    location: '',
    status: 'Scheduled',
    type: ''
  });
  const [rescheduleData, setRescheduleData] = useState({
    hearing_date: '',
    start_time: '',
    duration: ''
  });

  // Fetch court calendar entries with real-time updates
  const {
    data: hearings = [],
    loading: hearingsLoading,
    error: hearingsError,
    addItem,
    updateItem,
    deleteItem
  } = useSupabaseData<CourtCalendarEntry>({
    table: 'court_calendar',
    orderBy: { column: 'hearing_date', ascending: true },
    realtime: false
  });

  // Fetch projects for case selection  
  const { 
    data: projects = [], 
    loading: projectsLoading,
    error: projectsError
  } = useSupabaseData<Project>({
    table: 'projects',
    select: 'id, case_number, title',
    orderBy: { column: 'created_at', ascending: false }
  });

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return <Badge variant="default">{status}</Badge>;
      case 'confirmed':
        return <Badge variant="secondary">{status}</Badge>;
      case 'tentative':
        return <Badge variant="outline">{status}</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">{status}</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type?: string) => {
    if (!type) return null;
    const colors = {
      'Mediation': 'bg-blue-100 text-blue-800',
      'Hearing': 'bg-purple-100 text-purple-800', 
      'Settlement': 'bg-green-100 text-green-800',
      'Final Hearing': 'bg-red-100 text-red-800',
      'Regulatory': 'bg-orange-100 text-orange-800'
    };
    return <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{type}</Badge>;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.hearing_date || !formData.start_time) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields (Title, Date, Start Time).',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (editingEntry) {
        await updateItem(editingEntry.id, formData);
        toast({
          title: 'Success',
          description: 'Hearing updated successfully.'
        });
      } else {
        await addItem(formData);
        toast({
          title: 'Success',
          description: 'Hearing scheduled successfully.'
        });
      }
      
      setIsDialogOpen(false);
      setEditingEntry(null);
      resetForm();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save hearing. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reschedulingEntry || !rescheduleData.hearing_date || !rescheduleData.start_time) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    try {
      await updateItem(reschedulingEntry.id, rescheduleData);
      toast({
        title: 'Success',
        description: 'Hearing rescheduled successfully.'
      });
      
      setIsRescheduleOpen(false);
      setReschedulingEntry(null);
      setRescheduleData({
        hearing_date: '',
        start_time: '',
        duration: ''
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reschedule hearing. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      case_id: '',
      title: '',
      description: '',
      court_name: '',
      hearing_date: '',
      start_time: '',
      duration: '',
      location: '',
      status: 'Scheduled',
      type: ''
    });
  };

  const handleEdit = (hearing: CourtCalendarEntry) => {
    setEditingEntry(hearing);
    setFormData({
      case_id: hearing.case_id || '',
      title: hearing.title,
      description: hearing.description || '',
      court_name: hearing.court_name || '',
      hearing_date: hearing.hearing_date,
      start_time: hearing.start_time || '',
      duration: hearing.duration || '',
      location: hearing.location || '',
      status: hearing.status,
      type: hearing.type || ''
    });
    setIsDialogOpen(true);
  };

  const handleRescheduleClick = (hearing: CourtCalendarEntry) => {
    setReschedulingEntry(hearing);
    setRescheduleData({
      hearing_date: hearing.hearing_date,
      start_time: hearing.start_time || '',
      duration: hearing.duration || ''
    });
    setIsRescheduleOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this hearing?')) {
      try {
        await deleteItem(id);
        toast({
          title: 'Success',
          description: 'Hearing deleted successfully.'
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete hearing.',
          variant: 'destructive'
        });
      }
    }
  };

  const handleAddToCalendar = (hearing: CourtCalendarEntry) => {
    const selectedCase = projects?.find(p => p.id === hearing.case_id);
    const startDate = new Date(`${hearing.hearing_date}T${hearing.start_time || '09:00'}`);
    const endDate = new Date(startDate);
    
    // Calculate end time based on duration
    if (hearing.duration) {
      const durationMatch = hearing.duration.match(/(\d+):(\d+)/);
      if (durationMatch) {
        const hours = parseInt(durationMatch[1]);
        const minutes = parseInt(durationMatch[2]);
        endDate.setHours(endDate.getHours() + hours, endDate.getMinutes() + minutes);
      } else {
        endDate.setHours(endDate.getHours() + 1); // Default 1 hour
      }
    } else {
      endDate.setHours(endDate.getHours() + 1);
    }

    const eventDetails = {
      text: hearing.title,
      dates: `${startDate.toISOString().replace(/[:-]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[:-]/g, '').split('.')[0]}Z`,
      details: `${hearing.description || ''}\n\nCase: ${selectedCase ? `${selectedCase.case_number} - ${selectedCase.title}` : 'N/A'}\nType: ${hearing.type || 'N/A'}`,
      location: hearing.location || hearing.court_name || '',
      sf: true,
      output: 'xml'
    };

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventDetails.text)}&dates=${eventDetails.dates}&details=${encodeURIComponent(eventDetails.details)}&location=${encodeURIComponent(eventDetails.location)}`;
    
    window.open(googleCalendarUrl, '_blank');
    
    toast({
      title: 'Calendar Event',
      description: 'Opening Google Calendar to add this hearing.'
    });
  };

  const upcomingHearings = useMemo(() => {
    if (!hearings || hearings.length === 0) return [];
    const today = new Date();
    return hearings.filter(hearing => new Date(hearing.hearing_date) >= today);
  }, [hearings]);

  // Show error state if there are fetch errors
  if (hearingsError || projectsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Court Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-red-600">Unable to connect to database</p>
            <p className="text-sm">Please check your internet connection and refresh the page</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // REMOVE THE LOADING CHECK COMPLETELY - ALWAYS RENDER THE COMPONENT

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Court Calendar ({upcomingHearings.length} upcoming)
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingEntry(null);
                resetForm();
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Hearing
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEntry ? 'Edit Hearing' : 'Schedule New Hearing'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="case_id">Case (Optional)</Label>
                  <Select value={formData.case_id} onValueChange={(value) => setFormData({...formData, case_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a case" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects && projects.length > 0 ? (
                        projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.case_number} - {project.title}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>No cases available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="title">Hearing Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Property Dispute Hearing"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="court_name">Court Name</Label>
                  <Input
                    id="court_name"
                    value={formData.court_name}
                    onChange={(e) => setFormData({...formData, court_name: e.target.value})}
                    placeholder="e.g., Delhi High Court"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hearing_date">Hearing Date *</Label>
                    <Input
                      id="hearing_date"
                      type="date"
                      value={formData.hearing_date}
                      onChange={(e) => setFormData({...formData, hearing_date: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="start_time">Start Time *</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Select value={formData.duration} onValueChange={(value) => setFormData({...formData, duration: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="00:30:00">30 minutes</SelectItem>
                        <SelectItem value="01:00:00">1 hour</SelectItem>
                        <SelectItem value="01:30:00">1.5 hours</SelectItem>
                        <SelectItem value="02:00:00">2 hours</SelectItem>
                        <SelectItem value="03:00:00">3 hours</SelectItem>
                        <SelectItem value="04:00:00">4 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="type">Hearing Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mediation">Mediation</SelectItem>
                        <SelectItem value="Hearing">Hearing</SelectItem>
                        <SelectItem value="Settlement">Settlement</SelectItem>
                        <SelectItem value="Final Hearing">Final Hearing</SelectItem>
                        <SelectItem value="Regulatory">Regulatory</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="e.g., Room 101, Courtroom A"
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="Confirmed">Confirmed</SelectItem>
                      <SelectItem value="Tentative">Tentative</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Additional details about the hearing"
                    rows={3}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingEntry ? 'Update Hearing' : 'Schedule Hearing'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="sm:w-auto"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Reschedule Dialog */}
          <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Reschedule Hearing</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleReschedule} className="space-y-4">
                <div>
                  <Label htmlFor="reschedule_date">New Date *</Label>
                  <Input
                    id="reschedule_date"
                    type="date"
                    value={rescheduleData.hearing_date}
                    onChange={(e) => setRescheduleData({...rescheduleData, hearing_date: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="reschedule_time">New Time *</Label>
                  <Input
                    id="reschedule_time"
                    type="time"
                    value={rescheduleData.start_time}
                    onChange={(e) => setRescheduleData({...rescheduleData, start_time: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="reschedule_duration">Duration</Label>
                  <Select value={rescheduleData.duration} onValueChange={(value) => setRescheduleData({...rescheduleData, duration: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="00:30:00">30 minutes</SelectItem>
                      <SelectItem value="01:00:00">1 hour</SelectItem>
                      <SelectItem value="01:30:00">1.5 hours</SelectItem>
                      <SelectItem value="02:00:00">2 hours</SelectItem>
                      <SelectItem value="03:00:00">3 hours</SelectItem>
                      <SelectItem value="04:00:00">4 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    Reschedule
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsRescheduleOpen(false)}
                    className="sm:w-auto"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hearings || hearings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hearings scheduled</p>
              <p className="text-sm">Click "Schedule Hearing" to add your first hearing</p>
            </div>
          ) : (
            hearings.map((hearing) => {
              const hearingDate = new Date(hearing.hearing_date);
              const selectedCase = projects?.find(p => p.id === hearing.case_id);
              
              return (
                <Card key={hearing.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{hearing.title}</h3>
                          {getStatusBadge(hearing.status)}
                          {getTypeBadge(hearing.type)}
                        </div>
                        
                        {selectedCase && (
                          <p className="text-sm text-muted-foreground">
                            Case: {selectedCase.case_number} - {selectedCase.title}
                          </p>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{format(hearingDate, 'PPP')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {hearing.start_time || format(hearingDate, 'p')}
                              {hearing.duration && ` (${hearing.duration.split(':').slice(0,2).join(':')})`}
                            </span>
                          </div>
                          {(hearing.location || hearing.court_name) && (
                            <div className="flex items-center gap-2 md:col-span-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{hearing.location || hearing.court_name}</span>
                            </div>
                          )}
                        </div>
                        
                        {hearing.description && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {hearing.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-4 flex-wrap">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(hearing)} title="Edit hearing">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleRescheduleClick(hearing)} title="Reschedule">
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleAddToCalendar(hearing)} title="Add to Google Calendar">
                          <CalendarPlus className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(hearing.id)} title="Delete hearing">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CourtCalendar;