import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, FileDown, Search, Filter, Calendar, DollarSign } from 'lucide-react';
import jsPDF from 'jspdf';

interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  lawyer_id: string;
  services: any;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  status: string;
  due_date: string;
  issued_date: string;
  payment_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  client_profile?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

const Invoices = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clients, setClients] = useState<any[]>([]);

  const [newInvoice, setNewInvoice] = useState({
    client_id: '',
    services: [{ description: '', hours: 0, rate: 0, amount: 0 }],
    tax_amount: 0,
    discount_amount: 0,
    due_date: '',
    notes: ''
  });

  // Fetch invoices with real-time updates
  useEffect(() => {
    if (!user) return;

    const fetchInvoices = async () => {
      try {
        const { data, error } = await supabase
          .from('invoices')
          .select(`
            *,
            client_profile:profiles!invoices_client_id_fkey(
              first_name,
              last_name,
              email
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setInvoices((data as any) || []);
      } catch (error) {
        console.error('Error fetching invoices:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch invoices',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    // Fetch clients for dropdown
    const fetchClients = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('role', 'client');
      setClients(data || []);
    };

    fetchInvoices();
    fetchClients();

    // Real-time subscription
    const channel = supabase
      .channel('invoices_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'invoices'
      }, () => {
        fetchInvoices();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, toast]);

  const calculateInvoiceTotal = () => {
    const subtotal = newInvoice.services.reduce((sum, service) => sum + service.amount, 0);
    return subtotal + newInvoice.tax_amount - newInvoice.discount_amount;
  };

  const handleServiceChange = (index: number, field: string, value: any) => {
    const updatedServices = [...newInvoice.services];
    updatedServices[index] = { ...updatedServices[index], [field]: value };
    
    if (field === 'hours' || field === 'rate') {
      updatedServices[index].amount = updatedServices[index].hours * updatedServices[index].rate;
    }
    
    setNewInvoice({ ...newInvoice, services: updatedServices });
  };

  const addService = () => {
    setNewInvoice({
      ...newInvoice,
      services: [...newInvoice.services, { description: '', hours: 0, rate: 0, amount: 0 }]
    });
  };

  const removeService = (index: number) => {
    const updatedServices = newInvoice.services.filter((_, i) => i !== index);
    setNewInvoice({ ...newInvoice, services: updatedServices });
  };

  const handleCreateInvoice = async () => {
    try {
      const subtotal = newInvoice.services.reduce((sum, service) => sum + service.amount, 0);
      const total = subtotal + newInvoice.tax_amount - newInvoice.discount_amount;
      
      const invoiceNumber = `INV-${Date.now()}`;
      
      const { error } = await supabase
        .from('invoices')
        .insert([{
          invoice_number: invoiceNumber,
          client_id: newInvoice.client_id,
          lawyer_id: user?.id,
          services: newInvoice.services,
          subtotal: subtotal,
          tax_amount: newInvoice.tax_amount,
          discount_amount: newInvoice.discount_amount,
          total_amount: total,
          due_date: newInvoice.due_date,
          notes: newInvoice.notes,
          status: 'unpaid'
        }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Invoice created successfully'
      });

      setIsCreateModalOpen(false);
      setNewInvoice({
        client_id: '',
        services: [{ description: '', hours: 0, rate: 0, amount: 0 }],
        tax_amount: 0,
        discount_amount: 0,
        due_date: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to create invoice',
        variant: 'destructive'
      });
    }
  };

  const handleStatusUpdate = async (invoiceId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ 
          status: newStatus,
          payment_date: newStatus === 'paid' ? new Date().toISOString() : null
        })
        .eq('id', invoiceId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Invoice marked as ${newStatus}`
      });
    } catch (error) {
      console.error('Error updating invoice status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update invoice status',
        variant: 'destructive'
      });
    }
  };

  const generatePDF = (invoice: Invoice) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Header
    doc.setFontSize(20);
    doc.text('INVOICE', pageWidth / 2, 30, { align: 'center' });
    
    // Invoice details
    doc.setFontSize(12);
    doc.text(`Invoice #: ${invoice.invoice_number}`, 20, 50);
    doc.text(`Date: ${new Date(invoice.issued_date).toLocaleDateString()}`, 20, 60);
    doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, 20, 70);
    
    // Client details
    doc.text('Bill To:', 20, 90);
    if (invoice.client_profile) {
      doc.text(`${invoice.client_profile.first_name} ${invoice.client_profile.last_name}`, 20, 100);
      doc.text(invoice.client_profile.email, 20, 110);
    }
    
    // Services table
    let yPos = 130;
    doc.text('Description', 20, yPos);
    doc.text('Hours', 100, yPos);
    doc.text('Rate', 130, yPos);
    doc.text('Amount', 160, yPos);
    
    yPos += 10;
    doc.line(20, yPos, 190, yPos); // Table header line
    yPos += 10;
    
    invoice.services.forEach((service: any) => {
      doc.text(service.description || 'Service', 20, yPos);
      doc.text(service.hours?.toString() || '0', 100, yPos);
      doc.text(`$${service.rate || 0}`, 130, yPos);
      doc.text(`$${service.amount || 0}`, 160, yPos);
      yPos += 10;
    });
    
    // Totals
    yPos += 10;
    doc.line(20, yPos, 190, yPos);
    yPos += 10;
    
    doc.text(`Subtotal: $${invoice.subtotal}`, 130, yPos);
    yPos += 10;
    doc.text(`Tax: $${invoice.tax_amount}`, 130, yPos);
    yPos += 10;
    doc.text(`Discount: -$${invoice.discount_amount}`, 130, yPos);
    yPos += 10;
    doc.setFontSize(14);
    doc.text(`Total: $${invoice.total_amount}`, 130, yPos);
    
    // Notes
    if (invoice.notes) {
      yPos += 20;
      doc.setFontSize(12);
      doc.text('Notes:', 20, yPos);
      yPos += 10;
      doc.text(invoice.notes, 20, yPos);
    }
    
    doc.save(`invoice-${invoice.invoice_number}.pdf`);
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.client_profile?.first_name + ' ' + invoice.client_profile?.last_name).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'unpaid': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-6">Loading invoices...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">Manage and track your invoices</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="client">Client</Label>
                <Select value={newInvoice.client_id} onValueChange={(value) => setNewInvoice({...newInvoice, client_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.first_name} {client.last_name} ({client.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Services</Label>
                {newInvoice.services.map((service, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end mb-2">
                    <div className="col-span-5">
                      <Input
                        placeholder="Service description"
                        value={service.description}
                        onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Hours"
                        value={service.hours}
                        onChange={(e) => handleServiceChange(index, 'hours', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Rate"
                        value={service.rate}
                        onChange={(e) => handleServiceChange(index, 'rate', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={service.amount}
                        readOnly
                      />
                    </div>
                    <div className="col-span-1">
                      {newInvoice.services.length > 1 && (
                        <Button variant="outline" size="sm" onClick={() => removeService(index)}>
                          ×
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={addService}>Add Service</Button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="tax">Tax Amount</Label>
                  <Input
                    id="tax"
                    type="number"
                    value={newInvoice.tax_amount}
                    onChange={(e) => setNewInvoice({...newInvoice, tax_amount: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="discount">Discount</Label>
                  <Input
                    id="discount"
                    type="number"
                    value={newInvoice.discount_amount}
                    onChange={(e) => setNewInvoice({...newInvoice, discount_amount: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={newInvoice.due_date}
                    onChange={(e) => setNewInvoice({...newInvoice, due_date: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newInvoice.notes}
                  onChange={(e) => setNewInvoice({...newInvoice, notes: e.target.value})}
                />
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-lg font-semibold">
                  Total: ${calculateInvoiceTotal().toFixed(2)}
                </div>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateInvoice}>
                    Create Invoice
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoices Grid */}
      <div className="grid gap-4">
        {filteredInvoices.map((invoice) => (
          <Card key={invoice.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{invoice.invoice_number}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {invoice.client_profile?.first_name} {invoice.client_profile?.last_name}
                  </p>
                </div>
                <Badge className={getStatusColor(invoice.status)}>
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Issued
                  </div>
                  <div>{new Date(invoice.issued_date).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Due
                  </div>
                  <div>{new Date(invoice.due_date).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <DollarSign className="h-3 w-3" />
                    Amount
                  </div>
                  <div className="font-semibold">${invoice.total_amount}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => generatePDF(invoice)}>
                    <FileDown className="h-3 w-3 mr-1" />
                    PDF
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleStatusUpdate(invoice.id, invoice.status === 'paid' ? 'unpaid' : 'paid')}
                    className={invoice.status === 'paid' ? 'text-yellow-600' : 'text-green-600'}
                  >
                    Mark as {invoice.status === 'paid' ? 'Unpaid' : 'Paid'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInvoices.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No invoices found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Invoices;