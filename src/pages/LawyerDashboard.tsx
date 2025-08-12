
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase, Clock, Receipt, Calendar, User, TrendingUp } from 'lucide-react';
import TimeTracker from '@/components/TimeTracker';
import ExpenseLogger from '@/components/ExpenseLogger';
import CourtCalendar from '@/components/CourtCalendar';
import RoleGuard from '@/components/RoleGuard';

const LawyerDashboard = () => {
  const lawyerMetrics = [
    { label: 'Active Cases', value: '12', change: '+2', icon: Briefcase, color: 'text-blue-600' },
    { label: 'Hours This Week', value: '38.5', change: '+5.2', icon: Clock, color: 'text-green-600' },
    { label: 'Billable Hours', value: '32.0', change: '+3.8', icon: TrendingUp, color: 'text-purple-600' },
    { label: 'Pending Expenses', value: '$420', change: '+$85', icon: Receipt, color: 'text-orange-600' }
  ];

  return (
    <RoleGuard allowedRoles={['advocate']}>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Lawyer Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your cases, time, and court schedule</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {lawyerMetrics.map((metric, index) => {
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
                  <p className="text-sm text-green-600">{metric.change} from last week</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="time">Time Tracking</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="calendar">Court Calendar</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Today's Schedule</CardTitle>
                  <CardDescription>Your upcoming appointments and hearings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Client Meeting - Johnson Case</h4>
                        <p className="text-sm text-gray-600">10:00 AM - 11:00 AM</p>
                      </div>
                      <Badge>Scheduled</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Court Hearing - Smith Property</h4>
                        <p className="text-sm text-gray-600">2:00 PM - 3:30 PM</p>
                      </div>
                      <Badge variant="secondary">Confirmed</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest case activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Document filed for Johnson case</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Time entry logged: 2.5 hours</p>
                        <p className="text-xs text-gray-500">4 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Expense submitted: $150</p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="time">
            <TimeTracker />
          </TabsContent>

          <TabsContent value="expenses">
            <ExpenseLogger />
          </TabsContent>

          <TabsContent value="calendar">
            <CourtCalendar />
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Lawyer Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold">Sarah Johnson</h3>
                    <p className="text-gray-600">Senior Associate</p>
                    <Badge className="mt-2">Bar #: NY12345</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div>
                      <h4 className="font-medium mb-2">Specializations</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">Personal Injury</Badge>
                        <Badge variant="outline">Civil Litigation</Badge>
                        <Badge variant="outline">Contract Law</Badge>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Experience</h4>
                      <p className="text-gray-600">8 years of practice</p>
                      <p className="text-sm text-gray-500">Licensed in NY, NJ</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-6">
                    <Button variant="outline" className="flex-1">Edit Profile</Button>
                    <Button variant="outline" className="flex-1">View Public Profile</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  );
};

export default LawyerDashboard;
