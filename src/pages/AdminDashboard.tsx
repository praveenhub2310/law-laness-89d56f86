
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Settings, FileText, BarChart3, Shield, Database } from 'lucide-react';

const AdminDashboard = () => {
  const adminModules = [
    {
      title: 'User Management',
      description: 'Manage system users, roles, and permissions',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'System Settings',
      description: 'Configure system-wide settings and preferences',
      icon: Settings,
      color: 'bg-green-500'
    },
    {
      title: 'System Logs',
      description: 'View and analyze system activity logs',
      icon: FileText,
      color: 'bg-yellow-500'
    },
    {
      title: 'Reports & Analytics',
      description: 'Generate comprehensive system reports',
      icon: BarChart3,
      color: 'bg-purple-500'
    },
    {
      title: 'Security Center',
      description: 'Monitor security events and access controls',
      icon: Shield,
      color: 'bg-red-500'
    },
    {
      title: 'Database Management',
      description: 'Manage database operations and backups',
      icon: Database,
      color: 'bg-indigo-500'
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">System administration and management overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminModules.map((module, index) => {
          const IconComponent = module.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${module.color}`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">{module.description}</CardDescription>
                <Button variant="outline" size="sm" className="w-full">
                  Access Module
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">System Health</span>
                <span className="text-sm font-medium text-green-600">Excellent</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Users</span>
                <span className="text-sm font-medium">247</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Database Size</span>
                <span className="text-sm font-medium">2.4 GB</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm">
                <span className="font-medium">User Registration:</span>
                <span className="text-gray-600 ml-2">5 new users today</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">System Updates:</span>
                <span className="text-gray-600 ml-2">Last updated 2 hours ago</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">Backup Status:</span>
                <span className="text-green-600 ml-2">Completed successfully</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
