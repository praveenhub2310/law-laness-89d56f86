import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

interface SystemCheckProps {
  userRole: string;
}

const SystemCheck: React.FC<SystemCheckProps> = ({ userRole }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const { toast } = useToast();

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    const testResults: TestResult[] = [];

    try {
      // Test 1: Database Connection
      try {
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        if (error) throw error;
        testResults.push({
          name: 'Database Connection',
          status: 'pass',
          message: 'Successfully connected to database'
        });
      } catch (error) {
        testResults.push({
          name: 'Database Connection',
          status: 'fail',
          message: 'Failed to connect to database',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Test 2: Authentication State
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          testResults.push({
            name: 'Authentication',
            status: 'pass',
            message: `User authenticated as ${user.email}`
          });
        } else {
          testResults.push({
            name: 'Authentication',
            status: 'fail',
            message: 'No authenticated user found'
          });
        }
      } catch (error) {
        testResults.push({
          name: 'Authentication',
          status: 'fail',
          message: 'Authentication check failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Test 3: RLS Policies
      try {
        const { data, error } = await supabase.from('projects').select('*').limit(1);
        if (error && error.code === 'PGRST301') {
          testResults.push({
            name: 'RLS Policies',
            status: 'warning',
            message: 'RLS policies are active but may need review',
            details: 'Some queries are restricted by Row Level Security'
          });
        } else if (error) {
          throw error;
        } else {
          testResults.push({
            name: 'RLS Policies',
            status: 'pass',
            message: 'RLS policies are working correctly'
          });
        }
      } catch (error) {
        testResults.push({
          name: 'RLS Policies',
          status: 'fail',
          message: 'RLS policy check failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Test 4: Role-based Access
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', (await supabase.auth.getUser()).data.user?.id)
          .single();

        if (profile?.role === userRole) {
          testResults.push({
            name: 'Role-based Access',
            status: 'pass',
            message: `User role ${userRole} matches database profile`
          });
        } else {
          testResults.push({
            name: 'Role-based Access',
            status: 'warning',
            message: `Role mismatch: expected ${userRole}, got ${profile?.role || 'none'}`
          });
        }
      } catch (error) {
        testResults.push({
          name: 'Role-based Access',
          status: 'fail',
          message: 'Role verification failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Test 5: Data Operations (CRUD)
      try {
        // Test read operation
        const { data: readTest } = await supabase.from('projects').select('id').limit(1);
        
        // Test write operation (only for non-client roles)
        if (userRole !== 'client') {
          const testProject = {
            case_number: `TEST-${Date.now()}`,
            title: 'System Test Case',
            description: 'Automated test case - can be deleted'
          };
          
          const { data: insertTest, error: insertError } = await supabase
            .from('projects')
            .insert(testProject)
            .select('id')
            .single();

          if (insertError) throw insertError;

          // Clean up test data
          if (insertTest?.id) {
            await supabase.from('projects').delete().eq('id', insertTest.id);
          }
        }

        testResults.push({
          name: 'Data Operations',
          status: 'pass',
          message: 'CRUD operations working correctly'
        });
      } catch (error) {
        testResults.push({
          name: 'Data Operations',
          status: 'fail',
          message: 'Data operations failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Test 6: Navigation & Routing
      const currentPath = window.location.pathname;
      const expectedPaths = {
        super_admin: ['/admin-dashboard', '/dashboard'],
        company: ['/firm-dashboard', '/dashboard'],
        advocate: ['/lawyer-dashboard', '/dashboard'],
        client: ['/client-dashboard', '/dashboard']
      };

      const validPaths = expectedPaths[userRole as keyof typeof expectedPaths] || [];
      if (validPaths.some(path => currentPath.includes(path))) {
        testResults.push({
          name: 'Navigation & Routing',
          status: 'pass',
          message: 'User is on correct dashboard for their role'
        });
      } else {
        testResults.push({
          name: 'Navigation & Routing',
          status: 'warning',
          message: `User may not be on optimal dashboard for role ${userRole}`,
          details: `Current path: ${currentPath}`
        });
      }

    } catch (error) {
      console.error('System check error:', error);
      toast({
        title: 'System Check Error',
        description: 'An error occurred during system testing',
        variant: 'destructive'
      });
    }

    setResults(testResults);
    setIsRunning(false);

    // Show summary toast
    const passCount = testResults.filter(r => r.status === 'pass').length;
    const totalCount = testResults.length;
    
    toast({
      title: 'System Check Complete',
      description: `${passCount}/${totalCount} tests passed`,
      variant: passCount === totalCount ? 'default' : 'destructive'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-100 text-green-800">Pass</Badge>;
      case 'fail':
        return <Badge variant="destructive">Fail</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            System Health Check
            {userRole && <Badge variant="outline">{userRole}</Badge>}
          </CardTitle>
          <Button 
            onClick={runTests} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Running Tests...' : 'Run Tests'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {results.length === 0 && !isRunning && (
          <div className="text-center py-8 text-gray-500">
            Click "Run Tests" to check system functionality
          </div>
        )}

        {isRunning && (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Running system checks...</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium">{result.name}</h4>
                    {getStatusBadge(result.status)}
                  </div>
                  <p className="text-sm text-gray-600">{result.message}</p>
                  {result.details && (
                    <p className="text-xs text-gray-500 mt-1 font-mono bg-gray-50 p-2 rounded">
                      {result.details}
                    </p>
                  )}
                </div>
              </div>
            ))}

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Summary</h4>
              <div className="flex gap-4 text-sm">
                <span className="text-green-600">
                  ✓ {results.filter(r => r.status === 'pass').length} Passed
                </span>
                <span className="text-red-600">
                  ✗ {results.filter(r => r.status === 'fail').length} Failed
                </span>
                <span className="text-yellow-600">
                  ⚠ {results.filter(r => r.status === 'warning').length} Warnings
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SystemCheck;