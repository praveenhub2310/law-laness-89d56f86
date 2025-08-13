
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Settings, FileText, BarChart3, Shield, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [realTimeStats, setRealTimeStats] = useState({
    activeUsers: 0,
    totalUsers: 0,
    securityEvents: 0,
    systemHealth: 'Excellent'
  });

  const adminModules = [
    {
      title: 'User Management',
      description: 'Manage system users, roles, and permissions',
      icon: Users,
      color: 'bg-blue-500',
      path: '/user-management'
    },
    {
      title: 'System Settings',
      description: 'Configure system-wide settings and preferences',
      icon: Settings,
      color: 'bg-green-500',
      path: '/system-settings'
    },
    {
      title: 'System Logs',
      description: 'View and analyze system activity logs',
      icon: FileText,
      color: 'bg-yellow-500',
      path: '/system-log'
    },
    {
      title: 'Reports & Analytics',
      description: 'Generate comprehensive system reports',
      icon: BarChart3,
      color: 'bg-purple-500',
      path: '/analytics'
    },
    {
      title: 'Security Center',
      description: 'Monitor security events and access controls',
      icon: Shield,
      color: 'bg-red-500',
      path: '/security-center'
    },
    {
      title: 'Database Management',
      description: 'Manage database operations and backups',
      icon: Database,
      color: 'bg-indigo-500',
      path: '/database-management'
    }
  ];

  useEffect(() => {
    const fetchRealTimeStats = async () => {
      if (!user) return;

      try {
        // Fetch user stats
        const { data: users } = await supabase
          .from('profiles')
          .select('id, is_active');

        // Fetch security events (last 24 hours)
        const { data: securityEvents } = await supabase
          .from('security_events')
          .select('id')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        setRealTimeStats({
          totalUsers: users?.length || 0,
          activeUsers: users?.filter(u => u.is_active).length || 0,
          securityEvents: securityEvents?.length || 0,
          systemHealth: 'Excellent'
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchRealTimeStats();

    // Set up real-time subscriptions
    const userChannel = supabase
      .channel('admin-dashboard-users')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' }, 
        () => fetchRealTimeStats()
      )
      .subscribe();

    const securityChannel = supabase
      .channel('admin-dashboard-security')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'security_events' }, 
        () => fetchRealTimeStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(userChannel);
      supabase.removeChannel(securityChannel);
    };
  }, [user]);

  const handleModuleClick = (path: string) => {
    navigate(path);
  };

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
            <Card 
              key={index} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleModuleClick(module.path)}
            >
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleModuleClick(module.path);
                  }}
                >
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
                <span className="text-sm font-medium text-green-600">{realTimeStats.systemHealth}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Users</span>
                <span className="text-sm font-medium">{realTimeStats.activeUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Users</span>
                <span className="text-sm font-medium">{realTimeStats.totalUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Security Events (24h)</span>
                <span className="text-sm font-medium">{realTimeStats.securityEvents}</span>
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
                <span className="font-medium">Real-time Updates:</span>
                <span className="text-green-600 ml-2">Active</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">Security Monitoring:</span>
                <span className="text-green-600 ml-2">Online</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">Database Status:</span>
                <span className="text-green-600 ml-2">Healthy</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">Authentication:</span>
                <span className="text-green-600 ml-2">Operational</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
