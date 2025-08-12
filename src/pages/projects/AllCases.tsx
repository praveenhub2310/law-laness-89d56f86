import React from 'react';
import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { useDataManager } from '@/hooks/useDataManager';
import { useToast } from '@/hooks/use-toast';

const AllCases = () => {
  const { toast } = useToast();
  
  const initialCasesData = [
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
      id: "CASE-2024-002", 
      title: "Smith Property Dispute",
      type: "Real Estate",
      client: "Robert Smith",
      assignedLawyer: "John Davis",
      status: "Under Review",
      priority: "Medium",
      createdDate: "2024-01-08",
      lastUpdated: "2024-01-11",
      value: "$75,000"
    },
    {
      id: "CASE-2024-003",
      title: "Corporate Contract Review",
      type: "Corporate Law",
      client: "TechCorp Inc.",
      assignedLawyer: "Emily Brown",
      status: "Closed",
      priority: "Low",
      createdDate: "2023-12-15",
      lastUpdated: "2024-01-05",
      value: "$25,000"
    },
    {
      id: "CASE-2024-004",
      title: "Employment Discrimination Case",
      type: "Employment Law",
      client: "Jane Doe",
      assignedLawyer: "Michael Johnson",
      status: "On Hold",
      priority: "High",
      createdDate: "2024-01-05",
      lastUpdated: "2024-01-10",
      value: "$200,000"
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
    }
  ];

  const {
    data,
    addItem,
    updateItem,
    deleteItem,
    exportData
  } = useDataManager({
    initialData: initialCasesData,
    entityName: 'Case'
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
      filterOptions: ['Personal Injury', 'Real Estate', 'Corporate Law', 'Family Law', 'Criminal Law', 'Employment Law', 'Medical Malpractice'],
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
      filterOptions: ['Sarah Wilson', 'John Davis', 'Emily Brown', 'Michael Johnson'],
      className: 'min-w-[150px] hidden sm:table-cell'
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: ['Active', 'Under Review', 'Closed', 'On Hold'],
      className: 'min-w-[100px]',
      render: (value: string) => {
        const colors = {
          'Active': 'bg-green-100 text-green-800',
          'Under Review': 'bg-yellow-100 text-yellow-800',
          'Closed': 'bg-gray-100 text-gray-800',
          'On Hold': 'bg-red-100 text-red-800'
        };
        return (
          <Badge className={`${colors[value as keyof typeof colors] || 'bg-gray-100 text-gray-800'} text-xs`}>
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
      options: ['Personal Injury', 'Real Estate', 'Corporate Law', 'Family Law', 'Criminal Law', 'Employment Law', 'Medical Malpractice'],
      required: true 
    },
    { key: 'client', label: 'Client Name', type: 'text' as const, required: true },
    { 
      key: 'assignedLawyer', 
      label: 'Assigned Lawyer', 
      type: 'select' as const,
      options: ['Sarah Wilson', 'John Davis', 'Emily Brown', 'Michael Johnson'],
      required: true 
    },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'select' as const,
      options: ['Active', 'Under Review', 'Closed', 'On Hold'],
      required: true 
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
    const content = `Case Report: ${item.title}

CASE INFORMATION
================
Case ID: ${item.id}
Client: ${item.client}
Case Type: ${item.type}
Status: ${item.status}
Priority: ${item.priority}
Assigned Lawyer: ${item.assignedLawyer}
Case Value: ${item.value}
Created Date: ${item.createdDate}
Last Updated: ${item.lastUpdated}

CASE SUMMARY
============
This is a ${item.type} case for ${item.client}. The case is currently ${item.status} with ${item.priority} priority.
The case was created on ${item.createdDate} and was last updated on ${item.lastUpdated}.

CASE DETAILS
============
• Case Type: ${item.type}
• Current Status: ${item.status}
• Priority Level: ${item.priority}
• Assigned Legal Team: ${item.assignedLawyer}
• Estimated Value: ${item.value}

NEXT STEPS
==========
[This section would contain next steps based on case status and priority]

---
Generated on: ${new Date().toLocaleDateString()}
Report Type: All Cases Report
    `;
    
    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.id}_All_Cases_Report.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Case Report Downloaded",
      description: `Case report for ${item.title} has been downloaded as a DOC file.`,
    });
  };

  const handleAiTools = (item: any, toolName: string) => {
    toast({
      title: "AI Tool Processing",
      description: `Processing "${item.title}" with ${toolName}...`,
    });
    console.log(`Processing case ${item.id} with ${toolName}`, item);
  };

  return (
    <div className="p-3 sm:p-6">
      <DataTable
        title="All Cases"
        columns={columns}
        data={data}
        fields={fields}
        searchPlaceholder="Search all cases by title, client, or case ID..."
        onAdd={addItem}
        onEdit={updateItem}
        onDelete={deleteItem}
        onExport={exportData}
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