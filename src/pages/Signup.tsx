import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Eye, EyeOff, CheckCircle } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';
import { toast } from 'sonner';

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp, signInWithGoogle, user, loading: authLoading } = useAuth();
  
  const selectedRole = location.state?.selectedRole || 'client';
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    companyName: '',
    barNumber: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      console.log('User already logged in, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  // Listen for hash changes to detect email confirmation and auto-login
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.includes('type=signup') || hash.includes('access_token')) {
        // Email was confirmed, auto-login and redirect to dashboard
        toast.success('Email confirmed successfully! Logging you in...', { duration: 3000 });
        // Navigate to dashboard instead of login since user is now authenticated
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    
    // Check initial hash
    handleHashChange();
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== SIGNUP FORM SUBMITTED ===');
    console.log('Form data:', formData);
    console.log('Selected role:', selectedRole);
    console.log('Current user:', user);
    console.log('Auth loading state:', authLoading);
    
    // Check if user is already logged in
    if (user) {
      console.log('User already logged in, redirecting to dashboard');
      navigate('/dashboard');
      return;
    }
    
    // Enhanced validation with detailed logging
    if (!formData.email || !formData.password) {
      console.log('Validation failed: Missing email or password', {
        email: formData.email,
        password: formData.password ? 'provided' : 'missing'
      });
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      console.log('Validation failed: Password too short', formData.password.length);
      toast.error('Password must be at least 6 characters long');
      return;
    }

    // Role-specific validation
    if (selectedRole === 'company' && !formData.companyName.trim()) {
      console.log('Validation failed: Missing company name for company role');
      toast.error('Company name is required');
      return;
    }

    console.log('All validations passed, proceeding with signup...');
    
    // Prevent double submission
    if (loading) {
      console.log('Already loading, preventing double submission');
      return;
    }
    
    setLoading(true);
    console.log('Loading state set to true');
    
    const userData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      role: selectedRole,
      ...(selectedRole === 'company' && { company_name: formData.companyName }),
      ...(selectedRole === 'advocate' && { bar_number: formData.barNumber }),
    };

    console.log('Calling signUp with:', { 
      email: formData.email, 
      passwordLength: formData.password.length,
      userData 
    });

    try {
      const result = await signUp(formData.email, formData.password, userData);
      console.log('SignUp function returned:', result);
      
      if (result?.error) {
        console.error('Signup failed with error:', result.error);
        
        // Handle specific error cases
        if (result.error.code === 'over_email_send_rate_limit' || result.error.status === 429) {
          toast.error('Email rate limit reached. Please wait a few minutes before trying again, or contact support if this persists.', {
            duration: 10000
          });
        } else if (result.error.message?.includes('User already registered')) {
          toast.error('An account with this email already exists. Please try logging in instead.', {
            duration: 8000
          });
        } else if (result.error.status === 500 || result.error.message?.includes('Error sending confirmation')) {
          // Handle email sending failure - user was likely created but email failed
          toast.error('Account may have been created, but we couldn\'t send a confirmation email. Please try logging in or contact support.', {
            duration: 10000
          });
          // Offer to navigate to login page after a short delay
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          toast.error(result.error.message || 'Failed to create account');
        }
        setLoading(false);
      } else {
        console.log('Signup successful - showing confirmation message');
        
        // Show confirmation toast that stays visible
        toast.success('Account created successfully! Please check your email and click the confirmation link to verify your account.', {
          duration: 15000,
        });
        
        // Set email sent state to show confirmation UI
        setEmailSent(true);
        setLoading(false);
        
        console.log('Email confirmation screen should now be visible, emailSent:', true);
      }
    } catch (catchError) {
      console.error('Signup threw an exception:', catchError);
      toast.error('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
    
    console.log('=== SIGNUP PROCESS COMPLETED ===');
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    
    const userData = {
      role: selectedRole,
      ...(selectedRole === 'company' && formData.companyName && { company_name: formData.companyName }),
      ...(selectedRole === 'advocate' && formData.barNumber && { bar_number: formData.barNumber }),
      ...(formData.firstName && { first_name: formData.firstName }),
      ...(formData.lastName && { last_name: formData.lastName }),
    };

    console.log('Starting Google signup with userData:', userData);

    const { error } = await signInWithGoogle(userData);
    
    if (error) {
      console.error('Google signup failed:', error);
      toast.error(error.message || 'Failed to sign in with Google');
      setLoading(false);
    } else {
      console.log('Google signup initiated successfully');
      toast.success('Redirecting to Google for authentication...', { duration: 3000 });
      // Show confirmation screen for Google signup too
      setEmailSent(true);
      setLoading(false);
    }
  };

  const getRoleName = (role: string) => {
    const roleNames = {
      super_admin: 'Super Admin',
      advocate: 'Lawyer/Advocate',
      company: 'Law Firm',
      client: 'Client',
    };
    return roleNames[role as keyof typeof roleNames] || 'Client';
  };

  return (
    <AuthLayout
      title="Create Your Account"
      description={`Sign up as ${getRoleName(selectedRole)}`}
    >
      <div className="space-y-6">
        <Button
          variant="ghost"
          className="mb-4 p-0 h-auto text-gray-600 hover:text-gray-800"
          onClick={() => navigate('/role-selection')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Change Role
        </Button>

        {emailSent ? (
          <div className="text-center space-y-4 py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {formData.email ? 'Check Your Email' : 'Account Setup Complete'}
              </h3>
              {formData.email ? (
                <>
                  <p className="text-gray-600">
                    We've sent a confirmation email to <strong>{formData.email}</strong>
                  </p>
                  <p className="text-sm text-gray-500">
                    Please click the confirmation link in your email to verify your account. You'll be automatically logged in after verification.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-gray-600">
                    Your Google account has been linked successfully!
                  </p>
                  <p className="text-sm text-gray-500">
                    You'll be redirected to your dashboard shortly after completing the authentication process.
                  </p>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignUp}
              disabled={loading}
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
              Sign up with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
              </div>

              {selectedRole === 'company' && (
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="Enter company name"
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    required
                  />
                </div>
              )}

              {selectedRole === 'advocate' && (
                <div className="space-y-2">
                  <Label htmlFor="barNumber">Bar Registration Number</Label>
                  <Input
                    id="barNumber"
                    type="text"
                    placeholder="Enter bar number"
                    value={formData.barNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, barNumber: e.target.value }))}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password (min. 6 characters)"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || authLoading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto text-primary hover:underline"
                  onClick={() => navigate('/login')}
                >
                  Sign in here
                </Button>
              </p>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
};

export default Signup;