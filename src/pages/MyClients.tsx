import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Phone, Mail, Plus, MessageSquare, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const MyClients = () => {
  const clients = [
    {
      id: 1,
      name: "Raj Kumar Sharma",
      email: "raj.sharma@email.com",
      phone: "+91 98765 43210",
      activeCases: 2,
      status: "Active",
      lastContact: "2024-01-15",
      caseTypes: ["Civil", "Property"]
    },
    {
      id: 2,
      name: "Priya Patel",
      email: "priya.patel@email.com",
      phone: "+91 87654 32109",
      activeCases: 1,
      status: "Active",
      lastContact: "2024-01-12",
      caseTypes: ["Family"]
    },
    {
      id: 3,
      name: "Mohammed Ali",
      email: "m.ali@email.com",
      phone: "+91 76543 21098",
      activeCases: 3,
      status: "Active",
      lastContact: "2024-01-10",
      caseTypes: ["Criminal", "Civil"]
    },
    {
      id: 4,
      name: "Sunita Devi",
      email: "sunita.devi@email.com",
      phone: "+91 65432 10987",
      activeCases: 0,
      status: "Inactive",
      lastContact: "2023-12-20",
      caseTypes: ["Property"]
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h1 className="text-3xl font-bold">My Clients</h1>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Client
        </Button>
      </div>

      <div className="grid gap-4">
        {clients.map((client) => (
          <Card key={client.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{client.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {client.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {client.phone}
                    </div>
                  </div>
                </div>
                <Badge variant={client.status === 'Active' ? 'default' : 'secondary'}>
                  {client.status}
                </Badge>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Active Cases</p>
                  <p className="font-semibold text-lg">{client.activeCases}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Contact</p>
                  <p className="font-semibold">{client.lastContact}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Case Types</p>
                  <div className="flex gap-1 mt-1">
                    {client.caseTypes.map((type, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  Message
                </Button>
                <Button size="sm" variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Schedule Meeting
                </Button>
                <Button size="sm" variant="outline">
                  View Cases
                </Button>
                <Button size="sm">
                  Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyClients;