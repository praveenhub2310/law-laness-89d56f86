
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AuthLayout from '@/components/AuthLayout';
import LoginForm from '@/components/LoginForm';
import { toast } from 'sonner';

const Login = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Show confirmation message if user was redirected from signup
    if (location.state?.message) {
      toast.success(location.state.message, {
        duration: 8000,
      });
    }
  }, [location.state]);

  return (
    <AuthLayout
      title="Welcome Back"
      description="Sign in to your Akra Legal account"
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;
