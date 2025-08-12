import React from 'react';
import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { useDataManager } from '@/hooks/useDataManager';
import { useToast } from '@/hooks/use-toast';

const ActiveCases = () => {
  const { toast } = useToast();
  
  // Only active cases data
  const initialActiveCasesData = [
    {
      id: "CASE-2024-001",
      title: "Johnson vs. State Insurance Co.",
      type: "Personal Injury",
      client: "Michael Johnson",
      assignedLawyer: "Sarah Wilson",
      status: "Active",
      priority: "High",
      createdDate: "2024-01-10",
      lastUpdated: "2024-01-12",
      value: "$150,000"
    },
    {
      id: "CASE-2024-005",
      title: "Medical Malpractice Suit",
      type: "Medical Malpractice",
      client: "Robert Wilson",
      assignedLawyer: "Sarah Wilson",
      status: "Active",
      priority: "High",
      createdDate: "2024-01-15",
      lastUpdated: "2024-01-18",
      value: "$500,000"
    },
    {
      id: "CASE-2024-006",
      title: "Construction Defect Claim",
      type: "Construction Law",
      client: "ABC Construction",
      assignedLawyer: "John Davis",
      status: "Active",
      priority: "Medium",
      createdDate: "2024-01-20",
      lastUpdated: "2024-01-22",
      value: "$300,000"
    }
  ];

  const {
    data,
    addItem,
    updateItem,
    deleteItem,
    exportData
  } = useDataManager({
    initialData: initialActiveCasesData,
    entityName: 'Active Case'
  });

  const columns = [
    {
      key: 'id',
      label: 'Case ID',
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
      key: 'type',
      label: 'Type',
      sortable: true,
      filterable: true,
      filterOptions: ['Personal Injury', 'Medical Malpractice', 'Construction Law', 'Real Estate', 'Corporate Law'],
      className: 'min-w-[120px]',
      render: (value: string) => (
        <Badge variant="outline" className="text-xs">{value}</Badge>
      )
    },
    {
      key: 'client',
      label: 'Client',
      sortable: true,
      filterable: true,
      className: 'min-w-[150px]'
    },
    {
      key: 'assignedLawyer',
      label: 'Assigned Lawyer',
      sortable: true,
      filterable: true,
      filterOptions: ['Sarah Wilson', 'John Davis', 'Emily Brown'],
      className: 'min-w-[150px] hidden sm:table-cell'
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: ['Active'],
      className: 'min-w-[100px]',
      render: (value: string) => (
        <Badge className="bg-green-100 text-green-800 text-xs">
          {value}
        </Badge>
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      filterable: true,
      filterOptions: ['High', 'Medium', 'Low'],
      className: 'min-w-[100px] hidden md:table-cell',
      render: (value: string) => {
        const colors = {
          'High': 'bg-red-100 text-red-800',
          'Medium': 'bg-yellow-100 text-yellow-800',
          'Low': 'bg-green-100 text-green-800'
        };
        return (
          <Badge className={`${colors[value as keyof typeof colors]} text-xs`}>
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'value',
      label: 'Value',
      sortable: true,
      filterable: true,
      className: 'min-w-[100px] hidden lg:table-cell'
    },
    {
      key: 'lastUpdated',
      label: 'Last Updated',
      sortable: true,
      filterable: true,
      className: 'min-w-[120px] hidden xl:table-cell'
    }
  ];

  const fields = [
    { key: 'title', label: 'Case Title', type: 'text' as const, required: true },
    { 
      key: 'type', 
      label: 'Case Type', 
      type: 'select' as const, 
      options: ['Personal Injury', 'Medical Malpractice', 'Construction Law', 'Real Estate', 'Corporate Law'],
      required: true 
    },
    { key: 'client', label: 'Client Name', type: 'text' as const, required: true },
    { 
      key: 'assignedLawyer', 
      label: 'Assigned Lawyer', 
      type: 'select' as const,
      options: ['Sarah Wilson', 'John Davis', 'Emily Brown'],
      required: true 
    },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'select' as const,
      options: ['Active'],
      required: true,
      readonly: true
    },
    { 
      key: 'priority', 
      label: 'Priority', 
      type: 'select' as const,
      options: ['High', 'Medium', 'Low'],
      required: true 
    },
    { key: 'value', label: 'Case Value', type: 'text' as const },
    { key: 'createdDate', label: 'Created Date', type: 'date' as const, required: true },
    { key: 'lastUpdated', label: 'Last Updated', type: 'date' as const, readonly: true }
  ];

  const handlePreview = (item: any) => {
    const content = `Active Case Report: ${item.title}

CASE INFORMATION
================
Case ID: ${item.id}
Client: ${item.client}
Case Type: ${item.type}
Status: ${item.status} (Currently Active)
Priority: ${item.priority}
Assigned Lawyer: ${item.assignedLawyer}
Case Value: ${item.value}
Created Date: ${item.createdDate}
Last Updated: ${item.lastUpdated}

ACTIVE CASE STATUS
==================
This case is currently ACTIVE and requires ongoing attention.
Priority Level: ${item.priority}
Legal Team: ${item.assignedLawyer}

RECENT ACTIVITY
===============
• Case was last updated on ${item.lastUpdated}
• Current status: Active proceedings
• Priority level: ${item.priority}

NEXT ACTIONS REQUIRED
=====================
1. Review case progress with assigned lawyer
2. Schedule client consultation if needed
3. Monitor upcoming deadlines
4. Prepare necessary documentation

---
Generated on: ${new Date().toLocaleDateString()}
Report Type: Active Cases Report
    `;
    
    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.id}_Active_Case_Report.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Active Case Report Downloaded",
      description: `Active case report for ${item.title} has been downloaded.`,
    });
  };

  const handleAiTools = (item: any, toolName: string) => {
    toast({
      title: "AI Tool Processing",
      description: `Processing active case "${item.title}" with ${toolName}...`,
    });
    console.log(`Processing active case ${item.id} with ${toolName}`, item);
  };

  return (
    <div className="p-3 sm:p-6">
      <DataTable
        title="Active Cases"
        columns={columns}
        data={data}
        fields={fields}
        searchPlaceholder="Search active cases by title, client, or case ID..."
        onAdd={addItem}
        onEdit={updateItem}
        onDelete={deleteItem}
        onExport={exportData}
        onPreview={handlePreview}
        onAiTools={handleAiTools}
        entityName="Active Case"
        showPreviewAction={true}
        showAiToolsAction={true}
        className="overflow-x-auto"
      />
    </div>
  );
};

export default ActiveCases;