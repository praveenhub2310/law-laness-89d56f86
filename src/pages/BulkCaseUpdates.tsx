import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Download, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Case {
  id: string;
  case_number: string;
  title: string;
  client_id: string | null;
  status: string;
  selected: boolean;
}

const BulkCaseUpdates = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCases, setSelectedCases] = useState<string[]>([]);
  const [newStatus, setNewStatus] = useState('');
  const [updateSource, setUpdateSource] = useState('');
  const [updating, setUpdating] = useState(false);

  const statusOptions = [
    'active',
    'pending', 
    'closed',
    'draft'
  ];

  useEffect(() => {
    fetchCases();
  }, [user]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('id, case_number, title, client_id, status')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCases((data || []).map(c => ({ ...c, selected: false })));
    } catch (error) {
      console.error('Error fetching cases:', error);
      toast.error('Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  const toggleCaseSelection = (caseId: string) => {
    setSelectedCases(prev => 
      prev.includes(caseId) 
        ? prev.filter(id => id !== caseId)
        : [...prev, caseId]
    );
  };

  const selectAllCases = () => {
    setSelectedCases(cases.map(c => c.id));
  };

  const clearSelection = () => {
    setSelectedCases([]);
  };

  const updateSelectedCases = async () => {
    if (!user || selectedCases.length === 0 || !newStatus) {
      toast.error('Please select cases and a new status');
      return;
    }

    try {
      setUpdating(true);
      console.log('🔵 Updating cases:', selectedCases, 'to status:', newStatus);

      // Update all selected cases
      const { error: updateError } = await supabase
        .from('projects')
        .update({ status: newStatus as any })
        .in('id', selectedCases);

      if (updateError) throw updateError;

      // Create case updates for each selected case
      const caseUpdates = selectedCases.map(caseId => ({
        case_id: caseId,
        created_by: user.id,
        update_type: 'status_change',
        title: 'Bulk Status Update',
        description: `Status changed to "${newStatus}" via bulk update${updateSource ? ` from ${updateSource}` : ''}`,
        is_visible_to_client: true,
      }));

      const { error: updatesError } = await supabase
        .from('case_updates')
        .insert(caseUpdates);

      if (updatesError) {
        console.error('Failed to create case updates:', updatesError);
        // Don't fail the whole operation if logging fails
      }

      toast.success(`Successfully updated ${selectedCases.length} case(s)`);
      
      // Clear selections and refresh
      setSelectedCases([]);
      setNewStatus('');
      setUpdateSource('');
      await fetchCases();
      
    } catch (error) {
      console.error('Error updating cases:', error);
      toast.error('Failed to update cases');
    } finally {
      setUpdating(false);
    }
  };

  const handleImportCauseList = () => {
    toast.info('Import Cause List feature coming soon. Please use the Cause List page to upload files.');
  };

  const handleExportUpdates = async () => {
    try {
      const selectedCaseData = cases.filter(c => selectedCases.includes(c.id));
      const csvContent = [
        ['Case Number', 'Title', 'Current Status', 'Updated Status'].join(','),
        ...selectedCaseData.map(c => [c.case_number, c.title, c.status, newStatus || c.status].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bulk-updates-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Export completed successfully');
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Failed to export updates');
    }
  };

  const handleSyncWithCourt = () => {
    toast.info('Court sync feature coming soon. This will automatically sync status from court cause lists.');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Bulk Case Updates</h1>
          <p className="text-muted-foreground mt-2">Update multiple case statuses from court cause list</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Bulk Case Updates</h1>
        <p className="text-muted-foreground mt-2">Update multiple case statuses from court cause list</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Active Cases</CardTitle>
                <CardDescription>Select cases to update from court cause list</CardDescription>
              </div>
              <div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={selectAllCases}
                  className="pointer-events-auto cursor-pointer relative z-10"
                  disabled={loading || cases.length === 0}
                >
                  Select All
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearSelection}
                  className="pointer-events-auto cursor-pointer relative z-10"
                  disabled={selectedCases.length === 0}
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cases.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No cases found. Create some cases first.
                </div>
              ) : (
                cases.map((case_) => (
                  <div key={case_.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedCases.includes(case_.id)}
                        onCheckedChange={() => toggleCaseSelection(case_.id)}
                        className="pointer-events-auto cursor-pointer"
                      />
                      <div>
                        <h4 className="font-medium">{case_.case_number}</h4>
                        <p className="text-sm text-muted-foreground">{case_.title}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        {case_.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Update Settings</CardTitle>
              <CardDescription>Configure bulk update parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Update Source</label>
                <Select value={updateSource} onValueChange={setUpdateSource}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="court-list">Court Cause List</SelectItem>
                    <SelectItem value="manual">Manual Update</SelectItem>
                    <SelectItem value="system">System Sync</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">New Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={updateSelectedCases}
                disabled={selectedCases.length === 0 || !newStatus || updating}
                className="w-full pointer-events-auto cursor-pointer relative z-10"
              >
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  `Update ${selectedCases.length} Case(s)`
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full pointer-events-auto cursor-pointer relative z-10"
                onClick={handleImportCauseList}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import Cause List
              </Button>
              <Button 
                variant="outline" 
                className="w-full pointer-events-auto cursor-pointer relative z-10"
                onClick={handleExportUpdates}
                disabled={selectedCases.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Updates
              </Button>
              <Button 
                variant="outline" 
                className="w-full pointer-events-auto cursor-pointer relative z-10"
                onClick={handleSyncWithCourt}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Sync with Court
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BulkCaseUpdates;