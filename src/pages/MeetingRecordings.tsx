import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Play, Pause, Download, FileText, Mic, Video, Upload } from 'lucide-react';

const MeetingRecordings = () => {
  const [recordings] = useState([
    {
      id: 1,
      title: 'Client Consultation - Acme Corp',
      date: '2024-01-10',
      duration: '45:32',
      type: 'video',
      size: '234 MB',
      transcript: 'This is a sample transcript of the client consultation meeting...',
      participants: ['John Lawyer', 'Acme Corp CEO', 'Legal Advisor']
    },
    {
      id: 2,
      title: 'Case Strategy Discussion',
      date: '2024-01-08',
      duration: '32:15',
      type: 'audio',
      size: '87 MB',
      transcript: 'Discussion regarding the strategic approach for the contract dispute...',
      participants: ['John Lawyer', 'Senior Partner', 'Junior Associate']
    }
  ]);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTitle, setRecordingTitle] = useState('');
  const [recordingType, setRecordingType] = useState<'audio' | 'video'>('audio');

  const startRecording = () => {
    setIsRecording(true);
    // Simulate recording start
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Simulate recording stop and processing
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Meeting Recordings</h1>
        <p className="text-muted-foreground mt-2">Record, manage, and transcribe client meetings</p>
      </div>

      {/* Recording Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>New Recording</CardTitle>
          <CardDescription>Start a new audio or video recording</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Input
              placeholder="Recording title..."
              value={recordingTitle}
              onChange={(e) => setRecordingTitle(e.target.value)}
            />
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <Button
                  variant={recordingType === 'audio' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRecordingType('audio')}
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Audio
                </Button>
                <Button
                  variant={recordingType === 'video' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRecordingType('video')}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Video
                </Button>
              </div>
              {!isRecording ? (
                <Button onClick={startRecording} disabled={!recordingTitle.trim()}>
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
              <div className="flex items-center gap-2 text-red-600">
                <div className="animate-pulse h-3 w-3 bg-red-600 rounded-full"></div>
                Recording in progress...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recordings List */}
      <div className="grid gap-6">
        {recordings.map((recording) => (
          <Card key={recording.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{recording.title}</CardTitle>
                  <CardDescription>
                    {recording.date} • {recording.duration} • {recording.size}
                  </CardDescription>
                </div>
                <Badge variant="outline">
                  {recording.type === 'video' ? <Video className="h-3 w-3 mr-1" /> : <Mic className="h-3 w-3 mr-1" />}
                  {recording.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Participants</h4>
                  <div className="flex flex-wrap gap-2">
                    {recording.participants.map((participant, index) => (
                      <Badge key={index} variant="secondary">{participant}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Transcript</h4>
                  <Textarea
                    value={recording.transcript}
                    readOnly
                    className="min-h-[100px]"
                  />
                </div>

                <div className="flex gap-2">
                  <Button size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    Play
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Export Transcript
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MeetingRecordings;