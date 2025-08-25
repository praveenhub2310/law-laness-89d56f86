import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, File, X } from 'lucide-react';
import { toast } from 'sonner';
import { useGoogleDrive } from '@/contexts/GoogleDriveContext';

interface DocumentUploaderProps {
  onFileUploaded: (file: { url: string; name: string; size: number }) => void;
  disabled?: boolean;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onFileUploaded, disabled = false }) => {
  const { isConnected, isGapiLoaded } = useGoogleDrive();
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ url: string; name: string; size: number } | null>(null);

  const uploadToGoogleDrive = async (file: File): Promise<{ id: string; name: string; webViewLink: string }> => {
    const metadata = {
      name: file.name,
      parents: ['root'], // Upload to root folder, can be customized
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

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    if (!isConnected || !isGapiLoaded) {
      toast.error('Please connect to Google Drive first');
      return;
    }
    
    const file = acceptedFiles[0];
    setUploading(true);
    
    try {
      const uploadedGoogleFile = await uploadToGoogleDrive(file);
      
      const fileData = {
        url: uploadedGoogleFile.webViewLink,
        name: uploadedGoogleFile.name,
        size: file.size,
        googleDriveId: uploadedGoogleFile.id
      };

      setUploadedFile(fileData);
      onFileUploaded(fileData);
      toast.success('Document uploaded to Google Drive successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document to Google Drive');
    } finally {
      setUploading(false);
    }
  }, [onFileUploaded, isConnected, isGapiLoaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    disabled: disabled || uploading || !isConnected
  });

  const removeFile = () => {
    setUploadedFile(null);
  };

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
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
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
      <CardContent>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'}
            ${disabled || uploading ? 'cursor-not-allowed opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          
          {uploading ? (
            <div>
              <p className="text-lg font-medium">Uploading...</p>
              <p className="text-muted-foreground">Please wait while your document is being uploaded</p>
            </div>
          ) : isDragActive ? (
            <div>
              <p className="text-lg font-medium">Drop the document here</p>
              <p className="text-muted-foreground">Release to upload</p>
            </div>
          ) : !isConnected ? (
            <div>
              <p className="text-lg font-medium text-muted-foreground">Connect to Google Drive</p>
              <p className="text-muted-foreground">Please connect to Google Drive to upload documents</p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-medium">Drag & drop a document here</p>
              <p className="text-muted-foreground">or click to select a file</p>
              <p className="text-sm text-muted-foreground mt-2">
                Supports PDF, DOC, DOCX files • Uploads to Google Drive
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentUploader;