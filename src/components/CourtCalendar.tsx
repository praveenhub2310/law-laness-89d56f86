import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, MapPin, Plus, Edit, Trash2 } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface CourtCalendarEntry {
  id: string;
  case_id?: string;
  title: string;
  description?: string;
  court_name: string;
  hearing_date: string;
  status: string;
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
  const [editingEntry, setEditingEntry] = useState<CourtCalendarEntry | null>(null);
  const [formData, setFormData] = useState({
    case_id: '',
    title: '',
    description: '',
    court_name: '',
    hearing_date: '',
    status: 'scheduled'
  });

  // Fetch court calendar entries with real-time updates
  const {
    data: hearings,
    loading,
    addItem,
    updateItem,
    deleteItem
  } = useSupabaseData<CourtCalendarEntry>({
    table: 'court_calendar',
    orderBy: { column: 'hearing_date', ascending: true },
    realtime: true
  });

  // Fetch projects for case selection
  const { data: projects } = useSupabaseData<Project>({
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
      case 'pending':
        return <Badge variant="outline">{status}</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">{status}</Badge>;
      case 'delayed':
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.court_name || !formData.hearing_date) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
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
      setFormData({
        case_id: '',
        title: '',
        description: '',
        court_name: '',
        hearing_date: '',
        status: 'scheduled'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save hearing. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (hearing: CourtCalendarEntry) => {
    setEditingEntry(hearing);
    setFormData({
      case_id: hearing.case_id || '',
      title: hearing.title,
      description: hearing.description || '',
      court_name: hearing.court_name,
      hearing_date: hearing.hearing_date.split('T')[0], // Convert to date format for input
      status: hearing.status
    });
    setIsDialogOpen(true);
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

  const upcomingHearings = useMemo(() => {
    const today = new Date();
    return hearings.filter(hearing => new Date(hearing.hearing_date) >= today);
  }, [hearings]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Court Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
                setFormData({
                  case_id: '',
                  title: '',
                  description: '',
                  court_name: '',
                  hearing_date: '',
                  status: 'scheduled'
                });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Hearing
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
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
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.case_number} - {project.title}
                        </SelectItem>
                      ))}
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
                  <Label htmlFor="court_name">Court Name *</Label>
                  <Input
                    id="court_name"
                    value={formData.court_name}
                    onChange={(e) => setFormData({...formData, court_name: e.target.value})}
                    placeholder="e.g., Delhi High Court"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="hearing_date">Hearing Date & Time *</Label>
                  <Input
                    id="hearing_date"
                    type="datetime-local"
                    value={formData.hearing_date}
                    onChange={(e) => setFormData({...formData, hearing_date: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="delayed">Delayed</SelectItem>
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

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingEntry ? 'Update Hearing' : 'Schedule Hearing'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-4">
          {hearings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hearings scheduled</p>
              <p className="text-sm">Click "Schedule Hearing" to add your first hearing</p>
            </div>
          ) : (
            hearings.map((hearing) => {
              const hearingDate = new Date(hearing.hearing_date);
              const selectedCase = projects.find(p => p.id === hearing.case_id);
              
              return (
                <Card key={hearing.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{hearing.title}</h3>
                          {getStatusBadge(hearing.status)}
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
                            <span>{format(hearingDate, 'p')}</span>
                          </div>
                          <div className="flex items-center gap-2 md:col-span-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{hearing.court_name}</span>
                          </div>
                        </div>
                        
                        {hearing.description && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {hearing.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(hearing)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(hearing.id)}>
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