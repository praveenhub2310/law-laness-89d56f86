import React from 'react';
import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { useDataManager } from '@/hooks/useDataManager';

const CourtDates = () => {
  const initialCourtDatesData = [
    {
      id: "CD-001",
      caseNumber: "CASE-2024-001",
      clientName: "Michael Johnson",
      courtName: "Superior Court of California",
      judge: "Hon. Margaret Stevens",
      hearingType: "Motion Hearing",
      date: "2024-01-25",
      time: "10:00 AM",
      location: "Courtroom 3A, 123 Justice Ave",
      status: "Scheduled",
      attorney: "Sarah Wilson",
      notes: "Motion for summary judgment",
      reminder: "2 days before",
      duration: "2 hours"
    },
    {
      id: "CD-002",
      caseNumber: "CASE-2024-002",
      clientName: "Robert Smith",
      courtName: "Family Court Division",
      judge: "Hon. David Martinez",
      hearingType: "Custody Hearing",
      date: "2024-01-30",
      time: "02:00 PM",
      location: "Courtroom 1B, 456 Family Court Blvd",
      status: "Scheduled",
      attorney: "John Davis",
      notes: "Child custody modification hearing",
      reminder: "1 week before",
      duration: "3 hours"
    },
    {
      id: "CD-003",
      caseNumber: "CASE-2024-003",
      clientName: "TechCorp Inc.",
      courtName: "Federal District Court",
      judge: "Hon. Elizabeth Chen",
      hearingType: "Trial",
      date: "2024-02-15",
      time: "09:00 AM",
      location: "Courtroom 5, Federal Courthouse",
      status: "Confirmed",
      attorney: "Emily Brown",
      notes: "Corporate liability trial - Day 1",
      reminder: "1 day before",
      duration: "Full day"
    },
    {
      id: "CD-004",
      caseNumber: "CASE-2024-004",
      clientName: "Global Industries",
      courtName: "Superior Court of California",
      judge: "Hon. Robert Wilson",
      hearingType: "Settlement Conference",
      date: "2024-02-08",
      time: "11:00 AM",
      location: "Conference Room A, 123 Justice Ave",
      status: "Postponed",
      attorney: "Sarah Wilson",
      notes: "Settlement discussion for workers comp case",
      reminder: "3 days before",
      duration: "1 hour"
    },
    {
      id: "CD-005",
      caseNumber: "CASE-2024-005",
      clientName: "Jane Williams",
      courtName: "Municipal Court",
      judge: "Hon. Thomas Anderson",
      hearingType: "Preliminary Hearing",
      date: "2024-01-22",
      time: "01:30 PM",
      location: "Courtroom 2, Municipal Building",
      status: "Completed",
      attorney: "John Davis",
      notes: "Preliminary hearing for traffic violation case",
      reminder: "Same day",
      duration: "30 minutes"
    }
  ];

  const {
    data,
    addItem,
    updateItem,
    deleteItem,
    exportData
  } = useDataManager({
    initialData: initialCourtDatesData,
    entityName: 'Court Date'
  });

  const columns = [
    {
      key: 'caseNumber',
      label: 'Case Number',
      sortable: true,
      filterable: true,
      className: 'min-w-[140px]'
    },
    {
      key: 'clientName',
      label: 'Client Name',
      sortable: true,
      filterable: true,
      className: 'min-w-[150px]'
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      filterable: true,
      className: 'min-w-[100px]'
    },
    {
      key: 'time',
      label: 'Time',
      sortable: true,
      filterable: true,
      className: 'min-w-[80px] hidden sm:table-cell'
    },
    {
      key: 'hearingType',
      label: 'Hearing Type',
      sortable: true,
      filterable: true,
      filterOptions: ['Motion Hearing', 'Custody Hearing', 'Trial', 'Settlement Conference', 'Preliminary Hearing'],
      className: 'min-w-[140px] hidden md:table-cell',
      render: (value: string) => (
        <Badge variant="outline" className="text-xs">{value}</Badge>
      )
    },
    {
      key: 'judge',
      label: 'Judge',
      sortable: true,
      filterable: true,
      className: 'min-w-[150px] hidden lg:table-cell'
    },
    {
      key: 'courtName',
      label: 'Court',
      sortable: true,
      filterable: true,
      className: 'min-w-[180px] hidden lg:table-cell'
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: ['Scheduled', 'Confirmed', 'Postponed', 'Completed', 'Cancelled'],
      className: 'min-w-[100px]',
      render: (value: string) => {
        const colors = {
          'Scheduled': 'bg-blue-100 text-blue-800',
          'Confirmed': 'bg-green-100 text-green-800',
          'Postponed': 'bg-yellow-100 text-yellow-800',
          'Completed': 'bg-gray-100 text-gray-800',
          'Cancelled': 'bg-red-100 text-red-800'
        };
        return (
          <Badge className={`${colors[value as keyof typeof colors]} text-xs`}>
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'attorney',
      label: 'Attorney',
      sortable: true,
      filterable: true,
      className: 'min-w-[130px] hidden xl:table-cell'
    },
    {
      key: 'duration',
      label: 'Duration',
      sortable: true,
      filterable: true,
      className: 'min-w-[100px] hidden xl:table-cell'
    }
  ];

  const fields = [
    { key: 'caseNumber', label: 'Case Number', type: 'text' as const, required: true },
    { key: 'clientName', label: 'Client Name', type: 'text' as const, required: true },
    { key: 'courtName', label: 'Court Name', type: 'text' as const, required: true },
    { key: 'judge', label: 'Judge', type: 'text' as const, required: true },
    { 
      key: 'hearingType', 
      label: 'Hearing Type', 
      type: 'select' as const,
      options: ['Motion Hearing', 'Custody Hearing', 'Trial', 'Settlement Conference', 'Preliminary Hearing'],
      required: true 
    },
    { key: 'date', label: 'Date', type: 'date' as const, required: true },
    { key: 'time', label: 'Time', type: 'text' as const, required: true },
    { key: 'location', label: 'Location', type: 'textarea' as const, required: true },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'select' as const,
      options: ['Scheduled', 'Confirmed', 'Postponed', 'Completed', 'Cancelled'],
      required: true 
    },
    { key: 'attorney', label: 'Attorney', type: 'text' as const, required: true },
    { key: 'notes', label: 'Notes', type: 'textarea' as const },
    { 
      key: 'reminder', 
      label: 'Reminder', 
      type: 'select' as const,
      options: ['Same day', '1 day before', '2 days before', '3 days before', '1 week before']
    },
    { key: 'duration', label: 'Duration', type: 'text' as const }
  ];

  return (
    <div className="p-3 sm:p-6">
      <DataTable
        title="Court Dates & Hearings"
        columns={columns}
        data={data}
        fields={fields}
        searchPlaceholder="Search court dates by case number, client, or judge..."
        onAdd={addItem}
        onEdit={updateItem}
        onDelete={deleteItem}
        onExport={exportData}
        entityName="Court Date"
        className="overflow-x-auto"
      />
    </div>
  );
};

export default CourtDates;
