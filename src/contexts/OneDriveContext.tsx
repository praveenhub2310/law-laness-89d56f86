import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  const [isMsalLoaded, setIsMsalLoaded] = useState(true); // Always true with Supabase auth
  const [isConfigured, setIsConfigured] = useState(true); // Always true with Supabase auth

  console.log('🚀 OneDriveProvider mounted with Supabase auth');

  // Check existing connection on mount
  useEffect(() => {
    checkExistingConnection();
  }, []);

  const checkExistingConnection = async (): Promise<boolean> => {
    try {
      console.log('🔍 Checking existing OneDrive connection...');
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.provider_token && session?.user) {
        console.log('✅ Found existing session with provider token');
        
        // Get user profile from Microsoft Graph
        const userResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: { 'Authorization': `Bearer ${session.provider_token}` }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          const profile: UserProfile = {
            email: userData.mail || userData.userPrincipalName || session.user.email,
            name: userData.displayName || session.user.user_metadata?.full_name || 'User',
            picture: session.user.user_metadata?.avatar_url
          };
          
          setUserProfile(profile);
          setIsConnected(true);
          
          console.log('✅ Restored OneDrive connection for:', profile.name);
          return true;
        }
      }
      
      console.log('❌ No valid OneDrive session found');
      return false;
    } catch (error) {
      console.error('Error checking existing connection:', error);
      return false;
    }
  };

  const connect = async (): Promise<void> => {
    console.log('🔗 OneDrive connect called (Supabase Azure auth)');
    
    setIsConnecting(true);
    
    try {
      console.log('🚀 Starting Supabase Azure OAuth...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          scopes: 'openid profile email https://graph.microsoft.com/Files.ReadWrite https://graph.microsoft.com/User.Read',
          redirectTo: window.location.origin + '/dashboard/cloud-storage'
        }
      });

      if (error) {
        console.error('❌ Azure OAuth error:', error);
        toast.error(`Connection failed: ${error.message}`);
        return;
      }

      console.log('✅ Azure OAuth initiated successfully');
      // The actual connection will be handled by the auth state change
      
    } catch (error: any) {
      console.error('💥 Connection failed:', error);
      toast.error(`Connection failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async (): Promise<void> => {
    console.log('🔌 Disconnecting from OneDrive...');
    
    try {
      await supabase.auth.signOut();
      setIsConnected(false);
      setUserProfile(null);
      toast.success('Disconnected from OneDrive');
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Error disconnecting from OneDrive');
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session?.provider_token) {
        console.log('✅ User signed in with provider token');
        await checkExistingConnection();
        toast.success('Successfully connected to OneDrive!');
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out');
        setIsConnected(false);
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
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