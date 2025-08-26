
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Calendar, MessageSquare, DollarSign, Clock, AlertCircle, Upload, CreditCard, PenTool, User } from 'lucide-react';
import OnlinePayments from '@/components/OnlinePayments';
import RoleGuard from '@/components/RoleGuard';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';

const ClientDashboard = () => {
  const { user } = useAuth();

  // Fetch client's cases
  const { data: cases, loading: casesLoading } = useSupabaseData({
    table: 'projects',
    select: '*',
    filters: user?.id ? [{ column: 'client_id', operator: 'eq', value: user.id }] : undefined,
    realtime: true
  });

  // Fetch client's hearings
  const { data: hearings } = useSupabaseData({
    table: 'hearings',
    select: '*',
    filters: user?.id ? [{ column: 'client_id', operator: 'eq', value: user.id }] : undefined,
    realtime: true
  });

  // Fetch client's e-sign documents
  const { data: documentsForSignature } = useSupabaseData({
    table: 'e_sign_documents',
    select: '*',
    filters: user?.id ? [{ column: 'client_id', operator: 'eq', value: user.id }] : undefined,
    realtime: true
  });

  // Calculate statistics
  const activeCases = cases?.filter(c => c.status === 'active')?.length || 0;
  
  const nextHearing = hearings?.find(h => 
    new Date(h.hearing_date) >= new Date() && h.status === 'scheduled'
  );
  
  const daysUntilHearing = nextHearing ? 
    Math.ceil((new Date(nextHearing.hearing_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 
    null;

  const pendingSignatures = documentsForSignature?.filter(doc => 
    doc.signing_status !== 'completed' && 
    !doc.signatures?.some((sig: any) => sig.signatory_id === user?.id)
  )?.length || 0;

  // Mock data for cases history
  const activeCasesList = cases?.filter(c => c.status === 'active') || [];
  const allCases = cases || [];

  if (casesLoading) {
    return (
      <RoleGuard allowedRoles={['client']}>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </RoleGuard>
    );
  }

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
              <div className="text-2xl font-bold text-blue-600">{activeCases}</div>
              <p className="text-sm text-gray-600">ongoing legal matter{activeCases !== 1 ? 's' : ''}</p>
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
              <div className="text-2xl font-bold text-green-600">
                {daysUntilHearing !== null ? daysUntilHearing : '--'}
              </div>
              <p className="text-sm text-gray-600">
                {daysUntilHearing !== null ? `day${daysUntilHearing !== 1 ? 's' : ''} remaining` : 'No scheduled hearings'}
              </p>
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
              <div className="text-2xl font-bold text-purple-600">{pendingSignatures}</div>
              <p className="text-sm text-gray-600">document{pendingSignatures !== 1 ? 's' : ''} to sign</p>
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
              <div className="text-2xl font-bold text-orange-600">--</div>
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
                  <CardDescription>Current status of your cases</CardDescription>
                </CardHeader>
                <CardContent>
                  {activeCasesList.length > 0 ? (
                    <div className="space-y-4">
                      {activeCasesList.slice(0, 2).map((case_: any, index: number) => (
                        <div key={case_.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{case_.title}</h4>
                            <Badge>{case_.status}</Badge>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                          </div>
                          <p className="text-sm text-gray-600">In progress - Case #{case_.case_number}</p>
                          <p className="text-xs text-gray-500">Last updated: {new Date(case_.updated_at).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No active cases</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Action Items</CardTitle>
                  <CardDescription>Things that need your attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingSignatures > 0 && (
                      <div className="flex items-center justify-between p-3 border rounded-lg border-red-200 bg-red-50">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <div>
                            <p className="text-sm font-medium">Pending E-Signatures</p>
                            <p className="text-xs text-gray-600">{pendingSignatures} document{pendingSignatures !== 1 ? 's' : ''} awaiting signature</p>
                          </div>
                        </div>
                        <Badge variant="destructive">Urgent</Badge>
                      </div>
                    )}
                    
                    {nextHearing && (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium">Upcoming Hearing</p>
                            <p className="text-xs text-gray-600">{new Date(nextHearing.hearing_date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Badge>Scheduled</Badge>
                      </div>
                    )}

                    {!pendingSignatures && !nextHearing && (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">No urgent action items at this time</p>
                      </div>
                    )}
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
                {allCases.length > 0 ? (
                  <div className="space-y-4">
                    {allCases.map((case_: any) => (
                      <div key={case_.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium">{case_.title}</h4>
                            <p className="text-sm text-gray-600">Case: {case_.case_number}</p>
                            <p className="text-xs text-gray-500">Last update: {new Date(case_.updated_at).toLocaleDateString()}</p>
                          </div>
                          <Badge variant={case_.status === 'active' ? 'default' : case_.status === 'closed' ? 'secondary' : 'outline'}>
                            {case_.status}
                          </Badge>
                        </div>
                        
                        {case_.status === 'active' && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-600">Progress</span>
                              <span className="text-sm font-medium">25%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <a href="/dashboard/case-status">View Details</a>
                          </Button>
                          <Button size="sm" variant="outline">Contact Lawyer</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Cases Yet</h3>
                    <p className="text-gray-600">You don't have any legal cases at this time.</p>
                  </div>
                )}
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
                    {documentsForSignature && documentsForSignature.length > 0 ? (
                      documentsForSignature
                        .filter((doc: any) => doc.signing_status !== 'completed' && !doc.signatures?.some((sig: any) => sig.signatory_id === user?.id))
                        .map((doc: any) => (
                          <div key={doc.id} className="border rounded-lg p-4 border-red-200 bg-red-50">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium">{doc.title}</h4>
                                <p className="text-sm text-gray-600">Document #{doc.document_number}</p>
                                <p className="text-xs text-gray-500">
                                  {doc.expires_at ? `Expires: ${new Date(doc.expires_at).toLocaleDateString()}` : ''}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="destructive">Urgent</Badge>
                                <Button size="sm" asChild>
                                  <a href="/dashboard/e-sign">
                                    <PenTool className="h-4 w-4 mr-2" />
                                    Sign Now
                                  </a>
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-8">
                        <PenTool className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">No documents requiring signature</p>
                      </div>
                    )}
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
                      <h3 className="text-lg font-medium mb-2">Upload Case Documents</h3>
                      <p className="text-gray-600 mb-4">Upload documents related to your legal cases</p>
                      <Button asChild>
                        <a href="/dashboard/document-upload">
                          Upload Documents
                        </a>
                      </Button> 
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
                      <User className="text-white text-lg h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">Your Assigned Lawyer</h3>
                      <p className="text-gray-600">Legal Representative</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">Legal Counsel</Badge>
                        <Badge variant="outline">Professional</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-3">
                        Your legal representative will be assigned based on your case type and requirements. 
                        Contact information will be provided once assignment is complete.
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
