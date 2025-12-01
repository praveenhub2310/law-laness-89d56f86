
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Play, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const TimeTracker = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isTracking, setIsTracking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentTask, setCurrentTask] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch time entries and projects
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const [entriesRes, projectsRes] = await Promise.all([
          supabase
            .from('time_tracker')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10),
          supabase
            .from('projects')
            .select('*')
            .eq('lawyer_id', user.id)
        ]);

        if (entriesRes.data) setTimeEntries(entriesRes.data);
        if (projectsRes.data) setProjects(projectsRes.data);
      } catch (error) {
        console.error('Error fetching time entries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  // Timer effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, startTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTracking = () => {
    if (!currentTask.trim()) {
      toast({
        title: "Task Required",
        description: "Please enter a task description before starting the timer.",
        variant: "destructive"
      });
      return;
    }
    setIsTracking(true);
    setStartTime(new Date());
    setElapsedTime(0);
    toast({
      title: "Time Tracking Started",
      description: `Started tracking: ${currentTask}`,
    });
  };

  const handleStopTracking = async () => {
    if (!startTime || !user?.id) return;

    try {
      setIsSaving(true);
      const endTime = new Date();
      const durationInSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
      
      const { data, error } = await supabase
        .from('time_tracker')
        .insert({
          user_id: user.id,
          task_description: currentTask,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          duration: durationInSeconds,
          case_id: null // Can be enhanced to select a case
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      if (data) {
        setTimeEntries([data, ...timeEntries]);
      }

      setIsTracking(false);
      setStartTime(null);
      setElapsedTime(0);
      setCurrentTask('');

      toast({
        title: "Time Entry Saved",
        description: `Tracked ${(durationInSeconds / 3600).toFixed(2)} hours for: ${currentTask}`,
      });
    } catch (error) {
      console.error('Error saving time entry:', error);
      toast({
        title: "Error Saving Entry",
        description: "Failed to save time entry. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="task">Current Task</Label>
              <Input
                id="task"
                value={currentTask}
                onChange={(e) => setCurrentTask(e.target.value)}
                placeholder="Enter task description..."
                disabled={isTracking}
              />
            </div>
            <div className="flex items-end">
              {!isTracking ? (
                <Button 
                  onClick={handleStartTracking} 
                  className="w-full"
                  disabled={isSaving}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Timer
                </Button>
              ) : (
                <Button 
                  onClick={handleStopTracking} 
                  variant="destructive" 
                  className="w-full"
                  disabled={isSaving}
                >
                  <Square className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Stop Timer'}
                </Button>
              )}
            </div>
          </div>
          
          {isTracking && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-green-800">Currently Tracking</p>
                  <p className="text-sm text-green-600">{currentTask}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-800">{formatTime(elapsedTime)}</p>
                  <p className="text-sm text-green-600">Active</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <div className="text-right space-y-1">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : timeEntries.length > 0 ? (
            <div className="space-y-3">
              {timeEntries.map((entry) => {
                const project = projects.find(p => p.id === entry.case_id);
                const hours = entry.duration ? (entry.duration / 3600).toFixed(2) : '0.00';
                const entryDate = new Date(entry.start_time).toLocaleDateString();
                
                return (
                  <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h4 className="font-medium text-lg">
                        {project?.title || 'General Task'}
                      </h4>
                      <p className="text-sm text-gray-600 font-medium">{entry.task_description}</p>
                      <p className="text-xs text-gray-400 mt-1">{entryDate}</p>
                      {entry.start_time && entry.end_time && (
                        <p className="text-xs text-gray-500">
                          {new Date(entry.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(entry.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      )}
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-bold text-lg">{hours}h</p>
                      <Badge variant="default">
                        Billable
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No time entries yet. Start tracking to see your entries here!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeTracker;
