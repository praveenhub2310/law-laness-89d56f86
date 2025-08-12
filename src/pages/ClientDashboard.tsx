
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Calendar, MessageSquare, DollarSign, Clock, AlertCircle, Upload, CreditCard, PenTool } from 'lucide-react';
import OnlinePayments from '@/components/OnlinePayments';
import RoleGuard from '@/components/RoleGuard';

const ClientDashboard = () => {
  const caseHistory = [
    { id: 1, title: 'Personal Injury Claim', status: 'Active', lastUpdate: '2024-01-12', lawyer: 'Sarah Johnson', progress: 65 },
    { id: 2, title: 'Contract Dispute Resolution', status: 'Settled', lastUpdate: '2023-12-18', lawyer: 'Michael Brown', progress: 100 },
    { id: 3, title: 'Estate Planning Consultation', status: 'Completed', lastUpdate: '2023-11-25', lawyer: 'Emily Chen', progress: 100 }
  ];

  const documentsForSignature = [
    { id: 1, title: 'Settlement Agreement', case: 'Personal Injury Claim', dueDate: '2024-01-20', urgent: true },
    { id: 2, title: 'Confidentiality Agreement', case: 'Personal Injury Claim', dueDate: '2024-01-25', urgent: false }
  ];

  return (
    <RoleGuard allowedRoles={['client']}>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Client Portal</h1>
          <p className="text-gray-600 mt-2">Your legal matters and communications hub</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Active Cases</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">1</div>
              <p className="text-sm text-gray-600">ongoing legal matter</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">Next Hearing</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">6</div>
              <p className="text-sm text-gray-600">days remaining</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <PenTool className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg">Pending Signatures</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">2</div>
              <p className="text-sm text-gray-600">documents to sign</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-lg">Outstanding</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">$4,300</div>
              <p className="text-sm text-gray-600">pending payments</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cases">My Cases</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="lawyer">My Lawyer</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Case Progress</CardTitle>
                  <CardDescription>Current status of your active case</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Personal Injury Claim</h4>
                      <Badge>Active</Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <p className="text-sm text-gray-600">Discovery phase in progress - 65% complete</p>
                    <p className="text-xs text-gray-500">Last updated: January 12, 2024</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Action Items</CardTitle>
                  <CardDescription>Things that need your attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg border-red-200 bg-red-50">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <div>
                          <p className="text-sm font-medium">Settlement Agreement</p>
                          <p className="text-xs text-gray-600">Signature required by Jan 20</p>
                        </div>
                      </div>
                      <Badge variant="destructive">Urgent</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">Invoice Payment</p>
                          <p className="text-xs text-gray-600">$2,500 due Jan 20</p>
                        </div>
                      </div>
                      <Badge>Pending</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cases">
            <Card>
              <CardHeader>
                <CardTitle>Case History</CardTitle>
                <CardDescription>Your legal matters and their current status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {caseHistory.map((case_) => (
                    <div key={case_.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium">{case_.title}</h4>
                          <p className="text-sm text-gray-600">Attorney: {case_.lawyer}</p>
                          <p className="text-xs text-gray-500">Last update: {case_.lastUpdate}</p>
                        </div>
                        <Badge variant={case_.status === 'Active' ? 'default' : case_.status === 'Settled' ? 'secondary' : 'outline'}>
                          {case_.status}
                        </Badge>
                      </div>
                      
                      {case_.status === 'Active' && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">Progress</span>
                            <span className="text-sm font-medium">{case_.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${case_.progress}%` }}></div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View Details</Button>
                        <Button size="sm" variant="outline">Contact Lawyer</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PenTool className="h-5 w-5" />
                    Documents Requiring Signature
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {documentsForSignature.map((doc) => (
                      <div key={doc.id} className={`border rounded-lg p-4 ${doc.urgent ? 'border-red-200 bg-red-50' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{doc.title}</h4>
                            <p className="text-sm text-gray-600">{doc.case}</p>
                            <p className="text-xs text-gray-500">Due: {doc.dueDate}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {doc.urgent && <Badge variant="destructive">Urgent</Badge>}
                            <Button size="sm">
                              <PenTool className="h-4 w-4 mr-2" />
                              Sign Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Upload Documents</h3>
                    <p className="text-gray-600 mb-4">Drag and drop files here, or click to browse</p>
                    <Button>Choose Files</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payments">
            <OnlinePayments />
          </TabsContent>

          <TabsContent value="lawyer">
            <Card>
              <CardHeader>
                <CardTitle>Your Assigned Lawyer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">SJ</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">Sarah Johnson</h3>
                    <p className="text-gray-600">Senior Associate</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">Personal Injury</Badge>
                      <Badge variant="outline">8 years experience</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-3">
                      Sarah specializes in personal injury cases and has successfully handled over 200 similar cases. 
                      She is licensed to practice in New York and New Jersey.
                    </p>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                      <Button size="sm" variant="outline">Schedule Meeting</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  );
};

export default ClientDashboard;
