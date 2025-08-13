import React from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from '@/hooks/use-toast';

const SecurityCenter = () => {
  const {
    data: events,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem
  } = useSupabaseData<any>({
    table: 'security_events',
    select: `
      id,
      event_type,
      severity,
      user_id,
      ip_address,
      description,
      details,
      resolved,
      resolved_by,
      created_at,
      resolved_at
    `,
    realtime: true,
    orderBy: { column: 'created_at', ascending: false }
  });

  const columns = [
    {
      key: 'event_type',
      label: 'Event Type',
      sortable: true,
      filterable: true
    },
    {
      key: 'severity',
      label: 'Severity',
      sortable: true,
      filterable: true,
      filterOptions: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      render: (value: string) => {
        const colors = {
          'LOW': 'bg-green-100 text-green-800',
          'MEDIUM': 'bg-yellow-100 text-yellow-800',
          'HIGH': 'bg-orange-100 text-orange-800',
          'CRITICAL': 'bg-red-100 text-red-800'
        };
        return (
          <Badge className={colors[value as keyof typeof colors]}>
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'ip_address',
      label: 'IP Address',
      sortable: true,
      filterable: true
    },
    {
      key: 'description',
      label: 'Description',
      sortable: false,
      filterable: true,
      render: (value: string) => (
        <span className="text-sm">
          {value?.substring(0, 50)}{value?.length > 50 ? '...' : ''}
        </span>
      )
    },
    {
      key: 'resolved',
      label: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: ['true', 'false'],
      render: (value: boolean) => (
        <Badge className={value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
          {value ? 'Resolved' : 'Open'}
        </Badge>
      )
    },
    {
      key: 'created_at',
      label: 'Detected',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleString()
    }
  ];

  const fields = [
    { key: 'event_type', label: 'Event Type', type: 'text' as const, required: true },
    { 
      key: 'severity', 
      label: 'Severity', 
      type: 'select' as const,
      options: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      required: true 
    },
    { key: 'ip_address', label: 'IP Address', type: 'text' as const },
    { key: 'description', label: 'Description', type: 'textarea' as const, required: true },
    { key: 'details', label: 'Details (JSON)', type: 'textarea' as const },
    { 
      key: 'resolved', 
      label: 'Resolved', 
      type: 'select' as const,
      options: [{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }],
      required: true
    }
  ];

  const exportSecurityEvents = () => {
    if (!events || events.length === 0) {
      toast({
        title: "No Data",
        description: "There is no data to export.",
        variant: "destructive",
      });
      return;
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(events);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'SecurityEvents');
    XLSX.writeFile(workbook, 'security_events_export.xlsx');
    
    toast({
      title: "Success",
      description: "Security events exported to Excel successfully.",
    });
  };

  if (loading && !events?.length) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Security Center</h1>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading security events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Security Center</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-destructive">Error loading security events: {typeof error === 'string' ? error : 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Security Center</h1>
      </div>
      
      <DataTable
        title="Security Events"
        columns={columns}
        data={events || []}
        fields={fields}
        searchPlaceholder="Search security events by type, user, or event..."
        onAdd={addItem}
        onEdit={updateItem}
        onDelete={deleteItem}
        onExport={exportSecurityEvents}
        entityName="Security Event"
        loading={loading}
      />
    </div>
  );
};

export default SecurityCenter;