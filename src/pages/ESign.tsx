import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  const { user, userProfile } = useAuth();
  const { isConnected, connect, isConnecting } = useGoogleDrive();
  const isClient = userProfile?.role === 'client';
  const [activeTab, setActiveTab] = useState(isClient ? 'sign' : 'create');
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

  // Component mount logging
  useEffect(() => {
    console.log('📋 E-Sign Module Loaded');
    console.log('User:', user?.id, user?.email);
    console.log('User Role:', userProfile?.role);
    console.log('Google Drive Connected:', isConnected);
    console.log('Active Tab:', activeTab);
  }, []);

  // Log file selection
  useEffect(() => {
    if (uploadedFile) {
      console.log('📄 File Selected:', {
        name: uploadedFile.name,
        size: uploadedFile.size,
        url: uploadedFile.url,
        googleDriveId: uploadedFile.googleDriveId
      });
    }
  }, [uploadedFile]);

  // Fetch documents - filter for clients
  const { data: allDocuments, loading: documentsLoading, refetch: refetchDocuments } = useSupabaseData<ESignDocument>({
    table: 'e_sign_documents',
    select: '*',
    realtime: true
  });

  // Filter documents based on user role
  const documents = React.useMemo(() => {
    if (!allDocuments) return [];
    
    if (isClient) {
      // For clients, show documents where they are a signatory or client
      return allDocuments.filter(doc => 
        doc.client_id === user?.id ||
        doc.signature_positions?.some((pos: any) => pos.email === user?.email) ||
        doc.signature_positions?.some((pos: any) => pos.signatory_id === user?.id)
      );
    }
    
    // For lawyers, show all their documents
    return allDocuments.filter(doc => doc.lawyer_id === user?.id);
  }, [allDocuments, isClient, user?.id, user?.email]);

  const addSignatory = () => {
    console.log('➕ Adding signatory:', { email: newSignatoryEmail, name: newSignatoryName, role: newSignatoryRole });
    
    if (!newSignatoryEmail || newSignatoryEmail.trim() === '') {
      console.error('❌ Validation Failed: Email is missing');
      toast.error('Email is required', {
        description: 'Please enter a valid email address for the signatory'
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newSignatoryEmail.trim())) {
      console.error('❌ Validation Failed: Invalid email format');
      toast.error('Invalid email format', {
        description: 'Please enter a valid email address (e.g., name@example.com)'
      });
      return;
    }

    if (!newSignatoryName || newSignatoryName.trim() === '') {
      console.error('❌ Validation Failed: Name is missing');
      toast.error('Name is required', {
        description: 'Please enter the full name of the signatory'
      });
      return;
    }

    // Check for duplicate email
    const isDuplicate = signatories.some(s => s.email.toLowerCase() === newSignatoryEmail.trim().toLowerCase());
    if (isDuplicate) {
      console.error('❌ Validation Failed: Duplicate email');
      toast.error('Duplicate signatory', {
        description: 'This email address has already been added'
      });
      return;
    }

    const newSignatory: Signatory = {
      id: Date.now().toString(),
      email: newSignatoryEmail.trim(),
      name: newSignatoryName.trim(),
      role: newSignatoryRole.trim() || 'Signatory',
      signed: false
    };

    setSignatories([...signatories, newSignatory]);
    setNewSignatoryEmail('');
    setNewSignatoryName('');
    setNewSignatoryRole('');
    
    console.log('✅ Signatory added successfully:', newSignatory);
    toast.success('Signatory added', {
      description: `${newSignatory.name} has been added to the list`
    });
  };

  const removeSignatory = (id: string) => {
    setSignatories(signatories.filter(s => s.id !== id));
  };

  const createDocument = async () => {
    console.log('🔄 Create Document - Starting validation...');
    console.log('Document Title:', documentTitle);
    console.log('Uploaded File:', uploadedFile);
    console.log('Signatories Count:', signatories.length);
    console.log('Selected Case ID:', selectedCaseId);
    console.log('Case Number:', caseNumber);

    // Step-by-step validation with specific error messages
    if (!documentTitle || documentTitle.trim() === '') {
      console.error('❌ Validation Failed: Document title is missing');
      toast.error('Document title is required', {
        description: 'Please enter a title for your document'
      });
      return;
    }

    if (!uploadedFile) {
      console.error('❌ Validation Failed: No file uploaded');
      toast.error('Document file is required', {
        description: 'Please select a document file from Google Drive'
      });
      return;
    }

    if (!uploadedFile.url || uploadedFile.url.trim() === '') {
      console.error('❌ Validation Failed: Uploaded file has no URL');
      toast.error('Invalid file selected', {
        description: 'The selected file does not have a valid URL. Please try selecting the file again.'
      });
      return;
    }

    if (signatories.length === 0) {
      console.error('❌ Validation Failed: No signatories added');
      toast.error('At least one signatory is required', {
        description: 'Please add at least one person to sign the document'
      });
      return;
    }

    // Validate email addresses for all signatories
    const invalidSignatories = signatories.filter(s => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return !emailRegex.test(s.email);
    });

    if (invalidSignatories.length > 0) {
      console.error('❌ Validation Failed: Invalid email addresses:', invalidSignatories);
      toast.error('Invalid email addresses', {
        description: `Please provide valid email addresses for all signatories`
      });
      return;
    }

    // Validate either existing case or new case number is provided
    if (!selectedCaseId && !caseNumber) {
      console.error('❌ Validation Failed: No case selected or created');
      toast.error('Case association required', {
        description: 'Please either select an existing case or create a new case number'
      });
      return;
    }

    console.log('✅ All validations passed, proceeding with document creation...');

    setIsCreating(true);
    try {
      const documentNumber = `DOC-${Date.now()}`;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiryDays));

      console.log('📝 Preparing document data...');
      const documentData = {
        document_number: documentNumber,
        title: documentTitle.trim(),
        original_file_url: uploadedFile.url,
        google_drive_file_id: uploadedFile.googleDriveId || null,
        case_id: selectedCaseId || null,
        case_number: caseNumber || null,
        client_id: user?.id || null,
        lawyer_id: user?.id || null,
        signature_positions: signatories.map((s, index) => ({
          signatory_id: s.id,
          email: s.email.trim(),
          name: s.name.trim(),
          role: s.role.trim() || 'Signatory',
          position: index + 1,
          signed: false
        })),
        signatures: [],
        signing_status: 'pending',
        expires_at: expiresAt.toISOString()
      };

      console.log('📤 Sending document data to Supabase:', JSON.stringify(documentData, null, 2));

      const { data, error } = await supabase
        .from('e_sign_documents')
        .insert(documentData)
        .select();

      if (error) {
        console.error('❌ Supabase Error:', error);
        throw error;
      }

      console.log('✅ Document created successfully:', data);

      toast.success('Document created successfully', {
        description: `Document ${documentNumber} has been created and sent for signature`
      });
      
      // Reset form
      console.log('🔄 Resetting form...');
      setDocumentTitle('');
      setDocumentDescription('');
      setUploadedFile(null);
      setSignatories([]);
      setSelectedCaseId('');
      setCaseNumber('');
      setExpiryDays('30');
      
      // Switch to manage tab and refresh
      setActiveTab('manage');
      await refetchDocuments();
      
      console.log('✅ Form reset complete');
    } catch (error: any) {
      console.error('❌ Error creating document:', error);
      console.error('Error details:', {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code
      });
      
      toast.error('Failed to create document', {
        description: error?.message || 'An unexpected error occurred. Please check the console for details.'
      });
    } finally {
      setIsCreating(false);
      console.log('🏁 Create document process completed');
    }
  };

  const handleSignatureCapture = (signature: string) => {
    setCurrentSignature(signature);
    toast.success('Signature captured successfully');
  };

  const signDocument = async () => {
    console.log('✍️ Sign Document - Starting validation...');
    console.log('Selected Document ID:', selectedDocumentId);
    console.log('Current Signature:', currentSignature ? 'Present' : 'Missing');

    if (!selectedDocumentId) {
      console.error('❌ Validation Failed: No document selected');
      toast.error('Please select a document', {
        description: 'Choose a document to sign from the list'
      });
      return;
    }

    if (!currentSignature) {
      console.error('❌ Validation Failed: No signature provided');
      toast.error('Signature required', {
        description: 'Please draw your signature in the signature pad'
      });
      return;
    }

    console.log('✅ Validation passed, proceeding with signing...');

    setIsSigning(true);
    try {
      const document = documents?.find(d => d.id === selectedDocumentId);
      if (!document) {
        console.error('❌ Document not found in list');
        throw new Error('Document not found');
      }

      console.log('📄 Document found:', document.title);

      // Create signature data
      const signatureData = {
        signatory_id: user?.id,
        signatory_email: user?.email,
        signature: currentSignature,
        signed_at: new Date().toISOString(),
        ip_address: 'unknown'
      };

      console.log('📝 Signature data prepared:', signatureData);

      // Update document with signature
      const updatedSignatures = [...(document.signatures || []), signatureData];
      const allSigned = document.signature_positions.every(pos => 
        updatedSignatures.some(sig => sig.signatory_id === pos.signatory_id)
      );

      console.log('📊 Signature status:', { 
        totalRequired: document.signature_positions.length, 
        totalSigned: updatedSignatures.length,
        allSigned 
      });

      const updateData = {
        signatures: updatedSignatures,
        signing_status: allSigned ? 'completed' : 'partially_signed',
        signed_at: allSigned ? new Date().toISOString() : null
      };

      console.log('📤 Sending update to Supabase:', updateData);

      const { data, error } = await supabase
        .from('e_sign_documents')
        .update(updateData)
        .eq('id', selectedDocumentId)
        .select();

      if (error) {
        console.error('❌ Supabase Error:', error);
        throw error;
      }

      console.log('✅ Document signed successfully:', data);

      toast.success('Document signed successfully', {
        description: allSigned ? 'All signatures collected!' : 'Your signature has been recorded'
      });
      
      setCurrentSignature('');
      setSelectedDocumentId('');
      signaturePadRef.current?.clear();
      await refetchDocuments();
      
      console.log('✅ Sign document process completed');
    } catch (error: any) {
      console.error('❌ Error signing document:', error);
      console.error('Error details:', {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code
      });
      
      toast.error('Failed to sign document', {
        description: error?.message || 'An unexpected error occurred. Please check the console for details.'
      });
    } finally {
      setIsSigning(false);
      console.log('🏁 Sign document process completed');
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
        <TabsList className={`grid w-full ${isClient ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {!isClient && <TabsTrigger value="create">Create Document</TabsTrigger>}
          <TabsTrigger value="sign">{isClient ? 'Sign Documents' : 'Sign Document'}</TabsTrigger>
          <TabsTrigger value="manage">{isClient ? 'My Documents' : 'Manage Documents'}</TabsTrigger>
        </TabsList>

        {!isClient && <TabsContent value="create" className="space-y-6">
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <FileSignature className="h-4 w-4 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-blue-900">Creating an E-Sign Document</h3>
                  <p className="text-sm text-blue-700">
                    Fill in all required fields marked with <span className="text-destructive">*</span>. 
                    The document will be sent to all signatories for electronic signature.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New E-Sign Document
              </CardTitle>
              <CardDescription>
                All fields marked with <span className="text-destructive">*</span> are required
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="flex items-center gap-1">
                    Document Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    placeholder="Enter document title"
                    required
                    className={!documentTitle && isCreating ? 'border-destructive' : ''}
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
                  <h3 className="text-lg font-semibold flex items-center gap-1">
                    Signatories <span className="text-destructive">*</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input
                    placeholder="Email address *"
                    value={newSignatoryEmail}
                    onChange={(e) => setNewSignatoryEmail(e.target.value)}
                    type="email"
                    required
                  />
                  <Input
                    placeholder="Full name *"
                    value={newSignatoryName}
                    onChange={(e) => setNewSignatoryName(e.target.value)}
                    required
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
                    <Label>Added Signatories ({signatories.length})</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {signatories.map((signatory) => (
                        <div key={signatory.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                          <div>
                            <p className="font-medium">{signatory.name}</p>
                            <p className="text-sm text-muted-foreground">{signatory.email}</p>
                            {signatory.role && (
                              <Badge variant="secondary" className="text-xs mt-1">{signatory.role}</Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSignatory(signatory.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {signatories.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Add at least one signatory to create the document
                  </p>
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

              <Separator />

              {/* Validation Summary */}
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-sm">Document Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    {documentTitle ? (
                      <>
                        <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-sm text-muted-foreground">Title provided</span>
                      </>
                    ) : (
                      <>
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Title required</span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {uploadedFile ? (
                      <>
                        <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-sm text-muted-foreground">File selected</span>
                      </>
                    ) : (
                      <>
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                        <span className="text-sm text-muted-foreground">File required</span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {signatories.length > 0 ? (
                      <>
                        <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-sm text-muted-foreground">{signatories.length} signator{signatories.length === 1 ? 'y' : 'ies'} added</span>
                      </>
                    ) : (
                      <>
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Signatories required</span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {(selectedCaseId || caseNumber) ? (
                      <>
                        <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-sm text-muted-foreground">Case associated</span>
                      </>
                    ) : (
                      <>
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Case required</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <Button 
                onClick={createDocument} 
                disabled={isCreating || !isConnected}
                className="w-full gap-2"
                size="lg"
              >
                <Send className="h-4 w-4" />
                {isCreating ? 'Creating Document...' : 'Create & Send for Signature'}
              </Button>
              
              {!isConnected && (
                <p className="text-sm text-destructive text-center">
                  Please connect to Google Drive to create documents
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>}

        <TabsContent value="sign" className="space-y-6">
          {isClient ? (
            // Client-focused signing interface
            <div className="space-y-6">
              {documents?.filter(doc => doc.signing_status !== 'completed' && !doc.signatures?.some((sig: any) => sig.signatory_id === user?.id)).length > 0 ? (
                documents
                  .filter(doc => doc.signing_status !== 'completed' && !doc.signatures?.some((sig: any) => sig.signatory_id === user?.id))
                  .map((doc) => (
                    <Card key={doc.id} className="border-2 border-blue-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileSignature className="h-5 w-5 text-blue-600" />
                          {doc.title}
                        </CardTitle>
                        <CardDescription>
                          Document #{doc.document_number} • 
                          {doc.case_number && ` Case: ${doc.case_number} • `}
                          {doc.expires_at && ` Expires: ${new Date(doc.expires_at).toLocaleDateString()}`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">Document Preview</h4>
                          <p className="text-sm text-gray-600 mb-3">
                            Please review the document before signing. Click the link below to view the full document.
                          </p>
                          <Button variant="outline" size="sm" className="gap-2" asChild>
                            <a href={doc.original_file_url} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" />
                              View Document
                            </a>
                          </Button>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-medium">Your Digital Signature</h4>
                          <SignaturePad
                            ref={signaturePadRef}
                            onSave={handleSignatureCapture}
                          />
                        </div>

                        <Button
                          onClick={() => {
                            setSelectedDocumentId(doc.id);
                            signDocument();
                          }}
                          disabled={isSigning || !currentSignature}
                          className="w-full gap-2"
                          size="lg"
                        >
                          <FileSignature className="h-4 w-4" />
                          {isSigning ? 'Signing Document...' : 'Sign Document'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <FileSignature className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Documents to Sign</h3>
                    <p className="text-gray-600">You have no pending documents requiring your signature at this time.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            // Lawyer signing interface (original)
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
          )}
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