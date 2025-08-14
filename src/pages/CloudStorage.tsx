
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cloud, Folder, File, Download, Eye, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Google API TypeScript declarations
declare global {
  interface Window {
    gapi: {
      load: (libraries: string, callback: () => void) => void;
      client: {
        init: (config: {
          apiKey: string;
          clientId: string;
          discoveryDocs: string[];
          scope: string;
        }) => Promise<void>;
      };
      auth2: {
        getAuthInstance: () => {
          signIn: (options?: { scope: string }) => Promise<{
            getAuthResponse: () => { access_token: string };
            getBasicProfile: () => { getEmail: () => string };
          }>;
          signOut: () => Promise<void>;
        };
      };
    };
  }
}

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
  iconLink?: string;
  webViewLink?: string;
  parents?: string[];
}

interface BreadcrumbItem {
  id: string;
  name: string;
}

const CloudStorage = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentFolder, setCurrentFolder] = useState('root');
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ id: 'root', name: 'Root' }]);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Google API configuration - These need to be configured in Google Cloud Console
  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE';
  const API_KEY = process.env.GOOGLE_API_KEY || 'YOUR_GOOGLE_API_KEY_HERE';
  const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
  const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

  useEffect(() => {
    const initializeAndCheck = async () => {
      await initializeGapi();
      // Check if user was previously connected
      const storedToken = localStorage.getItem('google_drive_token');
      const storedEmail = localStorage.getItem('google_drive_email');
      if (storedToken && storedEmail) {
        // Verify token is still valid by making a test request
        try {
          const response = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
            headers: { 'Authorization': `Bearer ${storedToken}` }
          });
          if (response.ok) {
            const data = await response.json();
            setAccessToken(storedToken);
            setUserEmail(data.user?.emailAddress || storedEmail);
            setIsConnected(true);
            await fetchFiles('root');
          } else {
            // Token expired, clear storage
            localStorage.removeItem('google_drive_token');
            localStorage.removeItem('google_drive_email');
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('google_drive_token');
          localStorage.removeItem('google_drive_email');
        }
      }
    };
    
    initializeAndCheck();
  }, []);

  const initializeGapi = async () => {
    try {
      console.log('Initializing Google API...');
      
      // Check if Google API keys are configured
      if (CLIENT_ID.includes('YOUR_GOOGLE') || API_KEY.includes('YOUR_GOOGLE')) {
        toast.error('Google API credentials not configured. Please contact administrator.');
        return;
      }
      
      // Load Google API script dynamically
      if (!window.gapi) {
        console.log('Loading Google API script...');
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://apis.google.com/js/api.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Google API script'));
          document.head.appendChild(script);
        });
      }

      // Initialize gapi.auth2 and gapi.client
      await new Promise<void>((resolve) => {
        window.gapi.load('auth2:client', () => resolve());
      });
      
      console.log('Initializing Google API client...');
      await window.gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: [DISCOVERY_DOC],
        scope: SCOPES
      });
      
      console.log('Google API initialized successfully');
    } catch (error) {
      console.error('Error initializing Google API:', error);
      toast.error('Failed to initialize Google Drive integration. Please check your internet connection.');
    }
  };

  const connectGoogleDrive = async () => {
    if (CLIENT_ID.includes('YOUR_GOOGLE') || API_KEY.includes('YOUR_GOOGLE')) {
      toast.error('Google API credentials not configured. Please contact administrator.');
      return;
    }

    setIsConnecting(true);
    console.log('Starting Google Drive connection...');
    
    try {
      // Ensure gapi is initialized
      if (!window.gapi?.auth2) {
        throw new Error('Google API not properly initialized');
      }

      const authInstance = window.gapi.auth2.getAuthInstance();
      if (!authInstance) {
        throw new Error('Google Auth instance not available');
      }

      console.log('Requesting Google sign-in...');
      const user = await authInstance.signIn({
        scope: SCOPES
      });
      
      const authResponse = user.getAuthResponse();
      if (!authResponse?.access_token) {
        throw new Error('No access token received');
      }

      const token = authResponse.access_token;
      const profile = user.getBasicProfile();
      const email = profile.getEmail();
      
      console.log('Google Drive connected successfully for:', email);
      
      setAccessToken(token);
      setUserEmail(email);
      setIsConnected(true);
      
      // Store in localStorage for persistence
      localStorage.setItem('google_drive_token', token);
      localStorage.setItem('google_drive_email', email);
      
      // Fetch root files
      await fetchFiles('root');
      toast.success(`Successfully connected to Google Drive as ${email}!`);
    } catch (error) {
      console.error('Error connecting to Google Drive:', error);
      
      // Handle specific error cases
      if (error.error === 'popup_closed_by_user') {
        toast.error('Sign-in was cancelled. Please try again.');
      } else if (error.error === 'access_denied') {
        toast.error('Access denied. Please grant permission to access your Google Drive.');
      } else {
        toast.error(`Failed to connect to Google Drive: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectGoogleDrive = async () => {
    try {
      const authInstance = window.gapi?.auth2?.getAuthInstance();
      if (authInstance) {
        await authInstance.signOut();
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
    
    setIsConnected(false);
    setAccessToken(null);
    setUserEmail('');
    setFiles([]);
    setCurrentFolder('root');
    setBreadcrumbs([{ id: 'root', name: 'Root' }]);
    
    localStorage.removeItem('google_drive_token');
    localStorage.removeItem('google_drive_email');
    
    toast.success('Disconnected from Google Drive');
  };

  const fetchFiles = async (folderId: string) => {
    if (!accessToken) {
      console.error('No access token available');
      return;
    }
    
    setLoading(true);
    console.log(`Fetching files for folder: ${folderId}`);
    
    try {
      const query = folderId === 'root' ? 
        `parents in 'root' and trashed=false` : 
        `'${folderId}' in parents and trashed=false`;
        
      const params = new URLSearchParams({
        q: query,
        fields: 'files(id,name,mimeType,modifiedTime,size,iconLink,webViewLink,parents),nextPageToken',
        orderBy: 'folder,name',
        pageSize: '100'
      });
      
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired
          toast.error('Session expired. Please reconnect to Google Drive.');
          disconnectGoogleDrive();
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`Fetched ${data.files?.length || 0} files`);
      setFiles(data.files || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error(`Failed to fetch files: ${error.message}`);
      
      // If it's an auth error, disconnect
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        disconnectGoogleDrive();
      }
    } finally {
      setLoading(false);
    }
  };

  const navigateToFolder = async (folder: GoogleDriveFile) => {
    setCurrentFolder(folder.id);
    setBreadcrumbs(prev => [...prev, { id: folder.id, name: folder.name }]);
    await fetchFiles(folder.id);
  };

  const navigateToBreadcrumb = async (breadcrumb: BreadcrumbItem, index: number) => {
    setCurrentFolder(breadcrumb.id);
    setBreadcrumbs(prev => prev.slice(0, index + 1));
    await fetchFiles(breadcrumb.id);
  };

  const downloadFile = async (file: GoogleDriveFile) => {
    if (!accessToken) return;
    
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to download file');
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
      
      toast.success(`Downloaded ${file.name}`);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const previewFile = (file: GoogleDriveFile) => {
    if (file.webViewLink) {
      window.open(file.webViewLink, '_blank');
    } else {
      toast.error('Preview not available for this file type');
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'application/vnd.google-apps.folder') {
      return <Folder className="h-5 w-5 text-blue-500" />;
    }
    return <File className="h-5 w-5 text-gray-500" />;
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
                  onClick={connectGoogleDrive}
                  disabled={isConnecting}
                  className="w-full"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Connect Google Drive'
                  )}
                </Button>
              </>
            ) : (
              <>
                <p className="text-muted-foreground mb-2">
                  Connected to: <span className="font-medium text-foreground">{userEmail}</span>
                </p>
                <Button 
                  variant="outline" 
                  onClick={disconnectGoogleDrive}
                  className="w-full"
                >
                  Disconnect
                </Button>
              </>
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
            <CardTitle>Google Drive Files</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 mb-4 text-sm">
              {breadcrumbs.map((breadcrumb, index) => (
                <React.Fragment key={breadcrumb.id}>
                  {index > 0 && <span className="text-muted-foreground">/</span>}
                  <button
                    onClick={() => navigateToBreadcrumb(breadcrumb, index)}
                    className="text-primary hover:underline"
                    disabled={loading}
                  >
                    {breadcrumb.name}
                  </button>
                </React.Fragment>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading files...</span>
              </div>
            ) : files.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No files found in this folder.</p>
            ) : (
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getFileIcon(file.mimeType)}
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => 
                            file.mimeType === 'application/vnd.google-apps.folder'
                              ? navigateToFolder(file)
                              : previewFile(file)
                          }
                          className="font-medium text-left hover:text-primary transition-colors truncate block w-full"
                        >
                          {file.name}
                        </button>
                        <p className="text-sm text-muted-foreground">
                          Modified {formatDate(file.modifiedTime)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground min-w-0">
                        {file.mimeType === 'application/vnd.google-apps.folder' ? 'Folder' : formatFileSize(file.size)}
                      </span>
                      
                      {file.mimeType !== 'application/vnd.google-apps.folder' && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => previewFile(file)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => downloadFile(file)}
                            className="h-8 w-8 p-0"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Contract_Amendment_v2.docx</h4>
                <p className="text-sm text-muted-foreground">Modified 2 hours ago • Google Drive</p>
              </div>
              <span className="text-sm text-muted-foreground">2.4 MB</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Evidence_Photos.zip</h4>
                <p className="text-sm text-muted-foreground">Modified yesterday • OneDrive</p>
              </div>
              <span className="text-sm text-muted-foreground">15.2 MB</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Legal_Brief_Draft.pdf</h4>
                <p className="text-sm text-muted-foreground">Modified 3 days ago • Google Drive</p>
              </div>
              <span className="text-sm text-muted-foreground">1.8 MB</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CloudStorage;
