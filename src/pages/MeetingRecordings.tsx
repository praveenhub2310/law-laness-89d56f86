import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Play, 
  Pause, 
  Download, 
  FileText, 
  Mic, 
  Video, 
  Upload,
  Plus,
  Search,
  Filter,
  Users,
  Clock,
  Calendar,
  File,
  VolumeX
} from 'lucide-react';

interface Recording {
  id: string;
  title: string;
  client_id: string;
  lawyer_id: string;
  case_id?: string;
  meeting_date: string;
  duration?: number;
  recording_type: string;
  file_url?: string;
  file_size?: number;
  transcript?: string;
  participants?: string[];
  status: 'processing' | 'ready' | 'failed';
  is_confidential: boolean;
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

const MeetingRecordings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clients, setClients] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [newRecording, setNewRecording] = useState({
    title: '',
    client_id: '',
    case_id: '',
    meeting_date: '',
    recording_type: 'audio' as 'audio' | 'video',
    participants: [''],
    notes: '',
    is_confidential: true
  });

  // Fetch recordings with real-time updates
  useEffect(() => {
    if (!user) return;

    const fetchRecordings = async () => {
      try {
        const { data, error } = await supabase
          .from('meeting_recordings')
          .select(`
            *,
            client_profile:profiles!meeting_recordings_client_id_fkey(
              first_name,
              last_name,
              email
            ),
            case_details:projects(
              case_number,
              title
            )
          `)
          .order('meeting_date', { ascending: false });

        if (error) throw error;
        setRecordings((data?.map(record => ({
          ...record,
          participants: Array.isArray(record.participants) ? record.participants : []
        })) as any) || []);
      } catch (error) {
        console.error('Error fetching recordings:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch recordings',
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

    fetchRecordings();
    fetchData();

    // Real-time subscription
    const channel = supabase
      .channel('recordings_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'meeting_recordings'
      }, () => {
        fetchRecordings();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, toast]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: newRecording.recording_type === 'video'
      });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, {
          type: newRecording.recording_type === 'video' ? 'video/webm' : 'audio/webm'
        });
        
        // Here you would typically upload the blob to Supabase Storage
        // For now, we'll create a mock recording entry
        await handleCreateRecording();
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: 'Recording Started',
        description: `${newRecording.recording_type} recording is now active`
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Error',
        description: 'Failed to start recording. Please check your microphone/camera permissions.',
        variant: 'destructive'
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all tracks
      mediaRecorderRef.current.stream?.getTracks().forEach(track => track.stop());
      
      toast({
        title: 'Recording Stopped',
        description: 'Processing your recording...'
      });
    }
  };

  const handleCreateRecording = async () => {
    try {
      const { error } = await supabase
        .from('meeting_recordings')
        .insert([{
          title: newRecording.title,
          client_id: newRecording.client_id,
          lawyer_id: user?.id,
          case_id: newRecording.case_id || null,
          meeting_date: newRecording.meeting_date,
          recording_type: newRecording.recording_type,
          participants: newRecording.participants.filter(p => p.trim()),
          notes: newRecording.notes || null,
          is_confidential: newRecording.is_confidential,
          status: 'processing',
          duration: 0 // This would be calculated from the actual recording
        }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Recording saved successfully'
      });

      setIsCreateModalOpen(false);
      setNewRecording({
        title: '',
        client_id: '',
        case_id: '',
        meeting_date: '',
        recording_type: 'audio',
        participants: [''],
        notes: '',
        is_confidential: true
      });
    } catch (error) {
      console.error('Error creating recording:', error);
      toast({
        title: 'Error',
        description: 'Failed to save recording',
        variant: 'destructive'
      });
    }
  };

  const addParticipant = () => {
    setNewRecording({
      ...newRecording,
      participants: [...newRecording.participants, '']
    });
  };

  const updateParticipant = (index: number, value: string) => {
    const updatedParticipants = [...newRecording.participants];
    updatedParticipants[index] = value;
    setNewRecording({ ...newRecording, participants: updatedParticipants });
  };

  const removeParticipant = (index: number) => {
    const updatedParticipants = newRecording.participants.filter((_, i) => i !== index);
    setNewRecording({ ...newRecording, participants: updatedParticipants });
  };

  const togglePlayback = (recordingId: string) => {
    if (playingId === recordingId) {
      setPlayingId(null);
    } else {
      setPlayingId(recordingId);
      // In a real implementation, you would start playing the audio/video file
      setTimeout(() => setPlayingId(null), 3000); // Mock playback
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const filteredRecordings = recordings.filter(recording => {
    const matchesSearch = recording.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (recording.client_profile?.first_name + ' ' + recording.client_profile?.last_name).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || recording.recording_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || recording.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-6">Loading recordings...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Meeting Recordings</h1>
          <p className="text-muted-foreground">Record, manage, and transcribe client meetings</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Recording
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Recording</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Recording Title</Label>
                <Input
                  id="title"
                  value={newRecording.title}
                  onChange={(e) => setNewRecording({...newRecording, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client">Client</Label>
                  <Select value={newRecording.client_id} onValueChange={(value) => setNewRecording({...newRecording, client_id: value})}>
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
                  <Select value={newRecording.case_id} onValueChange={(value) => setNewRecording({...newRecording, case_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select case (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Case</SelectItem>
                      {cases
                        .filter(c => !newRecording.client_id || c.client_id === newRecording.client_id)
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
                  <Label htmlFor="date">Meeting Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newRecording.meeting_date}
                    onChange={(e) => setNewRecording({...newRecording, meeting_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Recording Type</Label>
                  <Select value={newRecording.recording_type} onValueChange={(value: 'audio' | 'video') => setNewRecording({...newRecording, recording_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="audio">Audio Only</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Participants</Label>
                {newRecording.participants.map((participant, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      placeholder="Participant name"
                      value={participant}
                      onChange={(e) => updateParticipant(index, e.target.value)}
                    />
                    {newRecording.participants.length > 1 && (
                      <Button variant="outline" size="sm" onClick={() => removeParticipant(index)}>
                        ×
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addParticipant}>
                  Add Participant
                </Button>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newRecording.notes}
                  onChange={(e) => setNewRecording({...newRecording, notes: e.target.value})}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="confidential"
                  checked={newRecording.is_confidential}
                  onChange={(e) => setNewRecording({...newRecording, is_confidential: e.target.checked})}
                />
                <Label htmlFor="confidential">Mark as confidential</Label>
              </div>

              {/* Recording Controls */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <Button
                      variant={newRecording.recording_type === 'audio' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNewRecording({...newRecording, recording_type: 'audio'})}
                    >
                      <Mic className="h-4 w-4 mr-2" />
                      Audio
                    </Button>
                    <Button
                      variant={newRecording.recording_type === 'video' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNewRecording({...newRecording, recording_type: 'video'})}
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Video
                    </Button>
                  </div>
                  {!isRecording ? (
                    <Button onClick={startRecording} disabled={!newRecording.title.trim()}>
                      <Mic className="h-4 w-4 mr-2" />
                      Start Recording
                    </Button>
                  ) : (
                    <Button variant="destructive" onClick={stopRecording}>
                      <Pause className="h-4 w-4 mr-2" />
                      Stop Recording
                    </Button>
                  )}
                </div>
                {isRecording && (
                  <div className="flex items-center gap-2 text-red-600 mt-2">
                    <div className="animate-pulse h-3 w-3 bg-red-600 rounded-full"></div>
                    Recording in progress...
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRecording}>
                  Save Recording
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recordings</CardTitle>
            <File className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredRecordings.length}</div>
            <p className="text-xs text-muted-foreground">All recordings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Video Recordings</CardTitle>
            <Video className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredRecordings.filter(r => r.recording_type === 'video').length}
            </div>
            <p className="text-xs text-muted-foreground">Video meetings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Audio Recordings</CardTitle>
            <Mic className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredRecordings.filter(r => r.recording_type === 'audio').length}
            </div>
            <p className="text-xs text-muted-foreground">Audio meetings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready to Play</CardTitle>
            <Play className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredRecordings.filter(r => r.status === 'ready').length}
            </div>
            <p className="text-xs text-muted-foreground">Processed recordings</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search recordings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
            <SelectItem value="video">Video</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Recordings List */}
      <div className="grid gap-6">
        {filteredRecordings.map((recording) => (
          <Card key={recording.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {recording.title}
                    <Badge className={getStatusColor(recording.status)}>
                      {recording.status}
                    </Badge>
                    {recording.is_confidential && (
                      <Badge variant="secondary">Confidential</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {recording.client_profile?.first_name} {recording.client_profile?.last_name}
                    {recording.case_details && ` • ${recording.case_details.case_number}`}
                  </CardDescription>
                </div>
                <Badge variant="outline">
                  {recording.recording_type === 'video' ? 
                    <Video className="h-3 w-3 mr-1" /> : 
                    <Mic className="h-3 w-3 mr-1" />
                  }
                  {recording.recording_type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Date
                    </div>
                    <div>{new Date(recording.meeting_date).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Duration
                    </div>
                    <div>{formatDuration(recording.duration)}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <File className="h-3 w-3" />
                      Size
                    </div>
                    <div>{formatFileSize(recording.file_size)}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-3 w-3" />
                      Participants
                    </div>
                    <div>{recording.participants?.length || 0}</div>
                  </div>
                </div>

                {recording.participants && recording.participants.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Participants</h4>
                    <div className="flex flex-wrap gap-2">
                      {recording.participants.map((participant, index) => (
                        <Badge key={index} variant="secondary">{participant}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {recording.transcript && (
                  <div>
                    <h4 className="font-semibold mb-2">Transcript</h4>
                    <Textarea
                      value={recording.transcript}
                      readOnly
                      className="min-h-[100px]"
                    />
                  </div>
                )}

                {recording.notes && (
                  <div>
                    <h4 className="font-semibold mb-2">Notes</h4>
                    <p className="text-sm text-muted-foreground">{recording.notes}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  {recording.status === 'ready' ? (
                    <Button 
                      size="sm" 
                      onClick={() => togglePlayback(recording.id)}
                      variant={playingId === recording.id ? 'secondary' : 'default'}
                    >
                      {playingId === recording.id ? (
                        <Pause className="h-4 w-4 mr-2" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      {playingId === recording.id ? 'Pause' : 'Play'}
                    </Button>
                  ) : (
                    <Button size="sm" disabled>
                      <VolumeX className="h-4 w-4 mr-2" />
                      {recording.status === 'processing' ? 'Processing' : 'Unavailable'}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" disabled={recording.status !== 'ready'}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  {recording.transcript && (
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Export Transcript
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRecordings.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Mic className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No recordings found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Start recording your first meeting
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MeetingRecordings;