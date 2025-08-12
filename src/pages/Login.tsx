
import React from 'react';
import AuthLayout from '@/components/AuthLayout';
import LoginForm from '@/components/LoginForm';

const Login = () => {
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
