
import React from 'react';
import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { useDataManager } from '@/hooks/useDataManager';

const CourtDates = () => {
  const initialCourtDatesData = [
    {
      id: "CD-2024-001",
      caseNumber: "CASE-2024-001",
      caseName: "Johnson vs. Insurance Corp",
      courtName: "Superior Court of California",
      courtroom: "Department 12",
      judge: "Hon. Margaret Thompson",
      dateScheduled: "2024-06-15",
      timeScheduled: "09:30 AM",
      durationEstimated: "2 hours",
      hearingType: "Motion Hearing",
      status: "Scheduled",
      priority: "High",
      attorney: "Sarah Wilson",
      clientName: "Michael Johnson",
      purpose: "Motion for Summary Judgment",
      notes: "Bring exhibits A-D and witness statements",
      address: "1945 Third Street, La Verne, CA 91750",
      daysRemaining: 5,
      lastUpdated: "2024-06-10"
    },
    {
      id: "CD-2024-002",
      caseNumber: "CASE-2024-002",
      caseName: "Smith Property Dispute",
      courtName: "Los Angeles County Court",
      courtroom: "Department 8",
      judge: "Hon. Robert Davis",
      dateScheduled: "2024-06-18",
      timeScheduled: "02:00 PM",
      durationEstimated: "3 hours",
      hearingType: "Trial",
      status: "Confirmed",
      priority: "Medium",
      attorney: "John Davis",
      clientName: "Robert Smith",
      purpose: "Property boundary dispute trial",
      notes: "Survey documents and property deeds required",
      address: "110 North Grand Avenue, Los Angeles, CA 90012",
      daysRemaining: 8,
      lastUpdated: "2024-06-09"
    },
    {
      id: "CD-2024-003",
      caseNumber: "CASE-2024-003",
      caseName: "TechCorp Contract Review",
      courtName: "Central District Court",
      courtroom: "Department 5",
      judge: "Hon. Patricia Martinez",
      dateScheduled: "2024-06-20",
      timeScheduled: "10:00 AM",
      durationEstimated: "1.5 hours",
      hearingType: "Case Management",
      status: "Scheduled",
      priority: "Low",
      attorney: "Emily Brown",
      clientName: "TechCorp Inc.",
      purpose: "Contract dispute case management conference",
      notes: "Mediation discussion scheduled",
      address: "350 West 1st Street, Los Angeles, CA 90012",
      daysRemaining: 10,
      lastUpdated: "2024-06-08"
    },
    {
      id: "CD-2024-004",
      caseNumber: "CASE-2024-004",
      caseName: "Global Industries Settlement",
      courtName: "Beverly Hills Courthouse",
      courtroom: "Department 3",
      judge: "Hon. William Chen",
      dateScheduled: "2024-06-25",
      timeScheduled: "11:15 AM",
      durationEstimated: "45 minutes",
      hearingType: "Settlement Conference",
      status: "Pending Confirmation",
      priority: "High",
      attorney: "Sarah Wilson",
      clientName: "Global Industries",
      purpose: "Settlement negotiation hearing",
      notes: "Settlement amount pre-approved by client",
      address: "9355 Burton Way, Beverly Hills, CA 90210",
      daysRemaining: 15,
      lastUpdated: "2024-06-07"
    },
    {
      id: "CD-2024-005",
      caseNumber: "CASE-2024-005",
      caseName: "Martinez Family Law",
      courtName: "Family Court of Los Angeles",
      courtroom: "Department 15",
      judge: "Hon. Linda Rodriguez",
      dateScheduled: "2024-07-02",
      timeScheduled: "01:30 PM",
      durationEstimated: "2.5 hours",
      hearingType: "Custody Hearing",
      status: "Scheduled",
      priority: "High",
      attorney: "John Davis",
      clientName: "Maria Martinez",
      purpose: "Child custody modification hearing",
      notes: "Child welfare report due before hearing",
      address: "1725 Main Street, Santa Monica, CA 90401",
      daysRemaining: 22,
      lastUpdated: "2024-06-06"
    }
  ];

  console.log('Court Dates component rendered');
  console.log('Initial data:', initialCourtDatesData);

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

  console.log('Data from useDataManager:', data);

  const columns = [
    {
      key: 'caseNumber',
      label: 'Case Number',
      sortable: true,
      filterable: true
    },
    {
      key: 'caseName',
      label: 'Case Name',
      sortable: true,
      filterable: true
    },
    {
      key: 'dateScheduled',
      label: 'Date',
      sortable: true,
      filterable: true
    },
    {
      key: 'timeScheduled',
      label: 'Time',
      sortable: true,
      filterable: true
    },
    {
      key: 'courtName',
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
      key: 'hearingType',
      label: 'Hearing Type',
      sortable: true,
      filterable: true,
      filterOptions: ['Motion Hearing', 'Trial', 'Case Management', 'Settlement Conference', 'Custody Hearing', 'Arraignment'],
      render: (value: string) => {
        const colors = {
          'Motion Hearing': 'bg-blue-100 text-blue-800',
          'Trial': 'bg-red-100 text-red-800',
          'Case Management': 'bg-green-100 text-green-800',
          'Settlement Conference': 'bg-purple-100 text-purple-800',
          'Custody Hearing': 'bg-orange-100 text-orange-800',
          'Arraignment': 'bg-gray-100 text-gray-800'
        };
        return (
          <Badge className={colors[value as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: ['Scheduled', 'Confirmed', 'Pending Confirmation', 'Postponed', 'Cancelled', 'Completed'],
      render: (value: string) => {
        const colors = {
          'Scheduled': 'bg-blue-100 text-blue-800',
          'Confirmed': 'bg-green-100 text-green-800',
          'Pending Confirmation': 'bg-yellow-100 text-yellow-800',
          'Postponed': 'bg-orange-100 text-orange-800',
          'Cancelled': 'bg-red-100 text-red-800',
          'Completed': 'bg-gray-100 text-gray-800'
        };
        return (
          <Badge className={colors[value as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
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
          <Badge className={colors[value as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
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
    { key: 'caseName', label: 'Case Name', type: 'text' as const, required: true },
    { key: 'courtName', label: 'Court Name', type: 'text' as const, required: true },
    { key: 'courtroom', label: 'Courtroom', type: 'text' as const, required: true },
    { key: 'judge', label: 'Judge', type: 'text' as const, required: true },
    { key: 'dateScheduled', label: 'Date Scheduled', type: 'date' as const, required: true },
    { key: 'timeScheduled', label: 'Time Scheduled', type: 'text' as const, required: true },
    { key: 'durationEstimated', label: 'Estimated Duration', type: 'text' as const },
    { 
      key: 'hearingType', 
      label: 'Hearing Type', 
      type: 'select' as const,
      options: ['Motion Hearing', 'Trial', 'Case Management', 'Settlement Conference', 'Custody Hearing', 'Arraignment'],
      required: true 
    },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'select' as const,
      options: ['Scheduled', 'Confirmed', 'Pending Confirmation', 'Postponed', 'Cancelled', 'Completed'],
      required: true 
    },
    { 
      key: 'priority', 
      label: 'Priority', 
      type: 'select' as const,
      options: ['High', 'Medium', 'Low'],
      required: true 
    },
    { key: 'attorney', label: 'Assigned Attorney', type: 'text' as const, required: true },
    { key: 'clientName', label: 'Client Name', type: 'text' as const, required: true },
    { key: 'purpose', label: 'Purpose', type: 'text' as const, required: true },
    { key: 'address', label: 'Court Address', type: 'textarea' as const },
    { key: 'notes', label: 'Notes', type: 'textarea' as const }
  ];

  console.log('About to render DataTable with data:', data);

  return (
    <div className="p-6">
      <DataTable
        title="Court Dates Management"
        columns={columns}
        data={data}
        fields={fields}
        searchPlaceholder="Search court dates by case number, court name, or judge..."
        onAdd={addItem}
        onEdit={updateItem}
        onDelete={deleteItem}
        onExport={exportData}
        entityName="Court Date"
      />
    </div>
  );
};

export default CourtDates;
