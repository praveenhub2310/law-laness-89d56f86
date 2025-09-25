import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { File, Folder, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface OneDriveFile {
  id: string;
  name: string;
  size?: number;
  webUrl: string;
  downloadUrl?: string;
  folder?: {
    childCount: number;
  };
  file?: {
    mimeType: string;
  };
  createdDateTime: string;
  lastModifiedDateTime: string;
}

interface OneDriveFileBrowserProps {
  isConnected: boolean;
  userProfile: any;
  onFileSelect?: (file: OneDriveFile) => void;
  acceptedMimeTypes?: string[];
  title?: string;
}

const OneDriveFileBrowser: React.FC<OneDriveFileBrowserProps> = ({ 
  isConnected, 
  userProfile,
  onFileSelect,
  acceptedMimeTypes = [],
  title = "OneDrive Files"
}) => {
  const [files, setFiles] = useState<OneDriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState<string>('root');
  const [folderPath, setFolderPath] = useState<string[]>(['OneDrive']);

  const fetchFiles = async (folderId: string = 'root') => {
    if (!isConnected) return;

    setLoading(true);
    try {
      const accessToken = localStorage.getItem('onedrive_access_token');
      
      if (!accessToken) {
        throw new Error('No access token available');
      }

      const endpoint = folderId === 'root' 
        ? 'https://graph.microsoft.com/v1.0/me/drive/root/children'
        : `https://graph.microsoft.com/v1.0/me/drive/items/${folderId}/children`;

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch files: ${response.statusText}`);
      }

      const data = await response.json();
      setFiles(data.value || []);
      
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to load OneDrive files');
    } finally {
      setLoading(false);
    }
  };

  const openFolder = (folder: OneDriveFile) => {
    setCurrentFolderId(folder.id);
    setFolderPath([...folderPath, folder.name]);
    fetchFiles(folder.id);
  };

  const navigateUp = () => {
    if (folderPath.length > 1) {
      const newPath = folderPath.slice(0, -1);
      setFolderPath(newPath);
      
      if (newPath.length === 1) {
        setCurrentFolderId('root');
        fetchFiles('root');
      } else {
        // Navigate to parent folder (would need to track folder IDs for proper navigation)
        fetchFiles('root');
      }
    }
  };

  const downloadFile = async (file: OneDriveFile) => {
    try {
      const accessToken = localStorage.getItem('onedrive_access_token');
      
      if (!accessToken) {
        throw new Error('No access token available');
      }

      const response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${file.id}/content`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Downloaded ${file.name}`);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error(`Failed to download ${file.name}`);
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleFileClick = (file: OneDriveFile) => {
    if (file.folder) {
      openFolder(file);
    } else {
      // Check if file type is accepted
      if (acceptedMimeTypes.length > 0 && file.file && !acceptedMimeTypes.includes(file.file.mimeType)) {
        toast.error('This file type is not supported');
        return;
      }
      
      if (onFileSelect) {
        // Convert OneDrive file format to match GoogleDrive format for consistency
        const convertedFile = {
          ...file,
          size: file.size?.toString() || '0',
          webViewLink: file.webUrl,
          webContentLink: file['@microsoft.graph.downloadUrl'],
          mimeType: file.file?.mimeType || 'application/octet-stream'
        };
        onFileSelect(convertedFile as any);
        toast.success(`Selected: ${file.name}`);
      } else {
        downloadFile(file);
      }
    }
  };

  const isFileSelectable = (file: OneDriveFile) => {
    if (file.folder) {
      return false; // Don't allow folder selection for now
    }
    return acceptedMimeTypes.length === 0 || (file.file && acceptedMimeTypes.includes(file.file.mimeType));
  };

  useEffect(() => {
    if (isConnected) {
      fetchFiles();
    }
  }, [isConnected]);

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Connect to OneDrive to browse your files</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchFiles(currentFolderId)}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {folderPath.map((folder, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span>/</span>}
              <button
                onClick={() => index === 0 ? fetchFiles('root') : navigateUp()}
                className="hover:text-foreground"
                disabled={loading}
              >
                {folder}
              </button>
            </React.Fragment>
          ))}
        </div>
        
        {userProfile && (
          <p className="text-sm text-muted-foreground">
            Connected as: {userProfile.name} ({userProfile.email})
          </p>
        )}
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-96">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading files...</span>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No files found in this folder</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Back button for subfolders */}
              {folderPath.length > 1 && (
                <div
                  className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent"
                  onClick={navigateUp}
                >
                  <Folder className="h-5 w-5 text-blue-500" />
                  <span>.. (Back)</span>
                </div>
              )}
              
              {/* Files and folders */}
              {files.map((file) => (
                <div
                  key={file.id}
                  onClick={() => handleFileClick(file)}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    file.folder || isFileSelectable(file)
                      ? 'hover:bg-accent cursor-pointer border-border hover:border-primary/20'
                      : 'opacity-60 cursor-not-allowed border-muted'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {file.folder ? (
                      <Folder className="h-5 w-5 text-blue-500" />
                    ) : (
                      <File className="h-5 w-5 text-gray-500" />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {file.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {file.folder ? 
                          `${file.folder.childCount} items` : 
                          `${formatFileSize(file.size)} • Modified ${formatDate(file.lastModifiedDateTime)}`
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {file.folder ? (
                      <Button variant="ghost" size="sm">
                        Open
                      </Button>
                    ) : onFileSelect && isFileSelectable(file) ? (
                      <Button variant="ghost" size="sm">
                        Select
                      </Button>
                     ) : (
                       <Button variant="ghost" size="sm">
                         Download
                       </Button>
                     )}
                   </div>
                 </div>
               ))}
             </div>
           )}
         </ScrollArea>
       </CardContent>
     </Card>
   );
 };

export default OneDriveFileBrowser;