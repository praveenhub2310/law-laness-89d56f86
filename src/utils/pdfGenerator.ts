import jsPDF from 'jspdf';
import 'jspdf-autotable';

export interface InvoiceData {
  id: string;
  invoice_number: string;
  client_id?: string;
  lawyer_id?: string;
  services: any[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  issued_date: string;
  due_date?: string;
  status: string;
  notes?: string;
  // Additional fields for PDF generation
  clientName?: string;
  clientEmail?: string;
  clientAddress?: string;
  lawyerName?: string;
  lawyerEmail?: string;
  lawyerAddress?: string;
  companyName?: string;
  companyLogo?: string;
}

export const generateInvoicePDF = (invoice: InvoiceData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Company Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.companyName || 'Legal Services Firm', 20, 30);
  
  // Invoice Title
  doc.setFontSize(24);
  doc.setTextColor(40, 40, 40);
  doc.text('INVOICE', pageWidth - 20, 30, { align: 'right' });
  
  // Invoice Details (Top Right)
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  const invoiceDetails = [
    `Invoice #: ${invoice.invoice_number}`,
    `Date: ${new Date(invoice.issued_date).toLocaleDateString()}`,
    `Due Date: ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'Upon Receipt'}`,
    `Status: ${invoice.status.toUpperCase()}`
  ];
  
  invoiceDetails.forEach((detail, index) => {
    doc.text(detail, pageWidth - 20, 50 + (index * 7), { align: 'right' });
  });
  
  // Bill To Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text('BILL TO:', 20, 80);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.clientName || 'Client Name', 20, 95);
  if (invoice.clientEmail) {
    doc.text(invoice.clientEmail, 20, 105);
  }
  if (invoice.clientAddress) {
    doc.text(invoice.clientAddress, 20, 115);
  }
  
  // Services Table
  const tableStartY = 140;
  
  // Prepare services data
  const servicesData = invoice.services && invoice.services.length > 0 
    ? invoice.services.map((service: any) => [
        service.description || 'Legal Service',
        service.quantity || 1,
        `$${(service.rate || 0).toFixed(2)}`,
        `$${((service.quantity || 1) * (service.rate || 0)).toFixed(2)}`
      ])
    : [['Legal Services', 1, `$${invoice.subtotal.toFixed(2)}`, `$${invoice.subtotal.toFixed(2)}`]];
  
  // Add services table
  (doc as any).autoTable({
    startY: tableStartY,
    head: [['Description', 'Qty', 'Rate', 'Amount']],
    body: servicesData,
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    headStyles: {
      fillColor: [34, 197, 94],
      textColor: 255,
      fontStyle: 'bold'
    },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'right' }
    },
    margin: { left: 20, right: 20 }
  });
  
  const finalY = (doc as any).lastAutoTable.finalY || tableStartY + 50;
  
  // Totals Section
  const totalsStartY = finalY + 20;
  const totalsX = pageWidth - 80;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  // Subtotal
  doc.text('Subtotal:', totalsX - 40, totalsStartY, { align: 'right' });
  doc.text(`$${invoice.subtotal.toFixed(2)}`, totalsX, totalsStartY, { align: 'right' });
  
  // Discount (if any)
  if (invoice.discount_amount > 0) {
    doc.text('Discount:', totalsX - 40, totalsStartY + 10, { align: 'right' });
    doc.text(`-$${invoice.discount_amount.toFixed(2)}`, totalsX, totalsStartY + 10, { align: 'right' });
  }
  
  // Tax
  const taxY = invoice.discount_amount > 0 ? totalsStartY + 20 : totalsStartY + 10;
  doc.text('Tax:', totalsX - 40, taxY, { align: 'right' });
  doc.text(`$${invoice.tax_amount.toFixed(2)}`, totalsX, taxY, { align: 'right' });
  
  // Total (Bold)
  const totalY = taxY + 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('TOTAL:', totalsX - 40, totalY, { align: 'right' });
  doc.text(`$${invoice.total_amount.toFixed(2)}`, totalsX, totalY, { align: 'right' });
  
  // Notes Section (if any)
  if (invoice.notes) {
    const notesY = totalY + 30;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', 20, notesY);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(invoice.notes, pageWidth - 40);
    doc.text(splitNotes, 20, notesY + 10);
  }
  
  // Footer
  const footerY = doc.internal.pageSize.height - 30;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
  
  return doc;
};

export const downloadInvoicePDF = (invoice: InvoiceData) => {
  const doc = generateInvoicePDF(invoice);
  doc.save(`Invoice-${invoice.invoice_number}.pdf`);
};

export const previewInvoicePDF = (invoice: InvoiceData) => {
  const doc = generateInvoicePDF(invoice);
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, '_blank');
};