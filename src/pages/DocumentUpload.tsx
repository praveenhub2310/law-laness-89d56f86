import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileUp, 
  Upload, 
  File, 
  Trash2, 
  Download, 
  Eye, 
  Search,
  Filter,
  Folder,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { useGoogleDrive } from '@/contexts/GoogleDriveContext';
import GoogleDriveFileBrowser from '@/components/GoogleDriveFileBrowser';
import CaseSelector from '@/components/CaseSelector';

interface UploadedDocument {
  id: string;
  filename: string;
  title: string;
  category: string;
  file_type: string;
  file_size: string;
  case_id?: string;
  uploaded_by: string;
  status: string;
  confidential: boolean;
  upload_date: string;
  last_modified: string;
  cloud_provider?: string;
  cloud_file_id?: string;
  case?: {
    case_number: string;
    title: string;
  };
  uploader?: {
    first_name: string;
    last_name: string;
  };
}

const DocumentUpload = () => {
  const { user } = useAuth();
  const { isConnected, connect, isConnecting } = useGoogleDrive();
  
  // Form state
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentCategory, setDocumentCategory] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');
  const [isConfidential, setIsConfidential] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // File upload states
  const [selectedGoogleFile, setSelectedGoogleFile] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localFiles, setLocalFiles] = useState<FileList | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Fetch user's documents
  const { data: documents, loading: documentsLoading, refetch: refetchDocuments } = useSupabaseData<UploadedDocument>({
    table: 'documents',
    select: `
      *,
      case:projects!documents_case_id_fkey(case_number, title),
      uploader:profiles!documents_uploaded_by_fkey(first_name, last_name)
    `,
    filters: user?.id ? [{ column: 'uploaded_by', operator: 'eq', value: user.id }] : undefined,
    orderBy: { column: 'upload_date', ascending: false },
    realtime: true
  });

  const handleGoogleFileSelect = (file: any) => {
    setSelectedGoogleFile(file);
    setDocumentTitle(file.name);
    toast.success(`Selected: ${file.name}`);
  };

  const handleLocalFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setLocalFiles(files);
      setDocumentTitle(files[0].name);
      toast.success(`Selected ${files.length} file(s)`);
    }
  };

  const uploadToSupabase = async (file: File, metadata: any) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `documents/${user?.id}/${fileName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    // Insert document record
    const { error: insertError } = await supabase
      .from('documents')
      .insert({
        filename: file.name,
        title: metadata.title,
        category: metadata.category,
        file_type: file.type,
        file_size: file.size.toString(),
        case_id: metadata.case_id || null,
        uploaded_by: user?.id,
        status: 'active',
        confidential: metadata.confidential,
        version: '1.0',
        cloud_provider: 'supabase',
        cloud_file_id: publicUrl
      });

    if (insertError) {
      throw new Error(`Database insert failed: ${insertError.message}`);
    }
  };

  const uploadGoogleDriveDocument = async (metadata: any) => {
    if (!selectedGoogleFile) return;

    const { error } = await supabase
      .from('documents')
      .insert({
        filename: selectedGoogleFile.name,
        title: metadata.title,
        category: metadata.category,
        file_type: selectedGoogleFile.mimeType,
        file_size: selectedGoogleFile.size || '0',
        case_id: metadata.case_id || null,
        uploaded_by: user?.id,
        status: 'active',
        confidential: metadata.confidential,
        version: '1.0',
        cloud_provider: 'google_drive',
        cloud_file_id: selectedGoogleFile.id
      });

    if (error) {
      throw new Error(`Database insert failed: ${error.message}`);
    }
  };

  const handleUpload = async () => {
    if (!documentTitle.trim()) {
      toast.error('Please provide a document title');
      return;
    }

    if (!documentCategory) {
      toast.error('Please select a document category');
      return;
    }

    if (!selectedGoogleFile && !localFiles) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsUploading(true);

    try {
      const metadata = {
        title: documentTitle,
        category: documentCategory,
        case_id: selectedCaseId || null,
        confidential: isConfidential
      };

      if (selectedGoogleFile) {
        await uploadGoogleDriveDocument(metadata);
        toast.success('Google Drive document linked successfully!');
      } else if (localFiles) {
        const uploadPromises = Array.from(localFiles).map(file => 
          uploadToSupabase(file, metadata)
        );
        await Promise.all(uploadPromises);
        toast.success(`${localFiles.length} file(s) uploaded successfully!`);
      }

      // Reset form
      setDocumentTitle('');
      setDocumentCategory('');
      setDocumentDescription('');
      setSelectedCaseId('');
      setIsConfidential(false);
      setSelectedGoogleFile(null);
      setLocalFiles(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      refetchDocuments();

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ status: 'archived' })
        .eq('id', documentId);

      if (error) throw error;

      toast.success('Document archived successfully');
      refetchDocuments();
    } catch (error: any) {
      toast.error('Failed to archive document');
    }
  };

  const handleDownloadDocument = async (document: UploadedDocument) => {
    try {
      if (document.cloud_provider === 'google_drive' && document.cloud_file_id) {
        // For Google Drive files, open in new tab
        const response = await window.gapi.client.drive.files.get({
          fileId: document.cloud_file_id,
          fields: 'webContentLink,webViewLink'
        });
        
        const downloadUrl = response.result.webContentLink || response.result.webViewLink;
        if (downloadUrl) {
          window.open(downloadUrl, '_blank');
        } else {
          toast.error('Download link not available');
        }
      } else if (document.cloud_file_id) {
        // For Supabase storage files
        window.open(document.cloud_file_id, '_blank');
      }
    } catch (error) {
      toast.error('Failed to download document');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'draft': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'archived': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: string) => {
    const size = parseInt(bytes);
    if (size === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Filter documents
  const filteredDocuments = documents?.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.filename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  }) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <FileUp className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Document Upload & Management</h1>
      </div>

      {!isConnected && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                <FileUp className="h-4 w-4 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900">Connect Google Drive</h3>
                <p className="text-sm text-orange-700">
                  Connect to Google Drive to upload and manage documents from your cloud storage.
                </p>
              </div>
              <Button 
                onClick={connect} 
                disabled={isConnecting}
                className="gap-2"
              >
                {isConnecting ? 'Connecting...' : 'Connect Google Drive'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Documents</TabsTrigger>
          <TabsTrigger value="manage">Manage Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Document Title *</Label>
                  <Input
                    id="title"
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    placeholder="Enter document title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={documentCategory} onValueChange={setDocumentCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="legal">Legal Documents</SelectItem>
                      <SelectItem value="evidence">Evidence</SelectItem>
                      <SelectItem value="correspondence">Correspondence</SelectItem>
                      <SelectItem value="financial">Financial Records</SelectItem>
                      <SelectItem value="medical">Medical Records</SelectItem>
                      <SelectItem value="contracts">Contracts</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="case">Associated Case (Optional)</Label>
                  <CaseSelector
                    value={selectedCaseId}
                    onValueChange={setSelectedCaseId}
                    placeholder="Select case (optional)"
                    required={false}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={documentDescription}
                    onChange={(e) => setDocumentDescription(e.target.value)}
                    placeholder="Brief description of the document"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="confidential"
                    checked={isConfidential}
                    onChange={(e) => setIsConfidential(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="confidential" className="text-sm">
                    Mark as confidential
                  </Label>
                </div>

                <Button 
                  onClick={handleUpload}
                  disabled={isUploading || (!selectedGoogleFile && !localFiles)}
                  className="w-full"
                  size="lg"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload Document'}
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Local File Upload</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Upload from Computer</h3>
                    <p className="text-gray-600 mb-4">Select files from your computer</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleLocalFileSelect}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.png,.jpeg"
                    />
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                    >
                      Choose Files
                    </Button>
                    {localFiles && (
                      <div className="mt-4 text-sm">
                        <p className="font-medium">Selected files:</p>
                        {Array.from(localFiles).map((file, index) => (
                          <p key={index} className="text-gray-600">
                            {file.name} ({formatFileSize(file.size.toString())})
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {isConnected && (
                <GoogleDriveFileBrowser
                  onFileSelect={handleGoogleFileSelect}
                  acceptedMimeTypes={[
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'text/plain',
                    'image/jpeg',
                    'image/png',
                    'application/vnd.google-apps.document'
                  ]}
                  title="Select from Google Drive"
                />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search documents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="legal">Legal Documents</SelectItem>
                    <SelectItem value="evidence">Evidence</SelectItem>
                    <SelectItem value="correspondence">Correspondence</SelectItem>
                    <SelectItem value="financial">Financial Records</SelectItem>
                    <SelectItem value="medical">Medical Records</SelectItem>
                    <SelectItem value="contracts">Contracts</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Documents List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>My Documents</CardTitle>
                <Button
                  onClick={refetchDocuments}
                  variant="outline"
                  size="sm"
                  disabled={documentsLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${documentsLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {documentsLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">Loading documents...</p>
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <File className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">No documents found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDocuments.map((document) => (
                    <div key={document.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            {getStatusIcon(document.status)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{document.title}</h3>
                              {document.confidential && (
                                <Badge variant="destructive" className="text-xs">
                                  Confidential
                                </Badge>
                              )}
                              <Badge className={`text-xs ${getStatusColor(document.status)}`}>
                                {document.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {document.filename} • {document.category} • {formatFileSize(document.file_size)}
                            </p>
                            {document.case && (
                              <p className="text-xs text-blue-600">
                                Case: {document.case.case_number} - {document.case.title}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Uploaded: {new Date(document.upload_date).toLocaleDateString()} •
                              Provider: {document.cloud_provider === 'google_drive' ? 'Google Drive' : 'Supabase Storage'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleDownloadDocument(document)}
                            variant="outline"
                            size="sm"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {document.status === 'active' && (
                            <Button
                              onClick={() => handleDeleteDocument(document.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentUpload;