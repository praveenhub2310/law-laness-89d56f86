import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Cloud, 
  Loader2, 
  User, 
  LogOut, 
  Folder, 
  File, 
  Download, 
  Eye,
  Home,
  ChevronRight,
  RefreshCw,
  Upload,
  Plus,
  X,
  List,
  Grid3X3,
  FolderOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { useGoogleDrive } from '@/contexts/GoogleDriveContext';

// Interfaces
interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
  webViewLink?: string;
  webContentLink?: string;
  parents?: string[];
}

interface BreadcrumbItem {
  id: string;
  name: string;
}

const CloudStorage = () => {
  const { isConnected, userProfile, isConnecting, isGapiLoaded, connect, disconnect } = useGoogleDrive();
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [folders, setFolders] = useState<GoogleDriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentFolder, setCurrentFolder] = useState('root');
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ id: 'root', name: 'My Drive' }]);
  const [recentFiles, setRecentFiles] = useState<GoogleDriveFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [selectedUploadFolder, setSelectedUploadFolder] = useState('root');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Component mounting - load recent files and fetch drive files if connected
  useEffect(() => {
    console.log('🚀 CloudStorage component mounted successfully!');
    loadRecentFiles();
    
    // If already connected, fetch files and folders
    if (isConnected && isGapiLoaded) {
      fetchDriveFiles('root');
      fetchAllFolders();
    }
  }, [isConnected, isGapiLoaded]);

  const fetchAllFolders = async () => {
    if (!isGapiLoaded || !isConnected) return;
    
    try {
      const response = await window.gapi.client.drive.files.list({
        q: "mimeType='application/vnd.google-apps.folder' and trashed=false",
        pageSize: 100,
        fields: 'files(id,name,parents)',
        orderBy: 'name'
      });
      
      const folders = response.result.files || [];
      setFolders(folders);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };


  const loadRecentFiles = () => {
    const saved = localStorage.getItem('recentFiles');
    if (saved) {
      try {
        setRecentFiles(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent files:', error);
      }
    }
  };

  const addToRecentFiles = (file: GoogleDriveFile) => {
    setRecentFiles(prev => {
      // Remove if already exists to avoid duplicates
      const filtered = prev.filter(f => f.id !== file.id);
      // Add to beginning and limit to 10 files
      const updated = [file, ...filtered].slice(0, 10);
      // Save to localStorage
      localStorage.setItem('recentFiles', JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentFiles = () => {
    setRecentFiles([]);
    localStorage.removeItem('recentFiles');
    toast.success('Recent files cleared');
  };


  const fetchDriveFiles = async (folderId: string = 'root') => {
    console.log(`📁 fetchDriveFiles called with folder: ${folderId}`);
    console.log('🔍 isGapiLoaded:', isGapiLoaded);
    console.log('🔍 isConnected:', isConnected);
    
    if (!isGapiLoaded || !isConnected) {
      console.log('⚠️ Cannot fetch files - API not loaded or not connected');
      return;
    }
    
    console.log('🔄 Setting loading to true...');
    setLoading(true);
    
    try {
      console.log('📋 Preparing Google Drive API request...');
      const query = folderId === 'root' ? 'trashed=false' : `'${folderId}' in parents and trashed=false`;
      console.log('🔍 Query:', query);
      
      console.log('🌐 Making API call...');
      const response = await window.gapi.client.drive.files.list({
        q: query,
        pageSize: 100,
        fields: 'files(id,name,mimeType,modifiedTime,size,webViewLink,webContentLink,parents,thumbnailLink)',
        orderBy: 'folder,name'
      });
      
      console.log('📨 API response received:', response);
      console.log('📊 Response status:', response.status);
      
      if (response.status !== 200) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const files = response.result.files || [];
      console.log(`📋 Loaded ${files.length} files successfully`);
      console.log('📄 Sample files:', files.slice(0, 3));
      
      setFiles(files);
      console.log('✅ Files state updated');
      
    } catch (error: any) {
      console.error('💥 Error fetching files:', error);
      console.error('📊 Error details:', {
        name: error?.name,
        message: error?.message,
        status: error?.status,
        result: error?.result
      });
      
      // If there's an auth error, the connection might have failed
      if (error?.status === 401 || error?.message?.includes('unauthorized')) {
        console.log('🔐 Authentication error detected, clearing connection');
        localStorage.removeItem('google_drive_profile');
        localStorage.removeItem('google_drive_token');
        localStorage.removeItem('google_drive_token_expiry');
        toast.error('Authentication expired. Please reconnect.');
      } else {
        toast.error('Failed to fetch files');
      }
    } finally {
      console.log('🔄 Setting loading to false...');
      setLoading(false);
    }
  };

  const navigateToFolder = async (folder: GoogleDriveFile) => {
    setCurrentFolder(folder.id);
    setBreadcrumbs(prev => [...prev, { id: folder.id, name: folder.name }]);
    await fetchDriveFiles(folder.id);
  };

  const navigateToBreadcrumb = async (breadcrumb: BreadcrumbItem, index: number) => {
    setCurrentFolder(breadcrumb.id);
    setBreadcrumbs(prev => prev.slice(0, index + 1));
    await fetchDriveFiles(breadcrumb.id);
  };

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return 'N/A';
    const size = parseInt(bytes);
    if (size === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'application/vnd.google-apps.folder') {
      return <Folder className="h-5 w-5 text-blue-500" />;
    }
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const previewFile = (file: GoogleDriveFile) => {
    addToRecentFiles(file);
    if (file.webViewLink) {
      window.open(file.webViewLink, '_blank');
    } else {
      toast.error('Preview not available for this file');
    }
  };

  const downloadFile = async (file: GoogleDriveFile) => {
    addToRecentFiles(file);
    
    try {
      const token = localStorage.getItem('google_drive_token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      // Use the export API for Google Workspace files, direct download for others
      let downloadUrl;
      if (file.mimeType.startsWith('application/vnd.google-apps.')) {
        // Handle Google Workspace files (Docs, Sheets, etc.)
        const exportMimeType = getExportMimeType(file.mimeType);
        downloadUrl = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=${exportMimeType}`;
      } else {
        // Handle regular files
        downloadUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
      }

      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('File downloaded successfully');
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error(`Download failed: ${error.message}`);
    }
  };

  const getExportMimeType = (googleMimeType: string) => {
    const mimeTypeMap: { [key: string]: string } = {
      'application/vnd.google-apps.document': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.google-apps.spreadsheet': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.google-apps.presentation': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.google-apps.drawing': 'image/png'
    };
    return mimeTypeMap[googleMimeType] || 'application/pdf';
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    setSelectedFiles(files);
  };

  const removeSelectedFile = (index: number) => {
    if (selectedFiles) {
      const dt = new DataTransfer();
      Array.from(selectedFiles).forEach((file, i) => {
        if (i !== index) dt.items.add(file);
      });
      setSelectedFiles(dt.files);
    }
  };

  const uploadFiles = async () => {
    if (!selectedFiles || !isConnected) {
      toast.error('Please select files and ensure you are connected to Google Drive');
      return;
    }

    setUploading(true);
    const newProgress: {[key: string]: number} = {};

    try {
      const uploadPromises = Array.from(selectedFiles).map(async (file, index) => {
        const fileKey = `${file.name}_${index}`;
        newProgress[fileKey] = 0;
        setUploadProgress({ ...newProgress });

        const metadata = {
          name: file.name,
          parents: selectedUploadFolder === 'root' ? undefined : [selectedUploadFolder],
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', file);

        const xhr = new XMLHttpRequest();
        
        return new Promise<GoogleDriveFile>((resolve, reject) => {
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const progress = Math.round((e.loaded * 100) / e.total);
              setUploadProgress(prev => ({ ...prev, [fileKey]: progress }));
            }
          });

          xhr.onload = async () => {
            if (xhr.status === 200) {
              const uploadResult = JSON.parse(xhr.responseText);
              
              // Fetch complete file metadata after upload
              try {
                const token = localStorage.getItem('google_drive_token');
                const metadataResponse = await fetch(
                  `https://www.googleapis.com/drive/v3/files/${uploadResult.id}?fields=id,name,mimeType,modifiedTime,size,webViewLink,webContentLink,parents,thumbnailLink`,
                  {
                    headers: {
                      'Authorization': `Bearer ${token}`
                    }
                  }
                );
                
                if (metadataResponse.ok) {
                  const completeFile = await metadataResponse.json();
                  resolve(completeFile);
                } else {
                  // Fallback to basic upload result if metadata fetch fails
                  resolve(uploadResult);
                }
              } catch (metadataError) {
                console.error('Failed to fetch complete metadata:', metadataError);
                // Fallback to basic upload result
                resolve(uploadResult);
              }
            } else {
              reject(new Error(`Upload failed: ${xhr.statusText}`));
            }
          };

          xhr.onerror = () => reject(new Error('Upload failed'));

          const token = localStorage.getItem('google_drive_token');
          xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime,size,webViewLink,webContentLink,parents');
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          xhr.send(form);
        });
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      
      // Add uploaded files to recent files with complete metadata
      uploadedFiles.forEach(file => addToRecentFiles(file));
      
      // Refresh the current folder to show new files
      await fetchDriveFiles(currentFolder);
      
      // Clear selected files
      setSelectedFiles(null);
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      toast.success(`Successfully uploaded ${uploadedFiles.length} file(s)`);
      
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Cloud className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Cloud Storage</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Google Drive Integration</CardTitle>
          </CardHeader>
          <CardContent>
            {!isConnected ? (
              <>
                <p className="text-muted-foreground mb-4">
                  Connect your Google Drive account to access documents directly.
                </p>
                <Button 
                  onClick={connect}
                  disabled={isConnecting}
                  className="w-full"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : !isGapiLoaded ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Initializing Google API...
                    </>
                  ) : (
                    'Connect Google Drive'
                  )}
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={userProfile?.picture} alt={userProfile?.name} />
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-green-800">
                        Connected to Google Drive
                      </h3>
                      <p className="text-sm text-green-600">
                        {userProfile?.name} ({userProfile?.email})
                      </p>
                    </div>
                    <Button 
                      onClick={disconnect}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Disconnect
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>OneDrive Integration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Sync your OneDrive files with the case management system.</p>
            <Button disabled className="w-full">
              Connect OneDrive
            </Button>
          </CardContent>
        </Card>
      </div>

      {isConnected && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Google Drive Files</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{files.length} items</Badge>
                <div className="flex items-center gap-1 border rounded-md p-1">
                  <Button
                    onClick={() => setViewMode('list')}
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-6 w-6 p-0"
                  >
                    <List className="h-3 w-3" />
                  </Button>
                  <Button
                    onClick={() => setViewMode('grid')}
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-6 w-6 p-0"
                  >
                    <Grid3X3 className="h-3 w-3" />
                  </Button>
                </div>
                <Button
                  onClick={() => fetchDriveFiles(currentFolder)}
                  variant="ghost"
                  size="sm"
                  disabled={loading}
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Upload Section - Inside Google Drive Files */}
            <div className="bg-muted/20 rounded-lg p-4 border-2 border-dashed border-muted-foreground/25">
              <div className="flex items-center gap-2 mb-3">
                <Upload className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-medium">Upload to Google Drive</h3>
              </div>
              
              <div className="space-y-4">
                {/* Folder Selection */}
                <div className="flex items-center gap-3">
                  <FolderOpen className="h-5 w-5 text-primary" />
                  <Select value={selectedUploadFolder} onValueChange={setSelectedUploadFolder}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select upload folder" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="root">My Drive (Root)</SelectItem>
                      {folders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          📁 {folder.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center bg-background">
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <Plus className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm font-medium">Click to select files</span>
                    <span className="text-xs text-muted-foreground">
                      Upload files to the selected folder
                    </span>
                  </label>
                </div>

                {selectedFiles && selectedFiles.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Selected Files:</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {Array.from(selectedFiles).map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-background border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <File className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {uploading && uploadProgress[`${file.name}_${index}`] !== undefined ? (
                              <div className="flex items-center space-x-2">
                                <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary transition-all duration-300"
                                    style={{ width: `${uploadProgress[`${file.name}_${index}`]}%` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground min-w-[30px]">
                                  {uploadProgress[`${file.name}_${index}`]}%
                                </span>
                              </div>
                            ) : (
                              <Button
                                onClick={() => removeSelectedFile(index)}
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                disabled={uploading}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-sm text-muted-foreground">
                        {selectedFiles.length} file(s) selected
                      </span>
                      <Button
                        onClick={uploadFiles}
                        disabled={uploading}
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            Upload to Drive
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Breadcrumb Navigation */}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              {breadcrumbs.map((breadcrumb, index) => (
                <React.Fragment key={breadcrumb.id}>
                  {index > 0 && <ChevronRight className="h-4 w-4" />}
                  <button
                    onClick={() => navigateToBreadcrumb(breadcrumb, index)}
                    className="hover:text-foreground transition-colors"
                    disabled={loading}
                  >
                    {index === 0 ? (
                      <div className="flex items-center space-x-1">
                        <Home className="h-4 w-4" />
                        <span>{breadcrumb.name}</span>
                      </div>
                    ) : (
                      breadcrumb.name
                    )}
                  </button>
                </React.Fragment>
              ))}
            </div>

            {/* Files List */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading files...</span>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-8">
                <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">No files found in this folder</p>
              </div>
            ) : viewMode === 'list' ? (
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        {getFileIcon(file.mimeType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {file.name}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>{file.mimeType === 'application/vnd.google-apps.folder' ? 'Folder' : formatFileSize(file.size)}</span>
                          <span>{formatDate(file.modifiedTime)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {file.mimeType === 'application/vnd.google-apps.folder' ? (
                        <Button
                          onClick={() => navigateToFolder(file)}
                          variant="ghost"
                          size="sm"
                        >
                          <Folder className="h-4 w-4 mr-2" />
                          Open
                        </Button>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <Button
                            onClick={() => previewFile(file)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Preview"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => downloadFile(file)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex flex-col items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => {
                      if (file.mimeType === 'application/vnd.google-apps.folder') {
                        navigateToFolder(file);
                      } else {
                        previewFile(file);
                      }
                    }}
                  >
                    <div className="flex-shrink-0 mb-2">
                      {file.mimeType === 'application/vnd.google-apps.folder' ? (
                        <Folder className="h-8 w-8 text-blue-500" />
                      ) : (
                        <File className="h-8 w-8 text-gray-500" />
                      )}
                    </div>
                    <p className="text-xs font-medium text-center truncate w-full" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {file.mimeType === 'application/vnd.google-apps.folder' ? 'Folder' : formatFileSize(file.size)}
                    </p>
                    {file.mimeType !== 'application/vnd.google-apps.folder' && (
                      <div className="flex items-center space-x-1 mt-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            previewFile(file);
                          }}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          title="Preview"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadFile(file);
                          }}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          title="Download"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Files</CardTitle>
            {recentFiles.length > 0 && (
              <Button
                onClick={clearRecentFiles}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear Recent Files
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {recentFiles.length === 0 ? (
            <div className="text-center py-8">
              <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                No recent files to display
              </p>
              <p className="text-xs text-muted-foreground">
                Files you access will appear here for quick access
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {getFileIcon(file.mimeType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{file.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        Modified {formatDate(file.modifiedTime)} • Google Drive
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                    <div className="flex items-center space-x-1">
                      <Button
                        onClick={() => previewFile(file)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => downloadFile(file)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CloudStorage;