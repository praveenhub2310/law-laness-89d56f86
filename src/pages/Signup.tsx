import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';
import { toast } from 'sonner';

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp, signInWithGoogle } = useAuth();
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    
    const userData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      role: selectedRole,
      ...(selectedRole === 'company' && { company_name: formData.companyName }),
      ...(selectedRole === 'advocate' && { bar_number: formData.barNumber }),
    };

    const { error } = await signUp(formData.email, formData.password, userData);
    
    if (error) {
      toast.error(error.message || 'Failed to create account');
    } else {
      toast.success('Account created successfully! Please check your email to verify your account.');
      navigate('/login');
    }
    
    setLoading(false);
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

    const { error } = await signInWithGoogle(userData);
    
    if (error) {
      toast.error(error.message || 'Failed to sign in with Google');
      setLoading(false);
    }
    // Note: If successful, user will be redirected by OAuth flow
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

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignUp}
          disabled={loading}
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
            disabled={loading}
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
      </div>
    </AuthLayout>
  );
};

export default Signup;