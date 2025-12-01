import React, { useState } from 'react';
import { Users } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { toast } from 'sonner';

interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'number' | 'email' | 'tel' | 'case_select';
  options?: string[] | { label: string; value: any }[];
  required?: boolean;
  readonly?: boolean;
}

const TeamManagement = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { data: teamMembers, loading, updateItem, deleteItem } = useSupabaseData({
    table: 'profiles',
    orderBy: { column: 'created_at', ascending: false },
    realtime: true,
  });

  const fields: FieldConfig[] = [
    { key: 'first_name', label: 'First Name', type: 'text', required: true },
    { key: 'last_name', label: 'Last Name', type: 'text', required: true },
    { key: 'email', label: 'Email', type: 'email', required: true, readonly: true },
    { key: 'phone', label: 'Phone', type: 'tel', required: false },
    { key: 'role', label: 'Role', type: 'select', options: ['super_admin', 'company', 'advocate', 'client'], required: true },
    { key: 'is_active', label: 'Status', type: 'select', options: [
      { label: 'Active', value: true },
      { label: 'Inactive', value: false }
    ], required: true },
  ];

  const handleAdd = async () => {
    toast.info('To add new team members, please use the User Management page which handles authentication setup.');
  };

  const handleUpdate = async (id: string, data: any) => {
    try {
      await updateItem(id, data);
      toast.success('Team member updated successfully');
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error updating team member:', error);
      toast.error('Failed to update team member');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteItem(id);
      toast.success('Team member removed successfully');
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast.error('Failed to remove team member');
    }
  };

  // Enrich team members with full name
  const enrichedTeamMembers = teamMembers.map((member: any) => ({
    ...member,
    full_name: `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'N/A',
    status_label: member.is_active ? 'Active' : 'Inactive',
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Users className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Team Management</h1>
      </div>
      
      <DataTable
        title="Manage Your Legal Team"
        data={enrichedTeamMembers}
        columns={[
          { key: 'full_name', label: 'Name', sortable: true },
          { key: 'email', label: 'Email', sortable: true },
          { key: 'phone', label: 'Phone' },
          { key: 'role', label: 'Role', filterable: true, filterOptions: ['super_admin', 'company', 'advocate', 'client'] },
          { key: 'status_label', label: 'Status', filterable: true, filterOptions: ['Active', 'Inactive'] },
        ]}
        fields={fields}
        onAdd={handleAdd}
        onEdit={handleUpdate}
        onDelete={handleDelete}
        loading={loading}
        searchPlaceholder="Search team members..."
        entityName="team member"
      />
    </div>
  );
};

export default TeamManagement;
