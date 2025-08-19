import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signInWithGoogle: (userData?: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          advocates(*),
          clients(*),
          companies(*)
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return profile;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profile = await fetchUserProfile(user.id);
      setUserProfile(profile);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile fetching to avoid auth state conflicts
          setTimeout(async () => {
            const profile = await fetchUserProfile(session.user.id);
            setUserProfile(profile);
            setLoading(false);
          }, 0);
        } else {
          setUserProfile(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id).then(profile => {
          setUserProfile(profile);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: 'Login Failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Login Successful',
          description: 'Welcome to Akra Legal Case Management System',
        });
      }

      return { error };
    } catch (error: any) {
      const errorMessage = error?.message || 'An unexpected error occurred';
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const redirectUrl = `${window.location.origin}/login`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: userData
        }
      });

      if (error) {
        console.error('Signup error:', error);
        toast({
          title: 'Registration Failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        console.log('Signup successful:', data);
        // Different messages based on whether email confirmation is required
        if (data.user && !data.user.email_confirmed_at) {
          toast({
            title: 'Registration Successful!',
            description: 'Please check your email and click the confirmation link to verify your account before logging in.',
            duration: 8000,
          });
        } else {
          toast({
            title: 'Registration Successful',
            description: 'Your account has been created successfully.',
          });
        }
      }

      return { error };
    } catch (error: any) {
      console.error('Signup exception:', error);
      const errorMessage = error?.message || 'An unexpected error occurred';
      toast({
        title: 'Registration Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      return { error };
    }
  };

  const signInWithGoogle = async (userData?: any) => {
    try {
      console.log('AuthContext: Starting Google OAuth with userData:', userData);
      console.log('AuthContext: Redirect URL will be:', `${window.location.origin}/login`);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/login`,
          queryParams: userData ? {
            access_type: 'offline',
            prompt: 'consent',
            role: userData.role || 'client'
          } : undefined
        }
      });

      if (error) {
        console.error('AuthContext: Google OAuth error details:', {
          message: error.message,
          status: error.status,
          code: error.code,
          details: error
        });
        
        toast({
          title: 'Google Sign-In Failed',
          description: `Error: ${error.message}${error.status ? ` (Status: ${error.status})` : ''}`,
          variant: 'destructive',
        });
      } else {
        console.log('AuthContext: Google OAuth initiated successfully');
        toast({
          title: 'Redirecting to Google',
          description: 'Please complete the sign-in process with Google.',
        });
      }

      return { error };
    } catch (error: any) {
      console.error('AuthContext: Google OAuth exception:', error);
      const errorMessage = error?.message || 'An unexpected error occurred';
      toast({
        title: 'Google Sign-In Failed',
        description: `Exception: ${errorMessage}`,
        variant: 'destructive',
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: 'Logout Failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Logged Out',
          description: 'You have been successfully logged out.',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Logout Failed',
        description: error?.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  const value = {
    user,
    session,
    userProfile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};