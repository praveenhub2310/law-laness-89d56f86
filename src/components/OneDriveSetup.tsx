import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const OneDriveSetup = () => {
  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Setup Required:</strong> OneDrive integration requires Azure application registration to be configured.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Azure Portal Setup</span>
            <ExternalLink className="h-4 w-4" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Step 1: Register Application in Azure</h4>
            <p className="text-sm text-muted-foreground">
              Go to <a 
                href="https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Azure Portal App Registrations
              </a> and create a new application registration.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Step 2: Configure Application</h4>
            <p className="text-sm text-muted-foreground">
              Set the application details:
            </p>
            <ul className="text-sm text-muted-foreground ml-4 space-y-1">
              <li>• Name: Your application name</li>
              <li>• Supported account types: Accounts in any organizational directory and personal Microsoft accounts</li>
              <li>• Redirect URI: Web - <code className="bg-muted px-1 rounded">{window.location.origin}</code></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Step 3: Configure API Permissions</h4>
            <p className="text-sm text-muted-foreground">
              Add the following Microsoft Graph permissions:
            </p>
            <ul className="text-sm text-muted-foreground ml-4 space-y-1">
              <li>• Files.ReadWrite (Delegated)</li>
              <li>• User.Read (Delegated)</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Grant admin consent for the permissions.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Step 4: Configure Authentication</h4>
            <p className="text-sm text-muted-foreground">
              In the Authentication section:
            </p>
            <ul className="text-sm text-muted-foreground ml-4 space-y-1">
              <li>• Enable "Access tokens" and "ID tokens"</li>
              <li>• Add redirect URI: <code className="bg-muted px-1 rounded">{window.location.origin}</code></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Step 5: Get Application ID</h4>
            <p className="text-sm text-muted-foreground">
              Copy the "Application (client) ID" from the Overview page and update the configuration:
            </p>
            <div className="bg-muted p-3 rounded-md text-sm font-mono">
              VITE_MICROSOFT_CLIENT_ID=your_client_id_here
            </div>
          </div>

          <Button 
            onClick={() => window.open('https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade', '_blank')}
            className="w-full"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Open Azure Portal
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default OneDriveSetup;