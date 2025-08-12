
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

const TeamManagement = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Users className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Team Management</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Your Legal Team</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Organize lawyers into teams and manage assignments.</p>
          {/* This will be populated with team management functionality */}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamManagement;
