import React, { useState, useMemo, useCallback } from 'react';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  FileText, 
  ExternalLink,
  Plus,
  Download,
  RefreshCw
} from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import CaseSelector from '@/components/CaseSelector';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const localizer = momentLocalizer(moment);

interface HearingEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    hearing_number: string;
    case_id?: string;
    case_number?: string;
    case_title?: string;
    client_name?: string;
    lawyer_name?: string;
    court_name: string;
    court_room?: string;
    judge_name?: string;
    hearing_type?: string;
    status: string;
    description?: string;
    notes?: string;
  };
}

const EnhancedCourtCalendar: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<HearingEvent | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [calendarView, setCalendarView] = useState<View>('month');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newHearing, setNewHearing] = useState({
    case_id: '',
    hearing_date: '',
    hearing_time: '09:00',
    duration: '01:00:00',
    hearing_number: '',
    title: '',
    description: '',
    court_name: '',
    court_room: '',
    judge_name: '',
    hearing_type: '',
    status: 'scheduled',
    notes: ''
  });

  // Fetch hearings with detailed case and client information
  const {
    data: hearingsData = [],
    loading,
    addItem: addHearing,
    updateItem: updateHearing,
    deleteItem: deleteHearing
  } = useSupabaseData({
    table: 'hearings',
    select: `
      *,
      case:projects!hearings_case_id_fkey(case_number, title, client_id, lawyer_id),
      client:profiles!hearings_client_id_fkey(first_name, last_name, email, phone),
      lawyer:profiles!hearings_lawyer_id_fkey(first_name, last_name, email, phone)
    `,
    orderBy: { column: 'hearing_date', ascending: true },
    realtime: true
  });

  // Transform hearings data into calendar events
  const events: HearingEvent[] = useMemo(() => {
    return hearingsData.map(hearing => {
      const startDateTime = moment(`${hearing.hearing_date} ${hearing.hearing_time || '09:00'}`).toDate();
      let endDateTime = moment(startDateTime);
      
      // Calculate end time based on duration
      if (hearing.duration) {
        const durationMatch = hearing.duration.match(/(\d+):(\d+):(\d+)/);
        if (durationMatch) {
          const hours = parseInt(durationMatch[1]);
          const minutes = parseInt(durationMatch[2]);
          endDateTime.add(hours, 'hours').add(minutes, 'minutes');
        } else {
          endDateTime.add(1, 'hour');
        }
      } else {
        endDateTime.add(1, 'hour');
      }

      const clientName = hearing.client 
        ? `${hearing.client.first_name} ${hearing.client.last_name}`
        : hearing.case?.client_id ? 'Client' : 'N/A';
      
      const lawyerName = hearing.lawyer 
        ? `${hearing.lawyer.first_name} ${hearing.lawyer.last_name}`
        : hearing.case?.lawyer_id ? 'Lawyer' : 'N/A';

      return {
        id: hearing.id,
        title: `${hearing.title} (${hearing.hearing_number})`,
        start: startDateTime,
        end: endDateTime.toDate(),
        resource: {
          hearing_number: hearing.hearing_number,
          case_id: hearing.case_id,
          case_number: hearing.case?.case_number,
          case_title: hearing.case?.title,
          client_name: clientName,
          lawyer_name: lawyerName,
          court_name: hearing.court_name,
          court_room: hearing.court_room,
          judge_name: hearing.judge_name,
          hearing_type: hearing.hearing_type,
          status: hearing.status,
          description: hearing.description,
          notes: hearing.notes
        }
      };
    });
  }, [hearingsData]);

  // Custom event styling based on status
  const eventStyleGetter = useCallback((event: HearingEvent) => {
    let backgroundColor = '#3174ad';
    let borderColor = '#3174ad';
    
    switch (event.resource.status) {
      case 'confirmed':
        backgroundColor = '#10b981';
        borderColor = '#059669';
        break;
      case 'postponed':
        backgroundColor = '#f59e0b';
        borderColor = '#d97706';
        break;
      case 'completed':
        backgroundColor = '#6b7280';
        borderColor = '#4b5563';
        break;
      case 'cancelled':
        backgroundColor = '#ef4444';
        borderColor = '#dc2626';
        break;
      default:
        backgroundColor = '#3b82f6';
        borderColor = '#2563eb';
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        border: `2px solid ${borderColor}`,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        fontSize: '12px'
      }
    };
  }, []);

  const handleSelectEvent = (event: HearingEvent) => {
    setSelectedEvent(event);
    setIsDetailModalOpen(true);
  };

  const handleAddToGoogleCalendar = (event: HearingEvent) => {
    const startDate = moment(event.start).format('YYYYMMDDTHHmmss');
    const endDate = moment(event.end).format('YYYYMMDDTHHmmss');
    
    const details = [
      `Case: ${event.resource.case_number || 'N/A'} - ${event.resource.case_title || 'N/A'}`,
      `Client: ${event.resource.client_name}`,
      `Lawyer: ${event.resource.lawyer_name}`,
      `Type: ${event.resource.hearing_type || 'General'}`,
      `Status: ${event.resource.status}`,
      event.resource.description ? `\nDescription: ${event.resource.description}` : '',
      event.resource.notes ? `\nNotes: ${event.resource.notes}` : ''
    ].filter(Boolean).join('\n');

    const location = [
      event.resource.court_name,
      event.resource.court_room ? `Room: ${event.resource.court_room}` : '',
      event.resource.judge_name ? `Judge: ${event.resource.judge_name}` : ''
    ].filter(Boolean).join(', ');

    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate}Z/${endDate}Z&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
    
    window.open(googleUrl, '_blank');
    
    toast({
      title: 'Opening Google Calendar',
      description: 'Adding hearing to your Google Calendar...'
    });
  };

  const handleAddToOutlookCalendar = (event: HearingEvent) => {
    const startDate = moment(event.start).format('YYYY-MM-DDTHH:mm:ss');
    const endDate = moment(event.end).format('YYYY-MM-DDTHH:mm:ss');
    
    const details = [
      `Case: ${event.resource.case_number || 'N/A'} - ${event.resource.case_title || 'N/A'}`,
      `Client: ${event.resource.client_name}`,
      `Lawyer: ${event.resource.lawyer_name}`,
      `Type: ${event.resource.hearing_type || 'General'}`,
      `Status: ${event.resource.status}`,
      event.resource.description || '',
      event.resource.notes || ''
    ].filter(Boolean).join('\n');

    const location = [
      event.resource.court_name,
      event.resource.court_room ? `Room: ${event.resource.court_room}` : '',
      event.resource.judge_name ? `Judge: ${event.resource.judge_name}` : ''
    ].filter(Boolean).join(', ');

    const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(event.title)}&startdt=${startDate}&enddt=${endDate}&body=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
    
    window.open(outlookUrl, '_blank');
    
    toast({
      title: 'Opening Outlook Calendar',
      description: 'Adding hearing to your Outlook Calendar...'
    });
  };

  const handleSubmitNewHearing = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', newHearing);
    
    // Validate required fields
    if (!newHearing.title?.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a hearing title.',
        variant: 'destructive'
      });
      console.error('Validation failed: Missing title');
      return;
    }

    if (!newHearing.hearing_date) {
      toast({
        title: 'Validation Error',
        description: 'Please select a hearing date.',
        variant: 'destructive'
      });
      console.error('Validation failed: Missing date');
      return;
    }

    if (!newHearing.court_name?.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter the court name.',
        variant: 'destructive'
      });
      console.error('Validation failed: Missing court name');
      return;
    }

    if (!newHearing.hearing_time) {
      toast({
        title: 'Validation Error',
        description: 'Please select a start time.',
        variant: 'destructive'
      });
      console.error('Validation failed: Missing time');
      return;
    }

    if (!newHearing.duration) {
      toast({
        title: 'Validation Error',
        description: 'Please select a duration.',
        variant: 'destructive'
      });
      console.error('Validation failed: Missing duration');
      return;
    }

    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to schedule hearings.',
        variant: 'destructive'
      });
      console.error('User not authenticated');
      return;
    }

    // Auto-generate hearing number if not provided
    const hearingNumber = newHearing.hearing_number || `HR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    try {
      setIsSubmitting(true);
      console.log('Starting hearing creation...');

      const hearingData = {
        title: newHearing.title.trim(),
        hearing_number: hearingNumber,
        hearing_date: newHearing.hearing_date,
        hearing_time: newHearing.hearing_time,
        duration: newHearing.duration,
        court_name: newHearing.court_name.trim(),
        court_room: newHearing.court_room?.trim() || null,
        judge_name: newHearing.judge_name?.trim() || null,
        hearing_type: newHearing.hearing_type || null,
        status: newHearing.status,
        description: newHearing.description?.trim() || null,
        notes: newHearing.notes?.trim() || null,
        case_id: newHearing.case_id || null,
        client_id: user?.id || null,
        lawyer_id: user?.id || null
      };

      console.log('Hearing data to insert:', hearingData);

      await addHearing(hearingData);
      
      console.log('Hearing created successfully');
      
      toast({
        title: 'Success',
        description: `Hearing "${newHearing.title}" scheduled successfully for ${moment(newHearing.hearing_date).format('MMMM D, YYYY')}.`,
      });
      
      // Reset form and close modal
      setIsAddModalOpen(false);
      setNewHearing({
        case_id: '',
        hearing_date: '',
        hearing_time: '09:00',
        duration: '01:00:00',
        hearing_number: '',
        title: '',
        description: '',
        court_name: '',
        court_room: '',
        judge_name: '',
        hearing_type: '',
        status: 'scheduled',
        notes: ''
      });
    } catch (error: any) {
      console.error('Error scheduling hearing:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to schedule hearing. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportCalendarData = () => {
    const csvData = events.map(event => ({
      'Hearing Number': event.resource.hearing_number,
      'Title': event.title,
      'Date': moment(event.start).format('YYYY-MM-DD'),
      'Time': moment(event.start).format('HH:mm'),
      'Duration': moment(event.end).diff(moment(event.start), 'minutes') + ' minutes',
      'Case Number': event.resource.case_number || 'N/A',
      'Client': event.resource.client_name,
      'Court': event.resource.court_name,
      'Judge': event.resource.judge_name || 'TBD',
      'Status': event.resource.status,
      'Type': event.resource.hearing_type || 'General'
    }));
    
    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `court-calendar-${moment().format('YYYY-MM-DD')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'scheduled': 'bg-blue-100 text-blue-800',
      'confirmed': 'bg-green-100 text-green-800',
      'postponed': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Court Calendar & Hearings ({events.length} scheduled)
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={exportCalendarData}
                className="pointer-events-auto cursor-pointer relative z-10"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button 
                onClick={() => {
                  console.log('Schedule Hearing clicked');
                  setIsAddModalOpen(true);
                }}
                className="pointer-events-auto cursor-pointer relative z-10"
              >
                <Plus className="h-4 w-4 mr-2" />
                Schedule Hearing
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading calendar...</span>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">No hearings scheduled</h3>
              <p className="text-sm text-muted-foreground mb-4">Schedule your first hearing to get started</p>
              <Button 
                onClick={() => {
                  console.log('Schedule Hearing clicked (empty state)');
                  setIsAddModalOpen(true);
                }}
                className="pointer-events-auto cursor-pointer relative z-10"
              >
                <Plus className="h-4 w-4 mr-2" />
                Schedule Hearing
              </Button>
            </div>
          ) : (
            <div className="h-96">
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                onSelectEvent={handleSelectEvent}
                eventPropGetter={eventStyleGetter}
                view={calendarView}
                onView={setCalendarView}
                views={['month', 'week', 'day', 'agenda']}
                className="bg-white"
                popup
                showMultiDayTimes
                step={30}
                timeslots={2}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Hearing Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Hearing Number</Label>
                  <p className="text-sm font-mono">{selectedEvent.resource.hearing_number}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedEvent.resource.status)}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Title</Label>
                <p className="text-sm">{selectedEvent.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Date & Time
                  </Label>
                  <p className="text-sm">{moment(selectedEvent.start).format('MMMM D, YYYY at h:mm A')}</p>
                  <p className="text-xs text-muted-foreground">
                    Duration: {moment(selectedEvent.end).diff(moment(selectedEvent.start), 'minutes')} minutes
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Location
                  </Label>
                  <p className="text-sm">{selectedEvent.resource.court_name}</p>
                  {selectedEvent.resource.court_room && (
                    <p className="text-xs text-muted-foreground">Room: {selectedEvent.resource.court_room}</p>
                  )}
                </div>
              </div>

              {(selectedEvent.resource.case_number || selectedEvent.resource.case_title) && (
                <div>
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    Associated Case
                  </Label>
                  <p className="text-sm">
                    {selectedEvent.resource.case_number} - {selectedEvent.resource.case_title}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Client
                  </Label>
                  <p className="text-sm">{selectedEvent.resource.client_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Lawyer</Label>
                  <p className="text-sm">{selectedEvent.resource.lawyer_name}</p>
                </div>
              </div>

              {selectedEvent.resource.judge_name && (
                <div>
                  <Label className="text-sm font-medium">Judge</Label>
                  <p className="text-sm">{selectedEvent.resource.judge_name}</p>
                </div>
              )}

              {selectedEvent.resource.description && (
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm">{selectedEvent.resource.description}</p>
                </div>
              )}

              {selectedEvent.resource.notes && (
                <div>
                  <Label className="text-sm font-medium">Notes</Label>
                  <p className="text-sm">{selectedEvent.resource.notes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  onClick={() => handleAddToGoogleCalendar(selectedEvent)}
                  className="flex-1"
                  variant="outline"
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Add to Google Calendar
                </Button>
                <Button 
                  onClick={() => handleAddToOutlookCalendar(selectedEvent)}
                  className="flex-1"
                  variant="outline"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Add to Outlook
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add New Hearing Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background border shadow-lg z-50">
          <DialogHeader>
            <DialogTitle>Schedule New Hearing</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmitNewHearing} className="space-y-4">
            <div>
              <Label htmlFor="case_id">Associated Case</Label>
              <CaseSelector
                value={newHearing.case_id}
                onValueChange={(value) => setNewHearing(prev => ({ ...prev, case_id: value }))}
                placeholder="Select a case (optional)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hearing_number">
                  Hearing Number 
                  <span className="text-xs text-muted-foreground ml-1">(auto-generated if empty)</span>
                </Label>
                <Input
                  id="hearing_number"
                  value={newHearing.hearing_number}
                  onChange={(e) => setNewHearing(prev => ({ ...prev, hearing_number: e.target.value }))}
                  placeholder="e.g., HR001-2024 (optional)"
                />
              </div>
              <div>
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={newHearing.title}
                  onChange={(e) => setNewHearing(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Property Dispute Hearing"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="hearing_date">
                  Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="hearing_date"
                  type="date"
                  min={moment().format('YYYY-MM-DD')}
                  value={newHearing.hearing_date}
                  onChange={(e) => setNewHearing(prev => ({ ...prev, hearing_date: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="hearing_time">
                  Time <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="hearing_time"
                  type="time"
                  value={newHearing.hearing_time}
                  onChange={(e) => setNewHearing(prev => ({ ...prev, hearing_time: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="duration">
                  Duration <span className="text-destructive">*</span>
                </Label>
                <Select value={newHearing.duration} onValueChange={(value) => setNewHearing(prev => ({ ...prev, duration: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="00:30:00">30 minutes</SelectItem>
                    <SelectItem value="01:00:00">1 hour</SelectItem>
                    <SelectItem value="01:30:00">1.5 hours</SelectItem>
                    <SelectItem value="02:00:00">2 hours</SelectItem>
                    <SelectItem value="03:00:00">3 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="court_name">
                  Court Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="court_name"
                  value={newHearing.court_name}
                  onChange={(e) => setNewHearing(prev => ({ ...prev, court_name: e.target.value }))}
                  placeholder="e.g., Delhi High Court"
                  required
                />
              </div>
              <div>
                <Label htmlFor="court_room">Court Room</Label>
                <Input
                  id="court_room"
                  value={newHearing.court_room}
                  onChange={(e) => setNewHearing(prev => ({ ...prev, court_room: e.target.value }))}
                  placeholder="e.g., Room 101"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="judge_name">Judge Name</Label>
                <Input
                  id="judge_name"
                  value={newHearing.judge_name}
                  onChange={(e) => setNewHearing(prev => ({ ...prev, judge_name: e.target.value }))}
                  placeholder="e.g., Hon. Justice Smith"
                />
              </div>
              <div>
                <Label htmlFor="hearing_type">Hearing Type</Label>
                <Select value={newHearing.hearing_type} onValueChange={(value) => setNewHearing(prev => ({ ...prev, hearing_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Motion Hearing">Motion Hearing</SelectItem>
                    <SelectItem value="Trial">Trial</SelectItem>
                    <SelectItem value="Settlement Conference">Settlement Conference</SelectItem>
                    <SelectItem value="Final Hearing">Final Hearing</SelectItem>
                    <SelectItem value="Status Conference">Status Conference</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newHearing.description}
                onChange={(e) => setNewHearing(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Additional details about the hearing"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button 
                type="submit" 
                className="flex-1 pointer-events-auto cursor-pointer relative z-10"
                disabled={isSubmitting || !newHearing.title || !newHearing.hearing_date || !newHearing.court_name}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  'Schedule Hearing'
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  console.log('Cancel clicked, closing modal');
                  setIsAddModalOpen(false);
                }}
                disabled={isSubmitting}
                className="pointer-events-auto cursor-pointer relative z-10"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedCourtCalendar;