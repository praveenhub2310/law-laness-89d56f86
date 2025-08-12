import React from 'react';
import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { useDataManager } from '@/hooks/useDataManager';
import { useToast } from '@/hooks/use-toast';

const ClosedCases = () => {
  const { toast } = useToast();
  
  // Only closed cases data
  const initialClosedCasesData = [
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
      closedDate: "2024-01-05",
      value: "$25,000",
      outcome: "Successful"
    },
    {
      id: "CASE-2023-098",
      title: "Divorce Settlement",
      type: "Family Law",
      client: "Lisa Anderson",
      assignedLawyer: "Sarah Wilson",
      status: "Closed",
      priority: "Medium",
      createdDate: "2023-10-20",
      lastUpdated: "2023-12-20",
      closedDate: "2023-12-20",
      value: "$80,000",
      outcome: "Settled"
    },
    {
      id: "CASE-2023-087",
      title: "Personal Injury Claim",
      type: "Personal Injury",
      client: "Mark Thompson",
      assignedLawyer: "John Davis",
      status: "Closed",
      priority: "High",
      createdDate: "2023-08-15",
      lastUpdated: "2023-11-30",
      closedDate: "2023-11-30",
      value: "$250,000",
      outcome: "Won"
    },
    {
      id: "CASE-2023-076",
      title: "Employment Contract Dispute",
      type: "Employment Law",
      client: "Global Tech Solutions",
      assignedLawyer: "Emily Brown",
      status: "Closed",
      priority: "Medium",
      createdDate: "2023-07-10",
      lastUpdated: "2023-10-15",
      closedDate: "2023-10-15",
      value: "$120,000",
      outcome: "Dismissed"
    }
  ];

  const {
    data,
    addItem,
    updateItem,
    deleteItem,
    exportData
  } = useDataManager({
    initialData: initialClosedCasesData,
    entityName: 'Closed Case'
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
      filterOptions: ['Corporate Law', 'Family Law', 'Personal Injury', 'Employment Law'],
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
      filterOptions: ['Emily Brown', 'Sarah Wilson', 'John Davis'],
      className: 'min-w-[150px] hidden sm:table-cell'
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: ['Closed'],
      className: 'min-w-[100px]',
      render: (value: string) => (
        <Badge className="bg-gray-100 text-gray-800 text-xs">
          {value}
        </Badge>
      )
    },
    {
      key: 'outcome',
      label: 'Outcome',
      sortable: true,
      filterable: true,
      filterOptions: ['Successful', 'Settled', 'Won', 'Dismissed'],
      className: 'min-w-[100px] hidden md:table-cell',
      render: (value: string) => {
        const colors = {
          'Won': 'bg-green-100 text-green-800',
          'Successful': 'bg-green-100 text-green-800',
          'Settled': 'bg-blue-100 text-blue-800',
          'Dismissed': 'bg-red-100 text-red-800'
        };
        return (
          <Badge className={`${colors[value as keyof typeof colors] || 'bg-gray-100 text-gray-800'} text-xs`}>
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
      key: 'closedDate',
      label: 'Closed Date',
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
      options: ['Corporate Law', 'Family Law', 'Personal Injury', 'Employment Law'],
      required: true 
    },
    { key: 'client', label: 'Client Name', type: 'text' as const, required: true },
    { 
      key: 'assignedLawyer', 
      label: 'Assigned Lawyer', 
      type: 'select' as const,
      options: ['Emily Brown', 'Sarah Wilson', 'John Davis'],
      required: true 
    },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'select' as const,
      options: ['Closed'],
      required: true,
      readonly: true
    },
    { 
      key: 'outcome', 
      label: 'Case Outcome', 
      type: 'select' as const,
      options: ['Successful', 'Settled', 'Won', 'Dismissed'],
      required: true 
    },
    { key: 'value', label: 'Case Value', type: 'text' as const },
    { key: 'createdDate', label: 'Created Date', type: 'date' as const, required: true },
    { key: 'closedDate', label: 'Closed Date', type: 'date' as const, required: true },
    { key: 'lastUpdated', label: 'Last Updated', type: 'date' as const, readonly: true }
  ];

  const handlePreview = (item: any) => {
    const content = `Closed Case Report: ${item.title}

CASE INFORMATION
================
Case ID: ${item.id}
Client: ${item.client}
Case Type: ${item.type}
Status: ${item.status}
Final Outcome: ${item.outcome}
Assigned Lawyer: ${item.assignedLawyer}
Case Value: ${item.value}
Created Date: ${item.createdDate}
Closed Date: ${item.closedDate}
Last Updated: ${item.lastUpdated}

CASE CLOSURE SUMMARY
====================
This case has been successfully closed with outcome: ${item.outcome}
Final case value: ${item.value}
Duration: ${item.createdDate} to ${item.closedDate}

CASE OUTCOME DETAILS
====================
• Final Status: ${item.status}
• Case Outcome: ${item.outcome}
• Legal Team: ${item.assignedLawyer}
• Client Satisfaction: High
• Case Duration: Completed within expected timeframe

LESSONS LEARNED
===============
[This section would contain insights and lessons from the closed case]

CASE ARCHIVAL
=============
• Case files archived on: ${item.closedDate}
• Client final billing completed
• All documentation stored in case management system
• Client feedback collected and recorded

---
Generated on: ${new Date().toLocaleDateString()}
Report Type: Closed Cases Report
    `;
    
    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.id}_Closed_Case_Report.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Closed Case Report Downloaded",
      description: `Closed case report for ${item.title} has been downloaded.`,
    });
  };

  const handleAiTools = (item: any, toolName: string) => {
    toast({
      title: "AI Tool Processing",
      description: `Processing closed case "${item.title}" with ${toolName}...`,
    });
    console.log(`Processing closed case ${item.id} with ${toolName}`, item);
  };

  return (
    <div className="p-3 sm:p-6">
      <DataTable
        title="Closed Cases"
        columns={columns}
        data={data}
        fields={fields}
        searchPlaceholder="Search closed cases by title, client, or case ID..."
        onAdd={addItem}
        onEdit={updateItem}
        onDelete={deleteItem}
        onExport={exportData}
        onPreview={handlePreview}
        onAiTools={handleAiTools}
        entityName="Closed Case"
        showPreviewAction={true}
        showAiToolsAction={true}
        className="overflow-x-auto"
      />
    </div>
  );
};

export default ClosedCases;