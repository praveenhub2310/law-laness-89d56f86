import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Phone, Mail, Plus, MessageSquare, Calendar, Eye, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MyClients = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [newClientData, setNewClientData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    client_type: 'individual',
    preferred_contact_method: 'email',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  });

  // Fetch clients data with related information
  const {
    data: clients,
    loading,
    error,
    addItem: addClient,
    refetch
  } = useSupabaseData({
    table: 'profiles',
    select: `
      *,
      clients!inner(*),
      client_projects:projects!client_id(id, title, status, case_number),
      lawyer_projects:projects!lawyer_id(id, title, status, case_number)
    `,
    filters: { role: 'client' },
    orderBy: { column: 'created_at', ascending: false },
    realtime: true
  });

  const handleAddClient = async () => {
    if (!user) return;

    try {
      // Create auth user first
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newClientData.email,
        password: 'TempPassword123!', // Temporary password - client should change it
        email_confirm: true,
        user_metadata: {
          first_name: newClientData.first_name,
          last_name: newClientData.last_name,
          role: 'client'
        }
      });

      if (authError) throw authError;

      // The profile will be automatically created via the trigger
      // Just need to update the client-specific data
      if (authData.user) {
        const { error: clientError } = await supabase
          .from('clients')
          .update({
            client_type: newClientData.client_type,
            preferred_contact_method: newClientData.preferred_contact_method,
            emergency_contact_name: newClientData.emergency_contact_name,
            emergency_contact_phone: newClientData.emergency_contact_phone
          })
          .eq('id', authData.user.id);

        if (clientError) {
          console.error('Error updating client data:', clientError);
        }
      }

      toast({
        title: "Success",
        description: "Client added successfully"
      });

      setAddClientOpen(false);
      setNewClientData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        client_type: 'individual',
        preferred_contact_method: 'email',
        emergency_contact_name: '',
        emergency_contact_phone: ''
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add client",
        variant: "destructive"
      });
    }
  };

  const handleScheduleMeeting = async (clientId: string, clientName: string) => {
    // Navigate to calendar/schedule page with client pre-selected
    window.location.href = `/dashboard/schedule?client=${clientId}&name=${encodeURIComponent(clientName)}`;
  };

  const handleMessage = async (clientId: string, clientName: string) => {
    // Navigate to messages page with client chat
    window.location.href = `/dashboard/messages?client=${clientId}&name=${encodeURIComponent(clientName)}`;
  };

  const handleViewCases = async (clientId: string, clientName: string) => {
    // Navigate to cases page filtered by client
    window.location.href = `/dashboard/cases?client=${clientId}&name=${encodeURIComponent(clientName)}`;
  };

  const handleContact = async (clientId: string, email: string, phone: string) => {
    // Open default email/phone app
    if (email) {
      window.open(`mailto:${email}`, '_blank');
    } else if (phone) {
      window.open(`tel:${phone}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          Error loading clients: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h1 className="text-3xl font-bold">My Clients</h1>
        </div>
        <Dialog open={addClientOpen} onOpenChange={setAddClientOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={newClientData.first_name}
                    onChange={(e) => setNewClientData({...newClientData, first_name: e.target.value})}
                    placeholder="John"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newClientData.last_name}
                    onChange={(e) => setNewClientData({...newClientData, last_name: e.target.value})}
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newClientData.email}
                  onChange={(e) => setNewClientData({...newClientData, email: e.target.value})}
                  placeholder="john.doe@email.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newClientData.phone}
                  onChange={(e) => setNewClientData({...newClientData, phone: e.target.value})}
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <Label htmlFor="clientType">Client Type</Label>
                <Select value={newClientData.client_type} onValueChange={(value) => setNewClientData({...newClientData, client_type: value})}>
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
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAddClientOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddClient}>
                  Add Client
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {clients?.length === 0 ? (
        <div className="text-center py-12">
          <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No clients yet</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first client</p>
          <Button onClick={() => setAddClientOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Client
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {clients?.map((client: any) => {
            const activeCases = client.client_projects?.filter((p: any) => p.status === 'active').length || 0;
            const isActive = activeCases > 0 || client.is_active;
            
            return (
              <Card key={client.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        {client.first_name} {client.last_name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {client.email}
                        </div>
                        {client.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {client.phone}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant={isActive ? 'default' : 'secondary'}>
                      {isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Active Cases</p>
                      <p className="font-semibold text-lg">{activeCases}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Member Since</p>
                      <p className="font-semibold">{format(new Date(client.created_at), 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Client Type</p>
                      <Badge variant="outline" className="text-xs capitalize">
                        {client.clients?.client_type || 'Individual'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex items-center gap-1"
                      onClick={() => handleMessage(client.id, `${client.first_name} ${client.last_name}`)}
                    >
                      <MessageSquare className="h-3 w-3" />
                      Message
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex items-center gap-1"
                      onClick={() => handleScheduleMeeting(client.id, `${client.first_name} ${client.last_name}`)}
                    >
                      <Calendar className="h-3 w-3" />
                      Schedule Meeting
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex items-center gap-1"
                      onClick={() => handleViewCases(client.id, `${client.first_name} ${client.last_name}`)}
                    >
                      <Eye className="h-3 w-3" />
                      View Cases
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleContact(client.id, client.email, client.phone)}
                    >
                      Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyClients;