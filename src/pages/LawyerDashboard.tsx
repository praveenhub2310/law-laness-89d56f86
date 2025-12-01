
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Briefcase, Clock, Receipt, Calendar, User, TrendingUp, FileText, DollarSign, Play, Plus, Mail, Phone, Award, Briefcase as BriefcaseIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, isToday, startOfWeek, endOfWeek, format } from 'date-fns';
import TimeTracker from '@/components/TimeTracker';
import ExpenseLogger from '@/components/ExpenseLogger';
import CourtCalendar from '@/components/CourtCalendar';
import RoleGuard from '@/components/RoleGuard';

const LawyerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showPublicProfile, setShowPublicProfile] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    projects: [],
    timeEntries: [],
    expenses: [],
    hearings: [],
    documents: [],
    profile: null,
    advocate: null
  });

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        const [projectsRes, timeEntriesRes, expensesRes, hearingsRes, documentsRes, profileRes, advocateRes] = await Promise.all([
          supabase.from('projects').select('*').eq('lawyer_id', user.id),
          supabase.from('time_tracker').select('*').eq('user_id', user.id),
          supabase.from('expenses').select('*'),
          supabase.from('hearings').select('*, projects!hearings_case_id_fkey(title, case_number)').eq('lawyer_id', user.id),
          supabase.from('documents').select('*').eq('uploaded_by', user.id),
          supabase.from('profiles').select('*').eq('id', user.id).single(),
          supabase.from('advocates').select('*').eq('id', user.id).single()
        ]);

        setDashboardData({
          projects: projectsRes.data || [],
          timeEntries: timeEntriesRes.data || [],
          expenses: expensesRes.data || [],
          hearings: hearingsRes.data || [],
          documents: documentsRes.data || [],
          profile: profileRes.data,
          advocate: advocateRes.data
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    // Active cases
    const activeCases = dashboardData.projects.filter(p => p.status === 'active').length;
    
    // Hours this week
    const thisWeekHours = dashboardData.timeEntries
      .filter(entry => {
        const entryDate = new Date(entry.start_time);
        return entryDate >= weekStart && entryDate <= weekEnd;
      })
      .reduce((total, entry) => total + (entry.duration || 0), 0) / 3600; // Convert seconds to hours

    // Billable hours (assuming 80% of total hours are billable)
    const billableHours = thisWeekHours * 0.8;
    
    // Pending expenses
    const pendingExpenses = dashboardData.expenses
      .filter(expense => expense.status === 'pending')
      .reduce((total, expense) => total + parseFloat(expense.amount || 0), 0);

    return [
      { 
        label: 'Active Cases', 
        value: activeCases.toString(), 
        change: '+2', 
        icon: Briefcase, 
        color: 'text-blue-600',
        onClick: () => navigate('/dashboard/my-cases')
      },
      { 
        label: 'Hours This Week', 
        value: thisWeekHours.toFixed(1), 
        change: '+5.2', 
        icon: Clock, 
        color: 'text-green-600',
        onClick: () => navigate('/dashboard/time-logs')
      },
      { 
        label: 'Billable Hours', 
        value: billableHours.toFixed(1), 
        change: '+3.8', 
        icon: TrendingUp, 
        color: 'text-purple-600',
        onClick: () => navigate('/dashboard/time-logs')
      },
      { 
        label: 'Pending Expenses', 
        value: `$${pendingExpenses.toFixed(0)}`, 
        change: '+$85', 
        icon: Receipt, 
        color: 'text-orange-600',
        onClick: () => navigate('/dashboard/expense-tracker')
      }
    ];
  }, [dashboardData, navigate]);

  // Get today's schedule
  const todaysSchedule = useMemo(() => {
    return dashboardData.hearings
      .filter(hearing => isToday(new Date(hearing.hearing_date)))
      .sort((a, b) => new Date(a.hearing_time || '00:00').getTime() - new Date(b.hearing_time || '00:00').getTime())
      .slice(0, 3);
  }, [dashboardData.hearings]);

  // Get recent activity
  const recentActivity = useMemo(() => {
    const activities = [];
    
    // Recent documents
    dashboardData.documents
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 2)
      .forEach(doc => {
        activities.push({
          type: 'document',
          message: `Document uploaded: ${doc.title}`,
          time: doc.created_at,
          color: 'bg-blue-600'
        });
      });

    // Recent time entries
    dashboardData.timeEntries
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 2)
      .forEach(entry => {
        const hours = (entry.duration || 0) / 3600;
        activities.push({
          type: 'time',
          message: `Time entry logged: ${hours.toFixed(1)} hours`,
          time: entry.created_at,
          color: 'bg-green-600'
        });
      });

    // Recent expenses
    dashboardData.expenses
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 2)
      .forEach(expense => {
        activities.push({
          type: 'expense',
          message: `Expense submitted: $${expense.amount}`,
          time: expense.created_at,
          color: 'bg-orange-600'
        });
      });

    return activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5);
  }, [dashboardData]);

  return (
    <RoleGuard allowedRoles={['advocate']}>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Lawyer Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your cases, time, and court schedule</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={metric.onClick}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">{metric.label}</CardTitle>
                    <IconComponent className={`h-5 w-5 ${metric.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-16 mb-2" />
                  ) : (
                    <div className="text-2xl font-bold">{metric.value}</div>
                  )}
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
                  {loading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : todaysSchedule.length > 0 ? (
                    <div className="space-y-3">
                      {todaysSchedule.map((hearing) => (
                        <div 
                          key={hearing.id}
                          className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => navigate('/dashboard/hearings')}
                        >
                          <div>
                            <h4 className="font-medium">{hearing.title}</h4>
                            <p className="text-sm text-gray-600">
                              {hearing.hearing_time ? new Date(`2000-01-01T${hearing.hearing_time}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Time TBD'} - {hearing.court_name}
                            </p>
                          </div>
                          <Badge variant={hearing.status === 'confirmed' ? 'secondary' : 'default'}>
                            {hearing.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hearings scheduled for today</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest case activities</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center space-x-3">
                          <Skeleton className="w-2 h-2 rounded-full" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-3/4 mb-1" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : recentActivity.length > 0 ? (
                    <div className="space-y-3">
                      {recentActivity.map((activity, index) => (
                        <div 
                          key={index} 
                          className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                          onClick={() => {
                            if (activity.type === 'document') navigate('/dashboard/document-analysis');
                            else if (activity.type === 'time') navigate('/dashboard/time-logs');
                            else if (activity.type === 'expense') navigate('/dashboard/expense-tracker');
                          }}
                        >
                          <div className={`w-2 h-2 ${activity.color} rounded-full`}></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.message}</p>
                            <p className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No recent activity</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="time">
            <TimeTracker />
          </TabsContent>

          <TabsContent value="expenses">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Recent Expenses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <Skeleton className="h-4 w-48 mb-2" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                          <div className="text-right">
                            <Skeleton className="h-6 w-16 mb-1" />
                            <Skeleton className="h-4 w-12" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : dashboardData.expenses && dashboardData.expenses.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.expenses
                        .sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime())
                        .slice(0, 5)
                        .map((expense) => {
                          const project = dashboardData.projects?.find(p => p.id === expense.case_id);
                          return (
                            <div 
                              key={expense.id} 
                              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => navigate('/dashboard/expense-tracker')}
                            >
                              <div className="flex-1">
                                <p className="font-medium">{expense.expense_title}</p>
                                <p className="text-sm text-gray-600">
                                  {project ? project.title : 'General Expense'} • {format(new Date(expense.expense_date), 'MMM dd, yyyy')}
                                </p>
                                {expense.description && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    {expense.description.length > 50 
                                      ? `${expense.description.substring(0, 50)}...` 
                                      : expense.description
                                    }
                                  </p>
                                )}
                              </div>
                              <div className="text-right space-y-1">
                                <p className="font-bold text-lg">
                                  {expense.currency === 'USD' ? '$' : '₹'}{Number(expense.amount).toFixed(2)}
                                </p>
                                <Badge 
                                  variant={expense.status === 'approved' ? 'default' : expense.status === 'pending' ? 'secondary' : 'destructive'}
                                >
                                  {expense.status}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No expenses recorded yet</p>
                      <Button 
                        className="mt-4" 
                        onClick={() => navigate('/dashboard/expense-tracker')}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Expense
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
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
                {loading ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <Skeleton className="w-20 h-20 rounded-full mx-auto mb-4" />
                      <Skeleton className="h-6 w-32 mx-auto mb-2" />
                      <Skeleton className="h-4 w-24 mx-auto mb-2" />
                      <Skeleton className="h-6 w-20 mx-auto" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div>
                        <Skeleton className="h-4 w-24 mb-2" />
                        <div className="flex flex-wrap gap-2">
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-6 w-24" />
                        </div>
                      </div>
                      <div>
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold">
                        {dashboardData.profile?.first_name} {dashboardData.profile?.last_name}
                      </h3>
                      <p className="text-gray-600">
                        {dashboardData.advocate?.experience_years ? `${dashboardData.advocate.experience_years} years experience` : 'Advocate'}
                      </p>
                      {dashboardData.advocate?.bar_number && (
                        <Badge className="mt-2">Bar #: {dashboardData.advocate.bar_number}</Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div>
                        <h4 className="font-medium mb-2">Specializations</h4>
                        <div className="flex flex-wrap gap-2">
                          {dashboardData.advocate?.specialization?.length > 0 ? (
                            dashboardData.advocate.specialization.map((spec, index) => (
                              <Badge key={index} variant="outline">{spec}</Badge>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">No specializations listed</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Contact</h4>
                        <p className="text-gray-600">{dashboardData.profile?.email}</p>
                        {dashboardData.profile?.phone && (
                          <p className="text-sm text-gray-500">{dashboardData.profile.phone}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-6">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => navigate('/dashboard/profile')}
                      >
                        Edit Profile
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setShowPublicProfile(true)}
                      >
                        View Public Profile
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Public Profile View Dialog */}
      <Dialog open={showPublicProfile} onOpenChange={setShowPublicProfile}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Public Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="text-center pb-6 border-b">
              <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold">
                {dashboardData.profile?.first_name} {dashboardData.profile?.last_name}
              </h2>
              <p className="text-muted-foreground mt-1">
                Advocate{dashboardData.advocate?.experience_years ? ` • ${dashboardData.advocate.experience_years} years experience` : ''}
              </p>
              {dashboardData.advocate?.bar_number && (
                <Badge className="mt-3" variant="secondary">
                  Bar #: {dashboardData.advocate.bar_number}
                </Badge>
              )}
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{dashboardData.profile?.email}</p>
                </div>
              </div>
              {dashboardData.profile?.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{dashboardData.profile.phone}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Specializations */}
            {dashboardData.advocate?.specialization?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Award className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Specializations</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {dashboardData.advocate.specialization.map((spec: string, index: number) => (
                    <Badge key={index} variant="outline">{spec}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Professional Details */}
            {(dashboardData.advocate?.hourly_rate || dashboardData.advocate?.bio) && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BriefcaseIcon className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Professional Information</h3>
                </div>
                <div className="space-y-3">
                  {dashboardData.advocate?.hourly_rate && (
                    <div>
                      <p className="text-sm font-medium">Hourly Rate</p>
                      <p className="text-sm text-muted-foreground">₹{dashboardData.advocate.hourly_rate}/hour</p>
                    </div>
                  )}
                  {dashboardData.advocate?.bio && (
                    <div>
                      <p className="text-sm font-medium">Bio</p>
                      <p className="text-sm text-muted-foreground">{dashboardData.advocate.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </RoleGuard>
  );
};

export default LawyerDashboard;
