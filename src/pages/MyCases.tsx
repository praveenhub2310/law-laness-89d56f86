
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Briefcase, 
  Search, 
  Filter, 
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

interface Case {
  id: string;
  title: string;
  clientName: string;
  caseNumber: string;
  status: 'active' | 'pending' | 'closed' | 'review';
  priority: 'high' | 'medium' | 'low';
  nextHearing: string | null;
  lastUpdate: string;
  description: string;
  assignedLawyer: string;
  progress: number;
}

const MyCases = () => {
  const { userProfile } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration - replace with actual API call
  useEffect(() => {
    const mockCases: Case[] = [
      {
        id: '1',
        title: 'Contract Dispute - Tech Solutions Inc.',
        clientName: 'Tech Solutions Inc.',
        caseNumber: 'CS-2024-001',
        status: 'active',
        priority: 'high',
        nextHearing: '2024-01-15',
        lastUpdate: '2024-01-10',
        description: 'Commercial contract breach case involving software licensing disputes.',
        assignedLawyer: userProfile?.first_name + ' ' + userProfile?.last_name || 'Current User',
        progress: 65
      },
      {
        id: '2',
        title: 'Employment Termination Case',
        clientName: 'John Smith',
        caseNumber: 'EM-2024-012',
        status: 'pending',
        priority: 'medium',
        nextHearing: '2024-01-18',
        lastUpdate: '2024-01-08',
        description: 'Wrongful termination and discrimination case.',
        assignedLawyer: userProfile?.first_name + ' ' + userProfile?.last_name || 'Current User',
        progress: 30
      },
      {
        id: '3',
        title: 'Property Rights Dispute',
        clientName: 'Green Valley LLC',
        caseNumber: 'PR-2024-005',
        status: 'review',
        priority: 'low',
        nextHearing: null,
        lastUpdate: '2024-01-05',
        description: 'Land acquisition and boundary dispute case.',
        assignedLawyer: userProfile?.first_name + ' ' + userProfile?.last_name || 'Current User',
        progress: 80
      },
      {
        id: '4',
        title: 'Personal Injury Claim',
        clientName: 'Maria Rodriguez',
        caseNumber: 'PI-2024-008',
        status: 'closed',
        priority: 'medium',
        nextHearing: null,
        lastUpdate: '2024-01-03',
        description: 'Motor vehicle accident personal injury case - settled.',
        assignedLawyer: userProfile?.first_name + ' ' + userProfile?.last_name || 'Current User',
        progress: 100
      }
    ];

    setTimeout(() => {
      setCases(mockCases);
      setLoading(false);
    }, 1000);
  }, [userProfile]);

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

  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.caseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || caseItem.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const activeCases = cases.filter(c => c.status === 'active');
  const pendingCases = cases.filter(c => c.status === 'pending');
  const reviewCases = cases.filter(c => c.status === 'review');
  const closedCases = cases.filter(c => c.status === 'closed');

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
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Case
        </Button>
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
                <p className="text-sm text-gray-600">Under Review</p>
                <p className="text-2xl font-bold">{reviewCases.length}</p>
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
          <TabsTrigger value="all">All Cases ({cases.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeCases.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingCases.length})</TabsTrigger>
          <TabsTrigger value="review">Review ({reviewCases.length})</TabsTrigger>
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
            filteredCases.map((caseItem) => (
              <Card key={caseItem.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(caseItem.status)}
                        {caseItem.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{caseItem.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(caseItem.status)}>{caseItem.status}</Badge>
                      <span className={`text-sm font-medium ${getPriorityColor(caseItem.priority)}`}>
                        {caseItem.priority} priority
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Case #: {caseItem.caseNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Client: {caseItem.clientName}</span>
                    </div>
                    {caseItem.nextHearing && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">Next hearing: {caseItem.nextHearing}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{caseItem.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${caseItem.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="default" size="sm">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Documents
                    </Button>
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {['active', 'pending', 'review', 'closed'].map(status => (
          <TabsContent key={status} value={status} className="space-y-4">
            {cases.filter(c => c.status === status).map((caseItem) => (
              <Card key={caseItem.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(caseItem.status)}
                        {caseItem.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{caseItem.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(caseItem.status)}>{caseItem.status}</Badge>
                      <span className={`text-sm font-medium ${getPriorityColor(caseItem.priority)}`}>
                        {caseItem.priority} priority
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Case #: {caseItem.caseNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Client: {caseItem.clientName}</span>
                    </div>
                    {caseItem.nextHearing && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">Next hearing: {caseItem.nextHearing}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{caseItem.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${caseItem.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="default" size="sm">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Documents
                    </Button>
                    <Button variant="outline" size="sm">
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
