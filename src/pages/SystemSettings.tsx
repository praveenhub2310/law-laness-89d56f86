import React from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Settings } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from '@/hooks/use-toast';

const SystemSettings = () => {
  const {
    data: settings,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem
  } = useSupabaseData<any>({
    table: 'system_settings',
    select: `
      id,
      key,
      value,
      category,
      description,
      updated_by,
      created_at,
      updated_at
    `,
    realtime: true
  });

  const columns = [
    {
      key: 'key',
      label: 'Setting Key',
      sortable: true,
      filterable: true
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      filterable: true,
      filterOptions: ['system', 'security', 'notification', 'ui', 'integration'],
      render: (value: string) => {
        const colors = {
          'system': 'bg-blue-100 text-blue-800',
          'security': 'bg-red-100 text-red-800',
          'notification': 'bg-yellow-100 text-yellow-800',
          'ui': 'bg-green-100 text-green-800',
          'integration': 'bg-purple-100 text-purple-800'
        };
        return (
          <Badge className={colors[value as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
            {value?.toUpperCase()}
          </Badge>
        );
      }
    },
    {
      key: 'value',
      label: 'Value',
      sortable: false,
      filterable: false,
      render: (value: any) => (
        <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
          {typeof value === 'object' ? JSON.stringify(value).substring(0, 50) + '...' : String(value)}
        </span>
      )
    },
    {
      key: 'description',
      label: 'Description',
      sortable: false,
      filterable: true,
      render: (value: string) => (
        <span className="text-sm text-muted-foreground">
          {value?.substring(0, 60)}{value?.length > 60 ? '...' : ''}
        </span>
      )
    },
    {
      key: 'updated_at',
      label: 'Last Updated',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleString()
    }
  ];

  const fields = [
    { key: 'key', label: 'Setting Key', type: 'text' as const, required: true },
    { 
      key: 'category', 
      label: 'Category', 
      type: 'select' as const,
      options: ['system', 'security', 'notification', 'ui', 'integration'],
      required: true 
    },
    { key: 'value', label: 'Value (JSON)', type: 'textarea' as const, required: true },
    { key: 'description', label: 'Description', type: 'textarea' as const }
  ];

  if (loading && !settings?.length) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="h-6 w-6" />
          <h1 className="text-3xl font-bold">System Settings</h1>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="h-6 w-6" />
          <h1 className="text-3xl font-bold">System Settings</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-destructive">Error loading settings: {typeof error === 'string' ? error : 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  const exportSettings = () => {
    if (!settings || settings.length === 0) {
      toast({
        title: "No Data",
        description: "There is no data to export.",
        variant: "destructive",
      });
      return;
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(settings);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Settings');
    XLSX.writeFile(workbook, 'system_settings_export.xlsx');
    
    toast({
      title: "Success",
      description: "Settings data exported to Excel successfully.",
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6" />
        <h1 className="text-3xl font-bold">System Settings</h1>
      </div>
      
      <DataTable
        title="Configuration Settings"
        columns={columns}
        data={settings || []}
        fields={fields}
        searchPlaceholder="Search settings by key, category, or description..."
        onAdd={addItem}
        onEdit={updateItem}
        onDelete={deleteItem}
        onExport={exportSettings}
        entityName="Setting"
        loading={loading}
      />
    </div>
  );
};

export default SystemSettings;