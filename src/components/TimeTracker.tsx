
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, Square, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TimeTracker = () => {
  const { toast } = useToast();
  const [isTracking, setIsTracking] = useState(false);
  const [currentTask, setCurrentTask] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timeEntries, setTimeEntries] = useState([
    { id: 1, case: 'Johnson vs Insurance Co.', task: 'Document Review & Analysis', hours: 2.5, date: '2024-01-15', billable: true, description: 'Reviewed insurance policy documents and medical records' },
    { id: 2, case: 'Smith Property Dispute', task: 'Client Consultation', hours: 1.0, date: '2024-01-15', billable: true, description: 'Initial consultation regarding property boundary dispute' },
    { id: 3, case: 'Corporate Contract Review', task: 'Legal Research', hours: 3.0, date: '2024-01-14', billable: false, description: 'Research on corporate law precedents' },
    { id: 4, case: 'Miller Divorce Case', task: 'Court Preparation', hours: 4.0, date: '2024-01-13', billable: true, description: 'Prepared documents for divorce proceedings' },
    { id: 5, case: 'ABC Corp Merger', task: 'Due Diligence', hours: 6.5, date: '2024-01-12', billable: true, description: 'Conducted legal due diligence for merger' }
  ]);

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

  const handleStopTracking = () => {
    if (startTime) {
      const endTime = new Date();
      const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60); // hours
      
      const newEntry = {
        id: timeEntries.length + 1,
        case: 'Current Case',
        task: currentTask,
        hours: Math.round(duration * 100) / 100,
        date: new Date().toISOString().split('T')[0],
        billable: true,
        description: currentTask
      };
      
      setTimeEntries([newEntry, ...timeEntries]);
    }
    
    setIsTracking(false);
    setStartTime(null);
    setElapsedTime(0);
    toast({
      title: "Time Tracking Stopped",
      description: "Time entry has been saved.",
    });
    setCurrentTask('');
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
                <Button onClick={handleStartTracking} className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Start Timer
                </Button>
              ) : (
                <Button onClick={handleStopTracking} variant="destructive" className="w-full">
                  <Square className="h-4 w-4 mr-2" />
                  Stop Timer
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
          <div className="space-y-3">
            {timeEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <h4 className="font-medium text-lg">{entry.case}</h4>
                  <p className="text-sm text-gray-600 font-medium">{entry.task}</p>
                  <p className="text-sm text-gray-500 mt-1">{entry.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{entry.date}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-bold text-lg">{entry.hours}h</p>
                  <Badge variant={entry.billable ? 'default' : 'secondary'}>
                    {entry.billable ? 'Billable' : 'Non-billable'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeTracker;
