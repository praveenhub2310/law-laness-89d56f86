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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Court Cause List</h1>
          <p className="text-muted-foreground">
            Manage and track court hearings in real-time
          </p>
        </div>
      </div>

      {/* Tabs for different functionalities */}
      <Tabs defaultValue="view" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="view" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            View Cause List
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload & Parse
          </TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="space-y-6">
          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            
            <Button onClick={fetchCauseList} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Cause
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Cause</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="case_number">Case Number</Label>
                    <Input
                      id="case_number"
                      value={formData.case_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, case_number: e.target.value }))}
                      required
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
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="court_name">Court Name</Label>
                    <Input
                      id="court_name"
                      value={formData.court_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, court_name: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="judge_name">Judge Name</Label>
                    <Input
                      id="judge_name"
                      value={formData.judge_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, judge_name: e.target.value }))}
                      required
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
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="adjourned">Adjourned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Cause</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search case number or parties..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="adjourned">Adjourned</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={courtFilter} onValueChange={setCourtFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by court" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courts</SelectItem>
                    {uniqueCourts.map(court => (
                      <SelectItem key={court} value={court}>{court}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={judgeFilter} onValueChange={setJudgeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by judge" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Judges</SelectItem>
                    {uniqueJudges.map(judge => (
                      <SelectItem key={judge} value={judge}>{judge}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  placeholder="Filter by date"
                />
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Cases</p>
                    <p className="text-2xl font-bold">{filteredAndSortedData.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold">
                      {filteredAndSortedData.filter(item => item.status === 'in_progress').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Gavel className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">
                      {filteredAndSortedData.filter(item => item.status === 'completed').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Adjourned</p>
                    <p className="text-2xl font-bold">
                      {filteredAndSortedData.filter(item => item.status === 'adjourned').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Table with new fields */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <CauseListUploader />
        </TabsContent>
      </Tabs>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Cause</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit_case_number">Case Number</Label>
              <Input
                id="edit_case_number"
                value={formData.case_number}
                onChange={(e) => setFormData(prev => ({ ...prev, case_number: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="edit_parties">Parties</Label>
              <Textarea
                id="edit_parties"
                value={formData.parties}
                onChange={(e) => setFormData(prev => ({ ...prev, parties: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="edit_court_name">Court Name</Label>
              <Input
                id="edit_court_name"
                value={formData.court_name}
                onChange={(e) => setFormData(prev => ({ ...prev, court_name: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="edit_judge_name">Judge Name</Label>
              <Input
                id="edit_judge_name"
                value={formData.judge_name}
                onChange={(e) => setFormData(prev => ({ ...prev, judge_name: e.target.value }))}
                required
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
              />
            </div>
            
            <div>
              <Label htmlFor="edit_status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="adjourned">Adjourned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Cause</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Cause List Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this cause list entry? This action cannot be undone.
              <br />
              <strong>Case: {currentItem?.case_number}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CauseList;