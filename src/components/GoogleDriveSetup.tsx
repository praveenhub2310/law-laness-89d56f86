import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const GoogleDriveSetup = () => {
  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Setup Required:</strong> Google Drive integration requires API credentials to be configured.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Google Cloud Console Setup</span>
            <ExternalLink className="h-4 w-4" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Step 1: Create Google Cloud Project</h4>
            <p className="text-sm text-muted-foreground">
              Go to <a 
                href="https://console.cloud.google.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google Cloud Console
              </a> and create a new project or select an existing one.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Step 2: Enable Google Drive API</h4>
            <p className="text-sm text-muted-foreground">
              Navigate to "APIs & Services" → "Library" and enable the Google Drive API.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Step 3: Create OAuth 2.0 Credentials</h4>
            <p className="text-sm text-muted-foreground">
              Go to "APIs & Services" → "Credentials" → "Create Credentials" → "OAuth client ID"
            </p>
            <ul className="text-sm text-muted-foreground ml-4 space-y-1">
              <li>• Application type: Web application</li>
              <li>• Authorized JavaScript origins: <code className="bg-muted px-1 rounded">{window.location.origin}</code></li>
              <li>• Authorized redirect URIs: <code className="bg-muted px-1 rounded">{window.location.origin}</code></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Step 4: Get API Key</h4>
            <p className="text-sm text-muted-foreground">
              Create an API key in "APIs & Services" → "Credentials" → "Create Credentials" → "API key"
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Step 5: Configure Environment</h4>
            <p className="text-sm text-muted-foreground">
              Add your credentials to the environment configuration:
            </p>
            <div className="bg-muted p-3 rounded-md text-sm font-mono">
              VITE_GOOGLE_CLIENT_ID=your_client_id_here<br />
              VITE_GOOGLE_API_KEY=your_api_key_here
            </div>
          </div>

          <Button 
            onClick={() => window.open('https://console.cloud.google.com', '_blank')}
            className="w-full"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Open Google Cloud Console
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleDriveSetup;