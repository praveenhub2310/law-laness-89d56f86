import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface UserProfile {
  email: string;
  name: string;
  picture?: string;
}

interface OneDriveContextType {
  isConnected: boolean;
  userProfile: UserProfile | null;
  isConnecting: boolean;
  isMsalLoaded: boolean;
  isConfigured: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  checkConnection: () => Promise<boolean>;
}

const OneDriveContext = createContext<OneDriveContextType | null>(null);

export const OneDriveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMsalLoaded, setIsMsalLoaded] = useState(true);
  const [isConfigured, setIsConfigured] = useState(true);

  console.log('🚀 OneDriveProvider mounted with Microsoft Graph OAuth');

  // Check existing connection on mount
  useEffect(() => {
    checkExistingConnection();
  }, []);

  const checkExistingConnection = async (): Promise<boolean> => {
    try {
      console.log('🔍 Checking existing OneDrive connection...');
      
      const accessToken = localStorage.getItem('onedrive_access_token');
      
      if (accessToken) {
        console.log('✅ Found existing OneDrive access token');
        
        // Test the token by getting user profile
        const userResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          const profile: UserProfile = {
            email: userData.mail || userData.userPrincipalName,
            name: userData.displayName || 'User',
            picture: userData.photo?.['@odata.mediaContentType'] ? `data:${userData.photo['@odata.mediaContentType']};base64,${userData.photo}` : undefined
          };
          
          setUserProfile(profile);
          setIsConnected(true);
          
          console.log('✅ Restored OneDrive connection for:', profile.name);
          return true;
        } else {
          // Token expired or invalid, remove it
          localStorage.removeItem('onedrive_access_token');
          localStorage.removeItem('onedrive_refresh_token');
          console.log('❌ OneDrive token expired or invalid');
        }
      }
      
      console.log('❌ No valid OneDrive token found');
      return false;
    } catch (error) {
      console.error('Error checking existing connection:', error);
      return false;
    }
  };

  const connect = async (): Promise<void> => {
    console.log('🔗 OneDrive connect called (Microsoft Graph OAuth)');
    
    setIsConnecting(true);
    
    try {
      console.log('🚀 Starting Microsoft Graph OAuth...');
      
      // Microsoft OAuth configuration
      const clientId = 'your-client-id'; // You'll need to set this
      const redirectUri = `${window.location.origin}/dashboard/cloud-storage`;
      const scopes = 'openid profile User.Read Files.ReadWrite offline_access';
      
      // Build OAuth URL
      const authUrl = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize');
      authUrl.searchParams.set('client_id', clientId);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('scope', scopes);
      authUrl.searchParams.set('response_mode', 'query');
      authUrl.searchParams.set('state', 'onedrive_auth');
      
      console.log('🌐 Redirecting to:', authUrl.toString());
      
      // Open popup or redirect
      const popup = window.open(
        authUrl.toString(),
        'onedrive_auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );
      
      if (!popup) {
        throw new Error('Popup blocked. Please allow popups and try again.');
      }
      
      // Listen for popup completion
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setIsConnecting(false);
          
          // Check if connection was successful
          setTimeout(() => {
            checkExistingConnection();
          }, 1000);
        }
      }, 1000);
      
    } catch (error: any) {
      console.error('💥 Connection failed:', error);
      toast.error(`Connection failed: ${error.message || 'Unknown error'}`);
      setIsConnecting(false);
    }
  };

  const disconnect = async (): Promise<void> => {
    console.log('🔌 Disconnecting from OneDrive...');
    
    try {
      // Remove tokens from localStorage
      localStorage.removeItem('onedrive_access_token');
      localStorage.removeItem('onedrive_refresh_token');
      
      setIsConnected(false);
      setUserProfile(null);
      toast.success('Disconnected from OneDrive');
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Error disconnecting from OneDrive');
    }
  };

  // Handle OAuth callback from URL
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      
      if (code && state === 'onedrive_auth') {
        console.log('🔄 Processing OAuth callback...');
        
        try {
          // Exchange code for tokens
          const tokenResponse = await fetch('/api/onedrive/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
          });
          
          if (tokenResponse.ok) {
            const tokens = await tokenResponse.json();
            localStorage.setItem('onedrive_access_token', tokens.access_token);
            if (tokens.refresh_token) {
              localStorage.setItem('onedrive_refresh_token', tokens.refresh_token);
            }
            
            await checkExistingConnection();
            toast.success('Successfully connected to OneDrive!');
            
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (error) {
          console.error('❌ Token exchange failed:', error);
          toast.error('Failed to connect to OneDrive');
        }
      }
    };
    
    handleOAuthCallback();
  }, []);

  const checkConnection = useCallback(checkExistingConnection, []);

  const value: OneDriveContextType = {
    isConnected,
    userProfile,
    isConnecting,
    isMsalLoaded,
    isConfigured,
    connect,
    disconnect,
    checkConnection,
  };

  return (
    <OneDriveContext.Provider value={value}>
      {children}
    </OneDriveContext.Provider>
  );
};

export const useOneDrive = () => {
  const context = useContext(OneDriveContext);
  if (!context) {
    throw new Error('useOneDrive must be used within a OneDriveProvider');
  }
  return context;
};