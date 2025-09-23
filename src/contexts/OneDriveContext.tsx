import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

// Microsoft Graph API configuration
const MICROSOFT_CLIENT_ID = import.meta.env.VITE_MICROSOFT_CLIENT_ID || '';
const MICROSOFT_REDIRECT_URI = typeof window !== 'undefined' ? window.location.origin : '';
const SCOPES = 'https://graph.microsoft.com/Files.ReadWrite https://graph.microsoft.com/User.Read';

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

declare global {
  interface Window {
    msal: any;
  }
}

export const OneDriveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMsalLoaded, setIsMsalLoaded] = useState(false);
  const [isConfigured] = useState(!!MICROSOFT_CLIENT_ID);

  // Initialize Microsoft MSAL on provider mount
  useEffect(() => {
    console.log('🚀 OneDriveProvider initializing...');
    initializeMicrosoftAuth();
  }, []);

  // Check existing connection after MSAL is loaded
  useEffect(() => {
    if (isMsalLoaded) {
      checkExistingConnection();
      
      // Set up periodic connection validation
      const interval = setInterval(() => {
        validateConnection();
      }, 2 * 60 * 1000); // Check every 2 minutes
      
      return () => clearInterval(interval);
    }
  }, [isMsalLoaded]);

  const initializeMicrosoftAuth = async () => {
    try {
      console.log('🔧 Starting Microsoft Auth initialization...');
      
      // Load Microsoft Authentication Library script
      if (!window.msal) {
        await loadMsalScript();
      }
      
      console.log('✅ Microsoft Auth initialization completed!');
      setIsMsalLoaded(true);
      
    } catch (error) {
      console.error('❌ Microsoft Auth initialization failed:', error);
      setIsMsalLoaded(true); // Set to true anyway so user can try to connect
    }
  };

  const loadMsalScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://alcdn.msauth.net/browser/2.38.3/js/msal-browser.min.js';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        setTimeout(() => {
          if (window.msal) {
            resolve();
          } else {
            reject(new Error('MSAL not available'));
          }
        }, 100);
      };
      
      script.onerror = () => reject(new Error('Failed to load MSAL script'));
      document.head.appendChild(script);
    });
  };

  const checkExistingConnection = async (): Promise<boolean> => {
    const savedProfile = localStorage.getItem('onedrive_profile');
    const savedToken = localStorage.getItem('onedrive_token');
    const savedExpiry = localStorage.getItem('onedrive_token_expiry');
    
    if (savedProfile && savedToken) {
      try {
        console.log('🔍 Checking existing OneDrive connection...');
        
        // Check if token is expired
        if (savedExpiry && new Date().getTime() > (parseInt(savedExpiry) - 5 * 60 * 1000)) {
          console.log('⏰ Token expired, clearing connection...');
          await clearConnection();
          return false;
        }
        
        // Validate token with Microsoft Graph
        const response = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: { 'Authorization': `Bearer ${savedToken}` }
        });
        
        if (response.ok) {
          const profile = JSON.parse(savedProfile);
          console.log('✅ Restored OneDrive connection for:', profile.name);
          
          setUserProfile(profile);
          setIsConnected(true);
          
          return true;
        } else {
          console.log('❌ Stored token is invalid, clearing connection...');
          await clearConnection();
          return false;
        }
      } catch (error) {
        console.error('Error checking existing connection:', error);
        await clearConnection();
        return false;
      }
    }
    return false;
  };

  const validateConnection = async () => {
    if (!isConnected) return;
    
    const token = localStorage.getItem('onedrive_token');
    if (!token) {
      await clearConnection();
      return;
    }
    
    try {
      const response = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        console.log('🔐 Connection validation failed, disconnecting...');
        await clearConnection();
        toast.error('OneDrive session expired. Please reconnect.');
      }
    } catch (error) {
      console.error('Connection validation error:', error);
    }
  };

  const connect = async (): Promise<void> => {
    if (!isConfigured) {
      toast.error('OneDrive integration is not configured. Please set up your Microsoft Client ID.');
      return;
    }

    if (!isMsalLoaded || !window.msal) {
      toast.error('Microsoft Auth not ready. Please refresh the page.');
      return;
    }

    setIsConnecting(true);
    
    try {
      const msalConfig = {
        auth: {
          clientId: MICROSOFT_CLIENT_ID,
          authority: 'https://login.microsoftonline.com/common',
          redirectUri: MICROSOFT_REDIRECT_URI
        },
        cache: {
          cacheLocation: 'localStorage',
          storeAuthStateInCookie: false
        }
      };

      const msalInstance = new window.msal.PublicClientApplication(msalConfig);
      await msalInstance.initialize();

      const loginRequest = {
        scopes: SCOPES.split(' '),
        prompt: 'consent'
      };

      const response = await msalInstance.loginPopup(loginRequest);
      
      if (response.accessToken) {
        // Get user profile
        const userResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: { 'Authorization': `Bearer ${response.accessToken}` }
        });
        
        const userData = await userResponse.json();
        const profile: UserProfile = {
          email: userData.mail || userData.userPrincipalName,
          name: userData.displayName,
          picture: undefined // Will need to fetch photo separately if needed
        };
        
        // Store connection data
        localStorage.setItem('onedrive_profile', JSON.stringify(profile));
        localStorage.setItem('onedrive_token', response.accessToken);
        
        // Store expiry with 45-minute safety buffer
        const expiryTime = new Date().getTime() + (45 * 60 * 1000);
        localStorage.setItem('onedrive_token_expiry', expiryTime.toString());
        
        setUserProfile(profile);
        setIsConnected(true);
        
        console.log('✅ OneDrive connected successfully!');
        toast.success(`Connected to OneDrive as ${profile.name}!`);
        
      } else {
        toast.error('Failed to get access token');
      }
      
    } catch (error: any) {
      console.error('Connection failed:', error);
      toast.error(`Connection failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async (): Promise<void> => {
    console.log('🔌 Disconnecting from OneDrive...');
    
    try {
      // Clear MSAL cache if available
      if (window.msal) {
        const msalConfig = {
          auth: {
            clientId: MICROSOFT_CLIENT_ID,
            authority: 'https://login.microsoftonline.com/common',
            redirectUri: MICROSOFT_REDIRECT_URI
          }
        };
        const msalInstance = new window.msal.PublicClientApplication(msalConfig);
        await msalInstance.initialize();
        await msalInstance.clearCache();
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
    
    await clearConnection();
    toast.success('Disconnected from OneDrive');
  };

  const clearConnection = async () => {
    setIsConnected(false);
    setUserProfile(null);
    localStorage.removeItem('onedrive_profile');
    localStorage.removeItem('onedrive_token');
    localStorage.removeItem('onedrive_token_expiry');
  };

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