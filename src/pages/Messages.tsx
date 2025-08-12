
import React from 'react';
import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { useDataManager } from '@/hooks/useDataManager';

const Messages = () => {
  const initialMessagesData = [
    {
      id: "MSG-001",
      from: "Michael Johnson",
      to: "Sarah Wilson",
      subject: "Question about case progress",
      caseNumber: "CASE-2024-001",
      date: "2024-01-12",
      time: "09:15 AM",
      status: "Read",
      priority: "Medium",
      type: "Client Communication",
      hasAttachment: false
    },
    {
      id: "MSG-002",
      from: "Court Clerk",
      to: "John Davis",
      subject: "Hearing date confirmation",
      caseNumber: "CASE-2024-002",
      date: "2024-01-11",
      time: "02:30 PM",
      status: "Unread",
      priority: "High",
      type: "Court Communication",
      hasAttachment: true
    },
    {
      id: "MSG-003",
      from: "Emily Brown",
      to: "Sarah Wilson",
      subject: "Document review completed",
      caseNumber: "CASE-2024-003",
      date: "2024-01-10",
      time: "04:45 PM",
      status: "Read",
      priority: "Low",
      type: "Internal Communication",
      hasAttachment: false
    }
  ];

  const {
    data,
    addItem,
    updateItem,
    deleteItem,
    exportData
  } = useDataManager({
    initialData: initialMessagesData,
    entityName: 'Message'
  });

  const columns = [
    {
      key: 'id',
      label: 'Message ID',
      sortable: true,
      filterable: true
    },
    {
      key: 'from',
      label: 'From',
      sortable: true,
      filterable: true
    },
    {
      key: 'to',
      label: 'To',
      sortable: true,
      filterable: true
    },
    {
      key: 'subject',
      label: 'Subject',
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
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: ['Read', 'Unread', 'Replied'],
      render: (value: string) => {
        const colors = {
          'Read': 'bg-gray-100 text-gray-800',
          'Unread': 'bg-blue-100 text-blue-800',
          'Replied': 'bg-green-100 text-green-800'
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
      key: 'type',
      label: 'Type',
      sortable: true,
      filterable: true,
      filterOptions: ['Client Communication', 'Court Communication', 'Internal Communication'],
      render: (value: string) => (
        <Badge variant="outline">{value}</Badge>
      )
    },
    {
      key: 'hasAttachment',
      label: 'Attachment',
      sortable: true,
      filterable: true,
      render: (value: boolean) => (
        <Badge className={value ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}>
          {value ? 'Yes' : 'No'}
        </Badge>
      )
    }
  ];

  const fields = [
    { key: 'from', label: 'From', type: 'text' as const, required: true },
    { key: 'to', label: 'To', type: 'text' as const, required: true },
    { key: 'subject', label: 'Subject', type: 'text' as const, required: true },
    { key: 'caseNumber', label: 'Case Number', type: 'text' as const },
    { key: 'date', label: 'Date', type: 'date' as const, required: true },
    { key: 'time', label: 'Time', type: 'text' as const, required: true },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'select' as const,
      options: ['Read', 'Unread', 'Replied'],
      required: true 
    },
    { 
      key: 'priority', 
      label: 'Priority', 
      type: 'select' as const,
      options: ['High', 'Medium', 'Low'],
      required: true 
    },
    { 
      key: 'type', 
      label: 'Message Type', 
      type: 'select' as const,
      options: ['Client Communication', 'Court Communication', 'Internal Communication'],
      required: true 
    },
    { key: 'hasAttachment', label: 'Has Attachment', type: 'select' as const, options: ['true', 'false'] }
  ];

  return (
    <div className="p-6">
      <DataTable
        title="Messages & Communications"
        columns={columns}
        data={data}
        fields={fields}
        searchPlaceholder="Search messages by sender, subject, or case number..."
        onAdd={addItem}
        onEdit={updateItem}
        onDelete={deleteItem}
        onExport={exportData}
        entityName="Message"
      />
    </div>
  );
};

export default Messages;
