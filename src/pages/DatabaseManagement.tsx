import React from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Database } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from '@/hooks/use-toast';

const DatabaseManagement = () => {
  const {
    data: backups,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem
  } = useSupabaseData<any>({
    table: 'system_backups',
    select: `
      id,
      backup_type,
      file_path,
      file_size,
      status,
      started_at,
      completed_at,
      error_message,
      created_by
    `,
    realtime: true,
    orderBy: { column: 'started_at', ascending: false }
  });

  const columns = [
    {
      key: 'backup_type',
      label: 'Backup Type',
      sortable: true,
      filterable: true,
      filterOptions: ['Full', 'Incremental', 'Differential', 'Transaction Log']
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: ['IN_PROGRESS', 'COMPLETED', 'FAILED'],
      render: (value: string) => {
        const colors = {
          'IN_PROGRESS': 'bg-yellow-100 text-yellow-800',
          'COMPLETED': 'bg-green-100 text-green-800',
          'FAILED': 'bg-red-100 text-red-800'
        };
        return (
          <Badge className={colors[value as keyof typeof colors]}>
            {value.replace('_', ' ')}
          </Badge>
        );
      }
    },
    {
      key: 'file_size',
      label: 'Size',
      sortable: true,
      render: (value: number) => {
        if (!value) return 'N/A';
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        let i = 0;
        let size = value;
        while (size >= 1024 && i < sizes.length - 1) {
          size /= 1024;
          i++;
        }
        return `${size.toFixed(2)} ${sizes[i]}`;
      }
    },
    {
      key: 'file_path',
      label: 'File Path',
      sortable: false,
      filterable: true,
      render: (value: string) => (
        <span className="text-sm font-mono text-muted-foreground">
          {value?.substring(0, 40)}{value?.length > 40 ? '...' : ''}
        </span>
      )
    },
    {
      key: 'started_at',
      label: 'Started',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleString()
    },
    {
      key: 'completed_at',
      label: 'Completed',
      sortable: true,
      render: (value: string) => value ? new Date(value).toLocaleString() : 'N/A'
    },
    {
      key: 'error_message',
      label: 'Error',
      sortable: false,
      render: (value: string) => (
        value ? (
          <span className="text-sm text-destructive">
            {value.substring(0, 30)}{value.length > 30 ? '...' : ''}
          </span>
        ) : 'None'
      )
    }
  ];

  const fields = [
    { 
      key: 'backup_type', 
      label: 'Backup Type', 
      type: 'select' as const,
      options: ['Full', 'Incremental', 'Differential', 'Transaction Log'],
      required: true 
    },
    { key: 'file_path', label: 'File Path', type: 'text' as const },
    { key: 'file_size', label: 'File Size (bytes)', type: 'number' as const },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'select' as const,
      options: ['IN_PROGRESS', 'COMPLETED', 'FAILED'],
      required: true 
    },
    { key: 'error_message', label: 'Error Message', type: 'textarea' as const }
  ];

  if (loading && !backups?.length) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Database className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Database Management</h1>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading backups...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Database className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Database Management</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-destructive">Error loading backups: {typeof error === 'string' ? error : 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  const exportBackups = () => {
    if (!backups || backups.length === 0) {
      toast({
        title: "No Data",
        description: "There is no data to export.",
        variant: "destructive",
      });
      return;
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(backups);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Backups');
    XLSX.writeFile(workbook, 'database_backups_export.xlsx');
    
    toast({
      title: "Success",
      description: "Backup data exported to Excel successfully.",
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Database className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Database Management</h1>
      </div>
      
      <DataTable
        title="Database Backups"
        columns={columns}
        data={backups || []}
        fields={fields}
        searchPlaceholder="Search backups by type, path, or status..."
        onAdd={addItem}
        onEdit={updateItem}
        onDelete={deleteItem}
        onExport={exportBackups}
        entityName="Backup"
        loading={loading}
      />
    </div>
  );
};

export default DatabaseManagement;