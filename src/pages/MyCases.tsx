
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Briefcase, 
  Search, 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Plus,
  AlertCircle,
  CheckCircle2,
  Timer
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';
import type { Project } from '@/types/database';

interface NewCaseForm {
  title: string;
  description: string;
  case_number: string;
  client_id: string;
  status: 'active' | 'draft' | 'closed' | 'pending';
  budget: number;
  start_date: string;
}

const MyCases = () => {
  const { userProfile, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isNewCaseOpen, setIsNewCaseOpen] = useState(false);
  const [newCase, setNewCase] = useState<NewCaseForm>({
    title: '',
    description: '',
    case_number: '',
    client_id: '',
    status: 'active',
    budget: 0,
    start_date: new Date().toISOString().split('T')[0]
  });

  // Fetch projects from Supabase with real-time updates
  const { 
    data: projects, 
    loading, 
    addItem, 
    refetch 
  } = useSupabaseData<Project>({
    table: 'projects',
    filters: { lawyer_id: user?.id },
    orderBy: { column: 'created_at', ascending: false },
    realtime: true
  });

  const handleCreateCase = async () => {
    if (!newCase.title || !newCase.case_number) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const caseData = {
      ...newCase,
      lawyer_id: user?.id,
      client_id: newCase.client_id || null,
    };

    const result = await addItem(caseData);
    
    if (result.error) {
      toast({
        title: 'Error',
        description: 'Failed to create case. Please try again.',
        variant: 'destructive',
      });
    } else {
      setIsNewCaseOpen(false);
      setNewCase({
        title: '',
        description: '',
        case_number: '',
        client_id: '',
        status: 'active',
        budget: 0,
        start_date: new Date().toISOString().split('T')[0]
      });
      toast({
        title: 'Success',
        description: 'New case created successfully.',
      });
    }
  };

  const handleViewDetails = (caseId: string) => {
    navigate(`/case-details/${caseId}`);
  };

  const handleDocuments = () => {
    navigate('/cloud-storage');
  };

  const handleSchedule = (caseId: string) => {
    navigate(`/schedule/${caseId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending': return 'secondary';
      case 'closed': return 'outline';
      case 'review': return 'destructive';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Timer className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'closed': return <CheckCircle2 className="h-4 w-4" />;
      case 'review': return <AlertCircle className="h-4 w-4" />;
      default: return <Briefcase className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const filteredCases = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const activeCases = projects.filter(c => c.status === 'active');
  const pendingCases = projects.filter(c => c.status === 'pending');
  const draftCases = projects.filter(c => c.status === 'draft');
  const closedCases = projects.filter(c => c.status === 'closed');

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Briefcase className="h-6 w-6" />
          <h1 className="text-3xl font-bold">My Cases</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your cases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="h-6 w-6" />
          <h1 className="text-3xl font-bold">My Cases</h1>
        </div>
        <Dialog open={isNewCaseOpen} onOpenChange={setIsNewCaseOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Case
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Case</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Case Title *</Label>
                <Input
                  id="title"
                  value={newCase.title}
                  onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
                  placeholder="Enter case title"
                />
              </div>
              <div>
                <Label htmlFor="case_number">Case Number *</Label>
                <Input
                  id="case_number"
                  value={newCase.case_number}
                  onChange={(e) => setNewCase({ ...newCase, case_number: e.target.value })}
                  placeholder="e.g., CS-2024-001"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCase.description}
                  onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                  placeholder="Brief case description"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={newCase.status} onValueChange={(value: any) => setNewCase({ ...newCase, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="budget">Budget</Label>
                <Input
                  id="budget"
                  type="number"
                  value={newCase.budget}
                  onChange={(e) => setNewCase({ ...newCase, budget: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateCase} className="flex-1">
                  Create Case
                </Button>
                <Button variant="outline" onClick={() => setIsNewCaseOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Cases</p>
                <p className="text-2xl font-bold">{activeCases.length}</p>
              </div>
              <Timer className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{pendingCases.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Draft</p>
                <p className="text-2xl font-bold">{draftCases.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Closed</p>
                <p className="text-2xl font-bold">{closedCases.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search cases by title, client, or case number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="review">Under Review</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Cases List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Cases ({projects.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeCases.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingCases.length})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({draftCases.length})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({closedCases.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredCases.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No cases found matching your criteria.</p>
              </CardContent>
            </Card>
          ) : (
            filteredCases.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(project.status)}
                        {project.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(project.status)}>{project.status}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Case #: {project.case_number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Budget: ${project.budget?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Start: {project.start_date || 'Not set'}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="default" size="sm" onClick={() => handleViewDetails(project.id)}>
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDocuments}>
                      <FileText className="h-4 w-4 mr-2" />
                      Documents
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleSchedule(project.id)}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {['active', 'pending', 'draft', 'closed'].map(status => (
          <TabsContent key={status} value={status} className="space-y-4">
            {projects.filter(c => c.status === status).map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(project.status)}
                        {project.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(project.status)}>{project.status}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Case #: {project.case_number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Budget: ${project.budget?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Start: {project.start_date || 'Not set'}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="default" size="sm" onClick={() => handleViewDetails(project.id)}>
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDocuments}>
                      <FileText className="h-4 w-4 mr-2" />
                      Documents
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleSchedule(project.id)}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default MyCases;
