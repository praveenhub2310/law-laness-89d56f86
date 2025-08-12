
import React from 'react';
import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { useDataManager } from '@/hooks/useDataManager';

const ImportantLinks = () => {
  const initialLinksData = [
    {
      id: "LNK-001",
      title: "Federal Court Records",
      url: "https://www.federalcourts.gov",
      category: "Court Resources",
      description: "Access federal court case records and filings",
      lastAccessed: "2024-01-12",
      frequency: "Daily",
      status: "Active",
      addedBy: "John Davis",
      priority: "High"
    },
    {
      id: "LNK-002",
      title: "Legal Research Database",
      url: "https://www.westlaw.com",
      category: "Research Tools",
      description: "Comprehensive legal research and case law database",
      lastAccessed: "2024-01-11",
      frequency: "Weekly",
      status: "Active",
      addedBy: "Sarah Wilson",
      priority: "High"
    },
    {
      id: "LNK-003",
      title: "State Bar Association",
      url: "https://www.statebar.org",
      category: "Professional Resources",
      description: "State bar association resources and updates",
      lastAccessed: "2024-01-10",
      frequency: "Monthly",
      status: "Active",
      addedBy: "Emily Brown",
      priority: "Medium"
    },
    {
      id: "LNK-004",
      title: "Legal Forms Repository",
      url: "https://www.legalforms.com",
      category: "Templates",
      description: "Standard legal forms and document templates",
      lastAccessed: "2024-01-08",
      frequency: "Weekly",
      status: "Active",
      addedBy: "Michael Johnson",
      priority: "Medium"
    }
  ];

  const {
    data,
    addItem,
    updateItem,
    deleteItem,
    exportData
  } = useDataManager({
    initialData: initialLinksData,
    entityName: 'Link'
  });

  const columns = [
    {
      key: 'id',
      label: 'Link ID',
      sortable: true,
      filterable: true
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      filterable: true
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      filterable: true,
      filterOptions: ['Court Resources', 'Research Tools', 'Professional Resources', 'Templates'],
      render: (value: string) => {
        const colors = {
          'Court Resources': 'bg-blue-100 text-blue-800',
          'Research Tools': 'bg-purple-100 text-purple-800',
          'Professional Resources': 'bg-green-100 text-green-800',
          'Templates': 'bg-orange-100 text-orange-800'
        };
        return (
          <Badge className={colors[value as keyof typeof colors]}>
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'url',
      label: 'URL',
      sortable: true,
      filterable: true,
      render: (value: string) => (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          {value.substring(0, 30)}...
        </a>
      )
    },
    {
      key: 'lastAccessed',
      label: 'Last Accessed',
      sortable: true,
      filterable: true
    },
    {
      key: 'frequency',
      label: 'Usage Frequency',
      sortable: true,
      filterable: true,
      filterOptions: ['Daily', 'Weekly', 'Monthly']
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
      key: 'addedBy',
      label: 'Added By',
      sortable: true,
      filterable: true
    }
  ];

  const fields = [
    { key: 'title', label: 'Link Title', type: 'text' as const, required: true },
    { key: 'url', label: 'URL', type: 'text' as const, required: true },
    { 
      key: 'category', 
      label: 'Category', 
      type: 'select' as const,
      options: ['Court Resources', 'Research Tools', 'Professional Resources', 'Templates'],
      required: true 
    },
    { key: 'description', label: 'Description', type: 'textarea' as const, required: true },
    { key: 'lastAccessed', label: 'Last Accessed', type: 'date' as const },
    { 
      key: 'frequency', 
      label: 'Usage Frequency', 
      type: 'select' as const,
      options: ['Daily', 'Weekly', 'Monthly'],
      required: true 
    },
    { key: 'status', label: 'Status', type: 'select' as const, options: ['Active', 'Inactive'] },
    { key: 'addedBy', label: 'Added By', type: 'text' as const, required: true },
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
        title="Important Links Management"
        columns={columns}
        data={data}
        fields={fields}
        searchPlaceholder="Search links by title, category, or URL..."
        onAdd={addItem}
        onEdit={updateItem}
        onDelete={deleteItem}
        onExport={exportData}
        entityName="Link"
      />
    </div>
  );
};

export default ImportantLinks;
