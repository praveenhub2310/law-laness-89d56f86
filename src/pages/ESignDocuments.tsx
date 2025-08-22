import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Upload, FileSignature, Download, Eye, Trash2, Search, Filter, Calendar, User } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ESignDocument {
  id: string;
  document_number: string;
  title: string;
  original_file_url: string;
  signed_file_url?: string;
  signing_status: 'pending' | 'signed' | 'expired';
  client_id?: string;
  lawyer_id?: string;
  case_id?: string;
  expires_at?: string;
  signed_at?: string;
  created_at: string;
  client_profile?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  lawyer_profile?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  case_details?: {
    case_number: string;
    title: string;
  };
}

interface SignaturePosition {
  x: number;
  y: number;
  page: number;
  width: number;
  height: number;
}

const ESignDocuments = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<ESignDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSigningModalOpen, setIsSigningModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<ESignDocument | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clients, setClients] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [signatureData, setSignatureData] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);

  const [newDocument, setNewDocument] = useState({
    title: '',
    client_id: '',
    case_id: '',
    expires_at: ''
  });

  // Fetch documents with real-time updates
  useEffect(() => {
    if (!user) return;

    const fetchDocuments = async () => {
      try {
        const { data, error } = await supabase
          .from('e_sign_documents')
          .select(`
            *,
            client_profile:profiles!e_sign_documents_client_id_fkey(
              first_name,
              last_name,
              email
            ),
            lawyer_profile:profiles!e_sign_documents_lawyer_id_fkey(
              first_name,
              last_name,
              email
            ),
            case_details:projects(
              case_number,
              title
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setDocuments((data as any) || []);
      } catch (error) {
        console.error('Error fetching documents:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch documents',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    // Fetch clients and cases for dropdowns
    const fetchData = async () => {
      const [clientsResult, casesResult] = await Promise.all([
        supabase.from('profiles').select('id, first_name, last_name, email').eq('role', 'client'),
        supabase.from('projects').select('id, case_number, title')
      ]);
      
      setClients(clientsResult.data || []);
      setCases(casesResult.data || []);
    };

    fetchDocuments();
    fetchData();

    // Real-time subscription
    const channel = supabase
      .channel('e_sign_documents_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'e_sign_documents'
      }, () => {
        fetchDocuments();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, toast]);

  const handleUploadDocument = async () => {
    if (!uploadFile || !newDocument.title || !newDocument.client_id) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields and select a file',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Upload file to Supabase storage
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, uploadFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Create document record
      const documentNumber = `DOC-${Date.now()}`;
      const expiresAt = newDocument.expires_at ? new Date(newDocument.expires_at).toISOString() : null;

      const { error } = await supabase
        .from('e_sign_documents')
        .insert([{
          document_number: documentNumber,
          title: newDocument.title,
          original_file_url: publicUrl,
          client_id: newDocument.client_id,
          lawyer_id: user?.id,
          case_id: newDocument.case_id || null,
          expires_at: expiresAt,
          signing_status: 'pending'
        }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Document uploaded successfully'
      });

      setIsUploadModalOpen(false);
      setUploadFile(null);
      setNewDocument({
        title: '',
        client_id: '',
        case_id: '',
        expires_at: ''
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload document',
        variant: 'destructive'
      });
    }
  };

  const handleSignDocument = async () => {
    if (!selectedDocument || !signatureData) {
      toast({
        title: 'Error',
        description: 'Please provide a signature',
        variant: 'destructive'
      });
      return;
    }

    try {
      // In a real implementation, you would:
      // 1. Load the PDF
      // 2. Add the signature at the specified position
      // 3. Save the signed PDF
      // For now, we'll simulate this by updating the database

      const { error } = await supabase
        .from('e_sign_documents')
        .update({
          signing_status: 'signed',
          signed_at: new Date().toISOString(),
          signed_file_url: selectedDocument.original_file_url, // In real implementation, this would be the signed version
          signatures: JSON.stringify([{
            signer_id: user?.id,
            signature_data: signatureData,
            signed_at: new Date().toISOString()
          }])
        })
        .eq('id', selectedDocument.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Document signed successfully'
      });

      setIsSigningModalOpen(false);
      setSelectedDocument(null);
      setSignatureData('');
    } catch (error) {
      console.error('Error signing document:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign document',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from('e_sign_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Document deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive'
      });
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.document_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.client_profile?.first_name + ' ' + doc.client_profile?.last_name).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.signing_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-6">Loading documents...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">E-Sign Documents</h1>
          <p className="text-muted-foreground">Upload, manage and sign documents digitally</p>
        </div>
        <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload New Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Document Title</Label>
                <Input
                  id="title"
                  value={newDocument.title}
                  onChange={(e) => setNewDocument({...newDocument, title: e.target.value})}
                  placeholder="Enter document title"
                />
              </div>

              <div>
                <Label htmlFor="client">Client</Label>
                <Select value={newDocument.client_id} onValueChange={(value) => setNewDocument({...newDocument, client_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.first_name} {client.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="case">Case (Optional)</Label>
                <Select value={newDocument.case_id} onValueChange={(value) => setNewDocument({...newDocument, case_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select case (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Case</SelectItem>
                    {cases.map(case_item => (
                      <SelectItem key={case_item.id} value={case_item.id}>
                        {case_item.case_number} - {case_item.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="expires">Expires At (Optional)</Label>
                <Input
                  id="expires"
                  type="datetime-local"
                  value={newDocument.expires_at}
                  onChange={(e) => setNewDocument({...newDocument, expires_at: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="file">Document File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUploadDocument}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
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
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileSignature className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredDocuments.length}</div>
            <p className="text-xs text-muted-foreground">All uploaded documents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Signatures</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {filteredDocuments.filter(d => d.signing_status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting signatures</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signed Documents</CardTitle>
            <User className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {filteredDocuments.filter(d => d.signing_status === 'signed').length}
            </div>
            <p className="text-xs text-muted-foreground">Completed signatures</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
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
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="signed">Signed</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Documents List */}
      <div className="grid gap-4">
        {filteredDocuments.map((document) => (
          <Card key={document.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileSignature className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold">{document.title}</span>
                    <Badge className={getStatusColor(document.signing_status)}>
                      {document.signing_status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Document #</div>
                      <div>{document.document_number}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Client</div>
                      <div>{document.client_profile?.first_name} {document.client_profile?.last_name}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Created</div>
                      <div>{new Date(document.created_at).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Status</div>
                      <div className="capitalize">{document.signing_status}</div>
                    </div>
                  </div>
                  {document.case_details && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Case: {document.case_details.case_number} - {document.case_details.title}
                    </div>
                  )}
                  {document.expires_at && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Expires: {new Date(document.expires_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => window.open(document.original_file_url, '_blank')}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  {document.signing_status === 'pending' && (document.client_id === user?.id || document.lawyer_id === user?.id) && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setSelectedDocument(document);
                        setIsSigningModalOpen(true);
                      }}
                    >
                      <FileSignature className="h-4 w-4" />
                    </Button>
                  )}
                  {document.signed_file_url && (
                    <Button variant="outline" size="sm" onClick={() => window.open(document.signed_file_url, '_blank')}>
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  {(document.lawyer_id === user?.id || userProfile?.role === 'super_admin') && (
                    <Button variant="outline" size="sm" onClick={() => handleDeleteDocument(document.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No documents found</p>
          </CardContent>
        </Card>
      )}

      {/* Signing Modal */}
      <Dialog open={isSigningModalOpen} onOpenChange={setIsSigningModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sign Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedDocument && (
              <div className="text-sm text-muted-foreground">
                Signing: {selectedDocument.title}
              </div>
            )}
            <div>
              <Label>Type your signature</Label>
              <Input
                value={signatureData}
                onChange={(e) => setSignatureData(e.target.value)}
                placeholder="Type your full name"
                className="font-cursive text-lg"
                style={{ fontFamily: 'cursive' }}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsSigningModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSignDocument}>
                <FileSignature className="h-4 w-4 mr-2" />
                Sign Document
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ESignDocuments;