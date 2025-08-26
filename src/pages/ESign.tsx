import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileSignature, Download, Send, Users, Plus, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { useGoogleDrive } from '@/contexts/GoogleDriveContext';
import GoogleDriveFileBrowser from '@/components/GoogleDriveFileBrowser';
import SignaturePad, { SignaturePadRef } from '@/components/SignaturePad';
import CaseSelector from '@/components/CaseSelector';
import CaseNumberInput from '@/components/CaseNumberInput';

interface Signatory {
  id: string;
  email: string;
  name: string;
  role: string;
  signed: boolean;
}

interface ESignDocument {
  id: string;
  document_number: string;
  title: string;
  original_file_url: string;
  signed_file_url?: string;
  signing_status: string;
  case_id?: string;
  case_number?: string;
  client_id?: string;
  lawyer_id?: string;
  signature_positions: any[];
  signatures: any[];
  expires_at?: string;
  signed_at?: string;
  created_at: string;
}

const ESign = () => {
  const { user } = useAuth();
  const { isConnected, connect, isConnecting } = useGoogleDrive();
  const [activeTab, setActiveTab] = useState('create');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [caseNumber, setCaseNumber] = useState<string>('');
  
  // Create document state
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{ url: string; name: string; size: number; googleDriveId?: string } | null>(null);
  const [signatories, setSignatories] = useState<Signatory[]>([]);
  const [newSignatoryEmail, setNewSignatoryEmail] = useState('');
  const [newSignatoryName, setNewSignatoryName] = useState('');
  const [newSignatoryRole, setNewSignatoryRole] = useState('');
  const [expiryDays, setExpiryDays] = useState('30');
  const [isCreating, setIsCreating] = useState(false);

  // Sign document state
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>('');
  const [currentSignature, setCurrentSignature] = useState<string>('');
  const signaturePadRef = useRef<SignaturePadRef>(null);
  const [isSigning, setIsSigning] = useState(false);

  // Fetch documents
  const { data: documents, loading: documentsLoading, refetch: refetchDocuments } = useSupabaseData<ESignDocument>({
    table: 'e_sign_documents',
    select: '*',
    realtime: true
  });

  const addSignatory = () => {
    if (!newSignatoryEmail || !newSignatoryName) {
      toast.error('Please fill in email and name');
      return;
    }

    const newSignatory: Signatory = {
      id: Date.now().toString(),
      email: newSignatoryEmail,
      name: newSignatoryName,
      role: newSignatoryRole || 'Signatory',
      signed: false
    };

    setSignatories([...signatories, newSignatory]);
    setNewSignatoryEmail('');
    setNewSignatoryName('');
    setNewSignatoryRole('');
  };

  const removeSignatory = (id: string) => {
    setSignatories(signatories.filter(s => s.id !== id));
  };

  const createDocument = async () => {
    if (!documentTitle || !uploadedFile || signatories.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate either existing case or new case number is provided
    if (!selectedCaseId && !caseNumber) {
      toast.error('Please either select an existing case or create a new case number');
      return;
    }

    setIsCreating(true);
    try {
      const documentNumber = `DOC-${Date.now()}`;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiryDays));

      const { error } = await supabase
        .from('e_sign_documents')
        .insert({
          document_number: documentNumber,
          title: documentTitle,
          original_file_url: uploadedFile.url,
          google_drive_file_id: uploadedFile.googleDriveId,
          case_id: selectedCaseId || null,
          case_number: caseNumber || null, // Store the formatted case number
          client_id: user?.id,
          lawyer_id: user?.id,
          signature_positions: signatories.map((s, index) => ({
            signatory_id: s.id,
            email: s.email,
            name: s.name,
            role: s.role,
            position: index + 1,
            signed: false
          })),
          signatures: [],
          signing_status: 'pending',
          expires_at: expiresAt.toISOString()
        });

      if (error) throw error;

      toast.success('Document created successfully');
      
      // Reset form
      setDocumentTitle('');
      setDocumentDescription('');
      setUploadedFile(null);
      setSignatories([]);
      setSelectedCaseId('');
      setCaseNumber('');
      setActiveTab('manage');
      refetchDocuments();
    } catch (error) {
      console.error('Error creating document:', error);
      toast.error('Failed to create document');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSignatureCapture = (signature: string) => {
    setCurrentSignature(signature);
    toast.success('Signature captured successfully');
  };

  const signDocument = async () => {
    if (!selectedDocumentId || !currentSignature) {
      toast.error('Please select a document and provide signature');
      return;
    }

    setIsSigning(true);
    try {
      const document = documents?.find(d => d.id === selectedDocumentId);
      if (!document) {
        throw new Error('Document not found');
      }

      // Create signature data
      const signatureData = {
        signatory_id: user?.id,
        signature: currentSignature,
        signed_at: new Date().toISOString(),
        ip_address: 'unknown' // Could be enhanced to capture actual IP
      };

      // Update document with signature
      const updatedSignatures = [...(document.signatures || []), signatureData];
      const allSigned = document.signature_positions.every(pos => 
        updatedSignatures.some(sig => sig.signatory_id === pos.signatory_id)
      );

      const { error } = await supabase
        .from('e_sign_documents')
        .update({
          signatures: updatedSignatures,
          signing_status: allSigned ? 'completed' : 'partially_signed',
          signed_at: allSigned ? new Date().toISOString() : null
        })
        .eq('id', selectedDocumentId);

      if (error) throw error;

      toast.success('Document signed successfully');
      setCurrentSignature('');
      signaturePadRef.current?.clear();
      refetchDocuments();
    } catch (error) {
      console.error('Error signing document:', error);
      toast.error('Failed to sign document');
    } finally {
      setIsSigning(false);
    }
  };

  const downloadDocument = (document: ESignDocument) => {
    const url = document.signed_file_url || document.original_file_url;
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${document.title}.pdf`;
    link.click();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'partially_signed': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSignature className="h-6 w-6" />
          <h1 className="text-3xl font-bold">E-Sign Documents</h1>
        </div>
        {!isConnected && (
          <Button 
            onClick={connect} 
            disabled={isConnecting}
            className="gap-2"
          >
            {isConnecting ? 'Connecting...' : 'Connect Google Drive'}
          </Button>
        )}
      </div>

      {!isConnected && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                <FileSignature className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-orange-900">Google Drive Connection Required</h3>
                <p className="text-sm text-orange-700">
                  Connect to Google Drive to upload and manage your e-sign documents securely.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create Document</TabsTrigger>
          <TabsTrigger value="sign">Sign Document</TabsTrigger>
          <TabsTrigger value="manage">Manage Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New E-Sign Document
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Document Title *</Label>
                  <Input
                    id="title"
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    placeholder="Enter document title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="case">Associated Case (Optional)</Label>
                  <CaseSelector
                    value={selectedCaseId}
                    onValueChange={setSelectedCaseId}
                    placeholder="Select existing case (optional)"
                    required={false}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <CaseNumberInput
                  value={caseNumber}
                  onValueChange={setCaseNumber}
                  label="New Case Number"
                  placeholder="Enter case details"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={documentDescription}
                  onChange={(e) => setDocumentDescription(e.target.value)}
                  placeholder="Brief description of the document"
                  rows={3}
                />
              </div>

              <GoogleDriveFileBrowser
                onFileSelect={(file) => setUploadedFile({
                  url: file.webViewLink || file.webContentLink || '',
                  name: file.name,
                  size: parseInt(file.size || '0'),
                  googleDriveId: file.id
                })}
                acceptedMimeTypes={[
                  'application/pdf',
                  'application/msword',
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                  'application/vnd.google-apps.document'
                ]}
                title="Select Document for E-Signature"
              />

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Signatories</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input
                    placeholder="Email address"
                    value={newSignatoryEmail}
                    onChange={(e) => setNewSignatoryEmail(e.target.value)}
                  />
                  <Input
                    placeholder="Full name"
                    value={newSignatoryName}
                    onChange={(e) => setNewSignatoryName(e.target.value)}
                  />
                  <Input
                    placeholder="Role (optional)"
                    value={newSignatoryRole}
                    onChange={(e) => setNewSignatoryRole(e.target.value)}
                  />
                  <Button onClick={addSignatory} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>

                {signatories.length > 0 && (
                  <div className="space-y-2">
                    <Label>Added Signatories</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {signatories.map((signatory) => (
                        <div key={signatory.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{signatory.name}</p>
                            <p className="text-sm text-muted-foreground">{signatory.email}</p>
                            {signatory.role && (
                              <Badge variant="secondary" className="text-xs">{signatory.role}</Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSignatory(signatory.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiry">Expires in (days)</Label>
                <Select value={expiryDays} onValueChange={setExpiryDays}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="15">15 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={createDocument} 
                disabled={isCreating}
                className="w-full gap-2"
                size="lg"
              >
                <Send className="h-4 w-4" />
                {isCreating ? 'Creating Document...' : 'Create & Send for Signature'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sign" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSignature className="h-5 w-5" />
                Sign Document
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="document-select">Select Document to Sign</Label>
                <Select value={selectedDocumentId} onValueChange={setSelectedDocumentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a document" />
                  </SelectTrigger>
                  <SelectContent>
                    {documents?.filter(doc => doc.signing_status !== 'completed').map((doc) => (
                      <SelectItem key={doc.id} value={doc.id}>
                        {doc.title} - {doc.document_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedDocumentId && (
                <>
                  <SignaturePad
                    ref={signaturePadRef}
                    onSave={handleSignatureCapture}
                  />

                  <Button
                    onClick={signDocument}
                    disabled={isSigning || !currentSignature}
                    className="w-full gap-2"
                    size="lg"
                  >
                    <FileSignature className="h-4 w-4" />
                    {isSigning ? 'Signing Document...' : 'Apply Signature'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Document Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              {documentsLoading ? (
                <div className="text-center py-8">Loading documents...</div>
              ) : documents && documents.length > 0 ? (
                  <div className="space-y-4">
                    {documents.map((document) => (
                      <div key={document.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{document.title}</h3>
                            <p className="text-sm text-muted-foreground">{document.document_number}</p>
                            {document.case_number && (
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs font-mono">
                                  {document.case_number}
                                </Badge>
                              </div>
                            )}
                          </div>
                          <Badge className={getStatusColor(document.signing_status)}>
                            {document.signing_status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium">Created</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(document.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Signatures</p>
                          <p className="text-sm text-muted-foreground">
                            {document.signatures?.length || 0} / {document.signature_positions?.length || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Expires</p>
                          <p className="text-sm text-muted-foreground">
                            {document.expires_at ? new Date(document.expires_at).toLocaleDateString() : 'No expiry'}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadDocument(document)}
                          className="gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No documents found. Create your first e-sign document.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ESign;