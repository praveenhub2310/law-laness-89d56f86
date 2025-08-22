import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Plus, 
  Search, 
  Filter, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Briefcase, 
  Edit, 
  Trash2, 
  Eye,
  UserPlus,
  Users
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Client {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  role: string;
  company_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  client_details?: {
    client_type?: string;
    preferred_contact_method?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
  };
  cases?: Array<{
    id: string;
    case_number: string;
    title: string;
    status: string;
  }>;
}

const MyClientsPage = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [newClient, setNewClient] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    client_type: 'individual',
    preferred_contact_method: 'email',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  });

  // Fetch clients with real-time updates
  useEffect(() => {
    if (!user) return;

    const fetchClients = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            *,
            client_details:clients(
              client_type,
              preferred_contact_method,
              emergency_contact_name,
              emergency_contact_phone
            ),
            cases:projects!projects_client_id_fkey(
              id,
              case_number,
              title,
              status
            )
          `)
          .eq('role', 'client')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setClients((data as any) || []);
      } catch (error) {
        console.error('Error fetching clients:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch clients',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClients();

    // Real-time subscription for profiles changes
    const channel = supabase
      .channel('clients_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: 'role=eq.client'
      }, () => {
        fetchClients();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, toast]);

  const handleCreateClient = async () => {
    if (!newClient.first_name || !newClient.last_name || !newClient.email) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newClient.email,
        password: Math.random().toString(36).slice(-8), // Temporary password
        options: {
          data: {
            first_name: newClient.first_name,
            last_name: newClient.last_name,
            role: 'client'
          }
        }
      });

      if (authError) throw authError;

      // Update client details
      if (authData.user) {
        const { error: clientError } = await supabase
          .from('clients')
          .update({
            client_type: newClient.client_type,
            preferred_contact_method: newClient.preferred_contact_method,
            emergency_contact_name: newClient.emergency_contact_name || null,
            emergency_contact_phone: newClient.emergency_contact_phone || null
          })
          .eq('id', authData.user.id);

        if (clientError) throw clientError;

        // Update profile with phone
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            phone: newClient.phone || null
          })
          .eq('id', authData.user.id);

        if (profileError) throw profileError;
      }

      toast({
        title: 'Success',
        description: 'Client created successfully'
      });

      setIsCreateModalOpen(false);
      setNewClient({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        client_type: 'individual',
        preferred_contact_method: 'email',
        emergency_contact_name: '',
        emergency_contact_phone: ''
      });
    } catch (error) {
      console.error('Error creating client:', error);
      toast({
        title: 'Error',
        description: 'Failed to create client',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateClient = async () => {
    if (!selectedClient) return;

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: newClient.first_name,
          last_name: newClient.last_name,
          phone: newClient.phone || null
        })
        .eq('id', selectedClient.id);

      if (profileError) throw profileError;

      // Update client details
      const { error: clientError } = await supabase
        .from('clients')
        .update({
          client_type: newClient.client_type,
          preferred_contact_method: newClient.preferred_contact_method,
          emergency_contact_name: newClient.emergency_contact_name || null,
          emergency_contact_phone: newClient.emergency_contact_phone || null
        })
        .eq('id', selectedClient.id);

      if (clientError) throw clientError;

      toast({
        title: 'Success',
        description: 'Client updated successfully'
      });

      setIsEditModalOpen(false);
      setSelectedClient(null);
    } catch (error) {
      console.error('Error updating client:', error);
      toast({
        title: 'Error',
        description: 'Failed to update client',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Client deactivated successfully'
      });
    } catch (error) {
      console.error('Error deactivating client:', error);
      toast({
        title: 'Error',
        description: 'Failed to deactivate client',
        variant: 'destructive'
      });
    }
  };

  const openEditModal = (client: Client) => {
    setSelectedClient(client);
    setNewClient({
      first_name: client.first_name || '',
      last_name: client.last_name || '',
      email: client.email,
      phone: client.phone || '',
      client_type: client.client_details?.client_type || 'individual',
      preferred_contact_method: client.client_details?.preferred_contact_method || 'email',
      emergency_contact_name: client.client_details?.emergency_contact_name || '',
      emergency_contact_phone: client.client_details?.emergency_contact_phone || ''
    });
    setIsEditModalOpen(true);
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = (client.first_name + ' ' + client.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && client.is_active) ||
      (statusFilter === 'inactive' && !client.is_active);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="p-6">Loading clients...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Clients</h1>
          <p className="text-muted-foreground">Manage your client relationships and information</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={newClient.first_name}
                    onChange={(e) => setNewClient({...newClient, first_name: e.target.value})}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={newClient.last_name}
                    onChange={(e) => setNewClient({...newClient, last_name: e.target.value})}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <Label htmlFor="client_type">Client Type</Label>
                <Select value={newClient.client_type} onValueChange={(value) => setNewClient({...newClient, client_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="organization">Organization</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="contact_method">Preferred Contact Method</Label>
                <Select value={newClient.preferred_contact_method} onValueChange={(value) => setNewClient({...newClient, preferred_contact_method: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="emergency_name">Emergency Contact Name</Label>
                <Input
                  id="emergency_name"
                  value={newClient.emergency_contact_name}
                  onChange={(e) => setNewClient({...newClient, emergency_contact_name: e.target.value})}
                  placeholder="Enter emergency contact name"
                />
              </div>

              <div>
                <Label htmlFor="emergency_phone">Emergency Contact Phone</Label>
                <Input
                  id="emergency_phone"
                  value={newClient.emergency_contact_phone}
                  onChange={(e) => setNewClient({...newClient, emergency_contact_phone: e.target.value})}
                  placeholder="Enter emergency contact phone"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateClient}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Client
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredClients.length}</div>
            <p className="text-xs text-muted-foreground">All registered clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <UserPlus className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {filteredClients.filter(c => c.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredClients.reduce((total, client) => total + (client.cases?.length || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total ongoing cases</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
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
            <SelectItem value="all">All Clients</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clients List */}
      <div className="grid gap-4">
        {filteredClients.map((client) => (
          <Card key={client.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold">{client.first_name} {client.last_name}</span>
                    <Badge variant={client.is_active ? "default" : "secondary"}>
                      {client.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    {client.client_details?.client_type && (
                      <Badge variant="outline" className="capitalize">
                        {client.client_details.client_type}
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        Email
                      </div>
                      <div>{client.email}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        Phone
                      </div>
                      <div>{client.phone || 'Not provided'}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Joined
                      </div>
                      <div>{new Date(client.created_at).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        Cases
                      </div>
                      <div>{client.cases?.length || 0} active</div>
                    </div>
                  </div>
                  {client.client_details?.emergency_contact_name && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Emergency: {client.client_details.emergency_contact_name} 
                      {client.client_details.emergency_contact_phone && 
                        ` (${client.client_details.emergency_contact_phone})`
                      }
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditModal(client)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  {client.is_active && (
                    <Button variant="outline" size="sm" onClick={() => handleDeleteClient(client.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No clients found</p>
          </CardContent>
        </Card>
      )}

      {/* Edit Client Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_first_name">First Name *</Label>
                <Input
                  id="edit_first_name"
                  value={newClient.first_name}
                  onChange={(e) => setNewClient({...newClient, first_name: e.target.value})}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label htmlFor="edit_last_name">Last Name *</Label>
                <Input
                  id="edit_last_name"
                  value={newClient.last_name}
                  onChange={(e) => setNewClient({...newClient, last_name: e.target.value})}
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit_phone">Phone</Label>
              <Input
                id="edit_phone"
                value={newClient.phone}
                onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <Label htmlFor="edit_client_type">Client Type</Label>
              <Select value={newClient.client_type} onValueChange={(value) => setNewClient({...newClient, client_type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="organization">Organization</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit_contact_method">Preferred Contact Method</Label>
              <Select value={newClient.preferred_contact_method} onValueChange={(value) => setNewClient({...newClient, preferred_contact_method: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit_emergency_name">Emergency Contact Name</Label>
              <Input
                id="edit_emergency_name"
                value={newClient.emergency_contact_name}
                onChange={(e) => setNewClient({...newClient, emergency_contact_name: e.target.value})}
                placeholder="Enter emergency contact name"
              />
            </div>

            <div>
              <Label htmlFor="edit_emergency_phone">Emergency Contact Phone</Label>
              <Input
                id="edit_emergency_phone"
                value={newClient.emergency_contact_phone}
                onChange={(e) => setNewClient({...newClient, emergency_contact_phone: e.target.value})}
                placeholder="Enter emergency contact phone"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateClient}>
                <Edit className="h-4 w-4 mr-2" />
                Update Client
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyClientsPage;