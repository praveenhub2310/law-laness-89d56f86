
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { GoogleDriveProvider } from '@/contexts/GoogleDriveContext';
import { OneDriveProvider } from '@/contexts/OneDriveContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

interface QueryClientProps {
  children: React.ReactNode;
}

const QueryClientWrapper = ({ children }: QueryClientProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GoogleDriveProvider>
          <OneDriveProvider>
            {children}
          </OneDriveProvider>
        </GoogleDriveProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default QueryClientWrapper;
