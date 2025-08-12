import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import DataTable from '@/components/DataTable';
import { Calendar, Download, RefreshCw, Search, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const CourtCauseList = () => {
  const [searchDate, setSearchDate] = useState('');
  const [courtName, setCourtName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const mockCauseListData = [
    {
      id: '1',
      caseNumber: 'CC/245/2024',
      caseTitle: 'ABC Corp vs XYZ Ltd',
      court: 'Delhi High Court',
      judge: 'Hon\'ble Justice R.K. Sharma',
      hearingDate: '2024-01-15',
      hearingTime: '10:30 AM',
      status: 'Listed',
      caseType: 'Commercial Dispute',
      lastUpdate: '2024-01-10'
    },
    {
      id: '2', 
      caseNumber: 'CRL/156/2024',
      caseTitle: 'State vs John Doe',
      court: 'Sessions Court Delhi',
      judge: 'Hon\'ble Justice M.L. Verma',
      hearingDate: '2024-01-15',
      hearingTime: '11:00 AM',
      status: 'Adjourned',
      caseType: 'Criminal',
      lastUpdate: '2024-01-08'
    },
    {
      id: '3',
      caseNumber: 'MAT/789/2024',
      caseTitle: 'Priya Sharma vs Rajesh Sharma',
      court: 'Family Court Delhi',
      judge: 'Hon\'ble Justice S.K. Singh',
      hearingDate: '2024-01-16',
      hearingTime: '2:00 PM',
      status: 'Final Arguments',
      caseType: 'Matrimonial',
      lastUpdate: '2024-01-12'
    }
  ];

  const [causeListData, setCauseListData] = useState(mockCauseListData);

  const columns = [
    {
      key: 'caseNumber',
      label: 'Case Number',
      sortable: true
    },
    {
      key: 'caseTitle',
      label: 'Case Title',
      sortable: true
    },
    {
      key: 'court',
      label: 'Court',
      sortable: true
    },
    {
      key: 'judge',
      label: 'Judge',
      sortable: true
    },
    {
      key: 'hearingDate',
      label: 'Hearing Date',
      sortable: true
    },
    {
      key: 'hearingTime',
      label: 'Time',
      sortable: false
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <Badge 
          variant={
            value === 'Listed' ? 'default' : 
            value === 'Adjourned' ? 'destructive' : 
            'secondary'
          }
        >
          {value}
        </Badge>
      )
    },
    {
      key: 'caseType',
      label: 'Type',
      sortable: true
    }
  ];

  const handleFetchCauseList = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Cause List Updated",
        description: "Latest cause list data has been fetched and case statuses updated",
      });
    }, 2000);
  };

  const handleSyncDatabase = () => {
    toast({
      title: "Database Sync Initiated",
      description: "Case statuses are being updated in the database",
    });
  };

  const handleExportCauseList = () => {
    // Create CSV content
    const headers = ['Case Number', 'Case Title', 'Court', 'Judge', 'Hearing Date', 'Time', 'Status', 'Type'];
    const csvContent = [
      headers.join(','),
      ...causeListData.map(row => [
        row.caseNumber,
        `"${row.caseTitle}"`,
        `"${row.court}"`,
        `"${row.judge}"`,
        row.hearingDate,
        `"${row.hearingTime}"`,
        row.status,
        `"${row.caseType}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cause-list-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Cause list has been downloaded as CSV file",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Court Cause List Integration</h1>
          <p className="text-muted-foreground">Fetch and integrate court cause lists to auto-update case statuses</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Fetch Cause List
          </CardTitle>
          <CardDescription>
            Search and fetch cause list from court websites
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Court Name (e.g., Delhi High Court)"
              value={courtName}
              onChange={(e) => setCourtName(e.target.value)}
            />
            <Input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
            />
            <Button onClick={handleFetchCauseList} disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Fetching...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Fetch Cause List
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Today's Cause List</CardTitle>
          <div className="flex gap-2">
            <Button onClick={handleSyncDatabase} variant="outline" size="sm">
              <CheckCircle className="mr-2 h-4 w-4" />
              Sync Database
            </Button>
            <Button onClick={handleExportCauseList} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            title="Court Cause List"
            data={causeListData}
            columns={columns}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Cases Listed Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {causeListData.filter(item => item.status === 'Listed').length}
            </div>
            <p className="text-muted-foreground text-sm">Active hearings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Adjourned Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">
              {causeListData.filter(item => item.status === 'Adjourned').length}
            </div>
            <p className="text-muted-foreground text-sm">Postponed hearings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Courts Covered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {new Set(causeListData.map(item => item.court)).size}
            </div>
            <p className="text-muted-foreground text-sm">Different courts</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CourtCauseList;