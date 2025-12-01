import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Play, Video, Mic, Download, FileText, Calendar, Clock, Users } from 'lucide-react';
import { toast } from 'sonner';

const ClientMeetings = () => {
  const [meetings] = useState([
    {
      id: 1,
      title: 'Case Strategy Discussion',
      date: '2024-01-15',
      time: '10:00 AM',
      duration: '45 minutes',
      type: 'video',
      status: 'completed',
      participants: ['You', 'John Lawyer', 'Legal Assistant'],
      recording: true,
      transcript: 'Today we discussed the key points of your contract dispute case. The main issues we identified are...',
      agenda: [
        'Review case documents',
        'Discuss legal strategy',
        'Timeline planning',
        'Q&A session'
      ]
    },
    {
      id: 2,
      title: 'Settlement Negotiation Briefing',
      date: '2024-01-20',
      time: '2:00 PM',
      duration: '30 minutes',
      type: 'video',
      status: 'scheduled',
      participants: ['You', 'John Lawyer'],
      recording: false,
      transcript: '',
      agenda: [
        'Review settlement options',
        'Discuss risks and benefits',
        'Prepare for negotiations'
      ]
    }
  ]);

  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);

  const joinMeeting = (meeting: any) => {
    setSelectedMeeting(meeting);
    toast.success('Joining Meeting', {
      description: 'Connecting to video call...'
    });
  };

  const handlePlayRecording = (meetingTitle: string) => {
    toast.info('Playing Recording', {
      description: `Starting playback of "${meetingTitle}"`
    });
  };

  const handleDownloadRecording = (meetingTitle: string) => {
    toast.success('Download Started', {
      description: `Downloading recording of "${meetingTitle}"`
    });
  };

  const handleDownloadTranscript = (meetingTitle: string) => {
    toast.success('Download Started', {
      description: `Downloading transcript of "${meetingTitle}"`
    });
  };

  const handleToggleMute = () => {
    toast.info('Microphone', {
      description: 'Microphone toggled'
    });
  };

  const handleToggleCamera = () => {
    toast.info('Camera', {
      description: 'Camera toggled'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'scheduled': return 'secondary';
      case 'in-progress': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Meeting Access</h1>
        <p className="text-muted-foreground mt-2">Join meetings and access recordings with transcripts</p>
      </div>

      <div className="grid gap-6">
        {meetings.map((meeting) => (
          <Card key={meeting.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {meeting.title}
                    <Badge variant={getStatusColor(meeting.status)}>{meeting.status}</Badge>
                  </CardTitle>
                  <CardDescription>
                    {meeting.date} at {meeting.time} • {meeting.duration}
                  </CardDescription>
                </div>
                <Badge variant="outline">
                  {meeting.type === 'video' ? <Video className="h-3 w-3 mr-1" /> : <Mic className="h-3 w-3 mr-1" />}
                  {meeting.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Participants
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {meeting.participants.map((participant, index) => (
                      <Badge key={index} variant="secondary">{participant}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Agenda
                  </h4>
                  <ul className="text-sm space-y-1">
                    {meeting.agenda.map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 bg-primary rounded-full"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {meeting.status === 'scheduled' && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Upcoming Meeting</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Your meeting is scheduled for {meeting.date} at {meeting.time}. 
                    You will receive a reminder 15 minutes before the meeting starts.
                  </p>
                  <Button className="mt-3" onClick={() => joinMeeting(meeting)}>
                    <Video className="h-4 w-4 mr-2" />
                    Join Meeting
                  </Button>
                </div>
              )}

              {meeting.status === 'completed' && meeting.recording && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Meeting Recording</h4>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handlePlayRecording(meeting.title)}
                        className="cursor-pointer pointer-events-auto"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Play Recording
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadRecording(meeting.title)}
                        className="cursor-pointer pointer-events-auto"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>

                  {meeting.transcript && (
                    <div>
                      <h4 className="font-semibold mb-2">Meeting Transcript</h4>
                      <Textarea
                        value={meeting.transcript}
                        readOnly
                        className="min-h-[120px]"
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 cursor-pointer pointer-events-auto"
                        onClick={() => handleDownloadTranscript(meeting.title)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Download Transcript
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {meeting.status === 'completed' && !meeting.recording && (
                <div className="p-4 bg-gray-50 border rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    This meeting was not recorded as per participant preferences.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedMeeting && (
        <Card className="mt-6 border-2 border-blue-200">
          <CardHeader>
            <CardTitle>Meeting in Progress: {selectedMeeting.title}</CardTitle>
            <CardDescription>You are now connected to the meeting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Video className="h-16 w-16 mx-auto mb-4 text-blue-600" />
              <h3 className="text-lg font-semibold mb-2">Connected to Video Call</h3>
              <p className="text-muted-foreground mb-4">
                Meeting with {selectedMeeting.participants.join(', ')}
              </p>
              <div className="flex justify-center gap-3">
                <Button 
                  variant="outline"
                  onClick={handleToggleMute}
                  className="cursor-pointer pointer-events-auto"
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Mute
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleToggleCamera}
                  className="cursor-pointer pointer-events-auto"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Camera
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => setSelectedMeeting(null)}
                  className="cursor-pointer pointer-events-auto"
                >
                  End Call
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientMeetings;