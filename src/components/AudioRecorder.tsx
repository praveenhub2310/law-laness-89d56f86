import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Mic, Square, Play, Pause, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
  onSubmit?: (audioBlob: Blob, duration: number) => void;
  disabled?: boolean;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete, onSubmit, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isReadyToSubmit, setIsReadyToSubmit] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const { toast } = useToast();

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        setRecordedBlob(audioBlob);
        setIsReadyToSubmit(true);
        onRecordingComplete(audioBlob, duration);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setDuration(0);
      startTimer();
      
      toast({
        title: 'Recording Started',
        description: 'Recording audio... Click stop when finished.'
      });
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Recording Error',
        description: 'Unable to access microphone. Please check permissions.',
        variant: 'destructive'
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      stopTimer();
      
      toast({
        title: 'Recording Stopped',
        description: `Recording completed. Duration: ${formatDuration(duration)}`
      });
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        startTimer();
        setIsPaused(false);
      } else {
        mediaRecorderRef.current.pause();
        stopTimer();
        setIsPaused(true);
      }
    }
  };

  const playRecording = () => {
    if (audioURL && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getVolumeLevel = () => {
    // Simulate volume level for visual feedback
    return isRecording && !isPaused ? Math.random() * 100 : 0;
  };

  const handleSubmit = () => {
    if (recordedBlob && onSubmit) {
      onSubmit(recordedBlob, duration);
      setIsReadyToSubmit(false);
      setAudioURL(null);
      setRecordedBlob(null);
      setDuration(0);
    }
  };

  const handleReset = () => {
    setIsReadyToSubmit(false);
    setAudioURL(null);
    setRecordedBlob(null);
    setDuration(0);
    setIsPlaying(false);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Recording Controls */}
          <div className="flex items-center justify-center gap-4">
            {!isRecording ? (
              <Button 
                onClick={startRecording} 
                disabled={disabled}
                size="lg"
                className="w-32"
              >
                <Mic className="h-5 w-5 mr-2" />
                Start
              </Button>
            ) : (
              <>
                <Button 
                  onClick={pauseRecording}
                  variant="outline"
                  size="lg"
                >
                  {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                </Button>
                <Button 
                  onClick={stopRecording}
                  variant="destructive"
                  size="lg"
                >
                  <Square className="h-5 w-5 mr-2" />
                  Stop
                </Button>
              </>
            )}
          </div>

          {/* Recording Status */}
          {isRecording && (
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <div className={`h-3 w-3 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />
                <span className="text-sm font-medium">
                  {isPaused ? 'Paused' : 'Recording'} - {formatDuration(duration)}
                </span>
              </div>
              <Progress value={getVolumeLevel()} className="w-full h-2" />
            </div>
          )}

          {/* Playback Controls */}
          {audioURL && !isRecording && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4">
                <Button onClick={playRecording} variant="outline">
                  {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  {isPlaying ? 'Pause' : 'Play'} Recording
                </Button>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Volume2 className="h-4 w-4" />
                  Duration: {formatDuration(duration)}
                </div>
              </div>
              
              {/* Submit Controls */}
              {isReadyToSubmit && onSubmit && (
                <div className="flex items-center justify-center gap-4">
                  <Button onClick={handleSubmit} size="lg" className="w-32">
                    Submit & Save
                  </Button>
                  <Button onClick={handleReset} variant="outline" size="lg">
                    Re-record
                  </Button>
                </div>
              )}
              
              <audio
                ref={audioRef}
                src={audioURL}
                onEnded={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="hidden"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioRecorder;