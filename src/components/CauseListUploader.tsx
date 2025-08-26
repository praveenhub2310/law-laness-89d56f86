import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useGoogleDrive } from '@/contexts/GoogleDriveContext';
import GoogleDriveFileBrowser from '@/components/GoogleDriveFileBrowser';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Eye,
  Download,
  MapPin,
  Clock,
  Building,
  Gavel,
  AlertTriangle
} from 'lucide-react';

interface UploadResult {
  success: boolean;
  parsed_entries: number;
  mapped_entries: number;
  entries?: any[];
  error?: string;
}

interface CauseListUpload {
  id: string;
  filename: string;
  file_size: number;
  file_type: string;
  status: 'processing' | 'completed' | 'failed';
  parsed_entries_count: number;
  mapped_entries_count: number;
  error_message?: string;
  upload_date: string;
}

const CauseListUploader: React.FC = () => {
  const { isConnected } = useGoogleDrive();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [recentUploads, setRecentUploads] = useState<CauseListUpload[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<any[]>([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);

  // Fetch recent uploads
  const fetchRecentUploads = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('cause_list_uploads')
        .select('*')
        .order('upload_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentUploads((data || []) as CauseListUpload[]);
    } catch (error) {
      console.error('Error fetching uploads:', error);
    }
  }, []);

  React.useEffect(() => {
    fetchRecentUploads();
  }, [fetchRecentUploads]);

  const handleFileSelect = useCallback(async (file: any) => {
    setSelectedFile(file);
    setUploading(true);
    setUploadProgress(0);
    setUploadResult(null);
    
    try {
      // Create upload record
      const { data: uploadRecord, error: uploadError } = await supabase
        .from('cause_list_uploads')
        .insert({
          filename: file.name,
          file_size: parseInt(file.size) || 0,
          file_type: file.mimeType || 'application/octet-stream',
          uploaded_by: (await supabase.auth.getUser()).data.user?.id,
          status: 'processing'
        })
        .select()
        .single();

      if (uploadError) throw uploadError;

      setUploadProgress(20);

      // Download file from Google Drive
      const response = await window.gapi.client.drive.files.get({
        fileId: file.id,
        alt: 'media'
      });

      setUploadProgress(40);

      // Convert response to blob
      const blob = new Blob([response.body], { type: file.mimeType });
      
      // Prepare form data
      const formData = new FormData();
      formData.append('file', blob, file.name);
      formData.append('uploadId', uploadRecord.id);

      setUploadProgress(60);

      // Call edge function to process file
      const processResponse = await supabase.functions.invoke('parse-cause-list', {
        body: formData,
      });

      setUploadProgress(80);

      if (processResponse.error) {
        throw new Error(processResponse.error.message || 'Failed to process file');
      }

      const result = processResponse.data as UploadResult;
      setUploadResult(result);
      setUploadProgress(100);

      if (result.success) {
        toast.success(`Successfully parsed ${result.parsed_entries} entries, mapped ${result.mapped_entries} to existing cases`);
        fetchRecentUploads();
      } else {
        toast.error(result.error || 'Failed to process cause list');
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadResult({
        success: false,
        parsed_entries: 0,
        mapped_entries: 0,
        error: error.message
      });
      toast.error('Failed to upload and process file');
    } finally {
      setUploading(false);
    }
  }, [fetchRecentUploads]);

  const acceptedMimeTypes = [
    'application/pdf',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  const viewUploadDetails = async (upload: CauseListUpload) => {
    try {
      const { data, error } = await supabase
        .from('cause_list')
        .select('*')
        .eq('original_filename', upload.filename)
        .eq('parsed_from_file', true);

      if (error) throw error;
      setSelectedEntries(data || []);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching upload details:', error);
      toast.error('Failed to load upload details');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      processing: 'bg-blue-100 text-blue-800'
    };

    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Google Drive File Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Select Cause List from Google Drive
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please connect to Google Drive first to select cause list files.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {uploading && (
                <div className="mb-4 p-4 border rounded-lg bg-muted/20">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                    <p className="text-lg font-medium">Processing cause list...</p>
                    <p className="text-muted-foreground mb-4">Please wait while we parse your file</p>
                    <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                    <p className="text-sm text-muted-foreground mt-2">{uploadProgress}%</p>
                  </div>
                </div>
              )}
              
              <GoogleDriveFileBrowser
                onFileSelect={handleFileSelect}
                acceptedMimeTypes={acceptedMimeTypes}
                title="Select Cause List Document"
              />
              
              {uploadResult && (
                <div className="mt-4">
                  {uploadResult.success ? (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Successfully processed {uploadResult.parsed_entries} entries. 
                        {uploadResult.mapped_entries > 0 && (
                          <> {uploadResult.mapped_entries} were automatically mapped to existing cases.</>
                        )}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {uploadResult.error || 'Failed to process the file'}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Recent Uploads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Uploads
            </span>
            <Button variant="outline" size="sm" onClick={fetchRecentUploads}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentUploads.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No uploads yet. Upload your first cause list file above.
            </p>
          ) : (
            <div className="space-y-4">
              {recentUploads.map((upload) => (
                <div key={upload.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(upload.status)}
                    <div>
                      <h4 className="font-medium">{upload.filename}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatFileSize(upload.file_size)}</span>
                        <span>{new Date(upload.upload_date).toLocaleDateString()}</span>
                        {upload.parsed_entries_count > 0 && (
                          <span>{upload.parsed_entries_count} entries</span>
                        )}
                        {upload.mapped_entries_count > 0 && (
                          <span>{upload.mapped_entries_count} mapped</span>
                        )}
                      </div>
                      {upload.error_message && (
                        <p className="text-sm text-red-600 mt-1">{upload.error_message}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(upload.status)}
                    {upload.status === 'completed' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => viewUploadDetails(upload)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Parsed Cause List Entries</DialogTitle>
          </DialogHeader>
          
          {selectedEntries.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedEntries.length}</div>
                  <div className="text-muted-foreground">Total Entries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {selectedEntries.filter(e => e.mapped_case_id).length}
                  </div>
                  <div className="text-muted-foreground">Mapped Cases</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {selectedEntries.filter(e => !e.mapped_case_id).length}
                  </div>
                  <div className="text-muted-foreground">Unmapped</div>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item #</TableHead>
                    <TableHead>Case Number</TableHead>
                    <TableHead>Parties</TableHead>
                    <TableHead>Court Room</TableHead>
                    <TableHead>Judge</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Mapping</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedEntries.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell>{entry.item_number || '-'}</TableCell>
                      <TableCell className="font-mono text-sm">{entry.case_number || '-'}</TableCell>
                      <TableCell className="max-w-xs truncate">{entry.parties || '-'}</TableCell>
                      <TableCell>
                        {entry.court_room_number && (
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {entry.court_room_number}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {entry.judge_name && (
                          <div className="flex items-center gap-1">
                            <Gavel className="h-3 w-3" />
                            {entry.judge_name}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{entry.time_slot || '-'}</TableCell>
                      <TableCell>
                        {entry.mapped_case_id ? (
                          <Badge className="bg-green-100 text-green-800">
                            <MapPin className="h-3 w-3 mr-1" />
                            Mapped ({Math.round((entry.mapping_confidence || 0) * 100)}%)
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not Mapped</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No entries found for this upload.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CauseListUploader;