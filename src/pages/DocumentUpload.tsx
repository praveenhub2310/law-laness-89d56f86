import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUp } from 'lucide-react';

const DocumentUpload = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <FileUp className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Upload Documents</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Document Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Upload and manage your case documents.</p>
          {/* This will be populated with actual document upload functionality */}
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentUpload;