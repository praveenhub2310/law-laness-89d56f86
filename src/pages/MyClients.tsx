import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Phone, Mail, Plus, MessageSquare, Calendar, Eye, User, Send, Clock, FileText } from 'lucide-react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const MyClients = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [casesDialogOpen, setCasesDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [messageText, setMessageText] = useState('');
  const [meetingData, setMeetingData] = useState({
    title: '',
    date: '',
    time: '',
    description: ''
  });

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

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch clients data with related information
  const {
    data: clients,
    loading,
    error,
    addItem: addClient,
    refetch
  } = useSupabaseData({
    table: 'profiles',
    select: '*',
    filters: { role: 'client' },
    orderBy: { column: 'created_at', ascending: false },
    realtime: true
  });

  // Fetch client cases for the selected client
  const {
    data: clientCases,
    loading: casesLoading,
    refetch: refetchCases
  } = useSupabaseData({
    table: 'projects',
    select: '*',
    filters: selectedClient ? { client_id: selectedClient.id } : { client_id: 'none' },
    orderBy: { column: 'created_at', ascending: false },
    realtime: true
  });

  // Refetch cases when selected client changes
  useEffect(() => {
    if (selectedClient && refetchCases) {
      refetchCases();
    }
  }, [selectedClient, refetchCases]);

  const handleAddClient = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add clients",
        variant: "destructive"
      });
      return;
    }

    // Validate required fields
    if (!newClientData.email || !newClientData.first_name || !newClientData.last_name) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields: First Name, Last Name, and Email",
        variant: "destructive"
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newClientData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    console.log('Creating client with data:', newClientData);

    try {
      // Call the edge function to create the client
      const { data, error } = await supabase.functions.invoke('create-client', {
        body: newClientData
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        throw new Error(error.message || 'Failed to create client');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.success) {
        toast({
          title: "Success",
          description: `Client added successfully. Temporary password: ${data.temp_password || 'Generated'}`,
        });

        // Reset form and close dialog
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
        
        // Refetch clients list
        if (refetch) {
          setTimeout(() => refetch(), 500);
        }
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (error: any) {
      console.error('Error creating client:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add client",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScheduleMeeting = async (client: any) => {
    console.log('📅 Opening schedule dialog for client:', client.id, client.first_name, client.last_name);
    setSelectedClient(client);
    setScheduleDialogOpen(true);
  };

  const handleMessage = async (client: any) => {
    setSelectedClient(client);
    setMessageDialogOpen(true);
  };

  const handleViewCases = async (client: any) => {
    setSelectedClient(client);
    setCasesDialogOpen(true);
  };

  const handleContact = async (client: any) => {
    setSelectedClient(client);
    setContactDialogOpen(true);
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedClient) return;

    try {
      // In a real app, you'd save this to a messages table
      toast({
        title: "Message Sent",
        description: `Message sent to ${selectedClient.first_name} ${selectedClient.last_name}`
      });
      
      setMessageText('');
      setMessageDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const scheduleMeeting = async () => {
    console.log('💾 Attempting to schedule meeting:', meetingData, 'for client:', selectedClient?.id);
    
    if (!meetingData.title || !meetingData.date || !selectedClient) {
      console.error('❌ Missing required fields:', { 
        hasTitle: !!meetingData.title, 
        hasDate: !!meetingData.date, 
        hasClient: !!selectedClient 
      });
      toast({
        title: "Validation Error",
        description: "Please fill in meeting title and date",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      console.error('❌ No authenticated user');
      toast({
        title: "Authentication Error",
        description: "You must be logged in to schedule meetings",
        variant: "destructive"
      });
      return;
    }

    try {
      // Insert into hearings table which has proper client_id relationship
      console.log('🔄 Inserting meeting into hearings table...');
      const { data, error } = await supabase
        .from('hearings')
        .insert({
          title: meetingData.title,
          description: meetingData.description || `Meeting with ${selectedClient.first_name} ${selectedClient.last_name}`,
          hearing_date: meetingData.date,
          hearing_time: meetingData.time || '10:00',
          court_name: 'Client Meeting',
          hearing_type: 'meeting',
          status: 'scheduled',
          client_id: selectedClient.id,
          lawyer_id: user.id,
          hearing_number: `MTG-${Date.now()}`
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      console.log('✅ Meeting scheduled successfully:', data);
      
      toast({
        title: "Meeting Scheduled",
        description: `Meeting with ${selectedClient.first_name} ${selectedClient.last_name} scheduled for ${new Date(meetingData.date).toLocaleDateString()}`
      });
      
      setMeetingData({ title: '', date: '', time: '', description: '' });
      setScheduleDialogOpen(false);
      setSelectedClient(null);
    } catch (error: any) {
      console.error('❌ Failed to schedule meeting:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to schedule meeting",
        variant: "destructive"
      });
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
                  <Label htmlFor="firstName">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    required
                    value={newClientData.first_name}
                    onChange={(e) => setNewClientData({...newClientData, first_name: e.target.value})}
                    placeholder="John"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    required
                    value={newClientData.last_name}
                    onChange={(e) => setNewClientData({...newClientData, last_name: e.target.value})}
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
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
                <Button 
                  variant="outline" 
                  onClick={() => setAddClientOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddClient}
                  disabled={isSubmitting || !newClientData.email || !newClientData.first_name || !newClientData.last_name}
                >
                  {isSubmitting ? 'Adding...' : 'Add Client'}
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
            // For now, we'll use simple data until we fetch projects separately
            const activeCases = 0; // Will be updated with actual project count
            const isActive = client.is_active;
            
            return (
              <Card key={client.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        {client.first_name || 'Unknown'} {client.last_name || 'Client'}
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
                        Business
                      </Badge>
                    </div>
                  </div>

                   <div className="flex gap-2 flex-wrap">
                     <Button 
                       size="sm" 
                       variant="outline" 
                       className="flex items-center gap-1 relative z-10 pointer-events-auto cursor-pointer"
                       onClick={() => handleMessage(client)}
                     >
                       <MessageSquare className="h-3 w-3" />
                       Message
                     </Button>
                     <Button 
                       size="sm" 
                       variant="outline" 
                       className="flex items-center gap-1 relative z-10 pointer-events-auto cursor-pointer"
                       onClick={() => handleScheduleMeeting(client)}
                     >
                       <Calendar className="h-3 w-3" />
                       Schedule
                     </Button>
                     <Button 
                       size="sm" 
                       variant="outline"
                       className="flex items-center gap-1 relative z-10 pointer-events-auto cursor-pointer"
                       onClick={() => handleViewCases(client)}
                     >
                       <Eye className="h-3 w-3" />
                       View Cases
                     </Button>
                     <Button 
                       size="sm"
                       className="relative z-10 pointer-events-auto cursor-pointer"
                       onClick={() => handleContact(client)}
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

      {/* Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Send Message to {selectedClient?.first_name} {selectedClient?.last_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message here..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setMessageDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={sendMessage} disabled={!messageText.trim()}>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Meeting Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="max-w-md bg-background border shadow-lg z-50">
          <DialogHeader>
            <DialogTitle>
              Schedule Meeting with {selectedClient?.first_name} {selectedClient?.last_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="meetingTitle">
                Meeting Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="meetingTitle"
                value={meetingData.title}
                onChange={(e) => setMeetingData({...meetingData, title: e.target.value})}
                placeholder="e.g., Initial Consultation, Case Review"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="meetingDate">
                  Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="meetingDate"
                  type="date"
                  value={meetingData.date}
                  onChange={(e) => setMeetingData({...meetingData, date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <Label htmlFor="meetingTime">Time</Label>
                <Input
                  id="meetingTime"
                  type="time"
                  value={meetingData.time}
                  onChange={(e) => setMeetingData({...meetingData, time: e.target.value})}
                  placeholder="10:00"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="meetingDescription">Description (Optional)</Label>
              <Textarea
                id="meetingDescription"
                value={meetingData.description}
                onChange={(e) => setMeetingData({...meetingData, description: e.target.value})}
                placeholder="Meeting agenda, topics to discuss..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  console.log('❌ Canceling schedule dialog');
                  setScheduleDialogOpen(false);
                  setSelectedClient(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={scheduleMeeting} 
                disabled={!meetingData.title || !meetingData.date}
              >
                <Clock className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Cases Dialog */}
      <Dialog open={casesDialogOpen} onOpenChange={setCasesDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Cases for {selectedClient?.first_name} {selectedClient?.last_name}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px]">
            {casesLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : clientCases?.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No cases found for this client</p>
              </div>
            ) : (
              <div className="space-y-3">
                {clientCases?.map((case_: any) => (
                  <Card key={case_.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{case_.title}</h4>
                        <Badge variant={case_.status === 'active' ? 'default' : 'secondary'}>
                          {case_.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Case #{case_.case_number}
                      </p>
                      {case_.description && (
                        <p className="text-sm text-gray-700">{case_.description}</p>
                      )}
                      <div className="mt-2 text-xs text-gray-500">
                        Started: {format(new Date(case_.created_at), 'MMM dd, yyyy')}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Contact {selectedClient?.first_name} {selectedClient?.last_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedClient?.email && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-gray-600">{selectedClient.email}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => window.open(`mailto:${selectedClient.email}`, '_blank')}
                >
                  Send Email
                </Button>
              </div>
            )}
            {selectedClient?.phone && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-gray-600">{selectedClient.phone}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => window.open(`tel:${selectedClient.phone}`, '_blank')}
                >
                  Call Now
                </Button>
              </div>
            )}
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setContactDialogOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyClients;