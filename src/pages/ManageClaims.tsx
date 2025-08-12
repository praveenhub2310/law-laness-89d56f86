
import React from 'react';
import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { useDataManager } from '@/hooks/useDataManager';

const ManageClaims = () => {
  const initialClaimsData = [
    {
      id: "CLM-2024-001",
      claimNumber: "INS-2024-001",
      clientName: "Michael Johnson",
      caseNumber: "CASE-2024-001",
      insuranceCompany: "State Insurance Co.",
      claimType: "Personal Injury",
      dateOfIncident: "2023-12-15",
      dateFiled: "2024-01-10",
      claimAmount: "$125,000.00",
      status: "Under Review",
      assignedTo: "Sarah Wilson",
      priority: "High",
      lastUpdate: "2024-01-12",
      expectedResolution: "2024-02-15"
    },
    {
      id: "CLM-2024-002",
      claimNumber: "INS-2024-002",
      clientName: "Robert Smith",
      caseNumber: "CASE-2024-002",
      insuranceCompany: "Global Insurance",
      claimType: "Property Damage",
      dateOfIncident: "2023-12-20",
      dateFiled: "2024-01-08",
      claimAmount: "$45,000.00",
      status: "Approved",
      assignedTo: "John Davis",
      priority: "Medium",
      lastUpdate: "2024-01-11",
      expectedResolution: "2024-01-30"
    },
    {
      id: "CLM-2024-003",
      claimNumber: "INS-2024-003",
      clientName: "TechCorp Inc.",
      caseNumber: "CASE-2024-003",
      insuranceCompany: "Business Shield Insurance",
      claimType: "Professional Liability",
      dateOfIncident: "2023-11-30",
      dateFiled: "2024-01-05",
      claimAmount: "$250,000.00",
      status: "Disputed",
      assignedTo: "Emily Brown",
      priority: "High",
      lastUpdate: "2024-01-10",
      expectedResolution: "2024-03-01"
    },
    {
      id: "CLM-2024-004",
      claimNumber: "INS-2024-004",
      clientName: "Global Industries",
      caseNumber: "CASE-2024-004",
      insuranceCompany: "Commercial Coverage Corp",
      claimType: "Workers Compensation",
      dateOfIncident: "2024-01-01",
      dateFiled: "2024-01-09",
      claimAmount: "$75,000.00",
      status: "Pending Documentation",
      assignedTo: "Sarah Wilson",
      priority: "Medium",
      lastUpdate: "2024-01-09",
      expectedResolution: "2024-02-10"
    }
  ];

  const {
    data,
    addItem,
    updateItem,
    deleteItem,
    exportData
  } = useDataManager({
    initialData: initialClaimsData,
    entityName: 'Claim'
  });

  const columns = [
    {
      key: 'claimNumber',
      label: 'Claim Number',
      sortable: true,
      filterable: true
    },
    {
      key: 'clientName',
      label: 'Client Name',
      sortable: true,
      filterable: true
    },
    {
      key: 'insuranceCompany',
      label: 'Insurance Company',
      sortable: true,
      filterable: true
    },
    {
      key: 'claimType',
      label: 'Claim Type',
      sortable: true,
      filterable: true,
      filterOptions: ['Personal Injury', 'Property Damage', 'Professional Liability', 'Workers Compensation'],
      render: (value: string) => {
        const colors = {
          'Personal Injury': 'bg-red-100 text-red-800',
          'Property Damage': 'bg-blue-100 text-blue-800',
          'Professional Liability': 'bg-purple-100 text-purple-800',
          'Workers Compensation': 'bg-green-100 text-green-800'
        };
        return (
          <Badge className={colors[value as keyof typeof colors]}>
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'claimAmount',
      label: 'Claim Amount',
      sortable: true,
      filterable: true,
      render: (value: string) => (
        <span className="font-semibold">{value}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: ['Under Review', 'Approved', 'Disputed', 'Pending Documentation', 'Closed'],
      render: (value: string) => {
        const colors = {
          'Under Review': 'bg-yellow-100 text-yellow-800',
          'Approved': 'bg-green-100 text-green-800',
          'Disputed': 'bg-red-100 text-red-800',
          'Pending Documentation': 'bg-blue-100 text-blue-800',
          'Closed': 'bg-gray-100 text-gray-800'
        };
        return (
          <Badge className={colors[value as keyof typeof colors]}>
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      filterable: true,
      filterOptions: ['High', 'Medium', 'Low'],
      render: (value: string) => {
        const colors = {
          'High': 'bg-red-100 text-red-800',
          'Medium': 'bg-yellow-100 text-yellow-800',
          'Low': 'bg-green-100 text-green-800'
        };
        return (
          <Badge className={colors[value as keyof typeof colors]}>
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'assignedTo',
      label: 'Assigned To',
      sortable: true,
      filterable: true
    },
    {
      key: 'dateFiled',
      label: 'Date Filed',
      sortable: true,
      filterable: true
    },
    {
      key: 'expectedResolution',
      label: 'Expected Resolution',
      sortable: true,
      filterable: true
    }
  ];

  const fields = [
    { key: 'claimNumber', label: 'Claim Number', type: 'text' as const, required: true },
    { key: 'clientName', label: 'Client Name', type: 'text' as const, required: true },
    { key: 'caseNumber', label: 'Case Number', type: 'text' as const },
    { key: 'insuranceCompany', label: 'Insurance Company', type: 'text' as const, required: true },
    { 
      key: 'claimType', 
      label: 'Claim Type', 
      type: 'select' as const,
      options: ['Personal Injury', 'Property Damage', 'Professional Liability', 'Workers Compensation'],
      required: true 
    },
    { key: 'dateOfIncident', label: 'Date of Incident', type: 'date' as const, required: true },
    { key: 'dateFiled', label: 'Date Filed', type: 'date' as const, required: true },
    { key: 'claimAmount', label: 'Claim Amount', type: 'text' as const, required: true },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'select' as const,
      options: ['Under Review', 'Approved', 'Disputed', 'Pending Documentation', 'Closed'],
      required: true 
    },
    { key: 'assignedTo', label: 'Assigned To', type: 'text' as const, required: true },
    { 
      key: 'priority', 
      label: 'Priority', 
      type: 'select' as const,
      options: ['High', 'Medium', 'Low'],
      required: true 
    },
    { key: 'lastUpdate', label: 'Last Update', type: 'date' as const },
    { key: 'expectedResolution', label: 'Expected Resolution', type: 'date' as const }
  ];

  return (
    <div className="p-6">
      <DataTable
        title="Insurance Claims Management"
        columns={columns}
        data={data}
        fields={fields}
        searchPlaceholder="Search claims by number, client, or insurance company..."
        onAdd={addItem}
        onEdit={updateItem}
        onDelete={deleteItem}
        onExport={exportData}
        entityName="Claim"
      />
    </div>
  );
};

export default ManageClaims;
