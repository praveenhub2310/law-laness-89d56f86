import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

// Google API configuration
const GOOGLE_CLIENT_ID = '1048512211591-7isrimn9n6q2a6jh1ra23iktoilkbc3e.apps.googleusercontent.com';
const GOOGLE_API_KEY = 'AIzaSyAdpCkgEOgsSeF_Ofa5nWOcUTZQZE-_bvk';
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

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

interface UserProfile {
  email: string;
  name: string;
  picture?: string;
}

// Global Google API declaration
declare global {
  interface Window {
    gapi: any;
  }
}

const CloudStorage = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentFolder, setCurrentFolder] = useState('root');
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ id: 'root', name: 'My Drive' }]);
  const [isGapiLoaded, setIsGapiLoaded] = useState(false);

  // Component mounting and Google API initialization
  useEffect(() => {
    console.log('🚀 CloudStorage component mounted successfully!');
    console.log('📍 Current location:', window.location.href);
    console.log('⏰ Timestamp:', new Date().toISOString());
    
    // Initialize Google API
    initializeGoogleAPI();
  }, []);

  const initializeGoogleAPI = async () => {
    try {
      console.log('🔧 Starting Google API initialization...');
      
      // Load Google API script if not already loaded
      if (!window.gapi) {
        console.log('📥 Loading Google API script...');
        await loadGoogleScript();
        console.log('✅ Google API script loaded');
      } else {
        console.log('📋 Google API script already available');
      }
      
      // Load gapi modules
      console.log('🔌 Loading gapi modules (auth2:client)...');
      await new Promise<void>((resolve, reject) => {
        window.gapi.load('auth2:client', {
          callback: () => {
            console.log('✅ Gapi modules loaded successfully');
            resolve();
          },
          onerror: () => {
            console.error('❌ Failed to load gapi modules');
            reject(new Error('Failed to load gapi modules'));
          }
        });
      });
      
      // Initialize the client
      console.log('⚙️ Initializing Google client...');
      await window.gapi.client.init({
        apiKey: GOOGLE_API_KEY,
        clientId: GOOGLE_CLIENT_ID,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        scope: SCOPES
      });
      
      console.log('✅ Google client initialized successfully');
      setIsGapiLoaded(true);
      console.log('🎉 Google API initialization completed!');
      toast.success('Google Drive integration ready!');
      
    } catch (error) {
      console.error('❌ Google API initialization failed:', error);
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      });
      
      // Set to true anyway so user can try to connect
      setIsGapiLoaded(true);
      toast.error('Google API initialization had issues, but you can try connecting');
    }
  };

  const loadGoogleScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('📦 Google API script element loaded');
        // Give it a moment to initialize
        setTimeout(() => {
          if (window.gapi) {
            console.log('✅ window.gapi is now available');
            resolve();
          } else {
            console.error('❌ window.gapi still not available after script load');
            reject(new Error('Google API not available after script load'));
          }
        }, 100);
      };
      
      script.onerror = (error) => {
        console.error('❌ Failed to load Google API script:', error);
        reject(new Error('Failed to load Google API script'));
      };
      
      console.log('📥 Appending Google API script to document head...');
      document.head.appendChild(script);
    });
  };

  const handleConnect = async () => {
    console.log('🔗 Connect button clicked');
    console.log('🔍 isGapiLoaded:', isGapiLoaded);
    console.log('🔍 window.gapi exists:', !!window.gapi);
    
    if (!isGapiLoaded) {
      console.log('⚠️ Google API not ready yet');
      toast.error('Google API not ready. Please wait and try again.');
      return;
    }

    if (!window.gapi) {
      console.error('❌ window.gapi is not available');
      toast.error('Google API not loaded. Please refresh the page.');
      return;
    }

    console.log('🔗 Starting Google Drive connection...');
    setIsConnecting(true);
    
    try {
      console.log('🔐 Getting auth instance...');
      const authInstance = window.gapi.auth2.getAuthInstance();
      
      if (!authInstance) {
        console.error('❌ Auth instance not available');
        throw new Error('Google Auth instance not available');
      }
      
      console.log('✅ Auth instance obtained');
      console.log('👤 Requesting sign in...');
      
      const user = await authInstance.signIn();
      console.log('📝 Sign in completed, checking user status...');
      console.log('🔍 User object:', user);
      console.log('🔍 User.isSignedIn():', user.isSignedIn());
      
      if (user.isSignedIn()) {
        console.log('✅ User is signed in, getting profile...');
        
        const profile = user.getBasicProfile();
        console.log('📋 Profile obtained:', {
          email: profile.getEmail(),
          name: profile.getName(),
          hasImage: !!profile.getImageUrl()
        });
        
        const userProfile: UserProfile = {
          email: profile.getEmail(),
          name: profile.getName(),
          picture: profile.getImageUrl()
        };
        
        console.log('💾 Setting user profile and connection state...');
        setUserProfile(userProfile);
        setIsConnected(true);
        
        console.log('🗃️ Storing credentials in localStorage...');
        localStorage.setItem('google_drive_profile', JSON.stringify(userProfile));
        
        console.log('📁 Fetching initial files...');
        await fetchDriveFiles('root');
        
        console.log('🎉 Connection process completed successfully!');
        toast.success(`Connected as ${userProfile.name}!`);
      } else {
        console.error('❌ User is not signed in after sign-in attempt');
        throw new Error('User is not signed in after sign-in attempt');
      }
    } catch (error: any) {
      console.error('💥 Connection failed with error:', error);
      console.error('📊 Error details:', {
        name: error?.name,
        message: error?.message,
        error: error?.error,
        details: error?.details
      });
      
      if (error?.error === 'popup_closed_by_user') {
        console.log('👆 User closed the popup');
        toast.error('Sign-in was cancelled');
      } else if (error?.error === 'access_denied') {
        console.log('🚫 User denied access');
        toast.error('Access denied. Please grant permission to access Google Drive.');
      } else {
        console.log('❓ Unknown error occurred');
        toast.error(`Failed to connect: ${error?.message || 'Unknown error'}`);
      }
    } finally {
      console.log('🔚 Setting isConnecting to false');
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    console.log('🔌 Disconnecting from Google Drive...');
    
    try {
      if (isGapiLoaded) {
        const authInstance = window.gapi.auth2.getAuthInstance();
        await authInstance.signOut();
      }
    } catch (error) {
      console.error('Error during sign out:', error);
    }
    
    setIsConnected(false);
    setUserProfile(null);
    setFiles([]);
    setCurrentFolder('root');
    setBreadcrumbs([{ id: 'root', name: 'My Drive' }]);
    
    localStorage.removeItem('google_drive_profile');
    toast.success('Disconnected from Google Drive');
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
        pageSize: 50,
        fields: 'files(id,name,mimeType,modifiedTime,size,webViewLink,webContentLink,parents)',
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
        console.log('🔐 Authentication error detected, resetting connection');
        setIsConnected(false);
        setUserProfile(null);
        localStorage.removeItem('google_drive_profile');
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
    if (file.webViewLink) {
      window.open(file.webViewLink, '_blank');
    } else {
      toast.error('Preview not available for this file');
    }
  };

  const downloadFile = (file: GoogleDriveFile) => {
    if (file.webContentLink) {
      window.open(file.webContentLink, '_blank');
    } else {
      toast.error('Download not available for this file');
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
                  onClick={handleConnect}
                  disabled={isConnecting || !isGapiLoaded}
                  className="w-full"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : !isGapiLoaded ? (
                    'Initializing...'
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
                      onClick={handleDisconnect}
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
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading files...</span>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-8">
                <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">No files found in this folder</p>
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