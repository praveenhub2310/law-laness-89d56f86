import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, DollarSign, FileText, TrendingUp, Calendar } from 'lucide-react';

const FirmDashboard = () => {
  const navigate = useNavigate();
  const firmMetrics = [
    { label: 'Total Revenue', value: '$142,580', change: '+12%', icon: DollarSign, color: 'text-green-600' },
    { label: 'Active Lawyers', value: '8', change: '+1', icon: Users, color: 'text-blue-600' },
    { label: 'Open Cases', value: '67', change: '+5', icon: FileText, color: 'text-purple-600' },
    { label: 'Client Satisfaction', value: '94%', change: '+2%', icon: TrendingUp, color: 'text-orange-600' }
  ];

  const recentBilling = [
    { client: 'Acme Corporation', amount: '$5,200', status: 'Paid', date: '2024-01-10' },
    { client: 'Johnson Family Trust', amount: '$3,800', status: 'Pending', date: '2024-01-12' },
    { client: 'Tech Startup LLC', amount: '$7,500', status: 'Overdue', date: '2024-01-08' }
  ];

  const teamWorkflow = [
    { lawyer: 'Sarah Johnson', cases: 8, utilization: '92%', status: 'High' },
    { lawyer: 'Michael Brown', cases: 6, utilization: '78%', status: 'Medium' },
    { lawyer: 'Emily Chen', cases: 4, utilization: '65%', status: 'Low' }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Firm Dashboard</h1>
        <p className="text-gray-600 mt-2">Comprehensive firm management and analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {firmMetrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">{metric.label}</CardTitle>
                  <IconComponent className={`h-5 w-5 ${metric.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-sm text-green-600">{metric.change} from last month</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Billing</CardTitle>
            <CardDescription>Latest invoices and payment status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBilling.map((bill, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{bill.client}</h4>
                    <p className="text-sm text-gray-600">{bill.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{bill.amount}</p>
                    <Badge variant={bill.status === 'Paid' ? 'default' : bill.status === 'Pending' ? 'secondary' : 'destructive'}>
                      {bill.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              className="w-full mt-4 pointer-events-auto cursor-pointer relative z-10" 
              variant="outline"
              onClick={() => navigate('/invoices')}
            >
              View All Invoices
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Workflow</CardTitle>
            <CardDescription>Lawyer utilization and caseload distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamWorkflow.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{member.lawyer}</h4>
                    <p className="text-sm text-gray-600">{member.cases} active cases</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{member.utilization}</p>
                    <Badge variant={member.status === 'High' ? 'destructive' : member.status === 'Medium' ? 'default' : 'secondary'}>
                      {member.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              className="w-full mt-4 pointer-events-auto cursor-pointer relative z-10" 
              variant="outline"
              onClick={() => navigate('/team-management')}
            >
              Manage Team
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Document Archive & Compliance</CardTitle>
          <CardDescription>Centralized document management and regulatory compliance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium">Documents</h4>
              <p className="text-2xl font-bold text-blue-600">2,347</p>
              <p className="text-sm text-gray-600">Total archived</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Building2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium">Compliance</h4>
              <p className="text-2xl font-bold text-green-600">98%</p>
              <p className="text-sm text-gray-600">Compliance rate</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-medium">Retention</h4>
              <p className="text-2xl font-bold text-purple-600">7 Years</p>
              <p className="text-sm text-gray-600">Average retention</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FirmDashboard;
