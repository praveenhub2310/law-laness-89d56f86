import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, ExternalLink, Play } from 'lucide-react';
import { menuItems } from '@/components/sidebar/menuItems';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ModuleTest {
  title: string;
  path: string;
  status: 'untested' | 'pass' | 'fail';
  error?: string;
}

const ModuleTester: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [moduleTests, setModuleTests] = useState<Record<string, ModuleTest>>({});
  const [isRunning, setIsRunning] = useState(false);

  const userRole = userProfile?.role || 'client';

  // Get modules available to current user
  const availableModules = menuItems.filter(item => 
    item.roles.includes(userRole)
  ).flatMap(item => {
    if (item.subItems) {
      return [
        { title: item.title, path: item.path },
        ...item.subItems.filter(sub => sub.roles.includes(userRole))
          .map(sub => ({ title: sub.title, path: sub.path }))
      ];
    }
    return [{ title: item.title, path: item.path }];
  });

  const testModule = async (module: { title: string; path: string }) => {
    try {
      // Simulate navigation test
      const testResult: ModuleTest = {
        title: module.title,
        path: module.path,
        status: 'pass'
      };

      // Basic path validation
      if (!module.path || module.path === '#') {
        testResult.status = 'fail';
        testResult.error = 'Invalid or missing path';
      }

      setModuleTests(prev => ({
        ...prev,
        [module.path]: testResult
      }));

      return testResult;
    } catch (error) {
      const testResult: ModuleTest = {
        title: module.title,
        path: module.path,
        status: 'fail',
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      setModuleTests(prev => ({
        ...prev,
        [module.path]: testResult
      }));

      return testResult;
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setModuleTests({});

    const results = await Promise.all(
      availableModules.map(module => testModule(module))
    );

    const passCount = results.filter(r => r.status === 'pass').length;
    const totalCount = results.length;

    toast({
      title: 'Module Tests Complete',
      description: `${passCount}/${totalCount} modules passed basic validation`,
      variant: passCount === totalCount ? 'default' : 'destructive'
    });

    setIsRunning(false);
  };

  const testSingleModule = async (module: { title: string; path: string }) => {
    await testModule(module);
  };

  const navigateToModule = (path: string) => {
    navigate(path);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-100 text-green-800">Working</Badge>;
      case 'fail':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Untested</Badge>;
    }
  };

  // Group modules by category for better organization
  const groupedModules = availableModules.reduce((acc, module) => {
    const category = module.path.split('/')[2] || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(module);
    return acc;
  }, {} as Record<string, typeof availableModules>);

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Module Functionality Test
            <Badge variant="outline">{userRole}</Badge>
            <Badge variant="secondary">{availableModules.length} modules</Badge>
          </CardTitle>
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {isRunning ? 'Testing...' : 'Test All Modules'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Modules</TabsTrigger>
            <TabsTrigger value="working">Working</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
            <TabsTrigger value="untested">Untested</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {Object.entries(groupedModules).map(([category, modules]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold mb-3 capitalize">
                  {category.replace('-', ' ')}
                </h3>
                <div className="grid gap-3">
                  {modules.map((module) => {
                    const test = moduleTests[module.path];
                    return (
                      <div key={module.path} className="flex items-center gap-3 p-3 border rounded-lg">
                        {getStatusIcon(test?.status || 'untested')}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{module.title}</h4>
                            {getStatusBadge(test?.status || 'untested')}
                          </div>
                          <p className="text-sm text-gray-600">{module.path}</p>
                          {test?.error && (
                            <p className="text-xs text-red-600 mt-1">{test.error}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => testSingleModule(module)}
                          >
                            Test
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => navigateToModule(module.path)}
                            className="flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Visit
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="working">
            <div className="space-y-3">
              {availableModules.filter(module => 
                moduleTests[module.path]?.status === 'pass'
              ).map(module => (
                <div key={module.path} className="flex items-center gap-3 p-3 border rounded-lg bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div className="flex-1">
                    <h4 className="font-medium">{module.title}</h4>
                    <p className="text-sm text-gray-600">{module.path}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => navigateToModule(module.path)}
                  >
                    Visit
                  </Button>
                </div>
              ))}
              {Object.values(moduleTests).filter(test => test.status === 'pass').length === 0 && (
                <p className="text-center text-gray-500 py-8">No working modules tested yet</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="errors">
            <div className="space-y-3">
              {availableModules.filter(module => 
                moduleTests[module.path]?.status === 'fail'
              ).map(module => {
                const test = moduleTests[module.path];
                return (
                  <div key={module.path} className="flex items-center gap-3 p-3 border rounded-lg bg-red-50">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <div className="flex-1">
                      <h4 className="font-medium">{module.title}</h4>
                      <p className="text-sm text-gray-600">{module.path}</p>
                      {test?.error && (
                        <p className="text-xs text-red-600 mt-1">{test.error}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testSingleModule(module)}
                    >
                      Retest
                    </Button>
                  </div>
                );
              })}
              {Object.values(moduleTests).filter(test => test.status === 'fail').length === 0 && (
                <p className="text-center text-gray-500 py-8">No failed modules</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="untested">
            <div className="space-y-3">
              {availableModules.filter(module => 
                !moduleTests[module.path]
              ).map(module => (
                <div key={module.path} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="h-4 w-4 rounded-full bg-gray-300" />
                  <div className="flex-1">
                    <h4 className="font-medium">{module.title}</h4>
                    <p className="text-sm text-gray-600">{module.path}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => testSingleModule(module)}
                  >
                    Test
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Summary */}
        {Object.keys(moduleTests).length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Test Summary</h4>
            <div className="flex gap-4 text-sm">
              <span className="text-green-600">
                ✓ {Object.values(moduleTests).filter(t => t.status === 'pass').length} Working
              </span>
              <span className="text-red-600">
                ✗ {Object.values(moduleTests).filter(t => t.status === 'fail').length} Errors
              </span>
              <span className="text-gray-600">
                ◯ {availableModules.length - Object.keys(moduleTests).length} Untested
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ModuleTester;