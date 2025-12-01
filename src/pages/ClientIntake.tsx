import React, { useState, useEffect } from 'react';
import { FileUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import DataTable from '@/components/DataTable';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'number' | 'email' | 'tel' | 'case_select';
  options?: string[] | { label: string; value: any }[];
  required?: boolean;
  readonly?: boolean;
}

const ClientIntake = () => {
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [clientData, setClientData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientIntakes();
  }, [refreshTrigger, user]);

  const fetchClientIntakes = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch profiles with role 'client' and join with clients table
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, phone, created_at, is_active')
        .eq('role', 'client')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch additional client details
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*');

      if (clientsError) throw clientsError;

      // Merge the data
      const mergedData = profilesData?.map(profile => {
        const clientDetails = clientsData?.find(c => c.id === profile.id);
        return {
          ...profile,
          ...clientDetails,
          full_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'N/A',
        };
      }) || [];

      setClientData(mergedData);
    } catch (error) {
      console.error('Error fetching client intakes:', error);
      toast.error('Failed to load client intake data');
    } finally {
      setLoading(false);
    }
  };

  const fields: FieldConfig[] = [
    { key: 'first_name', label: 'First Name', type: 'text', required: true },
    { key: 'last_name', label: 'Last Name', type: 'text', required: true },
    { key: 'email', label: 'Email', type: 'email', required: true },
    { key: 'phone', label: 'Phone', type: 'tel', required: false },
    { key: 'client_type', label: 'Client Type', type: 'select', options: ['individual', 'business', 'organization'], required: false },
    { key: 'preferred_contact_method', label: 'Preferred Contact', type: 'select', options: ['email', 'phone', 'sms'], required: false },
    { key: 'emergency_contact_name', label: 'Emergency Contact Name', type: 'text', required: false },
    { key: 'emergency_contact_phone', label: 'Emergency Contact Phone', type: 'tel', required: false },
  ];

  const handleAdd = async (data: any) => {
    try {
      // Note: In a real scenario, you'd need to create the auth user first
      // For now, we'll just show a message
      toast.info('Please use the User Management page to create new client accounts with authentication');
    } catch (error) {
      console.error('Error adding client:', error);
      toast.error('Failed to add client intake');
    }
  };

  const handleUpdate = async (id: string, data: any) => {
    try {
      // Update profile data
      const profileUpdates: any = {};
      if (data.first_name !== undefined) profileUpdates.first_name = data.first_name;
      if (data.last_name !== undefined) profileUpdates.last_name = data.last_name;
      if (data.email !== undefined) profileUpdates.email = data.email;
      if (data.phone !== undefined) profileUpdates.phone = data.phone;

      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', id);

        if (profileError) throw profileError;
      }

      // Update clients table data
      const clientUpdates: any = {};
      if (data.client_type !== undefined) clientUpdates.client_type = data.client_type;
      if (data.preferred_contact_method !== undefined) clientUpdates.preferred_contact_method = data.preferred_contact_method;
      if (data.emergency_contact_name !== undefined) clientUpdates.emergency_contact_name = data.emergency_contact_name;
      if (data.emergency_contact_phone !== undefined) clientUpdates.emergency_contact_phone = data.emergency_contact_phone;

      if (Object.keys(clientUpdates).length > 0) {
        const { error: clientError } = await supabase
          .from('clients')
          .upsert({ id, ...clientUpdates });

        if (clientError) throw clientError;
      }

      toast.success('Client intake updated successfully');
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Failed to update client intake');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Delete from clients table first
      const { error: clientError } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (clientError) throw clientError;

      // Note: Profile deletion requires proper permissions
      toast.success('Client intake deleted successfully');
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Failed to delete client intake');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <FileUp className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Client Intake Forms</h1>
      </div>
      
      <DataTable
        title="Client Intake Management"
        data={clientData}
        columns={[
          { key: 'full_name', label: 'Name', sortable: true },
          { key: 'email', label: 'Email', sortable: true },
          { key: 'phone', label: 'Phone' },
          { key: 'client_type', label: 'Type', filterable: true, filterOptions: ['individual', 'business', 'organization'] },
          { key: 'preferred_contact_method', label: 'Contact Method' },
          { key: 'is_active', label: 'Status', render: (value) => value ? 'Active' : 'Inactive' },
        ]}
        fields={fields}
        onAdd={handleAdd}
        onEdit={handleUpdate}
        onDelete={handleDelete}
        loading={loading}
        searchPlaceholder="Search clients..."
        entityName="client"
      />
    </div>
  );
};

export default ClientIntake;