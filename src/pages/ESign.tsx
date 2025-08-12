import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSignature } from 'lucide-react';

const ESign = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <FileSignature className="h-6 w-6" />
        <h1 className="text-3xl font-bold">E-Sign Documents</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Electronic Signatures</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Sign documents electronically and manage signatures.</p>
          {/* This will be populated with actual e-signature functionality */}
        </CardContent>
      </Card>
    </div>
  );
};

export default ESign;