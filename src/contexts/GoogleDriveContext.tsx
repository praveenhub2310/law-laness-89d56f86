import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

// Google API configuration
const GOOGLE_CLIENT_ID = '1048512211591-7isrimn9n6q2a6jh1ra23iktoilkbc3e.apps.googleusercontent.com';
const GOOGLE_API_KEY = 'AIzaSyAdpCkgEOgsSeF_Ofa5nWOcUTZQZE-_bvk';
const SCOPES = 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';

interface UserProfile {
  email: string;
  name: string;
  picture?: string;
}

interface GoogleDriveContextType {
  isConnected: boolean;
  userProfile: UserProfile | null;
  isConnecting: boolean;
  isGapiLoaded: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  checkConnection: () => Promise<boolean>;
}

const GoogleDriveContext = createContext<GoogleDriveContextType | null>(null);

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

export const GoogleDriveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isGapiLoaded, setIsGapiLoaded] = useState(false);

  // Initialize Google API on provider mount
  useEffect(() => {
    console.log('🚀 GoogleDriveProvider initializing...');
    initializeGoogleAPI();
  }, []);

  // Check existing connection after API is loaded
  useEffect(() => {
    if (isGapiLoaded) {
      checkExistingConnection();
      
      // Set up periodic connection validation
      const interval = setInterval(() => {
        validateConnection();
      }, 2 * 60 * 1000); // Check every 2 minutes
      
      return () => clearInterval(interval);
    }
  }, [isGapiLoaded]);

  const initializeGoogleAPI = async () => {
    try {
      console.log('🔧 Starting Google API initialization...');
      
      // Load Google Identity Services script
      if (!window.google) {
        await loadGoogleIdentityScript();
      }
      
      // Load Google API script for Drive API
      if (!window.gapi) {
        await loadGoogleAPIScript();
      }
      
      // Load gapi client
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
      await window.gapi.client.init({
        apiKey: GOOGLE_API_KEY,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
      });
      
      console.log('✅ Google API initialization completed!');
      setIsGapiLoaded(true);
      
    } catch (error) {
      console.error('❌ Google API initialization failed:', error);
      setIsGapiLoaded(true); // Set to true anyway so user can try to connect
    }
  };

  const loadGoogleIdentityScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        setTimeout(() => {
          if (window.google) {
            resolve();
          } else {
            reject(new Error('Google Identity Services not available'));
          }
        }, 100);
      };
      
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
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
        setTimeout(() => {
          if (window.gapi) {
            resolve();
          } else {
            reject(new Error('Google API not available after script load'));
          }
        }, 100);
      };
      
      script.onerror = () => reject(new Error('Failed to load Google API script'));
      document.head.appendChild(script);
    });
  };

  const checkExistingConnection = async (): Promise<boolean> => {
    const savedProfile = localStorage.getItem('google_drive_profile');
    const savedToken = localStorage.getItem('google_drive_token');
    const savedExpiry = localStorage.getItem('google_drive_token_expiry');
    
    if (savedProfile && savedToken) {
      try {
        console.log('🔍 Checking existing Google Drive connection...');
        
        // Check if token is expired
        if (savedExpiry && new Date().getTime() > (parseInt(savedExpiry) - 5 * 60 * 1000)) {
          console.log('⏰ Token expired, clearing connection...');
          await clearConnection();
          return false;
        }
        
        // Validate token with Google
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { 'Authorization': `Bearer ${savedToken}` }
        });
        
        if (response.ok) {
          const profile = JSON.parse(savedProfile);
          console.log('✅ Restored Google Drive connection for:', profile.name);
          
          setUserProfile(profile);
          setIsConnected(true);
          
          // Set token for gapi client
          if (window.gapi?.client) {
            window.gapi.client.setToken({ access_token: savedToken });
          }
          
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
    
    const token = localStorage.getItem('google_drive_token');
    if (!token) {
      await clearConnection();
      return;
    }
    
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        console.log('🔐 Connection validation failed, disconnecting...');
        await clearConnection();
        toast.error('Google Drive session expired. Please reconnect.');
      }
    } catch (error) {
      console.error('Connection validation error:', error);
    }
  };

  const connect = async (): Promise<void> => {
    if (!isGapiLoaded || !window.gapi || !window.google) {
      toast.error('Google API not ready. Please refresh the page.');
      return;
    }

    setIsConnecting(true);
    
    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: async (tokenResponse: any) => {
          if (tokenResponse.access_token) {
            try {
              // Set token for gapi client
              window.gapi.client.setToken({ access_token: tokenResponse.access_token });
              
              // Get user profile
              const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { 'Authorization': `Bearer ${tokenResponse.access_token}` }
              });
              
              const userData = await userResponse.json();
              const profile: UserProfile = {
                email: userData.email,
                name: userData.name,
                picture: userData.picture
              };
              
              // Store connection data
              localStorage.setItem('google_drive_profile', JSON.stringify(profile));
              localStorage.setItem('google_drive_token', tokenResponse.access_token);
              
              // Store expiry with 45-minute safety buffer
              const expiryTime = new Date().getTime() + (45 * 60 * 1000);
              localStorage.setItem('google_drive_token_expiry', expiryTime.toString());
              
              setUserProfile(profile);
              setIsConnected(true);
              
              console.log('✅ Google Drive connected successfully!');
              toast.success(`Connected to Google Drive as ${profile.name}!`);
              
            } catch (error: any) {
              console.error('Error during connection:', error);
              toast.error(`Failed to connect: ${error.message}`);
            }
          } else {
            toast.error('Failed to get access token');
          }
          setIsConnecting(false);
        },
        error_callback: (error: any) => {
          console.error('OAuth error:', error);
          toast.error(`Connection failed: ${error.message || 'Unknown error'}`);
          setIsConnecting(false);
        }
      });
      
      tokenClient.requestAccessToken({ prompt: 'consent' });
      
    } catch (error: any) {
      console.error('Connection setup failed:', error);
      toast.error(`Failed to setup connection: ${error.message}`);
      setIsConnecting(false);
    }
  };

  const disconnect = async (): Promise<void> => {
    console.log('🔌 Disconnecting from Google Drive...');
    
    try {
      // Revoke token
      const token = localStorage.getItem('google_drive_token');
      if (token && window.google?.accounts?.oauth2) {
        window.google.accounts.oauth2.revoke(token);
      }
      
      // Clear gapi client token
      if (window.gapi?.client) {
        window.gapi.client.setToken(null);
      }
    } catch (error) {
      console.error('Error during token revocation:', error);
    }
    
    await clearConnection();
    toast.success('Disconnected from Google Drive');
  };

  const clearConnection = async () => {
    setIsConnected(false);
    setUserProfile(null);
    localStorage.removeItem('google_drive_profile');
    localStorage.removeItem('google_drive_token');
    localStorage.removeItem('google_drive_token_expiry');
  };

  const checkConnection = useCallback(checkExistingConnection, []);

  const value: GoogleDriveContextType = {
    isConnected,
    userProfile,
    isConnecting,
    isGapiLoaded,
    connect,
    disconnect,
    checkConnection,
  };

  return (
    <GoogleDriveContext.Provider value={value}>
      {children}
    </GoogleDriveContext.Provider>
  );
};

export const useGoogleDrive = () => {
  const context = useContext(GoogleDriveContext);
  if (!context) {
    throw new Error('useGoogleDrive must be used within a GoogleDriveProvider');
  }
  return context;
};