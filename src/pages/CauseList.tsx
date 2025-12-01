import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CauseListUploader from '@/components/CauseListUploader';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  RefreshCw,
  Calendar,
  Gavel,
  Building,
  Users,
  Upload,
  MapPin,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

interface CauseListItem {
  id: string;
  case_number: string;
  parties: string;
  court_name: string;
  judge_name: string;
  date: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'adjourned';
  created_at: string;
  updated_at: string;
  item_number?: string;
  court_room_number?: string;
  time_slot?: string;
  hearing_type?: string;
  parsed_from_file?: boolean;
  mapping_confidence?: number;
  mapped_case_id?: string;
}

const CauseList = () => {
  const [causeList, setCauseList] = useState<CauseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courtFilter, setCourtFilter] = useState<string>('all');
  const [judgeFilter, setJudgeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [sortColumn, setSortColumn] = useState<keyof CauseListItem>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<CauseListItem | null>(null);
  const [formData, setFormData] = useState<{
    case_number: string;
    parties: string;
    court_name: string;
    judge_name: string;
    date: string;
    status: 'scheduled' | 'in_progress' | 'completed' | 'adjourned';
  }>({
    case_number: '',
    parties: '',
    court_name: '',
    judge_name: '',
    date: '',
    status: 'scheduled'
  });
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch cause list data
  const fetchCauseList = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cause_list')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setCauseList(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Real-time subscription
  useEffect(() => {
    fetchCauseList();

    const channel = supabase
      .channel('cause_list_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cause_list'
        },
        () => {
          fetchCauseList();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Get unique values for filters
  const uniqueCourts = useMemo(() => 
    [...new Set(causeList.map(item => item.court_name))].sort(),
    [causeList]
  );

  const uniqueJudges = useMemo(() => 
    [...new Set(causeList.map(item => item.judge_name))].sort(),
    [causeList]
  );

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = causeList.filter(item => {
      const matchesSearch = 
        item.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.parties.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesCourt = courtFilter === 'all' || item.court_name === courtFilter;
      const matchesJudge = judgeFilter === 'all' || item.judge_name === judgeFilter;
      const matchesDate = !dateFilter || item.date.startsWith(dateFilter);

      return matchesSearch && matchesStatus && matchesCourt && matchesJudge && matchesDate;
    });

    // Sort data
    filtered.sort((a, b) => {
      let aValue: string | number | boolean = a[sortColumn];
      let bValue: string | number | boolean = b[sortColumn];

      // Handle different data types
      if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        aValue = aValue ? 1 : 0;
        bValue = bValue ? 1 : 0;
      } else if (sortColumn === 'date') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      } else if (typeof aValue !== 'string' && typeof aValue !== 'number') {
        aValue = String(aValue || '');
        bValue = String(bValue || '');
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [causeList, searchTerm, statusFilter, courtFilter, judgeFilter, dateFilter, sortColumn, sortDirection]);

  // Handle sort
  const handleSort = (column: keyof CauseListItem) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      case_number: '',
      parties: '',
      court_name: '',
      judge_name: '',
      date: '',
      status: 'scheduled'
    });
  };

  // Handle add/edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditModalOpen && currentItem) {
        const { error } = await supabase
          .from('cause_list')
          .update(formData)
          .eq('id', currentItem.id);

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Cause list entry updated successfully.',
        });
        setIsEditModalOpen(false);
      } else {
        const { error } = await supabase
          .from('cause_list')
          .insert([formData]);

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Cause list entry added successfully.',
        });
        setIsAddModalOpen(false);
      }
      
      resetForm();
      setCurrentItem(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Handle edit
  const handleEdit = (item: CauseListItem) => {
    setCurrentItem(item);
    setFormData({
      case_number: item.case_number,
      parties: item.parties,
      court_name: item.court_name,
      judge_name: item.judge_name,
      date: format(new Date(item.date), 'yyyy-MM-dd\'T\'HH:mm'),
      status: item.status
    });
    setIsEditModalOpen(true);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!currentItem) return;

    try {
      const { error } = await supabase
        .from('cause_list')
        .delete()
        .eq('id', currentItem.id);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Cause list entry deleted successfully.',
      });
      
      setIsDeleteDialogOpen(false);
      setCurrentItem(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Case Number', 'Parties', 'Court', 'Judge', 'Date', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedData.map(item => [
        item.case_number,
        `"${item.parties}"`,
        `"${item.court_name}"`,
        `"${item.judge_name}"`,
        format(new Date(item.date), 'yyyy-MM-dd HH:mm'),
        item.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cause-list-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Success',
      description: 'Cause list exported successfully.',
    });
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    const variants = {
      scheduled: 'default',
      in_progress: 'secondary',
      completed: 'success',
      adjourned: 'warning'
    };
    
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      adjourned: 'bg-orange-100 text-orange-800'
    };

    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen overflow-x-hidden">
      <div className="w-full max-w-full space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
        {/* Header */}
        <div className="w-full">
          <div className="flex flex-col gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold break-words w-full">
              Court Cause List
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground break-words w-full">
              Manage and track court hearings in real-time
            </p>
          </div>
        </div>

        {/* Tabs for different functionalities */}
        <Tabs defaultValue="view" className="w-full max-w-full">
          <TabsList className="grid w-full max-w-full grid-cols-2 h-auto">
            <TabsTrigger 
              value="view" 
              className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-2 min-w-0"
            >
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">View List</span>
            </TabsTrigger>
            <TabsTrigger 
              value="upload" 
              className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-2 min-w-0"
            >
              <Upload className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">Upload</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="view" className="w-full max-w-full space-y-4 sm:space-y-6">
            {/* Actions */}
            <div className="flex flex-col gap-2 w-full max-w-full">
              <Button 
                onClick={exportToCSV} 
                variant="outline" 
                size="sm" 
                className="w-full h-9 text-xs sm:text-sm pointer-events-auto cursor-pointer relative z-10"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span>Export CSV</span>
              </Button>
              
              <Button 
                onClick={fetchCauseList} 
                variant="outline" 
                size="sm" 
                className="w-full h-9 text-xs sm:text-sm pointer-events-auto cursor-pointer relative z-10"
              >
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span>Refresh</span>
              </Button>
              
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={resetForm} 
                    size="sm" 
                    className="w-full h-9 text-xs sm:text-sm pointer-events-auto cursor-pointer relative z-10"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                    <span>Add Cause</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto mx-2 bg-background border shadow-lg z-[100]">
                  <DialogHeader>
                    <DialogTitle className="text-base sm:text-lg md:text-xl">Add New Cause</DialogTitle>
                  </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="case_number">Case Number</Label>
                    <Input
                      id="case_number"
                      value={formData.case_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, case_number: e.target.value }))}
                      required
                      className="pointer-events-auto"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="parties">Parties</Label>
                    <Textarea
                      id="parties"
                      value={formData.parties}
                      onChange={(e) => setFormData(prev => ({ ...prev, parties: e.target.value }))}
                      placeholder="Petitioner vs Respondent"
                      required
                      className="pointer-events-auto"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="court_name">Court Name</Label>
                    <Input
                      id="court_name"
                      value={formData.court_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, court_name: e.target.value }))}
                      required
                      className="pointer-events-auto"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="judge_name">Judge Name</Label>
                    <Input
                      id="judge_name"
                      value={formData.judge_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, judge_name: e.target.value }))}
                      required
                      className="pointer-events-auto"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="date">Hearing Date & Time</Label>
                    <Input
                      id="date"
                      type="datetime-local"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      required
                      className="pointer-events-auto"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
                    >
                      <SelectTrigger className="pointer-events-auto cursor-pointer relative z-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border shadow-lg z-[100]">
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="adjourned">Adjourned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsAddModalOpen(false)}
                      className="pointer-events-auto"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      className="pointer-events-auto"
                    >
                      Add Cause
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

            {/* Filters */}
            <Card className="w-full max-w-full overflow-hidden">
              <CardHeader className="p-3 sm:p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg w-full">
                  <Filter className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span className="truncate">Filters & Search</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6 pt-0 w-full max-w-full">
                <div className="flex flex-col gap-3 w-full max-w-full">
                  <div className="relative w-full max-w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none z-10" />
                    <Input
                      placeholder="Search case or parties..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-9 text-sm w-full max-w-full pointer-events-auto"
                    />
                  </div>
                
                  <div className="w-full max-w-full">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="h-9 text-sm w-full max-w-full pointer-events-auto cursor-pointer relative z-10">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border shadow-lg z-[100]">
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="adjourned">Adjourned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-full max-w-full">
                    <Select value={courtFilter} onValueChange={setCourtFilter}>
                      <SelectTrigger className="h-9 text-sm w-full max-w-full pointer-events-auto cursor-pointer relative z-10">
                        <SelectValue placeholder="All Courts" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border shadow-lg z-[100]">
                        <SelectItem value="all">All Courts</SelectItem>
                        {uniqueCourts.map(court => (
                          <SelectItem key={court} value={court}>{court}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-full max-w-full">
                    <Select value={judgeFilter} onValueChange={setJudgeFilter}>
                      <SelectTrigger className="h-9 text-sm w-full max-w-full pointer-events-auto cursor-pointer relative z-10">
                        <SelectValue placeholder="All Judges" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border shadow-lg z-[100]">
                        <SelectItem value="all">All Judges</SelectItem>
                        {uniqueJudges.map(judge => (
                          <SelectItem key={judge} value={judge}>{judge}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-full max-w-full">
                    <Input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      placeholder="Filter by date"
                      className="h-9 text-sm w-full max-w-full pointer-events-auto"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-full">
              <Card className="w-full max-w-full overflow-hidden">
                <CardContent className="p-3 sm:p-4 w-full">
                  <div className="flex items-center gap-2 w-full min-w-0">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">Total Cases</p>
                      <p className="text-xl sm:text-2xl font-bold truncate">{filteredAndSortedData.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            
              <Card className="w-full max-w-full overflow-hidden">
                <CardContent className="p-3 sm:p-4 w-full">
                  <div className="flex items-center gap-2 w-full min-w-0">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">In Progress</p>
                      <p className="text-xl sm:text-2xl font-bold truncate">
                        {filteredAndSortedData.filter(item => item.status === 'in_progress').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            
              <Card className="w-full max-w-full overflow-hidden">
                <CardContent className="p-3 sm:p-4 w-full">
                  <div className="flex items-center gap-2 w-full min-w-0">
                    <Gavel className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">Completed</p>
                      <p className="text-xl sm:text-2xl font-bold truncate">
                        {filteredAndSortedData.filter(item => item.status === 'completed').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            
              <Card className="w-full max-w-full overflow-hidden">
                <CardContent className="p-3 sm:p-4 w-full">
                  <div className="flex items-center gap-2 w-full min-w-0">
                    <Building className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">Adjourned</p>
                      <p className="text-xl sm:text-2xl font-bold truncate">
                        {filteredAndSortedData.filter(item => item.status === 'adjourned').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Table with new fields */}
            <Card className="w-full max-w-full overflow-hidden">
              <CardContent className="p-0 w-full max-w-full">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('item_number')}
                      >
                        Item # {sortColumn === 'item_number' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('case_number')}
                      >
                        Case Number {sortColumn === 'case_number' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('parties')}
                      >
                        Parties {sortColumn === 'parties' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('court_name')}
                      >
                        Court {sortColumn === 'court_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('court_room_number')}
                      >
                        Room {sortColumn === 'court_room_number' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('judge_name')}
                      >
                        Judge {sortColumn === 'judge_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('date')}
                      >
                        Date & Time {sortColumn === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('status')}
                      >
                        Status {sortColumn === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                          No cause list entries found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAndSortedData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            {item.item_number ? (
                              <Badge variant="outline" className="font-mono">
                                {item.item_number}
                              </Badge>
                            ) : '-'}
                          </TableCell>
                          <TableCell className="font-medium font-mono text-sm">{item.case_number}</TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate" title={item.parties}>
                              {item.parties}
                            </div>
                          </TableCell>
                          <TableCell>{item.court_name}</TableCell>
                          <TableCell>
                            {item.court_room_number ? (
                              <div className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                {item.court_room_number}
                              </div>
                            ) : '-'}
                          </TableCell>
                          <TableCell>{item.judge_name}</TableCell>
                          <TableCell>
                            <div>
                              {format(new Date(item.date), 'MMM dd, yyyy HH:mm')}
                              {item.time_slot && (
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {item.time_slot}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell>
                            {item.parsed_from_file ? (
                              <div className="flex items-center gap-1">
                                <Badge className="bg-purple-100 text-purple-800 text-xs">
                                  <Upload className="h-3 w-3 mr-1" />
                                  Parsed
                                </Badge>
                                {item.mapped_case_id && (
                                  <Badge className="bg-green-100 text-green-800 text-xs">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    Mapped
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-xs">Manual</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(item)}
                                className="pointer-events-auto cursor-pointer"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setCurrentItem(item);
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="pointer-events-auto cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3 p-3 w-full max-w-full">
                  {filteredAndSortedData.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No cause list entries found
                    </div>
                  ) : (
                    filteredAndSortedData.map((item) => (
                      <Card key={item.id} className="w-full max-w-full overflow-hidden">
                        <CardContent className="p-4 space-y-3 w-full max-w-full min-w-0">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-mono text-sm font-semibold break-words">
                              {item.case_number}
                            </div>
                            {item.item_number && (
                              <Badge variant="outline" className="font-mono text-xs mt-1">
                                #{item.item_number}
                              </Badge>
                            )}
                          </div>
                          {getStatusBadge(item.status)}
                        </div>

                        {/* Parties */}
                        <div className="text-sm">
                          <div className="text-xs text-muted-foreground mb-1">Parties</div>
                          <div className="break-words">{item.parties}</div>
                        </div>

                        {/* Court & Judge */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Court</div>
                            <div className="break-words">{item.court_name}</div>
                            {item.court_room_number && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                <Building className="h-3 w-3" />
                                Room {item.court_room_number}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Judge</div>
                            <div className="break-words">{item.judge_name}</div>
                          </div>
                        </div>

                        {/* Date & Time */}
                        <div className="text-sm">
                          <div className="text-xs text-muted-foreground mb-1">Date & Time</div>
                          <div>{format(new Date(item.date), 'MMM dd, yyyy HH:mm')}</div>
                          {item.time_slot && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3" />
                              {item.time_slot}
                            </div>
                          )}
                        </div>

                        {/* Source */}
                        <div className="flex flex-wrap gap-2">
                          {item.parsed_from_file ? (
                            <>
                              <Badge className="bg-purple-100 text-purple-800 text-xs">
                                <Upload className="h-3 w-3 mr-1" />
                                Parsed
                              </Badge>
                              {item.mapped_case_id && (
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  Mapped
                                </Badge>
                              )}
                            </>
                          ) : (
                            <Badge variant="outline" className="text-xs">Manual</Badge>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(item)}
                            className="flex-1 text-xs pointer-events-auto cursor-pointer"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setCurrentItem(item);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="flex-1 text-xs pointer-events-auto cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="w-full max-w-full space-y-4 sm:space-y-6">
          <CauseListUploader />
        </TabsContent>
      </Tabs>

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto mx-2 bg-background border shadow-lg z-[100]">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg md:text-xl">Edit Cause</DialogTitle>
            </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit_case_number">Case Number</Label>
              <Input
                id="edit_case_number"
                value={formData.case_number}
                onChange={(e) => setFormData(prev => ({ ...prev, case_number: e.target.value }))}
                required
                className="pointer-events-auto"
              />
            </div>
            
            <div>
              <Label htmlFor="edit_parties">Parties</Label>
              <Textarea
                id="edit_parties"
                value={formData.parties}
                onChange={(e) => setFormData(prev => ({ ...prev, parties: e.target.value }))}
                required
                className="pointer-events-auto"
              />
            </div>
            
            <div>
              <Label htmlFor="edit_court_name">Court Name</Label>
              <Input
                id="edit_court_name"
                value={formData.court_name}
                onChange={(e) => setFormData(prev => ({ ...prev, court_name: e.target.value }))}
                required
                className="pointer-events-auto"
              />
            </div>
            
            <div>
              <Label htmlFor="edit_judge_name">Judge Name</Label>
              <Input
                id="edit_judge_name"
                value={formData.judge_name}
                onChange={(e) => setFormData(prev => ({ ...prev, judge_name: e.target.value }))}
                required
                className="pointer-events-auto"
              />
            </div>
            
            <div>
              <Label htmlFor="edit_date">Hearing Date & Time</Label>
              <Input
                id="edit_date"
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
                className="pointer-events-auto"
              />
            </div>
            
            <div>
              <Label htmlFor="edit_status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
              >
                <SelectTrigger className="pointer-events-auto cursor-pointer relative z-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-[100]">
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="adjourned">Adjourned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditModalOpen(false)}
                className="pointer-events-auto"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="pointer-events-auto"
              >
                Update Cause
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-background border shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Cause List Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this cause list entry? This action cannot be undone.
              <br />
              <strong>Case: {currentItem?.case_number}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="pointer-events-auto cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="pointer-events-auto cursor-pointer"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </div>
  );
};

export default CauseList;