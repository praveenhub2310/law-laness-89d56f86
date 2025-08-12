
import React from 'react';
import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { useDataManager } from '@/hooks/useDataManager';

const Invoices = () => {
  const initialInvoicesData = [
    {
      id: "INV-2024-001",
      clientName: "Michael Johnson",
      caseNumber: "CASE-2024-001",
      amount: "$5,250.00",
      issueDate: "2024-01-10",
      dueDate: "2024-01-25",
      status: "Paid",
      paymentMethod: "Bank Transfer",
      description: "Legal consultation and case preparation",
      hours: 15,
      hourlyRate: "$350.00",
      taxAmount: "$525.00"
    },
    {
      id: "INV-2024-002",
      clientName: "Robert Smith",
      caseNumber: "CASE-2024-002",
      amount: "$3,800.00",
      issueDate: "2024-01-08",
      dueDate: "2024-01-23",
      status: "Pending",
      paymentMethod: "Check",
      description: "Property dispute legal services",
      hours: 12,
      hourlyRate: "$300.00",
      taxAmount: "$380.00"
    },
    {
      id: "INV-2024-003",
      clientName: "TechCorp Inc.",
      caseNumber: "CASE-2024-003",
      amount: "$12,500.00",
      issueDate: "2024-01-05",
      dueDate: "2024-01-20",
      status: "Overdue",
      paymentMethod: "Corporate Transfer",
      description: "Corporate contract review and analysis",
      hours: 35,
      hourlyRate: "$350.00",
      taxAmount: "$1,250.00"
    }
  ];

  const {
    data,
    addItem,
    updateItem,
    deleteItem,
    exportData
  } = useDataManager({
    initialData: initialInvoicesData,
    entityName: 'Invoice'
  });

  const columns = [
    {
      key: 'id',
      label: 'Invoice #',
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
      key: 'caseNumber',
      label: 'Case Number',
      sortable: true,
      filterable: true
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      filterable: true
    },
    {
      key: 'issueDate',
      label: 'Issue Date',
      sortable: true,
      filterable: true
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      sortable: true,
      filterable: true
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: ['Paid', 'Pending', 'Overdue', 'Draft'],
      render: (value: string) => {
        const colors = {
          'Paid': 'bg-green-100 text-green-800',
          'Pending': 'bg-yellow-100 text-yellow-800',
          'Overdue': 'bg-red-100 text-red-800',
          'Draft': 'bg-gray-100 text-gray-800'
        };
        return (
          <Badge className={colors[value as keyof typeof colors]}>
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'paymentMethod',
      label: 'Payment Method',
      sortable: true,
      filterable: true
    },
    {
      key: 'hours',
      label: 'Hours',
      sortable: true,
      filterable: true
    },
    {
      key: 'hourlyRate',
      label: 'Rate/Hour',
      sortable: true,
      filterable: true
    }
  ];

  const fields = [
    { key: 'clientName', label: 'Client Name', type: 'text' as const, required: true },
    { key: 'caseNumber', label: 'Case Number', type: 'text' as const, required: true },
    { key: 'amount', label: 'Amount', type: 'text' as const, required: true },
    { key: 'issueDate', label: 'Issue Date', type: 'date' as const, required: true },
    { key: 'dueDate', label: 'Due Date', type: 'date' as const, required: true },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'select' as const,
      options: ['Paid', 'Pending', 'Overdue', 'Draft'],
      required: true 
    },
    { 
      key: 'paymentMethod', 
      label: 'Payment Method', 
      type: 'select' as const,
      options: ['Bank Transfer', 'Check', 'Corporate Transfer', 'Credit Card', 'Cash']
    },
    { key: 'description', label: 'Description', type: 'textarea' as const, required: true },
    { key: 'hours', label: 'Hours', type: 'number' as const, required: true },
    { key: 'hourlyRate', label: 'Hourly Rate', type: 'text' as const, required: true },
    { key: 'taxAmount', label: 'Tax Amount', type: 'text' as const }
  ];

  return (
    <div className="p-6">
      <DataTable
        title="Invoices Management"
        columns={columns}
        data={data}
        fields={fields}
        searchPlaceholder="Search invoices by client name, case number, or invoice ID..."
        onAdd={addItem}
        onEdit={updateItem}
        onDelete={deleteItem}
        onExport={exportData}
        entityName="Invoice"
      />
    </div>
  );
};

export default Invoices;
