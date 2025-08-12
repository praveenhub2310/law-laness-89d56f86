
import React from 'react';
import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { useDataManager } from '@/hooks/useDataManager';

const Parties = () => {
  const initialPartiesData = [
    {
      id: "PTY-001",
      name: "Michael Johnson",
      type: "Client",
      role: "Plaintiff",
      caseNumber: "CASE-2024-001",
      email: "m.johnson@email.com",
      phone: "+1-555-1001",
      address: "123 Main St, City, State 12345",
      status: "Active",
      joinDate: "2024-01-10",
      notes: "Primary client for personal injury case"
    },
    {
      id: "PTY-002",
      name: "State Insurance Co.",
      type: "Defendant",
      role: "Defendant",
      caseNumber: "CASE-2024-001",
      email: "legal@stateinsurance.com",
      phone: "+1-555-2002",
      address: "456 Insurance Blvd, City, State 12345",
      status: "Active",
      joinDate: "2024-01-10",
      notes: "Insurance company defendant"
    },
    {
      id: "PTY-003",
      name: "Dr. Sarah Mitchell",
      type: "Witness",
      role: "Expert Witness",
      caseNumber: "CASE-2024-001",
      email: "s.mitchell@hospital.com",
      phone: "+1-555-3003",
      address: "789 Medical Center Dr, City, State 12345",
      status: "Confirmed",
      joinDate: "2024-01-11",
      notes: "Medical expert for injury assessment"
    }
  ];

  const {
    data,
    addItem,
    updateItem,
    deleteItem,
    exportData
  } = useDataManager({
    initialData: initialPartiesData,
    entityName: 'Party'
  });

  const columns = [
    {
      key: 'id',
      label: 'Party ID',
      sortable: true,
      filterable: true
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      filterable: true
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      filterable: true,
      filterOptions: ['Client', 'Defendant', 'Witness', 'Attorney'],
      render: (value: string) => {
        const colors = {
          'Client': 'bg-blue-100 text-blue-800',
          'Defendant': 'bg-red-100 text-red-800',
          'Witness': 'bg-green-100 text-green-800',
          'Attorney': 'bg-purple-100 text-purple-800'
        };
        return (
          <Badge className={colors[value as keyof typeof colors]}>
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      filterable: true,
      render: (value: string) => (
        <Badge variant="outline">{value}</Badge>
      )
    },
    {
      key: 'caseNumber',
      label: 'Case Number',
      sortable: true,
      filterable: true
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      filterable: true
    },
    {
      key: 'phone',
      label: 'Phone',
      sortable: true,
      filterable: true
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: ['Active', 'Confirmed', 'Pending', 'Inactive'],
      render: (value: string) => {
        const colors = {
          'Active': 'bg-green-100 text-green-800',
          'Confirmed': 'bg-blue-100 text-blue-800',
          'Pending': 'bg-yellow-100 text-yellow-800',
          'Inactive': 'bg-gray-100 text-gray-800'
        };
        return (
          <Badge className={colors[value as keyof typeof colors]}>
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'joinDate',
      label: 'Join Date',
      sortable: true,
      filterable: true
    }
  ];

  const fields = [
    { key: 'name', label: 'Name', type: 'text' as const, required: true },
    { 
      key: 'type', 
      label: 'Party Type', 
      type: 'select' as const,
      options: ['Client', 'Defendant', 'Witness', 'Attorney'],
      required: true 
    },
    { key: 'role', label: 'Role', type: 'text' as const, required: true },
    { key: 'caseNumber', label: 'Case Number', type: 'text' as const, required: true },
    { key: 'email', label: 'Email', type: 'email' as const, required: true },
    { key: 'phone', label: 'Phone', type: 'tel' as const, required: true },
    { key: 'address', label: 'Address', type: 'textarea' as const },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'select' as const,
      options: ['Active', 'Confirmed', 'Pending', 'Inactive'],
      required: true 
    },
    { key: 'joinDate', label: 'Join Date', type: 'date' as const, required: true },
    { key: 'notes', label: 'Notes', type: 'textarea' as const }
  ];

  return (
    <div className="p-6">
      <DataTable
        title="Manage Parties"
        columns={columns}
        data={data}
        fields={fields}
        searchPlaceholder="Search parties by name, type, or case number..."
        onAdd={addItem}
        onEdit={updateItem}
        onDelete={deleteItem}
        onExport={exportData}
        entityName="Party"
      />
    </div>
  );
};

export default Parties;
