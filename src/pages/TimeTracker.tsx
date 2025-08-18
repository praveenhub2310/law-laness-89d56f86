import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Clock, Play, Square, Calendar, BarChart3, Timer, Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface TimeEntry {
  id: string;
  user_id: string;
  case_id?: string;
  task_description: string;
  start_time: string;
  end_time?: string;
  duration?: number; // in minutes
  created_at: string;
  updated_at: string;
}

interface Project {
  id: string;
  case_number: string;
  title: string;
}

const TimeTracker = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  
  const [formData, setFormData] = useState({
    case_id: '',
    task_description: ''
  });

  // Fetch time entries with real-time updates
  const userFilters = useMemo(() => ({ user_id: user?.id }), [user?.id]);
  
  const {
    data: timeEntries,
    loading,
    addItem,
    updateItem,
    deleteItem
  } = useSupabaseData<TimeEntry>({
    table: 'time_tracker',
    filters: userFilters,
    orderBy: { column: 'start_time', ascending: false },
    realtime: true
  });

  // Fetch projects for case selection
  const { data: projects } = useSupabaseData<Project>({
    table: 'projects',
    select: 'id, case_number, title',
    orderBy: { column: 'created_at', ascending: false }
  });

  // Check for active timers and update current time
  useEffect(() => {
    const runningEntry = timeEntries.find(entry => !entry.end_time);
    setActiveTimer(runningEntry?.id || null);
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeEntries]);

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const startTimer = async () => {
    if (!user) return;
    
    if (!formData.task_description) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a task description',
        variant: 'destructive'
      });
      return;
    }

    try {
      const newTimeEntry = {
        user_id: user.id,
        case_id: formData.case_id || null,
        task_description: formData.task_description,
        start_time: new Date().toISOString()
      };

      await addItem(newTimeEntry);
      setIsDialogOpen(false);
      setFormData({ case_id: '', task_description: '' });

      toast({
        title: 'Timer Started',
        description: 'Time tracking has begun'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start timer',
        variant: 'destructive'
      });
    }
  };

  const stopTimer = async (entryId: string) => {
    try {
      const endTime = new Date().toISOString();
      const entry = timeEntries.find(e => e.id === entryId);
      
      if (entry) {
        const startTime = new Date(entry.start_time);
        const duration = Math.floor((new Date(endTime).getTime() - startTime.getTime()) / (1000 * 60));
        
        await updateItem(entryId, {
          end_time: endTime,
          duration
        });

        toast({
          title: 'Timer Stopped',
          description: `Time tracked: ${formatDuration(duration)}`
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to stop timer',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (entryId: string) => {
    if (window.confirm('Are you sure you want to delete this time entry?')) {
      try {
        await deleteItem(entryId);
        toast({
          title: 'Success',
          description: 'Time entry deleted successfully'
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete time entry',
          variant: 'destructive'
        });
      }
    }
  };

  const getRunningDuration = (entry: TimeEntry): number => {
    if (entry.end_time) {
      return entry.duration || 0;
    }
    
    const startTime = new Date(entry.start_time);
    const now = new Date();
    return Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60));
  };

  // Calculate daily metrics
  const today = new Date().toDateString();
  const todayEntries = timeEntries.filter(entry => 
    new Date(entry.start_time).toDateString() === today
  );
  
  const totalHoursToday = todayEntries.reduce((total, entry) => {
    return total + getRunningDuration(entry);
  }, 0);

  const activeTimersCount = timeEntries.filter(entry => !entry.end_time).length;
  const completedEntriesToday = todayEntries.filter(entry => entry.end_time).length;

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Clock className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Time Tracker</h1>
        </div>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Time Tracker</h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingEntry(null);
              setFormData({ case_id: '', task_description: '' });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              New Time Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Start New Timer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
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
                <Label htmlFor="task_description">Task Description *</Label>
                <Textarea
                  id="task_description"
                  value={formData.task_description}
                  onChange={(e) => setFormData({...formData, task_description: e.target.value})}
                  placeholder="Describe what you'll be working on..."
                  rows={3}
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={startTimer} className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  Start Timer
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Daily Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Hours Today</p>
                <p className="text-2xl font-bold">{formatDuration(totalHoursToday)}</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Timers</p>
                <p className="text-2xl font-bold">{activeTimersCount}</p>
              </div>
              <Play className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed Today</p>
                <p className="text-2xl font-bold">{completedEntriesToday}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Entries</p>
                <p className="text-2xl font-bold">{timeEntries.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {timeEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Timer className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No time entries yet</p>
              <p className="text-sm">Start your first timer to track your work</p>
            </div>
          ) : (
            <div className="space-y-4">
              {timeEntries.map((entry) => {
                const selectedCase = projects.find(p => p.id === entry.case_id);
                const isRunning = !entry.end_time;
                const duration = getRunningDuration(entry);
                
                return (
                  <div
                    key={entry.id}
                    className={`p-4 border rounded-lg ${
                      isRunning ? 'border-green-500 bg-green-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {selectedCase && (
                            <Badge variant="outline">
                              {selectedCase.case_number}
                            </Badge>
                          )}
                          {isRunning && (
                            <Badge variant="default" className="bg-green-600">
                              <Play className="h-3 w-3 mr-1" />
                              Running
                            </Badge>
                          )}
                        </div>
                        
                        <h4 className="font-medium mb-1">{entry.task_description}</h4>
                        {selectedCase && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {selectedCase.title}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Started: {format(new Date(entry.start_time), 'PPp')}</span>
                          {entry.end_time && (
                            <span>Ended: {format(new Date(entry.end_time), 'p')}</span>
                          )}
                          <span>Duration: {formatDuration(duration)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isRunning ? (
                          <Button size="sm" onClick={() => stopTimer(entry.id)}>
                            <Square className="h-4 w-4 mr-2" />
                            Stop
                          </Button>
                        ) : (
                          <>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(entry.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeTracker;