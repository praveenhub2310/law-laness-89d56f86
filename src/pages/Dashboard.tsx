
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Calendar, 
  FileText, 
  Users, 
  TrendingUp, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Active Cases",
      value: "42",
      change: "+12%",
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Today's Appointments",
      value: "8",
      change: "+3",
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Pending Documents",
      value: "23",
      change: "-5",
      icon: FileText,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      title: "Total Clients",
      value: "156",
      change: "+8%",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ];

  const recentCases = [
    {
      id: "CASE-2024-001",
      title: "Johnson vs. State Insurance",
      type: "Personal Injury",
      status: "active",
      nextHearing: "2024-01-15",
      priority: "high"
    },
    {
      id: "CASE-2024-002",
      title: "Smith Property Dispute",
      type: "Real Estate",
      status: "review",
      nextHearing: "2024-01-18",
      priority: "medium"
    },
    {
      id: "CASE-2024-003",
      title: "Corporate Contract Review",
      type: "Corporate Law",
      status: "closed",
      nextHearing: null,
      priority: "low"
    }
  ];

  const upcomingAppointments = [
    {
      time: "09:00 AM",
      title: "Client Consultation - Johnson Case",
      type: "Meeting",
      location: "Conference Room A"
    },
    {
      time: "11:30 AM",
      title: "Court Hearing - Smith Property",
      type: "Court",
      location: "Superior Court"
    },
    {
      time: "02:00 PM",
      title: "Document Review Session",
      type: "Internal",
      location: "Office"
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      review: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      closed: { color: "bg-gray-100 text-gray-800", icon: CheckCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800"
    };
    
    return (
      <Badge className={colors[priority as keyof typeof colors]}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Good morning, John!</h1>
          <p className="text-gray-600">Here's what's happening with your cases today.</p>
        </div>
        <Button 
          className="legal-gradient"
          onClick={() => navigate('/dashboard/projects')}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Case
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} from last month
                  </p>
                </div>
                <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Cases */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Cases
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/dashboard/projects')}
              >
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCases.map((case_, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate('/dashboard/projects')}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900">{case_.title}</h3>
                      {getPriorityBadge(case_.priority)}
                    </div>
                    <p className="text-sm text-gray-600">{case_.id} • {case_.type}</p>
                    {case_.nextHearing && (
                      <p className="text-sm text-blue-600">Next hearing: {case_.nextHearing}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(case_.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment, index) => (
                <div 
                  key={index} 
                  className="flex items-start space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                  onClick={() => navigate('/dashboard/appointments')}
                >
                  <div className="flex-shrink-0 w-16 text-sm font-medium text-gray-600">
                    {appointment.time}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{appointment.title}</p>
                    <p className="text-sm text-gray-600">{appointment.type} • {appointment.location}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => navigate('/dashboard/appointments')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              View Full Calendar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition-colors"
              onClick={() => navigate('/dashboard/projects')}
            >
              <Briefcase className="h-6 w-6" />
              <span className="text-sm">New Case</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition-colors"
              onClick={() => navigate('/dashboard/appointments')}
            >
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Schedule Meeting</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition-colors"
              onClick={() => navigate('/dashboard/documents')}
            >
              <FileText className="h-6 w-6" />
              <span className="text-sm">Upload Document</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition-colors"
              onClick={() => navigate('/dashboard/parties')}
            >
              <Users className="h-6 w-4" />
              <span className="text-sm">Add Client</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
