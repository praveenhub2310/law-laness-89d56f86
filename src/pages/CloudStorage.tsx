import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cloud, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const CloudStorage = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Simple test to verify component mounting
  useEffect(() => {
    console.log('🚀 CloudStorage component mounted successfully!');
    console.log('📍 Current location:', window.location.href);
    console.log('⏰ Timestamp:', new Date().toISOString());
    
    // Test toast to verify UI is working
    toast.success('CloudStorage component loaded successfully!');
  }, []);

  const handleConnect = () => {
    console.log('🔗 Connect button clicked!');
    setIsConnecting(true);
    
    // Simulate connection process
    setTimeout(() => {
      console.log('✅ Simulated connection completed');
      setIsConnecting(false);
      setIsConnected(true);
      toast.success('Test connection completed!');
    }, 2000);
  };

  const handleDisconnect = () => {
    console.log('🔌 Disconnect button clicked!');
    setIsConnected(false);
    toast.success('Disconnected!');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Cloud className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Cloud Storage - TEST MODE</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Google Drive Integration (Test)</CardTitle>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <>
              <p className="text-muted-foreground mb-4">
                Testing component mounting and basic functionality.
              </p>
              <Button 
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing Connection...
                  </>
                ) : (
                  'Test Connect'
                )}
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-green-800">
                  Test Connection Successful ✅
                </h3>
                <p className="text-sm text-green-600">
                  Component is working properly
                </p>
              </div>
              <Button 
                onClick={handleDisconnect}
                variant="outline"
                className="w-full"
              >
                Test Disconnect
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Component Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Component Mounted:</span>
              <span className="text-green-600 font-medium">✅ Yes</span>
            </div>
            <div className="flex justify-between">
              <span>React State Working:</span>
              <span className="text-green-600 font-medium">✅ Yes</span>
            </div>
            <div className="flex justify-between">
              <span>UI Components:</span>
              <span className="text-green-600 font-medium">✅ Loaded</span>
            </div>
            <div className="flex justify-between">
              <span>Toast System:</span>
              <span className="text-green-600 font-medium">✅ Working</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CloudStorage;