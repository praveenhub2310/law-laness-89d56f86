import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, ArrowLeft, Clock, MapPin, Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Hearing {
  id: string;
  case_id: string;
  title: string;
  description: string;
  hearing_date: string;
  hearing_time: string;
  court_name: string;
  judge_name: string;
  hearing_type: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'postponed';
  created_at: string;
}

const Schedule = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isNewHearingOpen, setIsNewHearingOpen] = useState(false);
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [newHearing, setNewHearing] = useState({
    title: '',
    description: '',
    hearing_date: '',
    hearing_time: '',
    court_name: '',
    judge_name: '',
    hearing_type: 'preliminary',
    status: 'scheduled' as const
  });

  const handleCreateHearing = async () => {
    if (!newHearing.title || !newHearing.hearing_date || !newHearing.hearing_time) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const hearing: Hearing = {
      id: Date.now().toString(),
      case_id: caseId || '',
      ...newHearing,
      created_at: new Date().toISOString()
    };

    setHearings(prev => [hearing, ...prev]);
    setIsNewHearingOpen(false);
    setNewHearing({
      title: '',
      description: '',
      hearing_date: '',
      hearing_time: '',
      court_name: '',
      judge_name: '',
      hearing_type: 'preliminary',
      status: 'scheduled'
    });

    toast({
      title: 'Success',
      description: 'Hearing scheduled successfully.',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'postponed': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Schedule Management</h1>
            <p className="text-muted-foreground">Manage hearings and court dates</p>
          </div>
        </div>
        <Dialog open={isNewHearingOpen} onOpenChange={setIsNewHearingOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Hearing
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Schedule New Hearing</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Hearing Title *</Label>
                <Input
                  id="title"
                  value={newHearing.title}
                  onChange={(e) => setNewHearing({ ...newHearing, title: e.target.value })}
                  placeholder="e.g., Preliminary Hearing"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hearing_date">Date *</Label>
                  <Input
                    id="hearing_date"
                    type="date"
                    value={newHearing.hearing_date}
                    onChange={(e) => setNewHearing({ ...newHearing, hearing_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="hearing_time">Time *</Label>
                  <Input
                    id="hearing_time"
                    type="time"
                    value={newHearing.hearing_time}
                    onChange={(e) => setNewHearing({ ...newHearing, hearing_time: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="hearing_type">Hearing Type</Label>
                <Select value={newHearing.hearing_type} onValueChange={(value) => setNewHearing({ ...newHearing, hearing_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preliminary">Preliminary Hearing</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="status">Status Conference</SelectItem>
                    <SelectItem value="motion">Motion Hearing</SelectItem>
                    <SelectItem value="sentencing">Sentencing</SelectItem>
                    <SelectItem value="appeal">Appeal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="court_name">Court Name</Label>
                <Input
                  id="court_name"
                  value={newHearing.court_name}
                  onChange={(e) => setNewHearing({ ...newHearing, court_name: e.target.value })}
                  placeholder="e.g., Superior Court of California"
                />
              </div>
              <div>
                <Label htmlFor="judge_name">Judge Name</Label>
                <Input
                  id="judge_name"
                  value={newHearing.judge_name}
                  onChange={(e) => setNewHearing({ ...newHearing, judge_name: e.target.value })}
                  placeholder="e.g., Hon. John Smith"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newHearing.description}
                  onChange={(e) => setNewHearing({ ...newHearing, description: e.target.value })}
                  placeholder="Additional notes or description"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateHearing} className="flex-1">
                  Schedule Hearing
                </Button>
                <Button variant="outline" onClick={() => setIsNewHearingOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold">{hearings.filter(h => h.status === 'scheduled').length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{hearings.filter(h => h.status === 'completed').length}</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Next Month</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hearings List */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Hearings</CardTitle>
        </CardHeader>
        <CardContent>
          {hearings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No hearings scheduled yet</p>
              <Button onClick={() => setIsNewHearingOpen(true)}>
                Schedule Your First Hearing
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {hearings.map((hearing) => (
                <Card key={hearing.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{hearing.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(hearing.status)}`}>
                            {hearing.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{hearing.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{hearing.hearing_date} at {hearing.hearing_time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{hearing.court_name || 'Court TBD'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm capitalize">{hearing.hearing_type}</span>
                          </div>
                        </div>
                        {hearing.judge_name && (
                          <div className="mt-2">
                            <span className="text-sm text-muted-foreground">Judge: {hearing.judge_name}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Schedule;