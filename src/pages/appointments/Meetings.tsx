
import React from 'react';
import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { useDataManager } from '@/hooks/useDataManager';

const Meetings = () => {
  const initialMeetingsData = [
    {
      id: "MTG-001",
      title: "Client Consultation - Johnson Case",
      type: "Client Meeting",
      caseNumber: "CASE-2024-001",
      client: "Michael Johnson",
      attorney: "Sarah Wilson",
      date: "2024-01-15",
      time: "09:00 AM",
      duration: "1 hour",
      location: "Conference Room A",
      status: "Scheduled",
      agenda: "Case strategy discussion",
      priority: "High"
    },
    {
      id: "MTG-002",
      title: "Settlement Discussion",
      type: "Settlement Meeting",
      caseNumber: "CASE-2024-002",
      client: "Robert Smith",
      attorney: "John Davis",
      date: "2024-01-16",
      time: "02:00 PM",
      duration: "2 hours",
      location: "Conference Room B",
      status: "Confirmed",
      agenda: "Negotiate settlement terms",
      priority: "Medium"
    },
    {
      id: "MTG-003",
      title: "Evidence Review",
      type: "Internal Meeting",
      caseNumber: "CASE-2024-003",
      client: "TechCorp Inc.",
      attorney: "Emily Brown",
      date: "2024-01-17",
      time: "11:30 AM",
      duration: "90 minutes",
      location: "Legal Library",
      status: "Completed",
      agenda: "Review case evidence",
      priority: "Low"
    }
  ];

  const {
    data,
    addItem,
    updateItem,
    deleteItem,
    exportData
  } = useDataManager({
    initialData: initialMeetingsData,
    entityName: 'Meeting'
  });

  const columns = [
    {
      key: 'id',
      label: 'Meeting ID',
      sortable: true,
      filterable: true
    },
    {
      key: 'title',
      label: 'Meeting Title',
      sortable: true,
      filterable: true
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      filterable: true,
      filterOptions: ['Client Meeting', 'Settlement Meeting', 'Internal Meeting', 'Strategy Meeting'],
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
      key: 'client',
      label: 'Client',
      sortable: true,
      filterable: true
    },
    {
      key: 'attorney',
      label: 'Attorney',
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
      key: 'location',
      label: 'Location',
      sortable: true,
      filterable: true
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: ['Scheduled', 'Confirmed', 'Completed', 'Cancelled'],
      render: (value: string) => {
        const colors = {
          'Scheduled': 'bg-blue-100 text-blue-800',
          'Confirmed': 'bg-green-100 text-green-800',
          'Completed': 'bg-gray-100 text-gray-800',
          'Cancelled': 'bg-red-100 text-red-800'
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
    }
  ];

  const fields = [
    { key: 'title', label: 'Meeting Title', type: 'text' as const, required: true },
    { 
      key: 'type', 
      label: 'Meeting Type', 
      type: 'select' as const,
      options: ['Client Meeting', 'Settlement Meeting', 'Internal Meeting', 'Strategy Meeting'],
      required: true 
    },
    { key: 'caseNumber', label: 'Case Number', type: 'text' as const, required: true },
    { key: 'client', label: 'Client', type: 'text' as const, required: true },
    { key: 'attorney', label: 'Attorney', type: 'text' as const, required: true },
    { key: 'date', label: 'Date', type: 'date' as const, required: true },
    { key: 'time', label: 'Time', type: 'text' as const, required: true },
    { key: 'duration', label: 'Duration', type: 'text' as const },
    { key: 'location', label: 'Location', type: 'text' as const, required: true },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'select' as const,
      options: ['Scheduled', 'Confirmed', 'Completed', 'Cancelled'],
      required: true 
    },
    { key: 'agenda', label: 'Agenda', type: 'textarea' as const },
    { 
      key: 'priority', 
      label: 'Priority', 
      type: 'select' as const,
      options: ['High', 'Medium', 'Low'],
      required: true 
    }
  ];

  return (
    <div className="p-6">
      <DataTable
        title="Client Meetings"
        columns={columns}
        data={data}
        fields={fields}
        searchPlaceholder="Search meetings by title, client, or case number..."
        onAdd={addItem}
        onEdit={updateItem}
        onDelete={deleteItem}
        onExport={exportData}
        entityName="Meeting"
      />
    </div>
  );
};

export default Meetings;
