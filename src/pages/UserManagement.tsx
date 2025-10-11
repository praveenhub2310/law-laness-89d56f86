import React, { useEffect } from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

  // Custom add function to create users properly
  const handleAddUser = async (userData: any) => {
    try {
      console.log('Creating user with data:', userData);
      
      // Create user using signup (this creates both auth user and profile)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            role: userData.role
          }
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        toast({
          title: "Error",
          description: `Failed to create user: ${authError.message}`,
          variant: "destructive",
        });
        return;
      }

      if (authData.user) {
        // Wait a moment for the trigger to create the profile
        setTimeout(async () => {
          console.log('Checking if profile was created for user:', authData.user.id);
          
          // First check if profile exists
          const { data: existingProfile, error: checkError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          console.log('Existing profile:', existingProfile);
          console.log('Check error:', checkError);

          if (checkError && checkError.code === 'PGRST116') {
            // Profile doesn't exist, create it manually
            console.log('Profile not found, creating manually...');
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: authData.user.id,
                email: userData.email,
                first_name: userData.first_name,
                last_name: userData.last_name,
                phone: userData.phone || null,
                role: userData.role,
                is_active: userData.is_active === 'true' || userData.is_active === true
              });

            if (insertError) {
              console.error('Insert error:', insertError);
              toast({
                title: "Error",
                description: `Failed to create profile: ${insertError.message}`,
                variant: "destructive",
              });
            } else {
              toast({
                title: "Success",
                description: "User created successfully!",
              });
              // Refresh the data to show new user
              window.location.reload();
            }
          } else if (existingProfile) {
            // Profile exists, update it
            console.log('Profile exists, updating...');
            const { error: profileError } = await supabase
              .from('profiles')
              .update({
                first_name: userData.first_name,
                last_name: userData.last_name,
                phone: userData.phone || null,
                role: userData.role,
                is_active: userData.is_active === 'true' || userData.is_active === true
              })
              .eq('id', authData.user.id);

            if (profileError) {
              console.error('Profile error:', profileError);
              toast({
                title: "Warning", 
                description: "User created but profile update failed. Please update manually.",
                variant: "destructive",
              });
            } else {
              toast({
                title: "Success",
                description: "User created successfully!",
              });
              // Refresh the data to show new user
              window.location.reload();
            }
          }
        }, 3000);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating the user.",
        variant: "destructive",
      });
    }
  };

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
    { key: 'password', label: 'Password', type: 'text' as const, required: true },
    { key: 'first_name', label: 'First Name', type: 'text' as const, required: true },
    { key: 'last_name', label: 'Last Name', type: 'text' as const, required: true },
    { 
      key: 'role', 
      label: 'Role', 
      type: 'select' as const,
      options: [
        { label: 'Super Admin', value: 'super_admin' },
        { label: 'Company', value: 'company' },
        { label: 'Advocate', value: 'advocate' },
        { label: 'Client', value: 'client' }
      ],
      required: true 
    },
    { key: 'phone', label: 'Phone', type: 'tel' as const },
    { 
      key: 'is_active', 
      label: 'Active Status', 
      type: 'select' as const,
      options: [{ label: 'Active', value: 'true' }, { label: 'Inactive', value: 'false' }],
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

  const exportUsers = () => {
    if (!users || users.length === 0) {
      toast({
        title: "No Data",
        description: "There is no data to export.",
        variant: "destructive",
      });
      return;
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(users);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    XLSX.writeFile(workbook, 'users_export.xlsx');
    
    toast({
      title: "Success",
      description: "Users data exported to Excel successfully.",
    });
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <Users className="h-5 w-5 sm:h-6 sm:w-6" />
        <h1 className="text-2xl sm:text-3xl font-bold">User Management</h1>
      </div>
      
      <DataTable
        title="System Users"
        columns={columns}
        data={users || []}
        fields={fields}
        searchPlaceholder="Search users by name, email, or role..."
        onAdd={handleAddUser}
        onEdit={updateItem}
        onDelete={deleteItem}
        onExport={exportUsers}
        entityName="User"
        loading={loading}
      />
    </div>
  );
};

export default UserManagement;