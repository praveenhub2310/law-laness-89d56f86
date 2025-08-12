
import React from 'react';
import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { useDataManager } from '@/hooks/useDataManager';

const SystemLog = () => {
  const initialLogsData = [
    {
      id: "LOG-001",
      timestamp: "2024-01-12 09:30:45",
      level: "INFO",
      module: "Authentication",
      user: "sarah.wilson",
      action: "User Login",
      ipAddress: "192.168.1.100",
      userAgent: "Chrome 120.0.0.0",
      status: "Success",
      details: "Successful login with 2FA",
      sessionId: "SES-ABC123"
    },
    {
      id: "LOG-002",
      timestamp: "2024-01-12 09:25:12",
      level: "WARNING",
      module: "Document Management",
      user: "john.davis",
      action: "Document Access",
      ipAddress: "192.168.1.105",
      userAgent: "Firefox 121.0.1",
      status: "Blocked",
      details: "Attempted access to restricted document",
      sessionId: "SES-DEF456"
    },
    {
      id: "LOG-003",
      timestamp: "2024-01-12 09:20:33",
      level: "ERROR",
      module: "Database",
      user: "System",
      action: "Database Query",
      ipAddress: "127.0.0.1",
      userAgent: "System Process",
      status: "Failed",
      details: "Connection timeout during backup operation",
      sessionId: "SYS-789"
    },
    {
      id: "LOG-004",
      timestamp: "2024-01-12 09:15:22",
      level: "INFO",
      module: "Case Management",
      user: "emily.brown",
      action: "Case Update",
      ipAddress: "192.168.1.110",
      userAgent: "Edge 120.0.2210.144",
      status: "Success",
      details: "Updated case CASE-2024-001 status",
      sessionId: "SES-GHI789"
    },
    {
      id: "LOG-005",
      timestamp: "2024-01-12 09:10:15",
      level: "CRITICAL",
      module: "Security",
      user: "Unknown",
      action: "Login Attempt",
      ipAddress: "203.0.113.195",
      userAgent: "Unknown Bot",
      status: "Blocked",
      details: "Multiple failed login attempts detected",
      sessionId: "N/A"
    }
  ];

  const {
    data,
    addItem,
    updateItem,
    deleteItem,
    exportData
  } = useDataManager({
    initialData: initialLogsData,
    entityName: 'Log Entry'
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
      key: 'user',
      label: 'User',
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
      key: 'ipAddress',
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
        <span className="text-sm text-gray-600">{value.substring(0, 30)}...</span>
      )
    }
  ];

  const fields = [
    { key: 'timestamp', label: 'Timestamp', type: 'text' as const, required: true },
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
    { key: 'user', label: 'User', type: 'text' as const, required: true },
    { key: 'action', label: 'Action', type: 'text' as const, required: true },
    { key: 'ipAddress', label: 'IP Address', type: 'text' as const },
    { key: 'userAgent', label: 'User Agent', type: 'text' as const },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'select' as const,
      options: ['Success', 'Failed', 'Blocked', 'Pending'],
      required: true 
    },
    { key: 'details', label: 'Details', type: 'textarea' as const },
    { key: 'sessionId', label: 'Session ID', type: 'text' as const }
  ];

  return (
    <div className="p-6">
      <DataTable
        title="System Activity Log"
        columns={columns}
        data={data}
        fields={fields}
        searchPlaceholder="Search logs by user, action, or module..."
        onAdd={addItem}
        onEdit={updateItem}
        onDelete={deleteItem}
        onExport={exportData}
        entityName="Log Entry"
      />
    </div>
  );
};

export default SystemLog;
