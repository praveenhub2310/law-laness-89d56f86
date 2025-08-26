import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Folder, 
  File, 
  Home,
  ChevronRight,
  RefreshCw,
  Upload,
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

interface GoogleDriveFileBrowserProps {
  onFileSelect: (file: GoogleDriveFile) => void;
  acceptedMimeTypes?: string[];
  title?: string;
  allowFolderSelection?: boolean;
}

const GoogleDriveFileBrowser: React.FC<GoogleDriveFileBrowserProps> = ({
  onFileSelect,
  acceptedMimeTypes = [],
  title = "Google Drive Files",
  allowFolderSelection = false
}) => {
  const { isConnected, isGapiLoaded } = useGoogleDrive();
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentFolder, setCurrentFolder] = useState('root');
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ id: 'root', name: 'My Drive (Root)' }]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    if (isConnected && isGapiLoaded) {
      fetchDriveFiles('root');
    }
  }, [isConnected, isGapiLoaded]);

  const fetchDriveFiles = async (folderId: string = 'root') => {
    if (!isGapiLoaded || !isConnected) {
      return;
    }
    
    setLoading(true);
    
    try {
      const query = folderId === 'root' ? 'trashed=false' : `'${folderId}' in parents and trashed=false`;
      
      const response = await window.gapi.client.drive.files.list({
        q: query,
        pageSize: 100,
        fields: 'files(id,name,mimeType,modifiedTime,size,webViewLink,webContentLink,parents,thumbnailLink)',
        orderBy: 'folder,name'
      });
      
      if (response.status !== 200) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const files = response.result.files || [];
      setFiles(files);
      
    } catch (error: any) {
      console.error('Error fetching files:', error);
      
      if (error?.status === 401 || error?.message?.includes('unauthorized')) {
        localStorage.removeItem('google_drive_profile');
        localStorage.removeItem('google_drive_token');
        localStorage.removeItem('google_drive_token_expiry');
        toast.error('Authentication expired. Please reconnect.');
      } else {
        toast.error('Failed to fetch files');
      }
    } finally {
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

  const handleFileClick = (file: GoogleDriveFile) => {
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      navigateToFolder(file);
    } else {
      // Check if file type is accepted
      if (acceptedMimeTypes.length > 0 && !acceptedMimeTypes.includes(file.mimeType)) {
        toast.error('This file type is not supported');
        return;
      }
      onFileSelect(file);
      toast.success(`Selected: ${file.name}`);
    }
  };

  const isFileSelectable = (file: GoogleDriveFile) => {
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      return allowFolderSelection;
    }
    return acceptedMimeTypes.length === 0 || acceptedMimeTypes.includes(file.mimeType);
  };

  if (!isConnected) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{files.length} items</Badge>
            <div className="flex items-center gap-1 border rounded-md p-1">
              <Button
                onClick={() => setViewMode('list')}
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 w-7 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setViewMode('grid')}
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 w-7 p-0"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={() => fetchDriveFiles(currentFolder)}
              variant="outline"
              size="sm"
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload to Google Drive button */}
        <div className="flex items-center justify-center p-4 border-2 border-dashed rounded-lg bg-muted/20">
          <div className="text-center">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload to Google Drive
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Upload files to the selected folder</p>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground overflow-x-auto">
          {breadcrumbs.map((breadcrumb, index) => (
            <React.Fragment key={breadcrumb.id}>
              <button
                onClick={() => navigateToBreadcrumb(breadcrumb, index)}
                className={`flex items-center gap-1 hover:text-foreground transition-colors whitespace-nowrap ${
                  index === breadcrumbs.length - 1 ? 'text-foreground font-medium' : ''
                }`}
              >
                {index === 0 && <Home className="h-4 w-4" />}
                {breadcrumb.name}
              </button>
              {index < breadcrumbs.length - 1 && (
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Files Grid/List */}
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Loading files...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-8">
            <FolderOpen className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No files found in this folder</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                onClick={() => handleFileClick(file)}
                className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                  isFileSelectable(file)
                    ? 'hover:bg-muted/50 cursor-pointer border-border hover:border-primary/50'
                    : 'opacity-60 cursor-not-allowed border-muted'
                }`}
              >
                <div className="flex items-center gap-3">
                  {getFileIcon(file.mimeType)}
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {file.mimeType === 'application/vnd.google-apps.folder' ? 'Folder' : formatFileSize(file.size)} • {formatDate(file.modifiedTime)}
                    </p>
                  </div>
                </div>
                {file.mimeType === 'application/vnd.google-apps.folder' ? (
                  <Button variant="ghost" size="sm">
                    Open
                  </Button>
                ) : (
                  isFileSelectable(file) && (
                    <Button variant="ghost" size="sm">
                      Select
                    </Button>
                  )
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((file) => (
              <div
                key={file.id}
                onClick={() => handleFileClick(file)}
                className={`p-4 border rounded-lg text-center transition-colors ${
                  isFileSelectable(file)
                    ? 'hover:bg-muted/50 cursor-pointer border-border hover:border-primary/50'
                    : 'opacity-60 cursor-not-allowed border-muted'
                }`}
              >
                <div className="flex justify-center mb-2">
                  {getFileIcon(file.mimeType)}
                </div>
                <p className="font-medium text-sm truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {file.mimeType === 'application/vnd.google-apps.folder' ? 'Folder' : formatFileSize(file.size)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoogleDriveFileBrowser;