import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, File, X } from 'lucide-react';
import { toast } from 'sonner';
import { useGoogleDrive } from '@/contexts/GoogleDriveContext';
import { useOneDrive } from '@/contexts/OneDriveContext';
import { supabase } from '@/integrations/supabase/client';

interface DocumentUploaderProps {
  onFileUploaded: (file: { url: string; name: string; size: number; provider: 'google' | 'onedrive' }) => void;
  disabled?: boolean;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onFileUploaded, disabled = false }) => {
  const { isConnected: googleConnected, isGapiLoaded } = useGoogleDrive();
  const { isConnected: oneDriveConnected, isMsalLoaded, isConfigured: oneDriveConfigured } = useOneDrive();
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ url: string; name: string; size: number; provider: 'google' | 'onedrive' } | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<'google' | 'onedrive'>('google');

  const uploadToGoogleDrive = async (file: File): Promise<{ id: string; name: string; webViewLink: string }> => {
    const metadata = {
      name: file.name,
      parents: ['root'],
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    const token = localStorage.getItem('google_drive_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: form,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  };

  const uploadToOneDrive = async (file: File): Promise<{ id: string; name: string; webUrl: string }> => {
    // Get token from Supabase session
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.provider_token;
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Upload file to OneDrive root folder
    const response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/root:/${file.name}:/content`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const isProviderConnected = selectedProvider === 'google' ? googleConnected : oneDriveConnected;
    const isProviderLoaded = selectedProvider === 'google' ? isGapiLoaded : isMsalLoaded;
    
    if (!isProviderConnected || !isProviderLoaded) {
      toast.error(`Please connect to ${selectedProvider === 'google' ? 'Google Drive' : 'OneDrive'} first`);
      return;
    }
    
    const file = acceptedFiles[0];
    setUploading(true);
    
    try {
      let fileData: { url: string; name: string; size: number; provider: 'google' | 'onedrive' };
      
      if (selectedProvider === 'google') {
        const uploadedGoogleFile = await uploadToGoogleDrive(file);
        fileData = {
          url: uploadedGoogleFile.webViewLink,
          name: uploadedGoogleFile.name,
          size: file.size,
          provider: 'google'
        };
        toast.success('Document uploaded to Google Drive successfully');
      } else {
        const uploadedOneDriveFile = await uploadToOneDrive(file);
        fileData = {
          url: uploadedOneDriveFile.webUrl,
          name: uploadedOneDriveFile.name,
          size: file.size,
          provider: 'onedrive'
        };
        toast.success('Document uploaded to OneDrive successfully');
      }

      setUploadedFile(fileData);
      onFileUploaded(fileData);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload document to ${selectedProvider === 'google' ? 'Google Drive' : 'OneDrive'}`);
    } finally {
      setUploading(false);
    }
  }, [onFileUploaded, googleConnected, oneDriveConnected, isGapiLoaded, isMsalLoaded, selectedProvider]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    disabled: disabled || uploading || (!googleConnected && !oneDriveConnected)
  });

  const removeFile = () => {
    setUploadedFile(null);
  };

  const isAnyProviderConnected = googleConnected || oneDriveConnected;
  const currentProviderConnected = selectedProvider === 'google' ? googleConnected : oneDriveConnected;

  if (uploadedFile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Document</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <File className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">{uploadedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • Uploaded to {uploadedFile.provider === 'google' ? 'Google Drive' : 'OneDrive'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Provider Selection */}
        {isAnyProviderConnected && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Upload to:</label>
            <Select value={selectedProvider} onValueChange={(value: 'google' | 'onedrive') => setSelectedProvider(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {googleConnected && (
                  <SelectItem value="google">Google Drive</SelectItem>
                )}
                {oneDriveConnected && oneDriveConfigured && (
                  <SelectItem value="onedrive">OneDrive</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'}
            ${disabled || uploading || !currentProviderConnected ? 'cursor-not-allowed opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          
          {uploading ? (
            <div>
              <p className="text-lg font-medium">Uploading...</p>
              <p className="text-muted-foreground">Please wait while your document is being uploaded to {selectedProvider === 'google' ? 'Google Drive' : 'OneDrive'}</p>
            </div>
          ) : isDragActive ? (
            <div>
              <p className="text-lg font-medium">Drop the document here</p>
              <p className="text-muted-foreground">Release to upload</p>
            </div>
          ) : !isAnyProviderConnected ? (
            <div>
              <p className="text-lg font-medium text-muted-foreground">Connect to Cloud Storage</p>
              <p className="text-muted-foreground">Please connect to Google Drive or OneDrive to upload documents</p>
            </div>
          ) : selectedProvider === 'onedrive' && !oneDriveConfigured ? (
            <div>
              <p className="text-lg font-medium text-muted-foreground">OneDrive Not Configured</p>
              <p className="text-muted-foreground">Please configure OneDrive integration in Cloud Storage settings</p>
            </div>
          ) : !currentProviderConnected ? (
            <div>
              <p className="text-lg font-medium text-muted-foreground">Connect to {selectedProvider === 'google' ? 'Google Drive' : 'OneDrive'}</p>
              <p className="text-muted-foreground">Please connect to {selectedProvider === 'google' ? 'Google Drive' : 'OneDrive'} to upload documents</p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium">Drag & drop a document here</p>
              <p className="text-muted-foreground">or click to select a file</p>
              <p className="text-sm text-muted-foreground mt-2">
                Supports PDF, DOC, DOCX files • Uploads to {selectedProvider === 'google' ? 'Google Drive' : 'OneDrive'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentUploader;