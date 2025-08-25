import React from 'react';
import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDataManager } from '@/hooks/useDataManager';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, ExternalLink } from 'lucide-react';

const ViewHearings = () => {
  const navigate = useNavigate();
  
  const { 
    data: hearingsData, 
    loading, 
    error, 
    addItem: addHearing, 
    updateItem: updateHearing, 
    deleteItem: deleteHearing 
  } = useSupabaseData({
    table: 'hearings',
    select: `
      *,
      case:projects!hearings_case_id_fkey(case_number, title),
      client:profiles!client_id(first_name, last_name),
      lawyer:profiles!lawyer_id(first_name, last_name)
    `,
    orderBy: { column: 'hearing_date', ascending: true },
    realtime: true
  });

  const {
    exportData
  } = useDataManager({
    initialData: (hearingsData || []).map(hearing => ({
      ...hearing,
      id: hearing.id || crypto.randomUUID() // Ensure each item has an id
    })),
    entityName: 'Hearing'
  });

  const handleAddToCalendar = (hearing: any) => {
    const startDate = new Date(`${hearing.hearing_date} ${hearing.hearing_time || '00:00'}`);
    const endDate = new Date(startDate.getTime() + (hearing.duration ? 60 * 60 * 1000 : 60 * 60 * 1000));
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(hearing.title)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(hearing.description || '')}&location=${encodeURIComponent(hearing.court_name || '')}`;
    
    window.open(calendarUrl, '_blank');
  };

  const handleViewCaseDetails = (hearing: any) => {
    if (hearing.case_id) {
      navigate(`/case-details/${hearing.case_id}`);
    } else {
      navigate('/projects');
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Hearing Title',
      sortable: true,
      filterable: true
    },
    {
      key: 'hearing_number',
      label: 'Hearing No.',
      sortable: true,
      filterable: true
    },
    {
      key: 'case',
      label: 'Case',
      sortable: true,
      filterable: true,
      render: (value: any) => value?.case_number || 'N/A'
    },
    {
      key: 'client',
      label: 'Client',
      sortable: true,
      filterable: true,
      render: (value: any) => value ? `${value.first_name} ${value.last_name}` : 'N/A'
    },
    {
      key: 'hearing_date',
      label: 'Date',
      sortable: true,
      filterable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'hearing_time',
      label: 'Time',
      sortable: true,
      render: (value: string) => {
        if (!value) return 'TBD';
        const time = new Date(`2000-01-01 ${value}`);
        return time.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
      }
    },
    {
      key: 'court_name',
      label: 'Court',
      sortable: true,
      filterable: true
    },
    {
      key: 'judge_name',
      label: 'Judge',
      sortable: true,
      filterable: true,
      render: (value: string) => value || 'TBD'
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: ['scheduled', 'confirmed', 'postponed', 'completed', 'cancelled'],
      render: (value: string) => {
        const colors = {
          'scheduled': 'bg-blue-100 text-blue-800',
          'confirmed': 'bg-green-100 text-green-800',
          'postponed': 'bg-yellow-100 text-yellow-800',
          'completed': 'bg-gray-100 text-gray-800',
          'cancelled': 'bg-red-100 text-red-800'
        };
        return (
          <Badge className={colors[value as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'hearing_type',
      label: 'Type',
      sortable: true,
      filterable: true,
      render: (value: string) => (
        <Badge variant="outline">{value || 'General'}</Badge>
      )
    }
  ];

  const fields = [
    { key: 'case_id', label: 'Associated Case', type: 'case_select' as const, required: false },
    { key: 'hearing_date', label: 'Hearing Date', type: 'date' as const, required: true },
    { key: 'hearing_time', label: 'Hearing Time', type: 'text' as const, required: true },
    { key: 'duration', label: 'Duration (HH:MM:SS)', type: 'text' as const, required: false },
    { key: 'hearing_number', label: 'Hearing Number', type: 'text' as const, required: true },
    { key: 'title', label: 'Title', type: 'text' as const, required: true },
    { key: 'description', label: 'Description', type: 'textarea' as const, required: false },
    { key: 'court_name', label: 'Court Name', type: 'text' as const, required: true },
    { key: 'court_room', label: 'Court Room', type: 'text' as const, required: false },
    { key: 'judge_name', label: 'Judge Name', type: 'text' as const, required: false },
    { 
      key: 'hearing_type', 
      label: 'Hearing Type', 
      type: 'select' as const,
      options: ['Motion Hearing', 'Trial', 'Settlement Conference', 'Final Hearing', 'Status Conference'],
      required: false 
    },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'select' as const,
      options: ['scheduled', 'confirmed', 'postponed', 'completed', 'cancelled'],
      required: true 
    },
    { key: 'outcome', label: 'Outcome', type: 'textarea' as const, required: false },
    { key: 'notes', label: 'Notes', type: 'textarea' as const, required: false }
  ];

  // Sync with Supabase data
  React.useEffect(() => {
    if (hearingsData && Array.isArray(hearingsData)) {
      // The data manager will be updated via the dependency change
    }
  }, [hearingsData]);

  return (
    <div className="p-6">
      <DataTable
        title="View Hearings"
        columns={columns}
        data={hearingsData || []}
        fields={fields}
        searchPlaceholder="Search hearings by title, case, or court..."
        onAdd={addHearing}
        onEdit={updateHearing}
        onDelete={deleteHearing}
        onExport={exportData}
        onView={handleViewCaseDetails}
        entityName="Hearing"
        loading={loading}
      />
    </div>
  );
};

export default ViewHearings;