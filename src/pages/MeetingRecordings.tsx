import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Play, 
  Pause, 
  Download, 
  FileText, 
  Mic, 
  Video, 
  Upload, 
  Trash2, 
  Users,
  Calendar,
  Clock,
  File,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AudioRecorder from '@/components/AudioRecorder';
import CaseSelector from '@/components/CaseSelector';

interface MeetingRecording {
  id: string;
  title: string;
  client_id?: string | null;
  lawyer_id?: string | null;
  case_id?: string | null;
  meeting_date: string;
  duration?: number | null;
  file_size?: number | null;
  participants: any; // Handle Json type from database
  is_confidential: boolean;
  recording_type: 'audio' | 'video';
  file_url?: string | null;
  transcript?: string | null;
  status: 'processing' | 'ready' | 'failed';
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

const MeetingRecordings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
  const [selectedRecording, setSelectedRecording] = useState<MeetingRecording | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const [newRecording, setNewRecording] = useState({
    title: '',
    case_id: '',
    recording_type: 'audio' as 'audio' | 'video',
    participants: [] as string[],
    is_confidential: true,
    notes: ''
  });

  // Use manual state management instead of useSupabaseData for better control
  const [recordings, setRecordings] = useState<MeetingRecording[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Set data function to be used by handleRecordingComplete
  const setData = setRecordings;

  // Fetch recordings on component mount and set up real-time subscription
  useEffect(() => {
    const fetchRecordings = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        console.log('Fetching meeting recordings for user:', user.id, 'role:', user.role);
        
        let query = supabase
          .from('meeting_recordings')
          .select('*')
          .order('meeting_date', { ascending: false });

        // Apply role-based filtering
        if (user.role === 'client') {
          query = query.eq('client_id', user.id);
        } else if (user.role === 'advocate' || user.role === 'company') {
          query = query.eq('lawyer_id', user.id);
        }
        // Super admin sees all recordings

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching recordings:', error);
          throw error;
        }

        console.log('Fetched recordings:', data);
        // Process participants field to ensure it's always an array
        const processedData = (data || []).map(recording => ({
          ...recording,
          participants: Array.isArray(recording.participants) 
            ? recording.participants 
            : (recording.participants ? [recording.participants] : []),
          recording_type: (recording.recording_type === 'video' ? 'video' : 'audio') as 'audio' | 'video',
          status: (['processing', 'ready', 'failed'].includes(recording.status) 
            ? recording.status 
            : 'ready') as 'processing' | 'ready' | 'failed'
        }));
        setRecordings(processedData);
      } catch (error) {
        console.error('Failed to fetch recordings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load recordings.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecordings();

    // Set up real-time subscription
    const subscription = supabase
      .channel('meeting_recordings_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'meeting_recordings' 
        }, 
        (payload) => {
          console.log('Real-time update:', payload);
          fetchRecordings(); // Refetch data on any change
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, toast]);

  // Dummy functions for compatibility (not used anymore)
  const addItem = async () => {};
  const updateItem = async () => {};
  const deleteItem = async (id: string) => {
    try {
      const recording = recordings.find(r => r.id === id);
      if (!recording) return;

      // Delete file from storage if exists
      if (recording.file_url) {
        const filePath = recording.file_url.split('/').pop();
        if (filePath) {
          await supabase.storage
            .from('meeting-recordings')
            .remove([`${user?.id}/${filePath}`]);
        }
      }

      // Delete record from database
      const { error } = await supabase
        .from('meeting_recordings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setRecordings(prev => prev.filter(r => r.id !== id));

      toast({
        title: 'Recording Deleted',
        description: 'Recording has been permanently deleted.'
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete recording.',
        variant: 'destructive'
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['audio/mp3', 'audio/wav', 'audio/webm', 'video/mp4', 'video/webm', 'audio/mpeg'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload audio (MP3, WAV, WebM) or video (MP4, WebM) files only.',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      toast({
        title: 'File Too Large',
        description: 'Please upload files smaller than 100MB.',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(50); // Show progress indicator

    try {
      // Create file path with user ID and timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filePath = `${user?.id}/${timestamp}-${file.name}`;
      
      // Upload file to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('meeting-recordings')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      setUploadProgress(100); // Set to 100% when upload completes

      if (uploadError) throw uploadError;

      // Get public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('meeting-recordings')
        .getPublicUrl(filePath);

      // Create recording metadata with proper role-based IDs
      const recordingData = {
        title: newRecording.title || file.name.replace(/\.[^/.]+$/, ''),
        // Set IDs based on user role
        client_id: user?.role === 'client' ? user.id : null,
        lawyer_id: user?.role === 'advocate' || user?.role === 'company' ? user.id : null,
        case_id: newRecording.case_id || null,
        meeting_date: new Date().toISOString().split('T')[0],
        duration: null, // Will be updated when processing is complete
        file_size: file.size,
        participants: newRecording.participants,
        is_confidential: newRecording.is_confidential,
        recording_type: file.type.startsWith('video/') ? 'video' : 'audio',
        file_url: urlData.publicUrl,
        transcript: null,
        status: 'processing',
        notes: newRecording.notes
      };

      // Handle file upload saving directly instead of using addItem
      const { data: insertData, error: insertError } = await supabase
        .from('meeting_recordings')
        .insert([recordingData])
        .select()
        .single();

      if (insertError) throw insertError;

      // Update local state
      const processedData = {
        ...insertData,
        participants: Array.isArray(insertData.participants) 
          ? insertData.participants 
          : (insertData.participants ? [insertData.participants] : []),
        recording_type: (insertData.recording_type === 'video' ? 'video' : 'audio') as 'audio' | 'video',
        status: (['processing', 'ready', 'failed'].includes(insertData.status) 
          ? insertData.status 
          : 'ready') as 'processing' | 'ready' | 'failed'
      };
      setRecordings(prev => [processedData as MeetingRecording, ...prev]);

      toast({
        title: 'Upload Successful',
        description: 'Recording uploaded and being processed for playback.'
      });

      // Reset form
      setNewRecording({
        title: '',
        case_id: '',
        recording_type: 'audio',
        participants: [],
        is_confidential: true,
        notes: ''
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload recording. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRecordingComplete = async (audioBlob: Blob, duration: number) => {
    if (!newRecording.title.trim()) {
      toast({
        title: 'Title Required',
        description: 'Please enter a title for the recording.',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create file path
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filePath = `${user?.id}/${timestamp}-${newRecording.title}.webm`;
      
      console.log('=== MEETING RECORDING SAVE START ===');
      console.log('User:', user);
      console.log('File path:', filePath);
      console.log('Audio blob size:', audioBlob.size);
      
      // Upload recording to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('meeting-recordings')
        .upload(filePath, audioBlob, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      console.log('Storage upload successful:', uploadData);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('meeting-recordings')
        .getPublicUrl(filePath);

      console.log('File URL:', urlData.publicUrl);

      // Create recording metadata with proper role-based IDs
      const recordingData = {
        title: newRecording.title,
        // Set IDs based on user role
        client_id: user?.role === 'client' ? user.id : null,
        lawyer_id: user?.role === 'advocate' || user?.role === 'company' ? user.id : null,
        case_id: newRecording.case_id || null,
        meeting_date: new Date().toISOString().split('T')[0],
        duration: duration,
        file_size: audioBlob.size,
        participants: newRecording.participants,
        is_confidential: newRecording.is_confidential,
        recording_type: 'audio' as const,
        file_url: urlData.publicUrl,
        transcript: null,
        status: 'ready' as const,
        notes: newRecording.notes
      };

      console.log('Recording data to insert:', recordingData);

      // Insert into database
      const { data: insertData, error: insertError } = await supabase
        .from('meeting_recordings')
        .insert([recordingData])
        .select()
        .single();

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw insertError;
      }

      console.log('Database insert successful:', insertData);

      // Update local state manually to ensure UI reflects the change
      setData(prev => [insertData as unknown as MeetingRecording, ...prev]);

      toast({
        title: 'Recording Saved',
        description: 'Audio recording saved successfully.'
      });

      setIsRecordingModalOpen(false);
      setNewRecording({
        title: '',
        case_id: '',
        recording_type: 'audio',
        participants: [],
        is_confidential: true,
        notes: ''
      });

    } catch (error) {
      console.error('Save recording error:', error);
      toast({
        title: 'Save Failed',
        description: `Failed to save recording: ${error.message || 'Unknown error'}`,
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handlePlayRecording = (recording: MeetingRecording) => {
    if (recording.file_url) {
      // Create audio/video element and play
      const mediaElement = document.createElement(recording.recording_type === 'video' ? 'video' : 'audio');
      mediaElement.src = recording.file_url;
      mediaElement.controls = true;
      mediaElement.style.width = '100%';
      
      // Open in a new modal or window for playback
      const playbackWindow = window.open('', '_blank', 'width=600,height=400');
      if (playbackWindow) {
        playbackWindow.document.write(`
          <html>
            <head>
              <title>${recording.title} - Playback</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
                .container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                h2 { margin-top: 0; color: #333; }
              </style>
            </head>
            <body>
              <div class="container">
                <h2>${recording.title}</h2>
                <p><strong>Date:</strong> ${new Date(recording.meeting_date).toLocaleDateString()}</p>
                <p><strong>Duration:</strong> ${recording.duration ? `${Math.floor(recording.duration / 60)}:${(recording.duration % 60).toString().padStart(2, '0')}` : 'Unknown'}</p>
                ${mediaElement.outerHTML}
              </div>
            </body>
          </html>
        `);
      }
    } else {
      toast({
        title: 'File Not Available',
        description: 'Recording file is not accessible.',
        variant: 'destructive'
      });
    }
  };

  const handleDownloadRecording = async (recording: MeetingRecording) => {
    if (!recording.file_url) {
      toast({
        title: 'Download Failed',
        description: 'Recording file is not available for download.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch(recording.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${recording.title}.${recording.recording_type === 'video' ? 'mp4' : 'webm'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Download Started',
        description: 'Recording download has started.'
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Failed to download recording.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteRecording = async (recording: MeetingRecording) => {
    if (!window.confirm(`Are you sure you want to delete "${recording.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // Delete file from storage if exists
      if (recording.file_url) {
        const filePath = recording.file_url.split('/').pop();
        if (filePath) {
          await supabase.storage
            .from('meeting-recordings')
            .remove([`${user?.id}/${filePath}`]);
        }
      }

      // Delete record from database
      await deleteItem(recording.id);

      toast({
        title: 'Recording Deleted',
        description: 'Recording has been permanently deleted.'
      });
    } catch (error) {
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete recording.',
        variant: 'destructive'
      });
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'processing': 'bg-yellow-100 text-yellow-800',
      'ready': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800'
    };
    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meeting Recordings</h1>
          <p className="text-muted-foreground mt-2">Record, manage, and playback client meetings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Recording
          </Button>
          <Button onClick={() => setIsRecordingModalOpen(true)}>
            <Mic className="h-4 w-4 mr-2" />
            New Recording
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,video/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Upload Progress */}
      {isUploading && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Uploading...</span>
                <span className="text-sm text-muted-foreground">{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recordings List */}
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mr-3" />
            <span className="text-muted-foreground">Loading recordings...</span>
          </CardContent>
        </Card>
      ) : recordings.length === 0 ? (
        <Card>
          <CardContent className="text-center p-12">
            <Mic className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">No recordings yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Start recording meetings or upload existing files</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setIsRecordingModalOpen(true)}>
                <Mic className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {recordings.map((recording) => (
            <Card key={recording.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {recording.recording_type === 'video' ? 
                        <Video className="h-5 w-5 text-blue-600" /> : 
                        <Mic className="h-5 w-5 text-green-600" />
                      }
                      {recording.title}
                      {recording.is_confidential && (
                        <Badge variant="outline" className="text-xs">
                          Confidential
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(recording.meeting_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(recording.duration)}
                      </span>
                      <span className="flex items-center gap-1">
                        <File className="h-3 w-3" />
                        {formatFileSize(recording.file_size)}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(recording.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                 <div className="space-y-4">
                   {Array.isArray(recording.participants) && recording.participants.length > 0 && (
                     <div>
                       <h4 className="font-semibold mb-2 flex items-center gap-2">
                         <Users className="h-4 w-4" />
                         Participants
                       </h4>
                       <div className="flex flex-wrap gap-2">
                         {recording.participants.map((participant: string, index: number) => (
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
                        className="min-h-[80px] text-sm"
                      />
                    </div>
                  )}

                  {recording.notes && (
                    <div>
                      <h4 className="font-semibold mb-2">Notes</h4>
                      <p className="text-sm text-muted-foreground">{recording.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t">
                    <Button 
                      size="sm" 
                      onClick={() => handlePlayRecording(recording)}
                      disabled={recording.status !== 'ready'}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Play
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadRecording(recording)}
                      disabled={recording.status !== 'ready'}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedRecording(recording);
                        setIsDetailModalOpen(true);
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteRecording(recording)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* New Recording Modal */}
      <Dialog open={isRecordingModalOpen} onOpenChange={setIsRecordingModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Audio Recording</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Recording Title *</Label>
              <Input
                id="title"
                value={newRecording.title}
                onChange={(e) => setNewRecording(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Client Consultation - Acme Corp"
                required
              />
            </div>

            <div>
              <Label htmlFor="case_id">Associated Case (Optional)</Label>
              <CaseSelector
                value={newRecording.case_id}
                onValueChange={(value) => setNewRecording(prev => ({ ...prev, case_id: value }))}
                placeholder="Select a case"
              />
            </div>

            <div>
              <Label htmlFor="participants">Participants (one per line)</Label>
              <Textarea
                id="participants"
                value={newRecording.participants.join('\n')}
                onChange={(e) => setNewRecording(prev => ({ 
                  ...prev, 
                  participants: e.target.value.split('\n').filter(p => p.trim()) 
                }))}
                placeholder="John Lawyer&#10;Client Name&#10;Legal Advisor"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newRecording.notes}
                onChange={(e) => setNewRecording(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about this recording"
                rows={2}
              />
            </div>

                      <AudioRecorder 
                        onRecordingComplete={() => {}} // No automatic saving
                        onSubmit={handleRecordingComplete} // Only save when submitted
                        disabled={isUploading}
                      />
          </div>
        </DialogContent>
      </Dialog>

      {/* Recording Details Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Recording Details</DialogTitle>
          </DialogHeader>
          
          {selectedRecording && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Title</Label>
                  <p className="text-sm">{selectedRecording.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedRecording.status)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Date</Label>
                  <p className="text-sm">{new Date(selectedRecording.meeting_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Duration</Label>
                  <p className="text-sm">{formatDuration(selectedRecording.duration)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">File Size</Label>
                  <p className="text-sm">{formatFileSize(selectedRecording.file_size)}</p>
                </div>
              </div>

               {Array.isArray(selectedRecording.participants) && selectedRecording.participants.length > 0 && (
                 <div>
                   <Label className="text-sm font-medium">Participants</Label>
                   <div className="flex flex-wrap gap-2 mt-1">
                     {selectedRecording.participants.map((participant: string, index: number) => (
                       <Badge key={index} variant="secondary">{participant}</Badge>
                     ))}
                   </div>
                 </div>
               )}

              {selectedRecording.notes && (
                <div>
                  <Label className="text-sm font-medium">Notes</Label>
                  <p className="text-sm text-muted-foreground">{selectedRecording.notes}</p>
                </div>
              )}

              {selectedRecording.transcript && (
                <div>
                  <Label className="text-sm font-medium">Transcript</Label>
                  <Textarea
                    value={selectedRecording.transcript}
                    readOnly
                    className="min-h-[100px] text-sm"
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MeetingRecordings;