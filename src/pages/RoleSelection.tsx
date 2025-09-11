import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Scale, Building2, User, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AuthLayout from '@/components/AuthLayout';

const roles = [
  {
    id: 'advocate',
    name: 'Lawyer/Advocate', 
    description: 'Case management, time tracking, document analysis, and client communication tools.',
    icon: Scale,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'company',
    name: 'Law Firm',
    description: 'Team management, case assignment, analytics, and firm-wide administration tools.',
    icon: Building2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    id: 'client',
    name: 'Client',
    description: 'View case status, communicate with advocates, upload documents, and track payments.',
    icon: User,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
];

const RoleSelection = () => {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
  };

  const handleEmailSignup = () => {
    if (selectedRole) {
      navigate('/signup', { state: { selectedRole } });
    }
  };

  const handleGoogleSignUp = async () => {
    if (!selectedRole) {
      console.error('No role selected');
      return;
    }
    
    console.log('Starting Google OAuth with role:', selectedRole);
    setIsLoading(true);
    
    try {
      const userData = {
        role: selectedRole
      };
      
      console.log('Calling signInWithGoogle with userData:', userData);
      const { error } = await signInWithGoogle(userData);
      
      if (error) {
        console.error('Google sign-up error details:', {
          message: error.message,
          status: error.status,
          statusCode: error.status,
          code: error.code,
          details: error
        });
        
        // Show user-friendly error message
        alert(`Google Sign-In failed: ${error.message || 'Unknown error'}`);
      } else {
        console.log('Google sign-up successful');
      }
    } catch (error) {
      console.error('Google sign-up failed with exception:', error);
      alert(`Google Sign-In failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Choose Your Role"
      description="Select your role to personalize your Akralegal experience"
    >
      <div className="space-y-4">
        <Button
          variant="ghost"
          className="mb-4 p-0 h-auto text-gray-600 hover:text-gray-800"
          onClick={() => navigate('/login')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sign In
        </Button>

        <div className="grid gap-4">
          {roles.map((role) => {
            const IconComponent = role.icon;
            return (
              <Card
                key={role.id}
                className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 ${
                  selectedRole === role.id 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:border-primary/20'
                }`}
                onClick={() => handleRoleSelect(role.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${role.bgColor}`}>
                      <IconComponent className={`h-6 w-6 ${role.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm leading-relaxed">
                    {role.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {selectedRole && (
          <div className="mt-6 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Continue with</span>
              </div>
            </div>
            
            <Button 
              onClick={handleGoogleSignUp}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isLoading ? 'Signing up...' : 'Sign up with Google'}
            </Button>

            <Button 
              onClick={handleEmailSignup}
              className="w-full"
              variant="default"
            >
              Continue with Email
            </Button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default RoleSelection;