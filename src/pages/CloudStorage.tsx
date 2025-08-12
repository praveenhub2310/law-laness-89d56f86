
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud } from 'lucide-react';

const CloudStorage = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Cloud className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Cloud Storage</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Google Drive Integration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Connect your Google Drive account to access documents directly.</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Connect Google Drive
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>OneDrive Integration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Sync your OneDrive files with the case management system.</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Connect OneDrive
            </button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Contract_Amendment_v2.docx</h4>
                <p className="text-sm text-gray-600">Modified 2 hours ago • Google Drive</p>
              </div>
              <span className="text-sm text-gray-500">2.4 MB</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Evidence_Photos.zip</h4>
                <p className="text-sm text-gray-600">Modified yesterday • OneDrive</p>
              </div>
              <span className="text-sm text-gray-500">15.2 MB</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Legal_Brief_Draft.pdf</h4>
                <p className="text-sm text-gray-600">Modified 3 days ago • Google Drive</p>
              </div>
              <span className="text-sm text-gray-500">1.8 MB</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CloudStorage;
