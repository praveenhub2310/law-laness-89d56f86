import React, { useEffect } from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

const UserManagement = () => {
  const {
    data: users,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem
  } = useSupabaseData<any>({
    table: 'profiles',
    select: `
      id,
      email,
      first_name,
      last_name,
      phone,
      role,
      company_id,
      is_active,
      created_at,
      updated_at
    `,
    realtime: true
  });

  const columns = [
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      filterable: true
    },
    {
      key: 'first_name',
      label: 'First Name',
      sortable: true,
      filterable: true
    },
    {
      key: 'last_name',
      label: 'Last Name',
      sortable: true,
      filterable: true
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      filterable: true,
      filterOptions: ['super_admin', 'company', 'advocate', 'client'],
      render: (value: string) => {
        const colors = {
          'super_admin': 'bg-purple-100 text-purple-800',
          'company': 'bg-blue-100 text-blue-800',
          'advocate': 'bg-green-100 text-green-800',
          'client': 'bg-gray-100 text-gray-800'
        };
        return (
          <Badge className={colors[value as keyof typeof colors]}>
            {value?.replace('_', ' ').toUpperCase()}
          </Badge>
        );
      }
    },
    {
      key: 'phone',
      label: 'Phone',
      sortable: true,
      filterable: true
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: [true, false],
      render: (value: boolean) => (
        <Badge className={value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  const fields = [
    { key: 'email', label: 'Email', type: 'email' as const, required: true },
    { key: 'first_name', label: 'First Name', type: 'text' as const, required: true },
    { key: 'last_name', label: 'Last Name', type: 'text' as const, required: true },
    { 
      key: 'role', 
      label: 'Role', 
      type: 'select' as const,
      options: ['super_admin', 'company', 'advocate', 'client'],
      required: true 
    },
    { key: 'phone', label: 'Phone', type: 'tel' as const },
    { 
      key: 'is_active', 
      label: 'Active Status', 
      type: 'select' as const,
      options: [{ label: 'Active', value: true }, { label: 'Inactive', value: false }],
      required: true 
    }
  ];

  if (loading && !users?.length) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Users className="h-6 w-6" />
          <h1 className="text-3xl font-bold">User Management</h1>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Users className="h-6 w-6" />
          <h1 className="text-3xl font-bold">User Management</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-destructive">Error loading users: {typeof error === 'string' ? error : 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-6 w-6" />
        <h1 className="text-3xl font-bold">User Management</h1>
      </div>
      
      <DataTable
        title="System Users"
        columns={columns}
        data={users || []}
        fields={fields}
        searchPlaceholder="Search users by name, email, or role..."
        onAdd={addItem}
        onEdit={updateItem}
        onDelete={deleteItem}
        entityName="User"
        loading={loading}
      />
    </div>
  );
};

export default UserManagement;