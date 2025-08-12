import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Download, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const BulkCaseUpdates = () => {
  const [cases] = useState([
    { id: 1, number: 'CS-2024-001', client: 'Acme Corp', currentStatus: 'In Progress', courtStatus: 'Hearing Scheduled', selected: false },
    { id: 2, number: 'CS-2024-002', client: 'Tech LLC', currentStatus: 'Discovery', courtStatus: 'Evidence Review', selected: false },
    { id: 3, number: 'CS-2024-003', client: 'Green Inc', currentStatus: 'Settlement', courtStatus: 'Mediation Pending', selected: false },
    { id: 4, number: 'CS-2024-004', client: 'Blue Co', currentStatus: 'Filed', courtStatus: 'Case Registered', selected: false },
  ]);

  const [selectedCases, setSelectedCases] = useState<number[]>([]);
  const [newStatus, setNewStatus] = useState('');
  const [updateSource, setUpdateSource] = useState('');

  const statusOptions = [
    'Case Registered',
    'Under Review',
    'Hearing Scheduled', 
    'Evidence Review',
    'Mediation Pending',
    'Settlement Negotiation',
    'Trial Scheduled',
    'Judgment Pending',
    'Case Closed'
  ];

  const toggleCaseSelection = (caseId: number) => {
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

  const updateSelectedCases = () => {
    // Simulate bulk update
    console.log('Updating cases:', selectedCases, 'to status:', newStatus);
  };

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
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllCases}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Clear
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cases.map((case_) => (
                <div key={case_.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedCases.includes(case_.id)}
                      onCheckedChange={() => toggleCaseSelection(case_.id)}
                    />
                    <div>
                      <h4 className="font-medium">{case_.number}</h4>
                      <p className="text-sm text-muted-foreground">{case_.client}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-1">
                      Current: {case_.currentStatus}
                    </Badge>
                    <br />
                    <Badge variant="secondary">
                      Court: {case_.courtStatus}
                    </Badge>
                  </div>
                </div>
              ))}
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
                disabled={selectedCases.length === 0 || !newStatus}
                className="w-full"
              >
                Update {selectedCases.length} Case(s)
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Import Cause List
              </Button>
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Updates
              </Button>
              <Button variant="outline" className="w-full">
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