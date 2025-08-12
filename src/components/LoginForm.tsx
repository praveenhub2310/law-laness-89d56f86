
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

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
  const [email, setEmail] = useState('admin@akralegal.com');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn } = useAuth();

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

  const handleRoleClick = (credential: DemoCredential) => {
    setSelectedRole(credential.role);
    setEmail(credential.email);
    setPassword(credential.password);
    
    // Auto-submit after a brief delay to show the selection
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        form.requestSubmit();
      }
    }, 300);
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

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700 text-center">Demo Credentials</h3>
        <div className="space-y-2">
          {demoCredentials.map((credential, index) => (
            <button
              key={index}
              onClick={() => handleRoleClick(credential)}
              disabled={isLoading}
              className={`w-full p-3 text-left border rounded-md transition-all duration-200 hover:bg-blue-50 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedRole === credential.role 
                  ? 'bg-blue-50 border-blue-300 shadow-sm' 
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex flex-col space-y-1">
                <span className="font-medium text-gray-900 text-sm">{getRoleDisplayName(credential.role)}</span>
                <span className="text-xs text-gray-600">{credential.email}</span>
                <span className="text-xs text-gray-500">{credential.password}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
