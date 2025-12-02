
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
      <OneDriveProvider>
        {children}
      </OneDriveProvider>
    </QueryClientProvider>
  );
};

export default QueryClientWrapper;
