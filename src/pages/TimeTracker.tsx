
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Play, 
  Pause, 
  Square, 
  Calendar, 
  Filter,
  Plus,
  Edit,
  Trash2,
  Download
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface TimeEntry {
  id: string;
  caseNumber: string;
  caseName: string;
  description: string;
  startTime: string;
  endTime: string | null;
  duration: number; // in minutes
  date: string;
  billable: boolean;
  rate: number;
  status: 'running' | 'completed';
}

const TimeTracker = () => {
  const { userProfile } = useAuth();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [newEntry, setNewEntry] = useState({
    caseNumber: '',
    caseName: '',
    description: '',
    billable: true,
    rate: 350
  });
  const [showNewEntryForm, setShowNewEntryForm] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockEntries: TimeEntry[] = [
      {
        id: '1',
        caseNumber: 'CS-2024-001',
        caseName: 'Tech Solutions Contract Dispute',
        description: 'Research and draft motion for summary judgment',
        startTime: '2024-01-10T09:00:00',
        endTime: '2024-01-10T11:30:00',
        duration: 150,
        date: '2024-01-10',
        billable: true,
        rate: 350,
        status: 'completed'
      },
      {
        id: '2',
        caseNumber: 'EM-2024-012',
        caseName: 'Employment Termination Case',
        description: 'Client consultation and case review',
        startTime: '2024-01-10T14:00:00',
        endTime: '2024-01-10T15:30:00',
        duration: 90,
        date: '2024-01-10',
        billable: true,
        rate: 350,
        status: 'completed'
      },
      {
        id: '3',
        caseNumber: 'PR-2024-005',
        caseName: 'Property Rights Dispute',
        description: 'Document review and analysis',
        startTime: '2024-01-11T10:00:00',
        endTime: null,
        duration: 45,
        date: '2024-01-11',
        billable: true,
        rate: 350,
        status: 'running'
      }
    ];
    setTimeEntries(mockEntries);
    
    // Set active timer if there's a running entry
    const runningEntry = mockEntries.find(entry => entry.status === 'running');
    if (runningEntry) {
      setActiveTimer(runningEntry.id);
    }
  }, []);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const startTimer = () => {
    if (!newEntry.caseNumber || !newEntry.description) return;

    const entry: TimeEntry = {
      id: Date.now().toString(),
      caseNumber: newEntry.caseNumber,
      caseName: newEntry.caseName,
      description: newEntry.description,
      startTime: new Date().toISOString(),
      endTime: null,
      duration: 0,
      date: new Date().toISOString().split('T')[0],
      billable: newEntry.billable,
      rate: newEntry.rate,
      status: 'running'
    };

    setTimeEntries(prev => [entry, ...prev]);
    setActiveTimer(entry.id);
    setShowNewEntryForm(false);
    setNewEntry({
      caseNumber: '',
      caseName: '',
      description: '',
      billable: true,
      rate: 350
    });
  };

  const stopTimer = (entryId: string) => {
    setTimeEntries(prev => prev.map(entry => {
      if (entry.id === entryId && entry.status === 'running') {
        const endTime = new Date().toISOString();
        const start = new Date(entry.startTime);
        const end = new Date(endTime);
        const duration = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
        
        return {
          ...entry,
          endTime,
          duration,
          status: 'completed' as const
        };
      }
      return entry;
    }));
    setActiveTimer(null);
  };

  const deleteEntry = (entryId: string) => {
    setTimeEntries(prev => prev.filter(entry => entry.id !== entryId));
    if (activeTimer === entryId) {
      setActiveTimer(null);
    }
  };

  const getRunningDuration = (entry: TimeEntry) => {
    if (entry.status !== 'running') return entry.duration;
    
    const start = new Date(entry.startTime);
    const now = currentTime;
    return Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
  };

  const totalHoursToday = timeEntries
    .filter(entry => entry.date === new Date().toISOString().split('T')[0])
    .reduce((total, entry) => total + getRunningDuration(entry), 0);

  const totalBillableToday = timeEntries
    .filter(entry => entry.date === new Date().toISOString().split('T')[0] && entry.billable)
    .reduce((total, entry) => total + getRunningDuration(entry), 0);

  const totalRevenue = timeEntries
    .filter(entry => entry.billable && entry.status === 'completed')
    .reduce((total, entry) => total + (entry.duration / 60) * entry.rate, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Time Tracker</h1>
        </div>
        <Button onClick={() => setShowNewEntryForm(!showNewEntryForm)}>
          <Plus className="h-4 w-4 mr-2" />
          New Time Entry
        </Button>
      </div>

      {/* Daily Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hours Today</p>
                <p className="text-2xl font-bold">{formatDuration(totalHoursToday)}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Billable Hours Today</p>
                <p className="text-2xl font-bold">{formatDuration(totalBillableToday)}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Timers</p>
                <p className="text-2xl font-bold">{activeTimer ? 1 : 0}</p>
              </div>
              <Play className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
              </div>
              <Download className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Entry Form */}
      {showNewEntryForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Time Entry</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Case Number</label>
                <Input
                  placeholder="e.g., CS-2024-001"
                  value={newEntry.caseNumber}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, caseNumber: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Case Name</label>
                <Input
                  placeholder="Brief case description"
                  value={newEntry.caseName}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, caseName: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Describe the work being performed..."
                value={newEntry.description}
                onChange={(e) => setNewEntry(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="billable"
                  checked={newEntry.billable}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, billable: e.target.checked }))}
                />
                <label htmlFor="billable" className="text-sm font-medium">Billable</label>
              </div>
              <div>
                <label className="text-sm font-medium">Hourly Rate ($)</label>
                <Input
                  type="number"
                  value={newEntry.rate}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, rate: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={startTimer}>
                <Play className="h-4 w-4 mr-2" />
                Start Timer
              </Button>
              <Button variant="outline" onClick={() => setShowNewEntryForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timeEntries.map((entry) => (
              <div
                key={entry.id}
                className={`p-4 border rounded-lg ${
                  entry.status === 'running' ? 'border-blue-500 bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{entry.caseNumber}</Badge>
                      <Badge variant={entry.billable ? 'default' : 'secondary'}>
                        {entry.billable ? 'Billable' : 'Non-billable'}
                      </Badge>
                      {entry.status === 'running' && (
                        <Badge variant="destructive">
                          <Play className="h-3 w-3 mr-1" />
                          Running
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-medium">{entry.caseName}</h4>
                    <p className="text-sm text-gray-600 mb-2">{entry.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Started: {formatTime(entry.startTime)}</span>
                      {entry.endTime && <span>Ended: {formatTime(entry.endTime)}</span>}
                      <span>Duration: {formatDuration(getRunningDuration(entry))}</span>
                      {entry.billable && (
                        <span>Value: ${((getRunningDuration(entry) / 60) * entry.rate).toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {entry.status === 'running' ? (
                      <Button size="sm" onClick={() => stopTimer(entry.id)}>
                        <Square className="h-4 w-4 mr-2" />
                        Stop
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => deleteEntry(entry.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
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
