
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';

const Profile = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <User className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Profile</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Manage your personal and professional information.</p>
          {/* This will be populated with actual profile management functionality */}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
