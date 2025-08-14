import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Cloud, 
  Folder, 
  File, 
  Download, 
  Eye, 
  ArrowLeft, 
  Loader2, 
  RefreshCw,
  User,
  LogOut,
  Home,
  ChevronRight,
  FileText,
  Image,
  Music,
  Video
} from 'lucide-react';
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
            getBasicProfile: () => { getEmail: () => string; getName: () => string; getImageUrl: () => string };
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
  webContentLink?: string;
  thumbnailLink?: string;
  parents?: string[];
}

interface BreadcrumbItem {
  id: string;
  name: string;
}

interface UserProfile {
  email: string;
  name: string;
  picture?: string;
}

const CloudStorage = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentFolder, setCurrentFolder] = useState('root');
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ id: 'root', name: 'My Drive' }]);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);

  // Google API configuration
  const CLIENT_ID = '1048512211591-7isrimn9n6q2a6jh1ra23iktoilkbc3e.apps.googleusercontent.com';
  const API_KEY = 'AIzaSyAdpCkgEOgsSeF_Ofa5nWOcUTZQZE-_bvk';
  const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
  const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

  useEffect(() => {
    console.log('🚀 CloudStorage component mounted successfully');
    console.log('📧 CLIENT_ID configured:', !CLIENT_ID.includes('YOUR_GOOGLE'));
    console.log('🔑 API_KEY configured:', !API_KEY.includes('YOUR_GOOGLE'));
    console.log('🌐 Current URL:', window.location.href);
    console.log('📁 Starting initialization...');
    
    const initializeAndCheck = async () => {
      try {
        console.log('⚡ Starting Google API initialization');
        const initialized = await initializeGapi();
        
        if (!initialized) {
          console.error('❌ Google API initialization failed');
          return;
        }
        
        console.log('✅ Google API initialized successfully');
        
        // Check if user was previously connected
        const storedToken = localStorage.getItem('google_drive_token');
        const storedProfile = localStorage.getItem('google_drive_profile');
        console.log('💾 Checking stored credentials...');
        console.log('🎟️ Stored token exists:', !!storedToken);
        console.log('👤 Stored profile exists:', !!storedProfile);
        
        if (storedToken && storedProfile) {
          try {
            console.log('🔍 Validating stored token...');
            const profile = JSON.parse(storedProfile);
            // Verify token is still valid
            const response = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
              headers: { 'Authorization': `Bearer ${storedToken}` }
            });
            
            if (response.ok) {
              console.log('✅ Token validation successful, restoring session');
              setAccessToken(storedToken);
              setUserProfile(profile);
              setIsConnected(true);
              await fetchFiles('root');
            } else {
              console.log('⚠️ Token expired, clearing storage');
              localStorage.removeItem('google_drive_token');
              localStorage.removeItem('google_drive_profile');
            }
          } catch (error) {
            console.error('❌ Token validation failed:', error);
            localStorage.removeItem('google_drive_token');
            localStorage.removeItem('google_drive_profile');
          }
        } else {
          console.log('ℹ️ No stored credentials found - user needs to connect');
        }
      } catch (error) {
        console.error('💥 Initialization failed:', error);
        toast.error('Failed to initialize Google Drive integration. Please refresh the page.');
      }
    };
    
    console.log('🏃 Running initialization...');
    initializeAndCheck();
  }, []);

  const initializeGapi = async (): Promise<boolean> => {
    try {
      console.log('🔧 === Starting Google API initialization ===');
      
      if (CLIENT_ID.includes('YOUR_GOOGLE') || API_KEY.includes('YOUR_GOOGLE')) {
        console.error('❌ Google API credentials not configured');
        toast.error('Google API credentials not configured. Please contact administrator.');
        return false;
      }
      
      console.log('🎯 API credentials are properly configured');
      
      // Load Google API script dynamically
      if (!window.gapi) {
        console.log('📥 Loading Google API script...');
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://apis.google.com/js/api.js';
          script.onload = () => {
            console.log('✅ Google API script loaded successfully');
            resolve();
          };
          script.onerror = (error) => {
            console.error('❌ Failed to load Google API script:', error);
            reject(new Error('Failed to load Google API script'));
          };
          document.head.appendChild(script);
        });
      } else {
        console.log('📋 Google API script already loaded');
      }

      // Initialize gapi.auth2 and gapi.client
      console.log('🔌 Loading gapi modules...');
      await new Promise<void>((resolve) => {
        window.gapi.load('auth2:client', () => {
          console.log('✅ gapi modules loaded successfully');
          resolve();
        });
      });
      
      console.log('⚙️ Initializing Google API client...');
      await window.gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: [DISCOVERY_DOC],
        scope: SCOPES
      });
      
      console.log('🎉 === Google API initialization completed successfully ===');
      return true;
    } catch (error) {
      console.error('💥 === Google API initialization failed ===', error);
      toast.error('Failed to initialize Google Drive integration. Please check your internet connection.');
      return false;
    }
  };

  const connectGoogleDrive = async () => {
    console.log('🔗 === Connect Google Drive button clicked ===');
    
    if (CLIENT_ID.includes('YOUR_GOOGLE') || API_KEY.includes('YOUR_GOOGLE')) {
      console.error('❌ Google API credentials not configured');
      toast.error('Google API credentials not configured.');
      return;
    }

    setIsConnecting(true);
    console.log('🔄 Starting Google Drive connection process...');
    
    try {
      console.log('🔍 Checking if Google API is available...');
      if (!window.gapi) {
        console.error('❌ Google API not loaded');
        throw new Error('Google API not loaded. Please refresh the page and try again.');
      }

      if (!window.gapi.auth2) {
        console.error('❌ Google Auth2 not available');
        throw new Error('Google Auth2 not available. Please refresh the page and try again.');
      }

      const authInstance = window.gapi.auth2.getAuthInstance();
      if (!authInstance) {
        console.error('❌ Google Auth instance not available');
        throw new Error('Google Auth instance not available. Please refresh the page and try again.');
      }

      console.log('🚀 Google API is ready, requesting sign-in...');
      const user = await authInstance.signIn({ scope: SCOPES });
      
      console.log('✅ Google sign-in successful');
      const authResponse = user.getAuthResponse();
      if (!authResponse?.access_token) {
        console.error('❌ No access token received');
        throw new Error('No access token received from Google');
      }

      const token = authResponse.access_token;
      const profile = user.getBasicProfile();
      const userProfile: UserProfile = {
        email: profile.getEmail(),
        name: profile.getName(),
        picture: profile.getImageUrl()
      };
      
      console.log('🎉 Google Drive connected successfully for:', userProfile.email);
      console.log('🔑 Access token received (length):', token.length);
      
      setAccessToken(token);
      setUserProfile(userProfile);
      setIsConnected(true);
      
      // Store in localStorage for persistence
      console.log('💾 Storing credentials in localStorage...');
      localStorage.setItem('google_drive_token', token);
      localStorage.setItem('google_drive_profile', JSON.stringify(userProfile));
      
      // Fetch root files
      console.log('📁 Fetching initial files...');
      await fetchFiles('root');
      toast.success(`Successfully connected to Google Drive as ${userProfile.name}!`);
    } catch (error: any) {
      console.error('💥 Google Drive connection failed:', error);
      
      if (error?.error === 'popup_closed_by_user') {
        console.log('👆 User closed the popup');
        toast.error('Sign-in was cancelled. Please try again.');
      } else if (error?.error === 'access_denied') {
        console.log('🚫 User denied access');
        toast.error('Access denied. Please grant permission to access your Google Drive.');
      } else if (error?.error === 'popup_blocked_by_browser') {
        console.log('🚧 Popup blocked by browser');
        toast.error('Popup blocked by browser. Please allow popups and try again.');
      } else {
        console.error('❓ Unknown error:', error);
        toast.error(`Failed to connect to Google Drive: ${error?.message || 'Unknown error'}`);
      }
    } finally {
      setIsConnecting(false);
      console.log('🔚 === Connect Google Drive process completed ===');
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
    setUserProfile(null);
    setFiles([]);
    setCurrentFolder('root');
    setBreadcrumbs([{ id: 'root', name: 'My Drive' }]);
    setNextPageToken(null);
    
    localStorage.removeItem('google_drive_token');
    localStorage.removeItem('google_drive_profile');
    
    toast.success('Disconnected from Google Drive');
  };

  const fetchFiles = async (folderId: string, loadMore: boolean = false) => {
    if (!accessToken) {
      console.error('No access token available');
      return;
    }
    
    if (loadMore) {
      setIsLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    console.log(`Fetching files for folder: ${folderId}, loadMore: ${loadMore}`);
    
    try {
      const query = folderId === 'root' ? 
        `trashed=false` : 
        `'${folderId}' in parents and trashed=false`;
        
      const params = new URLSearchParams({
        q: query,
        fields: 'files(id,name,mimeType,modifiedTime,size,iconLink,webViewLink,webContentLink,thumbnailLink,parents),nextPageToken',
        orderBy: 'folder,name',
        pageSize: '50'
      });

      if (loadMore && nextPageToken) {
        params.append('pageToken', nextPageToken);
      }
      
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
          toast.error('Session expired. Please reconnect to Google Drive.');
          disconnectGoogleDrive();
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`Fetched ${data.files?.length || 0} files`);
      
      if (loadMore) {
        setFiles(prev => [...prev, ...(data.files || [])]);
      } else {
        setFiles(data.files || []);
      }
      
      setNextPageToken(data.nextPageToken || null);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error(`Failed to fetch files: ${error.message}`);
      
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        disconnectGoogleDrive();
      }
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const navigateToFolder = async (folder: GoogleDriveFile) => {
    setCurrentFolder(folder.id);
    setBreadcrumbs(prev => [...prev, { id: folder.id, name: folder.name }]);
    setNextPageToken(null);
    await fetchFiles(folder.id);
  };

  const navigateToBreadcrumb = async (breadcrumb: BreadcrumbItem, index: number) => {
    setCurrentFolder(breadcrumb.id);
    setBreadcrumbs(prev => prev.slice(0, index + 1));
    setNextPageToken(null);
    await fetchFiles(breadcrumb.id);
  };

  const loadMoreFiles = () => {
    if (nextPageToken && !isLoadingMore) {
      fetchFiles(currentFolder, true);
    }
  };

  const downloadFile = async (file: GoogleDriveFile) => {
    if (!accessToken) return;
    
    try {
      let downloadUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
      
      // Handle Google Workspace files that need to be exported
      if (file.mimeType.includes('google-apps')) {
        const exportFormats = {
          'application/vnd.google-apps.document': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.google-apps.spreadsheet': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.google-apps.presentation': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        };
        
        const exportMimeType = exportFormats[file.mimeType] || 'application/pdf';
        downloadUrl = `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=${exportMimeType}`;
      }
      
      const response = await fetch(downloadUrl, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
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
      return <Folder className="h-6 w-6 text-blue-500" />;
    } else if (mimeType.includes('image')) {
      return <Image className="h-6 w-6 text-green-500" />;
    } else if (mimeType.includes('video')) {
      return <Video className="h-6 w-6 text-red-500" />;
    } else if (mimeType.includes('audio')) {
      return <Music className="h-6 w-6 text-purple-500" />;
    } else if (mimeType.includes('document') || mimeType.includes('pdf') || mimeType.includes('text')) {
      return <FileText className="h-6 w-6 text-orange-500" />;
    }
    return <File className="h-6 w-6 text-gray-500" />;
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

  const isFolder = (mimeType: string) => {
    return mimeType === 'application/vnd.google-apps.folder';
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
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={userProfile?.picture} alt={userProfile?.name} />
                      <AvatarFallback>
                        <User className="h-6 w-6" />
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
                      onClick={disconnectGoogleDrive}
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
              <CardTitle>Files and Folders</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{files.length} items</Badge>
                <Button
                  onClick={() => fetchFiles(currentFolder)}
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
          <CardContent>
            {/* Breadcrumb Navigation */}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
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

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center space-x-3 p-3">
                    <Skeleton className="h-8 w-8 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-3 w-[100px]" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-12">
                <Folder className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground mb-2">
                  No files or folders found
                </p>
                <p className="text-sm text-muted-foreground">
                  This folder appears to be empty
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        {file.iconLink ? (
                          <img src={file.iconLink} alt="" className="h-8 w-8" />
                        ) : (
                          getFileIcon(file.mimeType)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {file.name}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>{isFolder(file.mimeType) ? 'Folder' : formatFileSize(file.size)}</span>
                          <span>{formatDate(file.modifiedTime)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {isFolder(file.mimeType) ? (
                        <Button
                          onClick={() => navigateToFolder(file)}
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Folder className="h-4 w-4" />
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
                
                {/* Load More Button */}
                {nextPageToken && (
                  <div className="pt-4 border-t">
                    <Button
                      onClick={loadMoreFiles}
                      variant="outline"
                      disabled={isLoadingMore}
                      className="w-full"
                    >
                      {isLoadingMore ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Loading more...
                        </>
                      ) : (
                        'Load More Files'
                      )}
                    </Button>
                  </div>
                )}
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