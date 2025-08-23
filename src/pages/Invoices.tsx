
import React from 'react';
import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { downloadInvoicePDF, previewInvoicePDF } from '@/utils/pdfGenerator';
import { useToast } from '@/hooks/use-toast';

const Invoices = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const {
    data: invoices,
    loading,
    addItem,
    updateItem,
    deleteItem
  } = useSupabaseData({
    table: 'invoices',
    select: '*',
    filters: user?.role === 'client' ? { client_id: user.id } : {},
    orderBy: { column: 'created_at', ascending: false },
    realtime: true
  });

  // Generate auto invoice number
  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `INV-${year}${month}-${random}`;
  };

  // Handle adding new invoice
  const handleAddInvoice = async (formData: any) => {
    console.log('Form data received:', formData);
    console.log('Current user:', user);
    
    const invoiceData = {
      invoice_number: generateInvoiceNumber(),
      client_id: formData.client_id || user?.id,
      lawyer_id: user?.id,
      services: formData.services ? JSON.parse(formData.services) : [
        {
          description: formData.description,
          quantity: 1,
          rate: parseFloat(formData.amount) || 0
        }
      ],
      subtotal: parseFloat(formData.amount) || 0,
      tax_amount: parseFloat(formData.tax_amount) || 0,
      discount_amount: parseFloat(formData.discount_amount) || 0,
      total_amount: (parseFloat(formData.amount) || 0) + (parseFloat(formData.tax_amount) || 0) - (parseFloat(formData.discount_amount) || 0),
      issued_date: formData.issued_date || new Date().toISOString().split('T')[0],
      due_date: formData.due_date,
      status: formData.status || 'unpaid',
      notes: formData.notes
    };
    
    console.log('Invoice data to be inserted:', invoiceData);
    
    const result = await addItem(invoiceData);
    console.log('Insert result:', result);
  };

  // Handle PDF download
  const handleDownloadPDF = (invoice: any) => {
    const pdfData = {
      ...invoice,
      clientName: invoice.client_id || 'Client',
      clientEmail: 'client@example.com',
      lawyerName: 'Lawyer',
      lawyerEmail: user?.email || 'lawyer@example.com',
      companyName: 'Legal Services Firm'
    };
    
    downloadInvoicePDF(pdfData);
    toast({
      title: 'Success',
      description: 'Invoice PDF downloaded successfully.'
    });
  };

  // Handle PDF preview
  const handlePreviewPDF = (invoice: any) => {
    const pdfData = {
      ...invoice,
      clientName: invoice.client_id || 'Client',
      clientEmail: 'client@example.com',
      lawyerName: 'Lawyer',
      lawyerEmail: user?.email || 'lawyer@example.com',
      companyName: 'Legal Services Firm'
    };
    
    previewInvoicePDF(pdfData);
  };

  // Format data for display
  const formattedData = invoices.map(invoice => ({
    ...invoice, // Keep all original properties
    clientName: invoice.client_id || 'N/A',
    amount: `$${invoice.total_amount?.toFixed(2) || '0.00'}`,
    issueDate: new Date(invoice.issued_date).toLocaleDateString(),
    dueDate: invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A',
    taxAmount: `$${invoice.tax_amount?.toFixed(2) || '0.00'}`
  }));

  const handleExportData = () => {
    const csvData = invoices.map(invoice => ({
      'Invoice Number': invoice.invoice_number,
      'Client Name': invoice.client_id || 'N/A',
      'Amount': `$${invoice.total_amount?.toFixed(2) || '0.00'}`,
      'Issue Date': new Date(invoice.issued_date).toLocaleDateString(),
      'Due Date': invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A',
      'Status': invoice.status,
      'Tax Amount': `$${invoice.tax_amount?.toFixed(2) || '0.00'}`,
      'Notes': invoice.notes || ''
    }));
    
    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoices.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Remove the case number column since it's not in the database
  const columns = [
    {
      key: 'invoice_number',
      label: 'Invoice #',
      sortable: true,
      filterable: true
    },
    {
      key: 'clientName',
      label: 'Client Name',
      sortable: true,
      filterable: true
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      filterable: true
    },
    {
      key: 'issueDate',
      label: 'Issue Date',
      sortable: true,
      filterable: true
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      sortable: true,
      filterable: true
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: ['paid', 'unpaid', 'overdue', 'draft'],
      render: (value: string) => {
        const colors = {
          'paid': 'bg-green-100 text-green-800',
          'unpaid': 'bg-yellow-100 text-yellow-800',
          'overdue': 'bg-red-100 text-red-800',
          'draft': 'bg-gray-100 text-gray-800'
        };
        return (
          <Badge className={colors[value as keyof typeof colors]}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Badge>
        );
      }
    },
    {
      key: 'taxAmount',
      label: 'Tax Amount',
      sortable: true,
      filterable: false
    }
  ];

  const fields = [
    { key: 'client_id', label: 'Client ID', type: 'text' as const, required: true },
    { key: 'amount', label: 'Amount ($)', type: 'number' as const, required: true },
    { key: 'issued_date', label: 'Issue Date', type: 'date' as const, required: true },
    { key: 'due_date', label: 'Due Date', type: 'date' as const },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'select' as const,
      options: ['paid', 'unpaid', 'overdue', 'draft'],
      required: true 
    },
    { key: 'description', label: 'Service Description', type: 'textarea' as const, required: true },
    { key: 'tax_amount', label: 'Tax Amount ($)', type: 'number' as const },
    { key: 'discount_amount', label: 'Discount Amount ($)', type: 'number' as const },
    { key: 'notes', label: 'Notes', type: 'textarea' as const }
  ];

  return (
    <div className="p-6">
      <DataTable
        title="Invoices Management"
        columns={columns}
        data={formattedData}
        fields={fields}
        searchPlaceholder="Search invoices by client name, invoice number, or status..."
        onAdd={handleAddInvoice}
        onEdit={updateItem}
        onDelete={deleteItem}
        onExport={handleExportData}
        onPreview={handlePreviewPDF}
        onDownload={handleDownloadPDF}
        entityName="Invoice"
        showPreviewAction
        loading={loading}
      />
    </div>
  );
};

export default Invoices;
