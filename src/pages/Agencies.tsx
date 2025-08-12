import React from 'react';
import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { useDataManager } from '@/hooks/useDataManager';

const Agencies = () => {
  const initialAgenciesData = [
    {
      id: "AGE-001",
      name: "Smith & Associates Law Firm",
      type: "Law Firm",
      contactPerson: "David Smith",
      email: "david@smithlaw.com",
      phone: "+1-555-0101",
      address: "123 Legal Street, City, State 12345",
      specialization: "Corporate Law",
      status: "Active",
      partnership: "Preferred",
      cases: 12,
      lastContact: "2024-01-10"
    },
    {
      id: "AGE-002", 
      name: "Metro Court Services",
      type: "Court Agency",
      contactPerson: "Jennifer Brown",
      email: "j.brown@metrocourt.gov",
      phone: "+1-555-0202",
      address: "456 Justice Ave, City, State 12345",
      specialization: "Court Proceedings",
      status: "Active",
      partnership: "Official",
      cases: 28,
      lastContact: "2024-01-08"
    },
    {
      id: "AGE-003",
      name: "Legal Document Services",
      type: "Service Provider",
      contactPerson: "Michael Johnson",
      email: "m.johnson@legaldocs.com",
      phone: "+1-555-0303",
      address: "789 Document Blvd, City, State 12345",
      specialization: "Document Processing",
      status: "Inactive",
      partnership: "Standard",
      cases: 5,
      lastContact: "2023-12-15"
    }
  ];

  const {
    data,
    addItem,
    updateItem,
    deleteItem,
    exportData
  } = useDataManager({
    initialData: initialAgenciesData,
    entityName: 'Agency'
  });

  const columns = [
    {
      key: 'id',
      label: 'Agency ID',
      sortable: true,
      filterable: true,
      className: 'min-w-[100px]'
    },
    {
      key: 'name',
      label: 'Agency Name',
      sortable: true,
      filterable: true,
      className: 'min-w-[200px]'
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      filterable: true,
      filterOptions: ['Law Firm', 'Court Agency', 'Service Provider'],
      className: 'min-w-[120px]',
      render: (value: string) => (
        <Badge variant="outline" className="text-xs">{value}</Badge>
      )
    },
    {
      key: 'contactPerson',
      label: 'Contact Person',
      sortable: true,
      filterable: true,
      className: 'min-w-[150px] hidden sm:table-cell'
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      filterable: true,
      className: 'min-w-[200px] hidden md:table-cell'
    },
    {
      key: 'phone',
      label: 'Phone',
      sortable: true,
      filterable: true,
      className: 'min-w-[130px] hidden lg:table-cell'
    },
    {
      key: 'specialization',
      label: 'Specialization',
      sortable: true,
      filterable: true,
      className: 'min-w-[150px] hidden lg:table-cell'
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: ['Active', 'Inactive', 'Pending'],
      className: 'min-w-[100px]',
      render: (value: string) => {
        const colors = {
          'Active': 'bg-green-100 text-green-800',
          'Inactive': 'bg-red-100 text-red-800',
          'Pending': 'bg-yellow-100 text-yellow-800'
        };
        return (
          <Badge className={`${colors[value as keyof typeof colors]} text-xs`}>
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'partnership',
      label: 'Partnership',
      sortable: true,
      filterable: true,
      filterOptions: ['Preferred', 'Official', 'Standard'],
      className: 'min-w-[120px] hidden md:table-cell',
      render: (value: string) => {
        const colors = {
          'Preferred': 'bg-blue-100 text-blue-800',
          'Official': 'bg-purple-100 text-purple-800',
          'Standard': 'bg-gray-100 text-gray-800'
        };
        return (
          <Badge className={`${colors[value as keyof typeof colors]} text-xs`}>
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'cases',
      label: 'Active Cases',
      sortable: true,
      filterable: true,
      className: 'min-w-[110px] hidden xl:table-cell'
    },
    {
      key: 'lastContact',
      label: 'Last Contact',
      sortable: true,
      filterable: true,
      className: 'min-w-[120px] hidden xl:table-cell'
    }
  ];

  const fields = [
    { key: 'name', label: 'Agency Name', type: 'text' as const, required: true },
    { 
      key: 'type', 
      label: 'Agency Type', 
      type: 'select' as const, 
      options: ['Law Firm', 'Court Agency', 'Service Provider'],
      required: true 
    },
    { key: 'contactPerson', label: 'Contact Person', type: 'text' as const, required: true },
    { key: 'email', label: 'Email', type: 'email' as const, required: true },
    { key: 'phone', label: 'Phone', type: 'tel' as const, required: true },
    { key: 'address', label: 'Address', type: 'textarea' as const },
    { key: 'specialization', label: 'Specialization', type: 'text' as const },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'select' as const,
      options: ['Active', 'Inactive', 'Pending'],
      required: true 
    },
    { 
      key: 'partnership', 
      label: 'Partnership Level', 
      type: 'select' as const,
      options: ['Preferred', 'Official', 'Standard'],
      required: true 
    },
    { key: 'cases', label: 'Active Cases', type: 'number' as const },
    { key: 'lastContact', label: 'Last Contact Date', type: 'date' as const }
  ];

  return (
    <div className="p-3 sm:p-6">
      <DataTable
        title="Agencies Management"
        columns={columns}
        data={data}
        fields={fields}
        searchPlaceholder="Search agencies by name, type, or contact person..."
        onAdd={addItem}
        onEdit={updateItem}
        onDelete={deleteItem}
        onExport={exportData}
        entityName="Agency"
        className="overflow-x-auto"
      />
    </div>
  );
};

export default Agencies;
