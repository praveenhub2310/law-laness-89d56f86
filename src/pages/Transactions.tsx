
import React from 'react';
import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { useDataManager } from '@/hooks/useDataManager';

const Transactions = () => {
  const initialTransactionsData = [
    {
      id: "TXN-2024-001",
      date: "2024-01-12",
      time: "09:30 AM",
      type: "Payment Received",
      clientName: "Michael Johnson",
      caseNumber: "CASE-2024-001",
      amount: "$5,250.00",
      paymentMethod: "Bank Transfer",
      reference: "INV-2024-001",
      status: "Completed",
      processedBy: "Sarah Wilson",
      description: "Legal consultation payment"
    },
    {
      id: "TXN-2024-002",
      date: "2024-01-11",
      time: "02:15 PM",
      type: "Expense",
      clientName: "Robert Smith",
      caseNumber: "CASE-2024-002",
      amount: "$450.00",
      paymentMethod: "Corporate Card",
      reference: "EXP-2024-001",
      status: "Completed",
      processedBy: "John Davis",
      description: "Court filing fees"
    },
    {
      id: "TXN-2024-003",
      date: "2024-01-10",
      time: "11:45 AM",
      type: "Refund",
      clientName: "TechCorp Inc.",
      caseNumber: "CASE-2024-003",
      amount: "$1,200.00",
      paymentMethod: "Check",
      reference: "REF-2024-001",
      status: "Pending",
      processedBy: "Emily Brown",
      description: "Overpayment refund"
    },
    {
      id: "TXN-2024-004",
      date: "2024-01-09",
      time: "04:20 PM",
      type: "Payment Received",
      clientName: "Global Industries",
      caseNumber: "CASE-2024-004",
      amount: "$8,500.00",
      paymentMethod: "Wire Transfer",
      reference: "INV-2024-002",
      status: "Completed",
      processedBy: "Sarah Wilson",
      description: "Corporate legal services"
    }
  ];

  const {
    data,
    addItem,
    updateItem,
    deleteItem,
    exportData
  } = useDataManager({
    initialData: initialTransactionsData,
    entityName: 'Transaction'
  });

  const columns = [
    {
      key: 'id',
      label: 'Transaction ID',
      sortable: true,
      filterable: true
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      filterable: true
    },
    {
      key: 'time',
      label: 'Time',
      sortable: true,
      filterable: true
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      filterable: true,
      filterOptions: ['Payment Received', 'Expense', 'Refund', 'Transfer'],
      render: (value: string) => {
        const colors = {
          'Payment Received': 'bg-green-100 text-green-800',
          'Expense': 'bg-red-100 text-red-800',
          'Refund': 'bg-blue-100 text-blue-800',
          'Transfer': 'bg-purple-100 text-purple-800'
        };
        return (
          <Badge className={colors[value as keyof typeof colors]}>
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'clientName',
      label: 'Client',
      sortable: true,
      filterable: true
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      filterable: true,
      render: (value: string) => (
        <span className="font-semibold">{value}</span>
      )
    },
    {
      key: 'paymentMethod',
      label: 'Payment Method',
      sortable: true,
      filterable: true,
      filterOptions: ['Bank Transfer', 'Corporate Card', 'Check', 'Wire Transfer', 'Cash']
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: ['Completed', 'Pending', 'Failed', 'Processing'],
      render: (value: string) => {
        const colors = {
          'Completed': 'bg-green-100 text-green-800',
          'Pending': 'bg-yellow-100 text-yellow-800',
          'Failed': 'bg-red-100 text-red-800',
          'Processing': 'bg-blue-100 text-blue-800'
        };
        return (
          <Badge className={colors[value as keyof typeof colors]}>
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'processedBy',
      label: 'Processed By',
      sortable: true,
      filterable: true
    }
  ];

  const fields = [
    { key: 'date', label: 'Date', type: 'date' as const, required: true },
    { key: 'time', label: 'Time', type: 'text' as const, required: true },
    { 
      key: 'type', 
      label: 'Transaction Type', 
      type: 'select' as const,
      options: ['Payment Received', 'Expense', 'Refund', 'Transfer'],
      required: true 
    },
    { key: 'clientName', label: 'Client Name', type: 'text' as const, required: true },
    { key: 'caseNumber', label: 'Case Number', type: 'text' as const },
    { key: 'amount', label: 'Amount', type: 'text' as const, required: true },
    { 
      key: 'paymentMethod', 
      label: 'Payment Method', 
      type: 'select' as const,
      options: ['Bank Transfer', 'Corporate Card', 'Check', 'Wire Transfer', 'Cash'],
      required: true 
    },
    { key: 'reference', label: 'Reference', type: 'text' as const },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'select' as const,
      options: ['Completed', 'Pending', 'Failed', 'Processing'],
      required: true 
    },
    { key: 'processedBy', label: 'Processed By', type: 'text' as const, required: true },
    { key: 'description', label: 'Description', type: 'textarea' as const }
  ];

  return (
    <div className="p-6">
      <DataTable
        title="Financial Transactions"
        columns={columns}
        data={data}
        fields={fields}
        searchPlaceholder="Search transactions by client, amount, or reference..."
        onAdd={addItem}
        onEdit={updateItem}
        onDelete={deleteItem}
        onExport={exportData}
        entityName="Transaction"
      />
    </div>
  );
};

export default Transactions;
