import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, CheckCircle, AlertTriangle, Info, X, FileSignature, Upload, FolderOpen } from 'lucide-react';
import { useGoogleDrive } from '@/contexts/GoogleDriveContext';
import { useOneDrive } from '@/contexts/OneDriveContext';
import GoogleDriveFileBrowser from '@/components/GoogleDriveFileBrowser';
import OneDriveFileBrowser from '@/components/OneDriveFileBrowser';
import DocumentUploader from '@/components/DocumentUploader';
import { toast } from '@/hooks/use-toast';

const DocumentAnalysis = () => {
  const { isConnected: googleConnected, connect: connectGoogle, isConnecting: googleConnecting } = useGoogleDrive();
  const { isConnected: oneDriveConnected, connect: connectOneDrive, isConnecting: oneDriveConnecting, userProfile: oneDriveProfile } = useOneDrive();
  const [document, setDocument] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{ url: string; name: string; size: number; provider?: string; id?: string } | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCloudProvider, setSelectedCloudProvider] = useState<'google' | 'onedrive'>('google');
  const [activeTab, setActiveTab] = useState<'upload' | 'browse'>('browse');

  const handleFileSelect = async (file: any) => {
    setUploadedFile({
      url: file.webViewLink || file.webContentLink || file.webUrl || '',
      name: file.name,
      size: parseInt(file.size || '0'),
      provider: selectedCloudProvider,
      id: file.id
    });
    
    try {
      // For cloud files, simulate reading the document content
      const mockContent = `This is a sample legal document content from ${file.name}. 
      
      AGREEMENT
      
      This agreement is made between the party of the first part and the second party. The terms and conditions outlined herein shall govern the relationship between the parties.
      
      WHEREAS, the first party agrees to provide services...
      WHEREAS, the second party agrees to compensate...
      
      Therefore, both parties agree to the following terms:
      1. Service delivery shall commence within 30 days
      2. Payment terms are net 30 days
      3. This agreement shall remain in effect for one year`;
      
      setDocument(mockContent);
      toast({
        title: "Document loaded successfully",
        description: `${file.name} has been loaded for analysis`,
      });
    } catch (error) {
      console.error('Error reading file:', error);
      toast({
        title: "Error reading file",
        description: "Please try uploading a different document format",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (file: { url: string; name: string; size: number; provider: 'google' | 'onedrive' }) => {
    setUploadedFile({
      ...file,
    });
    
    try {
      // Simulate reading uploaded document content
      const mockContent = `This is a sample legal document content from uploaded file ${file.name}. 
      
      AGREEMENT
      
      This agreement is made between the party of the first part and the second party. The terms and conditions outlined herein shall govern the relationship between the parties.
      
      WHEREAS, the first party agrees to provide services...
      WHEREAS, the second party agrees to compensate...
      
      Therefore, both parties agree to the following terms:
      1. Service delivery shall commence within 30 days
      2. Payment terms are net 30 days
      3. This agreement shall remain in effect for one year`;
      
      setDocument(mockContent);
      toast({
        title: "Document uploaded successfully",
        description: `${file.name} has been uploaded and loaded for analysis`,
      });
    } catch (error) {
      console.error('Error processing uploaded file:', error);
      toast({
        title: "Error processing file",
        description: "Please try uploading a different document format",
        variant: "destructive",
      });
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setDocument('');
    setAnalysis(null);
  };

  const analyzeDocument = async () => {
    if (!document.trim()) return;
    
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setAnalysis({
        grammarScore: 92,
        terminologyScore: 88,
        clarityScore: 90,
        issues: [
          { type: 'grammar', text: 'Consider using active voice in paragraph 2', severity: 'medium' },
          { type: 'terminology', text: 'Replace "party of the first part" with specific entity name', severity: 'high' },
          { type: 'clarity', text: 'Sentence in paragraph 4 is too complex - consider splitting', severity: 'low' }
        ],
        suggestions: [
          'Add defined terms section for clarity',
          'Include force majeure clause',
          'Specify governing law jurisdiction'
        ]
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Document Analysis</h1>
          <p className="text-muted-foreground mt-2">Grammar and terminology analysis for legal documents</p>
        </div>
        <div className="flex items-center gap-2">
          {!googleConnected && (
            <Button 
              onClick={connectGoogle} 
              disabled={googleConnecting}
              variant="outline"
              className="gap-2"
            >
              <FileSignature className="h-4 w-4" />
              {googleConnecting ? 'Connecting...' : 'Connect Google Drive'}
            </Button>
          )}
          {!oneDriveConnected && (
            <Button 
              onClick={connectOneDrive} 
              disabled={oneDriveConnecting}
              variant="outline"
              className="gap-2"
            >
              <FileSignature className="h-4 w-4" />
              {oneDriveConnecting ? 'Connecting...' : 'Connect OneDrive'}
            </Button>
          )}
        </div>
      </div>

      {!googleConnected && !oneDriveConnected && (
        <Card className="border-orange-200 bg-orange-50 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                <FileSignature className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-orange-900">Cloud Storage Connection Required</h3>
                <p className="text-sm text-orange-700">
                  Connect to Google Drive or OneDrive to upload and analyze your legal documents securely.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Selection & Upload
            </CardTitle>
            <CardDescription>Upload a new document or select from your cloud storage for AI analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadedFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <div>
                      <p className="text-sm font-medium">{uploadedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(uploadedFile.size / 1024).toFixed(1)} KB • {uploadedFile.provider === 'google' ? 'Google Drive' : uploadedFile.provider === 'onedrive' ? 'OneDrive' : 'Cloud Storage'}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={removeFile}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-3 border rounded-lg bg-muted/20 max-h-32 overflow-y-auto">
                  <p className="text-xs text-muted-foreground mb-1">Document Preview:</p>
                  <p className="text-sm">{document.slice(0, 200)}...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {(googleConnected || oneDriveConnected) && (
                  <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'upload' | 'browse')}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="browse" className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4" />
                        Browse Files
                      </TabsTrigger>
                      <TabsTrigger value="upload" className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Upload New
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="browse" className="space-y-4">
                      {(googleConnected && oneDriveConnected) && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Select Cloud Provider:</label>
                          <Select value={selectedCloudProvider} onValueChange={(value: 'google' | 'onedrive') => setSelectedCloudProvider(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="google">Google Drive</SelectItem>
                              <SelectItem value="onedrive">OneDrive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      
                      {selectedCloudProvider === 'google' && googleConnected ? (
                        <GoogleDriveFileBrowser
                          onFileSelect={handleFileSelect}
                          acceptedMimeTypes={[
                            'application/pdf',
                            'application/msword',
                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                            'text/plain',
                            'application/rtf',
                            'application/vnd.google-apps.document'
                          ]}
                          title="Select Document for Analysis"
                        />
                      ) : selectedCloudProvider === 'onedrive' && oneDriveConnected ? (
                        <OneDriveFileBrowser
                          isConnected={oneDriveConnected}
                          userProfile={oneDriveProfile}
                          onFileSelect={handleFileSelect}
                          acceptedMimeTypes={[
                            'application/pdf',
                            'application/msword',
                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                            'text/plain',
                            'application/rtf'
                          ]}
                          title="Select Document for Analysis"
                        />
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <FileText className="h-8 w-8 mx-auto mb-2" />
                          <p>Connect to {selectedCloudProvider === 'google' ? 'Google Drive' : 'OneDrive'} to browse files</p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="upload">
                      <DocumentUploader onFileUploaded={handleFileUpload} />
                    </TabsContent>
                  </Tabs>
                )}
                
                {!googleConnected && !oneDriveConnected && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2" />
                    <p>Connect to Google Drive or OneDrive to upload and browse documents</p>
                  </div>
                )}
              </div>
            )}
            <Button onClick={analyzeDocument} disabled={isAnalyzing || !document.trim() || (!googleConnected && !oneDriveConnected)}>
              {isAnalyzing ? 'Analyzing...' : 'Analyze Document'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>AI-powered insights and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            {analysis ? (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{analysis.grammarScore}%</div>
                    <div className="text-sm text-muted-foreground">Grammar</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{analysis.terminologyScore}%</div>
                    <div className="text-sm text-muted-foreground">Terminology</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{analysis.clarityScore}%</div>
                    <div className="text-sm text-muted-foreground">Clarity</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Issues Found</h4>
                  {analysis.issues.map((issue: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      {issue.severity === 'high' && <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />}
                      {issue.severity === 'medium' && <Info className="h-5 w-5 text-yellow-500 mt-0.5" />}
                      {issue.severity === 'low' && <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={issue.severity === 'high' ? 'destructive' : issue.severity === 'medium' ? 'default' : 'secondary'}>
                            {issue.type}
                          </Badge>
                          <Badge variant="outline">{issue.severity}</Badge>
                        </div>
                        <p className="text-sm mt-1">{issue.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Suggestions</h4>
                  <ul className="text-sm space-y-1">
                    {analysis.suggestions.map((suggestion: string, index: number) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Select a document from Google Drive to see analysis results
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocumentAnalysis;