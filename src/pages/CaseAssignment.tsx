import React, { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { useSupabaseData } from '@/hooks/useSupabaseData';
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

const CaseAssignment = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [lawyers, setLawyers] = useState<Array<{ label: string; value: string }>>([]);
  const [clients, setClients] = useState<Array<{ label: string; value: string }>>([]);

  const { data: cases, loading, updateItem } = useSupabaseData({
    table: 'projects',
    orderBy: { column: 'created_at', ascending: false },
    realtime: true,
  });

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        // Fetch lawyers
        const { data: lawyersData, error: lawyersError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .eq('role', 'advocate');

        if (lawyersError) throw lawyersError;

        const lawyerOptions = lawyersData?.map(lawyer => ({
          label: `${lawyer.first_name || ''} ${lawyer.last_name || ''} (${lawyer.email})`.trim(),
          value: lawyer.id
        })) || [];

        setLawyers(lawyerOptions);

        // Fetch clients
        const { data: clientsData, error: clientsError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .eq('role', 'client');

        if (clientsError) throw clientsError;

        const clientOptions = clientsData?.map(client => ({
          label: `${client.first_name || ''} ${client.last_name || ''} (${client.email})`.trim(),
          value: client.id
        })) || [];

        setClients(clientOptions);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users data');
      }
    };

    fetchUsersData();
  }, []);

  const fields: FieldConfig[] = [
    { key: 'case_number', label: 'Case Number', type: 'text', required: true, readonly: true },
    { key: 'title', label: 'Case Title', type: 'text', required: true, readonly: true },
    { key: 'lawyer_id', label: 'Assigned Lawyer', type: 'select', options: lawyers, required: false },
    { key: 'client_id', label: 'Client', type: 'select', options: clients, readonly: true },
    { key: 'status', label: 'Status', type: 'select', options: ['active', 'pending', 'closed', 'draft'], readonly: true },
  ];

  const handleUpdate = async (id: string, data: any) => {
    await updateItem(id, data);
    setRefreshTrigger(prev => prev + 1);
  };

  // Enrich cases with lawyer and client names
  const enrichedCases = cases.map(caseItem => {
    const lawyer = lawyers.find(l => l.value === caseItem.lawyer_id);
    const client = clients.find(c => c.value === caseItem.client_id);
    
    return {
      ...caseItem,
      lawyer_name: lawyer?.label || 'Unassigned',
      client_name: client?.label || 'N/A'
    };
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <UserPlus className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Assign Lawyers</h1>
      </div>
      
      <DataTable
        title="Case-Lawyer Assignments"
        data={enrichedCases}
        columns={[
          { key: 'case_number', label: 'Case Number', sortable: true },
          { key: 'title', label: 'Case Title', sortable: true },
          { key: 'lawyer_name', label: 'Assigned Lawyer', sortable: true },
          { key: 'client_name', label: 'Client', sortable: true },
          { key: 'status', label: 'Status', filterable: true, filterOptions: ['active', 'pending', 'closed', 'draft'] },
        ]}
        fields={fields}
        onEdit={handleUpdate}
        loading={loading}
        searchPlaceholder="Search cases..."
        entityName="assignment"
      />
    </div>
  );
};

export default CaseAssignment;