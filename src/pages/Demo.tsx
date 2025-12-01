import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Scale, Building2, User, Loader2, ArrowLeft } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';

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

const Demo = () => {
  const [demoUsersCreated, setDemoUsersCreated] = useState(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signIn } = useAuth();

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
          setDemoUsersCreated(true);
        }
      } catch (error) {
        console.error('Demo users creation failed:', error);
        setDemoUsersCreated(true);
      }
    };

    createDemoUsers();
  }, []);

  const handleRoleClick = async (credential: DemoCredential) => {
    setLoadingRole(credential.role);
    
    // Wait 3 seconds to show loading state
    setTimeout(async () => {
      try {
        const { error } = await signIn(credential.email, credential.password);
        if (!error) {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Login error:', error);
      } finally {
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

  return (
    <AuthLayout
      title="Demo Access"
      description="Experience Law Lanes with different user roles"
    >
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/login')}
          className="w-full mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Login
        </Button>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 text-center">Choose Your Demo Role</h3>
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
      </div>
    </AuthLayout>
  );
};

export default Demo;