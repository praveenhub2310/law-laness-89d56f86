
import React from 'react';
import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { useDataManager } from '@/hooks/useDataManager';

const Hearings = () => {
  const initialHearingsData = [
    {
      id: "HRG-001",
      caseNumber: "CASE-2024-001",
      hearingType: "Motion Hearing",
      court: "Superior Court of California",
      judge: "Hon. Sarah Martinez",
      date: "2024-01-15",
      time: "09:00 AM",
      remainingDays: 3,
      status: "Scheduled",
      attorney: "Sarah Wilson",
      client: "Michael Johnson"
    },
    {
      id: "HRG-002",
      caseNumber: "CASE-2024-002",
      hearingType: "Trial",
      court: "District Court",
      judge: "Hon. Robert Chen",
      date: "2024-01-18",
      time: "10:30 AM", 
      remainingDays: 6,
      status: "Confirmed",
      attorney: "John Davis",
      client: "Robert Smith"
    },
    {
      id: "HRG-003",
      caseNumber: "CASE-2024-003",
      hearingType: "Settlement Conference",
      court: "Municipal Court",
      judge: "Hon. Lisa Rodriguez",
      date: "2024-01-22",
      time: "02:00 PM",
      remainingDays: 10,
      status: "Pending",
      attorney: "Emily Brown",
      client: "TechCorp Inc."
    }
  ];

  const {
    data,
    addItem,
    updateItem,
    deleteItem,
    exportData
  } = useDataManager({
    initialData: initialHearingsData,
    entityName: 'Hearing'
  });

  const columns = [
    {
      key: 'caseNumber',
      label: 'Case Number',
      sortable: true,
      filterable: true
    },
    {
      key: 'hearingType',
      label: 'Hearing Type',
      sortable: true,
      filterable: true,
      filterOptions: ['Motion Hearing', 'Trial', 'Settlement Conference', 'Preliminary Hearing'],
      render: (value: string) => (
        <Badge variant="outline">{value}</Badge>
      )
    },
    {
      key: 'court',
      label: 'Court',
      sortable: true,
      filterable: true
    },
    {
      key: 'judge',
      label: 'Judge',
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
      key: 'remainingDays',
      label: 'Days Left',
      sortable: true,
      filterable: true,
      render: (value: number) => {
        const color = value <= 7 ? 'bg-red-100 text-red-800' : 
                     value <= 14 ? 'bg-yellow-100 text-yellow-800' : 
                     'bg-green-100 text-green-800';
        return (
          <Badge className={color}>
            {value} days
          </Badge>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: ['Scheduled', 'Confirmed', 'Pending', 'Cancelled'],
      render: (value: string) => {
        const colors = {
          'Scheduled': 'bg-blue-100 text-blue-800',
          'Confirmed': 'bg-green-100 text-green-800', 
          'Pending': 'bg-yellow-100 text-yellow-800',
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
      key: 'attorney',
      label: 'Attorney',
      sortable: true,
      filterable: true
    }
  ];

  const fields = [
    { key: 'caseNumber', label: 'Case Number', type: 'text' as const, required: true },
    { 
      key: 'hearingType', 
      label: 'Hearing Type', 
      type: 'select' as const,
      options: ['Motion Hearing', 'Trial', 'Settlement Conference', 'Preliminary Hearing'],
      required: true 
    },
    { key: 'court', label: 'Court', type: 'text' as const, required: true },
    { key: 'judge', label: 'Judge', type: 'text' as const, required: true },
    { key: 'date', label: 'Date', type: 'date' as const, required: true },
    { key: 'time', label: 'Time', type: 'text' as const, required: true },
    { key: 'remainingDays', label: 'Days Until Hearing', type: 'number' as const },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'select' as const,
      options: ['Scheduled', 'Confirmed', 'Pending', 'Cancelled'],
      required: true 
    },
    { key: 'attorney', label: 'Attorney', type: 'text' as const, required: true },
    { key: 'client', label: 'Client', type: 'text' as const, required: true }
  ];

  return (
    <div className="p-6">
      <DataTable
        title="Hearings Schedule"
        columns={columns}
        data={data}
        fields={fields}
        searchPlaceholder="Search hearings by case number, court, or judge..."
        onAdd={addItem}
        onEdit={updateItem}
        onDelete={deleteItem}
        onExport={exportData}
        entityName="Hearing"
      />
    </div>
  );
};

export default Hearings;
