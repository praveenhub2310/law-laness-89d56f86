
import React from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

const SystemLog = () => {
  const {
    data: logs,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem
  } = useSupabaseData<any>({
    table: 'system_logs',
    select: `
      id,
      timestamp,
      level,
      module,
      user_id,
      action,
      ip_address,
      user_agent,
      status,
      details,
      session_id,
      created_at
    `,
    realtime: true,
    orderBy: { column: 'timestamp', ascending: false }
  });

  const columns = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      sortable: true,
      filterable: true
    },
    {
      key: 'level',
      label: 'Level',
      sortable: true,
      filterable: true,
      filterOptions: ['INFO', 'WARNING', 'ERROR', 'CRITICAL', 'DEBUG'],
      render: (value: string) => {
        const colors = {
          'INFO': 'bg-blue-100 text-blue-800',
          'WARNING': 'bg-yellow-100 text-yellow-800',
          'ERROR': 'bg-red-100 text-red-800',
          'CRITICAL': 'bg-red-200 text-red-900',
          'DEBUG': 'bg-gray-100 text-gray-800'
        };
        return (
          <Badge className={colors[value as keyof typeof colors]}>
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'module',
      label: 'Module',
      sortable: true,
      filterable: true,
      filterOptions: ['Authentication', 'Document Management', 'Database', 'Case Management', 'Security'],
      render: (value: string) => (
        <Badge variant="outline">{value}</Badge>
      )
    },
    {
      key: 'user_id',
      label: 'User ID',
      sortable: true,
      filterable: true
    },
    {
      key: 'action',
      label: 'Action',
      sortable: true,
      filterable: true
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: ['Success', 'Failed', 'Blocked', 'Pending'],
      render: (value: string) => {
        const colors = {
          'Success': 'bg-green-100 text-green-800',
          'Failed': 'bg-red-100 text-red-800',
          'Blocked': 'bg-orange-100 text-orange-800',
          'Pending': 'bg-yellow-100 text-yellow-800'
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
      key: 'details',
      label: 'Details',
      sortable: false,
      filterable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-600">{value?.substring(0, 30)}{value?.length > 30 ? '...' : ''}</span>
      )
    }
  ];

  const fields = [
    { 
      key: 'level', 
      label: 'Log Level', 
      type: 'select' as const,
      options: ['INFO', 'WARNING', 'ERROR', 'CRITICAL', 'DEBUG'],
      required: true 
    },
    { 
      key: 'module', 
      label: 'Module', 
      type: 'select' as const,
      options: ['Authentication', 'Document Management', 'Database', 'Case Management', 'Security'],
      required: true 
    },
    { key: 'action', label: 'Action', type: 'text' as const, required: true },
    { key: 'ip_address', label: 'IP Address', type: 'text' as const },
    { key: 'user_agent', label: 'User Agent', type: 'text' as const },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'select' as const,
      options: ['Success', 'Failed', 'Blocked', 'Pending'],
      required: true 
    },
    { key: 'details', label: 'Details', type: 'textarea' as const },
    { key: 'session_id', label: 'Session ID', type: 'text' as const }
  ];

  if (loading && !logs?.length) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="h-6 w-6" />
          <h1 className="text-3xl font-bold">System Logs</h1>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading logs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="h-6 w-6" />
          <h1 className="text-3xl font-bold">System Logs</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-destructive">Error loading logs: {typeof error === 'string' ? error : 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="h-6 w-6" />
        <h1 className="text-3xl font-bold">System Logs</h1>
      </div>
      
      <DataTable
        title="System Activity Log"
        columns={columns}
        data={logs || []}
        fields={fields}
        searchPlaceholder="Search logs by action, module, or details..."
        onAdd={addItem}
        onEdit={updateItem}
        onDelete={deleteItem}
        entityName="Log Entry"
        loading={loading}
      />
    </div>
  );
};

export default SystemLog;
