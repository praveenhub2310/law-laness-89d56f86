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
  RefreshCw,
  Upload,
  Plus,
  X
} from 'lucide-react';
import { toast } from 'sonner';

// Google API configuration
const GOOGLE_CLIENT_ID = '1048512211591-7isrimn9n6q2a6jh1ra23iktoilkbc3e.apps.googleusercontent.com';
const GOOGLE_API_KEY = 'AIzaSyAdpCkgEOgsSeF_Ofa5nWOcUTZQZE-_bvk';
const SCOPES = 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';

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

// Global Google API declarations
declare global {
  interface Window {
    gapi: any;
    google: any;
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
  const [recentFiles, setRecentFiles] = useState<GoogleDriveFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});

  // Component mounting and Google API initialization
  useEffect(() => {
    console.log('🚀 CloudStorage component mounted successfully!');
    console.log('📍 Current location:', window.location.href);
    console.log('⏰ Timestamp:', new Date().toISOString());
    
    // Initialize Google API
    initializeGoogleAPI();
    loadRecentFiles();
    
    // Check connection with enhanced retry logic for better persistence
    const checkConnection = async () => {
      let attempts = 0;
      while (attempts < 10) { // Increased attempts for better reliability
        const success = await checkExistingConnection();
        if (success || attempts >= 9) break;
        await new Promise(resolve => setTimeout(resolve, 500)); // Faster retry intervals
        attempts++;
      }
    };
    checkConnection();
    
    // Set up periodic connection check to maintain session
    const connectionCheckInterval = setInterval(() => {
      if (isConnected) {
        checkExistingConnection();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
    
    return () => {
      clearInterval(connectionCheckInterval);
    };
  }, []);

  const checkExistingConnection = async (): Promise<boolean> => {
    // Wait for API initialization to complete with better timeout handling
    let attempts = 0;
    while (!isGapiLoaded && attempts < 30) { // Increased attempts for reliability
      await new Promise(resolve => setTimeout(resolve, 200)); // Faster checks
      attempts++;
    }
    
    const savedProfile = localStorage.getItem('google_drive_profile');
    const savedToken = localStorage.getItem('google_drive_token');
    const savedExpiry = localStorage.getItem('google_drive_token_expiry');
    
    if (savedProfile && savedToken && isGapiLoaded) {
      try {
        console.log('🔍 Checking existing connection...');
        
        // Check if token is expired with more generous buffer
        if (savedExpiry && new Date().getTime() > (parseInt(savedExpiry) - 5 * 60 * 1000)) { // 5 min buffer
          console.log('⏰ Token will expire soon, clearing stored data...');
          await refreshOrClearToken();
          return false;
        }
        
        const profile = JSON.parse(savedProfile);
        
        // Test if the token is still valid by making a simple API call with retry logic
        let testResponse;
        let retryCount = 0;
        
        while (retryCount < 3) {
          try {
            testResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
              headers: {
                'Authorization': `Bearer ${savedToken}`
              }
            });
            break;
          } catch (error) {
            retryCount++;
            if (retryCount >= 3) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        if (testResponse && testResponse.ok) {
          console.log('✅ Existing token is valid, restoring connection...');
          setUserProfile(profile);
          setIsConnected(true);
          
          // Set the token for gapi client
          if (window.gapi?.client) {
            window.gapi.client.setToken({
              access_token: savedToken
            });
          }
          
          // Fetch files for the restored connection
          await fetchDriveFiles('root');
          
          // Only show welcome message if this is a fresh page load
          if (!isConnected) {
            toast.success(`Welcome back, ${profile.name}!`);
          }
          return true;
        } else {
          console.log('❌ Existing token is invalid, clearing stored data...');
          await refreshOrClearToken();
          return false;
        }
      } catch (error) {
        console.error('Error checking existing connection:', error);
        await refreshOrClearToken();
        return false;
      }
    }
    return false;
  };

  const refreshOrClearToken = async () => {
    localStorage.removeItem('google_drive_profile');
    localStorage.removeItem('google_drive_token');
    localStorage.removeItem('google_drive_token_expiry');
    setIsConnected(false);
    setUserProfile(null);
    setFiles([]);
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

  const initializeGoogleAPI = async () => {
    try {
      console.log('🔧 Starting Google API initialization...');
      
      // Load Google Identity Services script
      if (!window.google) {
        console.log('📥 Loading Google Identity Services script...');
        await loadGoogleIdentityScript();
        console.log('✅ Google Identity Services script loaded');
      } else {
        console.log('📋 Google Identity Services already available');
      }
      
      // Load Google API script for Drive API
      if (!window.gapi) {
        console.log('📥 Loading Google API script...');
        await loadGoogleAPIScript();
        console.log('✅ Google API script loaded');
      } else {
        console.log('📋 Google API script already available');
      }
      
      // Load gapi client
      console.log('🔌 Loading gapi client...');
      await new Promise<void>((resolve, reject) => {
        window.gapi.load('client', {
          callback: () => {
            console.log('✅ Gapi client loaded successfully');
            resolve();
          },
          onerror: () => {
            console.error('❌ Failed to load gapi client');
            reject(new Error('Failed to load gapi client'));
          }
        });
      });
      
      // Initialize the client
      console.log('⚙️ Initializing Google client...');
      await window.gapi.client.init({
        apiKey: GOOGLE_API_KEY,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
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

  const loadGoogleIdentityScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('📦 Google Identity Services script loaded');
        setTimeout(() => {
          if (window.google) {
            console.log('✅ window.google is now available');
            resolve();
          } else {
            console.error('❌ window.google still not available');
            reject(new Error('Google Identity Services not available'));
          }
        }, 100);
      };
      
      script.onerror = (error) => {
        console.error('❌ Failed to load Google Identity Services:', error);
        reject(new Error('Failed to load Google Identity Services'));
      };
      
      document.head.appendChild(script);
    });
  };

  const loadGoogleAPIScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('📦 Google API script element loaded');
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
    console.log('🔍 window.google exists:', !!window.google);
    
    if (!isGapiLoaded) {
      console.log('⚠️ Google API not ready yet');
      toast.error('Google API not ready. Please wait and try again.');
      return;
    }

    if (!window.gapi || !window.google) {
      console.error('❌ Required Google APIs not available');
      toast.error('Google APIs not loaded. Please refresh the page.');
      return;
    }

    console.log('🔗 Starting Google Drive connection...');
    setIsConnecting(true);
    
    try {
      console.log('🔐 Initializing Google Identity Services OAuth...');
      
      // Use the modern Google Identity Services
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: async (tokenResponse: any) => {
          console.log('🎉 Token response received:', tokenResponse);
          
          if (tokenResponse.access_token) {
            console.log('✅ Access token obtained successfully');
            
            // Set the access token for gapi client
            window.gapi.client.setToken({
              access_token: tokenResponse.access_token
            });
            
            try {
              console.log('👤 Fetching user profile...');
              
              // Get user info using the People API
              const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                  'Authorization': `Bearer ${tokenResponse.access_token}`
                }
              });
              
              if (!userResponse.ok) {
                throw new Error(`Failed to fetch user info: ${userResponse.status}`);
              }
              
              const userData = await userResponse.json();
              console.log('📋 User data received:', {
                email: userData.email,
                name: userData.name,
                hasImage: !!userData.picture
              });
              
              const userProfile: UserProfile = {
                email: userData.email,
                name: userData.name,
                picture: userData.picture
              };
              
              console.log('💾 Setting user profile and connection state...');
              setUserProfile(userProfile);
              setIsConnected(true);
              
              console.log('🗃️ Storing credentials in localStorage...');
              localStorage.setItem('google_drive_profile', JSON.stringify(userProfile));
              localStorage.setItem('google_drive_token', tokenResponse.access_token);
              
              // Store token expiry with more conservative timing (50 minutes for 1-hour tokens)
              const expiryTime = new Date().getTime() + (50 * 60 * 1000); // 50 minutes for safety
              localStorage.setItem('google_drive_token_expiry', expiryTime.toString());
              localStorage.setItem('google_drive_connected_at', new Date().getTime().toString());
              
              console.log('📁 Fetching initial files...');
              await fetchDriveFiles('root');
              
              console.log('🎉 Connection process completed successfully!');
              toast.success(`Connected as ${userProfile.name}!`);
              
            } catch (error: any) {
              console.error('💥 Error during profile fetch:', error);
              toast.error(`Failed to get user profile: ${error.message}`);
            } finally {
              setIsConnecting(false);
            }
          } else {
            console.error('❌ No access token in response');
            toast.error('Failed to get access token');
            setIsConnecting(false);
          }
        },
        error_callback: (error: any) => {
          console.error('💥 OAuth error:', error);
          toast.error(`OAuth error: ${error.message || 'Unknown error'}`);
          setIsConnecting(false);
        }
      });
      
      console.log('🚀 Requesting access token...');
      tokenClient.requestAccessToken({ prompt: 'consent' });
      
    } catch (error: any) {
      console.error('💥 Connection setup failed:', error);
      toast.error(`Failed to setup connection: ${error?.message || 'Unknown error'}`);
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    console.log('🔌 Disconnecting from Google Drive...');
    
    try {
      // Revoke the token if available
      const token = localStorage.getItem('google_drive_token');
      if (token && window.google?.accounts?.oauth2) {
        console.log('🔐 Revoking access token...');
        window.google.accounts.oauth2.revoke(token);
      }
      
      // Clear gapi client token
      if (window.gapi?.client) {
        window.gapi.client.setToken(null);
      }
    } catch (error) {
      console.error('Error during token revocation:', error);
    }
    
    setIsConnected(false);
    setUserProfile(null);
    setFiles([]);
    setCurrentFolder('root');
    setBreadcrumbs([{ id: 'root', name: 'My Drive' }]);
    setRecentFiles([]);
    
    localStorage.removeItem('google_drive_profile');
    localStorage.removeItem('google_drive_token');
    localStorage.removeItem('google_drive_token_expiry');
    localStorage.removeItem('google_drive_connected_at');
    localStorage.removeItem('recentFiles');
    console.log('✅ Disconnection completed');
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
    addToRecentFiles(file);
    if (file.webViewLink) {
      window.open(file.webViewLink, '_blank');
    } else {
      toast.error('Preview not available for this file');
    }
  };

  const downloadFile = (file: GoogleDriveFile) => {
    addToRecentFiles(file);
    if (file.webContentLink) {
      window.open(file.webContentLink, '_blank');
    } else {
      toast.error('Download not available for this file');
    }
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
          parents: currentFolder === 'root' ? undefined : [currentFolder],
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

          xhr.onload = () => {
            if (xhr.status === 200) {
              const result = JSON.parse(xhr.responseText);
              resolve(result);
            } else {
              reject(new Error(`Upload failed: ${xhr.statusText}`));
            }
          };

          xhr.onerror = () => reject(new Error('Upload failed'));

          const token = localStorage.getItem('google_drive_token');
          xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart');
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          xhr.send(form);
        });
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      
      // Add uploaded files to recent files
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
          <CardContent className="space-y-6">
            {/* Upload Section - Inside Google Drive Files */}
            <div className="bg-muted/20 rounded-lg p-4 border-2 border-dashed border-muted-foreground/25">
              <div className="flex items-center gap-2 mb-3">
                <Upload className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-medium">Upload to Google Drive</h3>
              </div>
              
              <div className="space-y-4">
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
                      Upload files directly to your Google Drive
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