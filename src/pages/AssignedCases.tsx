import React, { useState } from 'react';
import { Briefcase } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import DataTable from '@/components/DataTable';
import { useSupabaseData } from '@/hooks/useSupabaseData';

interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'number' | 'email' | 'tel' | 'case_select';
  options?: string[] | { label: string; value: any }[];
  required?: boolean;
  readonly?: boolean;
}

const AssignedCases = () => {
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { data: cases, loading, addItem, updateItem, deleteItem } = useSupabaseData({
    table: 'projects',
    filters: user ? [{ column: 'lawyer_id', operator: 'eq', value: user.id }] : [],
    orderBy: { column: 'created_at', ascending: false },
    realtime: true,
  });

  const fields: FieldConfig[] = [
    { key: 'case_number', label: 'Case Number', type: 'text' as const, required: true },
    { key: 'title', label: 'Case Title', type: 'text' as const, required: true },
    { key: 'description', label: 'Description', type: 'textarea' as const },
    { key: 'status', label: 'Status', type: 'select' as const, options: ['active', 'pending', 'closed', 'draft'], required: true },
    { key: 'start_date', label: 'Start Date', type: 'date' as const },
    { key: 'end_date', label: 'End Date', type: 'date' as const },
    { key: 'budget', label: 'Budget', type: 'text' as const },
  ];

  const handleAdd = async (data: any) => {
    await addItem({ ...data, lawyer_id: user?.id });
    setRefreshTrigger(prev => prev + 1);
  };

  const handleUpdate = async (id: string, data: any) => {
    await updateItem(id, data);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDelete = async (id: string) => {
    await deleteItem(id);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Briefcase className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Assigned Cases</h1>
      </div>
      
      <DataTable
        title="Your Assigned Cases"
        data={cases}
        columns={[
          { key: 'case_number', label: 'Case Number', sortable: true },
          { key: 'title', label: 'Title', sortable: true },
          { key: 'status', label: 'Status', filterable: true, filterOptions: ['active', 'pending', 'closed', 'draft'] },
          { key: 'start_date', label: 'Start Date', sortable: true },
        ]}
        fields={fields}
        onAdd={handleAdd}
        onEdit={handleUpdate}
        onDelete={handleDelete}
        loading={loading}
        searchPlaceholder="Search cases..."
        entityName="case"
      />
    </div>
  );
};

export default AssignedCases;
