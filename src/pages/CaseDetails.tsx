import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Briefcase, 
  Calendar, 
  Clock, 
  DollarSign, 
  FileText, 
  User, 
  Edit,
  MoreHorizontal,
  Trash2,
  Plus
} from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Project } from '@/types/database';

interface Hearing {
  id: string;
  title: string;
  description: string | null;
  hearing_date: string;
  hearing_time: string | null;
  court_name: string;
  court_room: string | null;
  judge_name: string | null;
  hearing_type: string | null;
  status: string;
  case_id: string | null;
  lawyer_id: string | null;
  client_id: string | null;
  notes: string | null;
  outcome: string | null;
  created_at: string;
  updated_at: string;
}

const CaseDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deletingHearingId, setDeletingHearingId] = useState<string | null>(null);

  // Memoize filters to prevent infinite re-renders
  const projectFilters = useMemo(() => ({ id }), [id]);
  const hearingFilters = useMemo(() => ({ case_id: id }), [id]);

  const { data: projects, loading: projectLoading } = useSupabaseData<Project>({
    table: 'projects',
    filters: projectFilters,
  });

  const { 
    data: hearings, 
    loading: hearingsLoading, 
    deleteItem: deleteHearing,
    refetch: refetchHearings 
  } = useSupabaseData<Hearing>({
    table: 'hearings',
    filters: hearingFilters,
    orderBy: { column: 'hearing_date', ascending: true },
  });

  const project = projects[0];
  const loading = projectLoading || hearingsLoading;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending': return 'secondary';
      case 'closed': return 'outline';
      case 'draft': return 'destructive';
      default: return 'default';
    }
  };

  const getHearingStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'default';
      case 'completed': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'postponed': return 'outline';
      default: return 'default';
    }
  };

  const handleEditHearing = (hearingId: string) => {
    console.log('✏️ Editing hearing:', hearingId);
    toast.info('Edit functionality', {
      description: 'Redirecting to hearing edit page...'
    });
    navigate(`/dashboard/schedule/${id}?edit=${hearingId}`);
  };

  const handleDeleteHearing = async (hearingId: string, hearingTitle: string) => {
    console.log('🗑️ Attempting to delete hearing:', hearingId, hearingTitle);
    
    if (!user) {
      toast.error('Authentication required', {
        description: 'Please log in to delete hearings'
      });
      return;
    }

    // Confirm deletion
    if (!confirm(`Are you sure you want to delete the hearing "${hearingTitle}"? This action cannot be undone.`)) {
      console.log('❌ Deletion cancelled by user');
      return;
    }

    setDeletingHearingId(hearingId);
    
    try {
      console.log('🔄 Calling deleteHearing from Supabase...');
      await deleteHearing(hearingId);
      
      console.log('✅ Hearing deleted successfully');
      toast.success('Hearing deleted', {
        description: `"${hearingTitle}" has been removed`
      });
      
      // Refetch hearings to update the list
      await refetchHearings();
    } catch (error) {
      console.error('❌ Error deleting hearing:', error);
      toast.error('Failed to delete hearing', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      setDeletingHearingId(null);
    }
  };

  const canManageHearings = () => {
    if (!user || !project) return false;
    
    // Check if user is the lawyer assigned to the case
    if (project.lawyer_id === user.id) return true;
    
    // Check if user has admin/company/advocate role (from user metadata or profile)
    const userRole = user.user_metadata?.role;
    return ['super_admin', 'company', 'advocate'].includes(userRole);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading case details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="text-center py-8">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Case not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <p className="text-muted-foreground">Case #{project.case_number}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusColor(project.status)}>{project.status}</Badge>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-lg font-semibold capitalize">{project.status}</p>
              </div>
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Budget</p>
                <p className="text-lg font-semibold">${project.budget?.toLocaleString() || 'N/A'}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="text-lg font-semibold">{project.start_date || 'Not set'}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">End Date</p>
                <p className="text-lg font-semibold">{project.end_date || 'Ongoing'}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="hearings">Hearings</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Case Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="mt-1">{project.description || 'No description provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="mt-1">{new Date(project.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <p className="mt-1">{new Date(project.updated_at).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" onClick={() => navigate('/dashboard/cloud-storage')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Manage Documents
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate(`/dashboard/schedule/${project.id}`)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Hearing
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Contact Client
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Case Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No documents uploaded yet</p>
                <Button onClick={() => navigate('/dashboard/cloud-storage')}>
                  Upload Documents
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hearings">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Scheduled Hearings</CardTitle>
              <Button onClick={() => navigate(`/dashboard/schedule/${project.id}`)}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Hearing
              </Button>
            </CardHeader>
            <CardContent>
              {hearingsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading hearings...</p>
                </div>
              ) : hearings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No hearings scheduled</p>
                  <Button variant="outline" onClick={() => navigate(`/dashboard/schedule/${project.id}`)}>
                    Schedule First Hearing
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {hearings.map((hearing) => (
                    <div
                      key={hearing.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1 space-y-2 mb-4 sm:mb-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-semibold text-lg">{hearing.title}</h3>
                          <Badge variant={getHearingStatusColor(hearing.status)}>
                            {hearing.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(hearing.hearing_date).toLocaleDateString()}</span>
                            {hearing.hearing_time && (
                              <span className="ml-1">at {hearing.hearing_time}</span>
                            )}
                          </div>
                          
                          {hearing.court_name && (
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-4 w-4" />
                              <span>{hearing.court_name}</span>
                              {hearing.court_room && (
                                <span className="text-xs">• Room {hearing.court_room}</span>
                              )}
                            </div>
                          )}
                          
                          {hearing.judge_name && (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>Judge {hearing.judge_name}</span>
                            </div>
                          )}
                          
                          {hearing.hearing_type && (
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span className="capitalize">{hearing.hearing_type}</span>
                            </div>
                          )}
                        </div>

                        {hearing.description && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {hearing.description}
                          </p>
                        )}

                        {hearing.outcome && (
                          <div className="mt-2 p-2 bg-muted rounded text-sm">
                            <span className="font-medium">Outcome: </span>
                            {hearing.outcome}
                          </div>
                        )}
                      </div>

                      {canManageHearings() && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditHearing(hearing.id)}
                            disabled={deletingHearingId === hearing.id}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteHearing(hearing.id, hearing.title)}
                            disabled={deletingHearingId === hearing.id}
                          >
                            {deletingHearingId === hearing.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Case Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Case Created</p>
                    <p className="text-sm text-muted-foreground">{new Date(project.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                {project.start_date && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Case Started</p>
                      <p className="text-sm text-muted-foreground">{project.start_date}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Total Budget</p>
                    <p className="text-sm text-muted-foreground">Allocated for this case</p>
                  </div>
                  <p className="text-lg font-semibold">${project.budget?.toLocaleString() || '0'}</p>
                </div>
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Spent</p>
                    <p className="text-sm text-muted-foreground">Total expenses so far</p>
                  </div>
                  <p className="text-lg font-semibold">$0</p>
                </div>
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Remaining</p>
                    <p className="text-sm text-muted-foreground">Available budget</p>
                  </div>
                  <p className="text-lg font-semibold text-green-600">${project.budget?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CaseDetails;