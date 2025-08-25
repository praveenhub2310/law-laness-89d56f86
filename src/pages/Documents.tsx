import React from 'react';
import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { useDataManager } from '@/hooks/useDataManager';
import { useToast } from '@/hooks/use-toast';

const Documents = () => {
  const { toast } = useToast();
  
  const initialDocumentsData = [
    {
      id: "DOC-001",
      filename: "Complaint_Johnson_vs_Insurance.pdf",
      title: "Initial Complaint Document",
      caseNumber: "CASE-2024-001",
      category: "Legal Filing",
      type: "PDF",
      size: "2.4 MB",
      uploadedBy: "Sarah Wilson",
      uploadDate: "2024-01-10",
      lastModified: "2024-01-12",
      status: "Active",
      confidential: true,
      version: "1.2"
    },
    {
      id: "DOC-002",
      filename: "Property_Deed_Smith.pdf",
      title: "Property Ownership Deed",
      caseNumber: "CASE-2024-002",
      category: "Evidence",
      type: "PDF",
      size: "1.8 MB",
      uploadedBy: "John Davis",
      uploadDate: "2024-01-08",
      lastModified: "2024-01-08",
      status: "Active",
      confidential: false,
      version: "1.0"
    },
    {
      id: "DOC-003",
      filename: "Contract_TechCorp_Review.docx",
      title: "Corporate Contract Analysis",
      caseNumber: "CASE-2024-003",
      category: "Contract",
      type: "DOCX",
      size: "856 KB",
      uploadedBy: "Emily Brown",
      uploadDate: "2024-01-05",
      lastModified: "2024-01-07",
      status: "Draft",
      confidential: true,
      version: "2.1"
    }
  ];

  const {
    data,
    addItem,
    updateItem,
    deleteItem,
    exportData
  } = useDataManager({
    initialData: initialDocumentsData,
    entityName: 'Document'
  });

  const columns = [
    {
      key: 'id',
      label: 'Document ID',
      sortable: true,
      filterable: true
    },
    {
      key: 'filename',
      label: 'File Name',
      sortable: true,
      filterable: true
    },
    {
      key: 'title',
      label: 'Document Title',
      sortable: true,
      filterable: true
    },
    {
      key: 'caseNumber',
      label: 'Case Number',
      sortable: true,
      filterable: true
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      filterable: true,
      filterOptions: ['Legal Filing', 'Evidence', 'Contract', 'Correspondence'],
      render: (value: string) => (
        <Badge variant="outline">{value}</Badge>
      )
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      filterable: true,
      filterOptions: ['PDF', 'DOCX', 'XLSX', 'IMG'],
      render: (value: string) => {
        const colors = {
          'PDF': 'bg-red-100 text-red-800',
          'DOCX': 'bg-blue-100 text-blue-800',
          'XLSX': 'bg-green-100 text-green-800',
          'IMG': 'bg-purple-100 text-purple-800'
        };
        return (
          <Badge className={colors[value as keyof typeof colors]}>
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'size',
      label: 'File Size',
      sortable: true,
      filterable: true
    },
    {
      key: 'uploadedBy',
      label: 'Uploaded By',
      sortable: true,
      filterable: true
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: ['Active', 'Draft', 'Archived'],
      render: (value: string) => {
        const colors = {
          'Active': 'bg-green-100 text-green-800',
          'Draft': 'bg-yellow-100 text-yellow-800',
          'Archived': 'bg-gray-100 text-gray-800'
        };
        return (
          <Badge className={colors[value as keyof typeof colors]}>
            {value}
          </Badge>
        );
      }
    },
    {
      key: 'confidential',
      label: 'Confidential',
      sortable: true,
      filterable: true,
      render: (value: boolean) => (
        <Badge className={value ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
          {value ? 'Yes' : 'No'}
        </Badge>
      )
    },
    {
      key: 'version',
      label: 'Version',
      sortable: true,
      filterable: true
    }
  ];

  const fields = [
    { key: 'case_id', label: 'Associated Case', type: 'case_select' as const, required: false },
    { key: 'filename', label: 'File Name', type: 'text' as const, required: true },
    { key: 'title', label: 'Document Title', type: 'text' as const, required: true },
    { 
      key: 'category', 
      label: 'Category', 
      type: 'select' as const,
      options: ['Legal Filing', 'Evidence', 'Contract', 'Correspondence'],
      required: true 
    },
    { 
      key: 'type', 
      label: 'File Type', 
      type: 'select' as const,
      options: ['PDF', 'DOCX', 'XLSX', 'IMG'],
      required: true 
    },
    { key: 'size', label: 'File Size', type: 'text' as const },
    { key: 'uploadedBy', label: 'Uploaded By', type: 'text' as const, required: true },
    { key: 'uploadDate', label: 'Upload Date', type: 'date' as const, required: true },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'select' as const,
      options: ['Active', 'Draft', 'Archived'],
      required: true 
    },
    { key: 'confidential', label: 'Confidential', type: 'select' as const, options: ['true', 'false'] },
    { key: 'version', label: 'Version', type: 'text' as const }
  ];

  const handleGoogleDriveConnect = async () => {
    // OAuth 2.0 flow for Google Drive
    toast({
      title: "Connecting to Google Drive",
      description: "Opening authentication window...",
    });
    
    // Simulate OAuth popup flow
    setTimeout(() => {
      toast({
        title: "Google Drive Connected ✔️",
        description: "Successfully connected to your Google Drive account.",
      });
    }, 2000);
  };

  const handleOneDriveConnect = async () => {
    // OAuth 2.0 flow for OneDrive
    toast({
      title: "Connecting to OneDrive",
      description: "Opening authentication window...",
    });
    
    // Simulate OAuth popup flow
    setTimeout(() => {
      toast({
        title: "OneDrive Connected ✔️",
        description: "Successfully connected to your OneDrive account.",
      });
    }, 2000);
  };

  const handlePreview = (item: any) => {
    // Generate a structured document report
    const content = `Document Report: ${item.title}

DOCUMENT INFORMATION
===================
Document ID: ${item.id}
Filename: ${item.filename}
Document Title: ${item.title}
Case Number: ${item.caseNumber}
Category: ${item.category}
File Type: ${item.type}
File Size: ${item.size}
Version: ${item.version}

DOCUMENT METADATA
================
Uploaded By: ${item.uploadedBy}
Upload Date: ${item.uploadDate}
Last Modified: ${item.lastModified}
Status: ${item.status}
Confidential: ${item.confidential ? 'Yes' : 'No'}

DOCUMENT SUMMARY
===============
This is a ${item.category} document (${item.type}) related to case ${item.caseNumber}.
The document was uploaded by ${item.uploadedBy} on ${item.uploadDate}.

DOCUMENT DETAILS
===============
• Category: ${item.category}
• File Format: ${item.type}
• Current Version: ${item.version}
• Confidentiality Level: ${item.confidential ? 'Confidential' : 'Public'}
• File Size: ${item.size}
• Associated Case: ${item.caseNumber}

DOCUMENT HISTORY
===============
• Upload Date: ${item.uploadDate}
• Last Modified: ${item.lastModified}
• Uploaded By: ${item.uploadedBy}
• Current Status: ${item.status}

---
Generated on: ${new Date().toLocaleDateString()}
Report Type: Document Information Report
    `;
    
    // Create document file
    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.id}_Document_Report.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Document Report Downloaded",
      description: `Document report for ${item.filename} has been downloaded as a DOC file.`,
    });
  };

  const handleAiTools = (item: any, toolName: string) => {
    toast({
      title: "AI Tool Processing",
      description: `Processing "${item.filename}" with ${toolName}...`,
    });
    console.log(`Processing document ${item.id} with ${toolName}`, item);
  };

  return (
    <div className="p-6">
      {/* Cloud Integration Buttons Section */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
            <p className="text-gray-600">Manage and organize your legal documents</p>
          </div>
          
          {/* Cloud Integration Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={handleGoogleDriveConnect}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-blue-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.26 12L8.59 16H15.31L17.64 12L15.31 8H8.59L6.26 12Z" fill="#34A853"/>
                <path d="M15.31 8L12.98 4H19.42L21.75 8L19.42 12H17.64L15.31 8Z" fill="#EA4335"/>
                <path d="M8.59 8L6.26 12L4.58 12L2.25 8L4.58 4H12.98L8.59 8Z" fill="#4285F4"/>
                <path d="M12.98 20L8.59 16H15.31L19.42 12L21.75 16L19.42 20H12.98Z" fill="#FBBC04"/>
                <path d="M8.59 16L4.58 12L2.25 16L4.58 20H12.98L8.59 16Z" fill="#34A853"/>
              </svg>
              <span className="text-sm font-medium text-gray-700">Connect with Google Drive</span>
            </button>
            
            <button
              onClick={handleOneDriveConnect}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-blue-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.5 5.5C18.44 5.5 20 7.06 20 9V15.5C20 17.44 18.44 19 16.5 19H7.5C3.36 19 0 15.64 0 11.5C0 8.34 2.09 5.69 5 4.65C5.41 2.56 7.52 1 10 1C12.85 1 15.19 3.34 15.19 6.19V6.5H16.5Z" fill="#0078D4"/>
              </svg>
              <span className="text-sm font-medium text-gray-700">Connect with OneDrive</span>
            </button>
          </div>
        </div>
      </div>

      <DataTable
        title="Documents"
        columns={columns}
        data={data}
        fields={fields}
        searchPlaceholder="Search documents by filename, title, or case number..."
        onAdd={addItem}
        onEdit={updateItem}
        onDelete={deleteItem}
        onExport={exportData}
        onPreview={handlePreview}
        onAiTools={handleAiTools}
        entityName="Document"
        showPreviewAction={true}
        showAiToolsAction={true}
      />
    </div>
  );
};

export default Documents;
