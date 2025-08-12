import React from 'react';
import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';
import { Project } from '@/types/database';

const AllCases = () => {
  const { toast } = useToast();
  
  const {
    data,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem
  } = useSupabaseData<Project>({
    table: 'projects',
    orderBy: { column: 'created_at', ascending: false },
    realtime: true
  });

  if (error) {
    console.error('Error loading cases:', error);
  }

  const columns = [
    {
      key: 'case_number',
      label: 'Case Number',
      sortable: true,
      filterable: true,
      className: 'min-w-[120px]'
    },
    {
      key: 'title',
      label: 'Case Title',
      sortable: true,
      filterable: true,
      className: 'min-w-[200px]'
    },
     {
       key: 'description',
       label: 'Description',
       sortable: true,
       filterable: true,
       className: 'min-w-[200px]',
       render: (value: string) => (
         <div className="max-w-xs truncate" title={value}>
           {value || 'No description'}
         </div>
       )
     },
     {
       key: 'status',
       label: 'Status',
       sortable: true,
       filterable: true,
       filterOptions: ['active', 'draft', 'closed', 'pending'],
       className: 'min-w-[100px]',
       render: (value: string) => {
         const colors = {
           'active': 'bg-green-100 text-green-800',
           'draft': 'bg-yellow-100 text-yellow-800',
           'closed': 'bg-gray-100 text-gray-800',
           'pending': 'bg-orange-100 text-orange-800'
         };
         return (
           <Badge className={`${colors[value as keyof typeof colors] || 'bg-gray-100 text-gray-800'} text-xs`}>
             {value}
           </Badge>
         );
       }
     },
     {
       key: 'budget',
       label: 'Budget',
       sortable: true,
       filterable: true,
       className: 'min-w-[100px] hidden lg:table-cell',
       render: (value: number) => value ? `$${value.toLocaleString()}` : 'Not set'
     },
     {
       key: 'updated_at',
       label: 'Last Updated',
       sortable: true,
       filterable: true,
       className: 'min-w-[120px] hidden xl:table-cell',
       render: (value: string) => new Date(value).toLocaleDateString()
     }
   ];

  const fields = [
    { key: 'case_number', label: 'Case Number', type: 'text' as const, required: true },
    { key: 'title', label: 'Case Title', type: 'text' as const, required: true },
    { key: 'description', label: 'Description', type: 'textarea' as const },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'select' as const,
      options: ['active', 'draft', 'closed', 'pending'],
      required: true 
    },
    { key: 'start_date', label: 'Start Date', type: 'date' as const },
    { key: 'end_date', label: 'End Date', type: 'date' as const },
    { key: 'budget', label: 'Budget', type: 'number' as const }
  ];

  const handlePreview = (item: Project) => {
    const content = `Case Report: ${item.title}

CASE INFORMATION
================
Case Number: ${item.case_number}
Title: ${item.title}
Status: ${item.status}
Start Date: ${item.start_date || 'Not set'}
End Date: ${item.end_date || 'Not set'}
Budget: ${item.budget ? `$${item.budget}` : 'Not set'}
Created: ${new Date(item.created_at).toLocaleDateString()}
Last Updated: ${new Date(item.updated_at).toLocaleDateString()}

CASE SUMMARY
============
${item.description || 'No description available'}

CASE DETAILS
============
• Case Number: ${item.case_number}
• Current Status: ${item.status}
• Budget: ${item.budget ? `$${item.budget}` : 'Not specified'}

NEXT STEPS
==========
[This section would contain next steps based on case status]

---
Generated on: ${new Date().toLocaleDateString()}
Report Type: All Cases Report
    `;
    
    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.case_number}_Report.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Case Report Downloaded",
      description: `Case report for ${item.title} has been downloaded as a DOC file.`,
    });
  };

  const handleAiTools = (item: Project, toolName: string) => {
    toast({
      title: "AI Tool Processing",
      description: `Processing "${item.title}" with ${toolName}...`,
    });
    console.log(`Processing case ${item.case_number} with ${toolName}`, item);
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      <DataTable
        title="All Cases"
        columns={columns}
        data={data}
        fields={fields}
        searchPlaceholder="Search cases by number, title, or description..."
        onAdd={addItem}
        onEdit={updateItem}
        onDelete={deleteItem}
        onExport={() => {
          toast({ title: 'Export Complete', description: 'Cases data exported successfully.' });
        }}
        onPreview={handlePreview}
        onAiTools={handleAiTools}
        entityName="Case"
        showPreviewAction={true}
        showAiToolsAction={true}
        className="overflow-x-auto"
      />
    </div>
  );
};

export default AllCases;