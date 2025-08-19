
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Scale, Building2, User, Loader2, Mail, Terminal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DemoCredential {
  role: string;
  email: string;
  password: string;
  dashboard: string;
}

const demoCredentials: DemoCredential[] = [
  {
    role: 'super_admin',
    email: 'admin@akralegal.com',
    password: 'admin123',
    dashboard: '/dashboard'
  },
  {
    role: 'advocate',
    email: 'lawyer@akralegal.com',
    password: 'lawyer123',
    dashboard: '/dashboard'
  },
  {
    role: 'company',
    email: 'firm@akralegal.com',
    password: 'firm123',
    dashboard: '/dashboard'
  },
  {
    role: 'client',
    email: 'client@akralegal.com',
    password: 'client123',
    dashboard: '/dashboard'
  }
];

const LoginForm = () => {
  const [email, setEmail] = useState('lawyer@akralegal.com');
  const [password, setPassword] = useState('lawyer123');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [demoUsersCreated, setDemoUsersCreated] = useState(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  
  // SMTP Test states
  const [testEmail, setTestEmail] = useState('');
  const [smtpLogs, setSmtpLogs] = useState<string[]>([]);
  const [isSmtpTesting, setIsSmtpTesting] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn, signInWithGoogle } = useAuth();

  // Create demo users on component mount
  useEffect(() => {
    const createDemoUsers = async () => {
      try {
        console.log('Creating demo users...');
        const { data, error } = await supabase.functions.invoke('create-demo-users');
        if (!error && data) {
          setDemoUsersCreated(true);
          console.log('Demo users setup completed:', data);
        } else {
          console.error('Error creating demo users:', error);
          // Set to true anyway so user can still try to login
          setDemoUsersCreated(true);
        }
      } catch (error) {
        console.error('Demo users creation failed:', error);
        // Set to true anyway so user can still try to login
        setDemoUsersCreated(true);
      }
    };

    createDemoUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (!error) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
      setSelectedRole(null);
    }
  };

  const getNameFromRole = (role: string): string => {
    const names = {
      'super_admin': 'John Smith',
      'advocate': 'Sarah Johnson',
      'company': 'Michael Brown',
      'client': 'Emily Davis'
    };
    return names[role as keyof typeof names] || 'User';
  };

  const getRoleDisplayName = (role: string): string => {
    const displayNames = {
      'super_admin': 'Super Admin',
      'advocate': 'Lawyer/Advocate',
      'company': 'Law Firm',
      'client': 'Client'
    };
    return displayNames[role as keyof typeof displayNames] || role;
  };

  const handleRoleClick = async (credential: DemoCredential) => {
    setLoadingRole(credential.role);
    setEmail(credential.email);
    setPassword(credential.password);
    
    // Wait 3 seconds to show loading state
    setTimeout(async () => {
      setIsLoading(true);
      try {
        const { error } = await signIn(credential.email, credential.password);
        if (!error) {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Login error:', error);
      } finally {
        setIsLoading(false);
        setLoadingRole(null);
      }
    }, 3000);
  };

  const getDemoRoles = () => {
    return [
      {
        role: 'advocate',
        name: 'Demo Lawyer',
        icon: Scale,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        credential: demoCredentials.find(c => c.role === 'advocate')!
      },
      {
        role: 'company', 
        name: 'Demo Law Firm',
        icon: Building2,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        credential: demoCredentials.find(c => c.role === 'company')!
      },
      {
        role: 'client',
        name: 'Demo Client', 
        icon: User,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        credential: demoCredentials.find(c => c.role === 'client')!
      }
    ];
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        console.error('Google sign-in error:', error);
      }
    } catch (error) {
      console.error('Google sign-in failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSmtpTest = async () => {
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Please enter an email address for testing",
        variant: "destructive"
      });
      return;
    }

    setIsSmtpTesting(true);
    setSmtpLogs([]);
    
    const addLog = (message: string) => {
      const timestamp = new Date().toLocaleTimeString();
      setSmtpLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    };

    try {
      addLog('Starting SMTP test...');
      addLog(`Attempting to send test email to: ${testEmail}`);
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'TempPassword123!', // Temporary password for test
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (error) {
        addLog(`SMTP Test Error: ${error.message}`);
        if (error.message.includes('User already registered')) {
          addLog('User exists - trying password reset instead...');
          
          const { error: resetError } = await supabase.auth.resetPasswordForEmail(testEmail, {
            redirectTo: `${window.location.origin}/login`
          });
          
          if (resetError) {
            addLog(`Password reset error: ${resetError.message}`);
          } else {
            addLog('✅ Password reset email sent successfully!');
            addLog('SMTP configuration is working correctly.');
          }
        }
      } else {
        addLog('✅ Signup email sent successfully!');
        addLog('SMTP configuration is working correctly.');
        addLog('Note: Check the email inbox for confirmation email.');
      }
    } catch (error: any) {
      addLog(`Unexpected error: ${error.message}`);
    } finally {
      setIsSmtpTesting(false);
      addLog('SMTP test completed.');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full legal-gradient text-white" 
          disabled={isLoading}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>

      <div className="mt-4 space-y-3">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">Or</span>
          </div>
        </div>
        
        <Button 
          type="button" 
          variant="outline" 
          className="w-full" 
          onClick={() => navigate('/role-selection')}
        >
          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Try Akralegal with Your Account
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 text-center">Quick Demo Access</h3>
        {!demoUsersCreated && (
          <p className="text-xs text-gray-500 text-center">Setting up demo users...</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {getDemoRoles().map((role) => {
            const IconComponent = role.icon;
            const isLoading = loadingRole === role.role;
            
            return (
              <button
                key={role.role}
                onClick={() => handleRoleClick(role.credential)}
                disabled={isLoading || loadingRole !== null}
                className={`p-4 text-center border-2 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isLoading
                    ? 'border-primary bg-primary/5 shadow-lg scale-105' 
                    : 'border-border bg-card hover:bg-accent/5'
                }`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className={`p-3 rounded-lg ${role.bgColor} transition-all duration-200`}>
                    {isLoading ? (
                      <Loader2 className="h-6 w-6 text-primary animate-spin" />
                    ) : (
                      <IconComponent className={`h-6 w-6 ${role.color}`} />
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="font-semibold text-foreground text-sm block">{role.name}</span>
                    {isLoading && (
                      <span className="text-xs text-muted-foreground">Signing you in...</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SMTP Test Section */}
      <Card className="mt-6 border-2 border-dashed border-muted-foreground/30">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>SMTP Configuration Test</span>
          </CardTitle>
          <CardDescription>
            Test if your SMTP settings are working correctly by sending a test email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Label htmlFor="testEmail">Test Email Address</Label>
              <Input
                id="testEmail"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter email to test SMTP"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleSmtpTest}
                disabled={isSmtpTesting}
                variant="outline"
                className="flex items-center space-x-2"
              >
                {isSmtpTesting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <Terminal className="h-4 w-4" />
                    <span>Test SMTP</span>
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {smtpLogs.length > 0 && (
            <div className="mt-4">
              <Label className="flex items-center space-x-2 mb-2">
                <Terminal className="h-4 w-4" />
                <span>SMTP Test Logs</span>
              </Label>
              <div className="bg-muted/30 border rounded-lg p-3 max-h-48 overflow-y-auto">
                <div className="font-mono text-xs space-y-1">
                  {smtpLogs.map((log, index) => (
                    <div 
                      key={index} 
                      className={`${
                        log.includes('✅') 
                          ? 'text-green-600' 
                          : log.includes('Error') || log.includes('error')
                          ? 'text-red-600'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
