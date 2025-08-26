import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PenTool, Languages, FileText, Download, Copy } from 'lucide-react';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { toast } from 'sonner';

const DraftingTranslation = () => {
  const [draftContent, setDraftContent] = useState('');
  const [translationContent, setTranslationContent] = useState('');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('');
  const [selectedDocType, setSelectedDocType] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const jurisdictions = [
    'Supreme Court of India',
    'Delhi High Court',
    'Bombay High Court',
    'Calcutta High Court',
    'Madras High Court',
    'Karnataka High Court',
    'Andhra Pradesh High Court',
    'Telangana High Court',
    'Kerala High Court',
    'Punjab and Haryana High Court',
    'Rajasthan High Court',
    'Madhya Pradesh High Court',
    'Chhattisgarh High Court',
    'Orissa High Court',
    'Jharkhand High Court',
    'Patna High Court',
    'Allahabad High Court',
    'Uttarakhand High Court',
    'Himachal Pradesh High Court',
    'Jammu and Kashmir High Court',
    'Gauhati High Court',
    'Sikkim High Court',
    'Tripura High Court',
    'Manipur High Court',
    'Meghalaya High Court',
    'District Court - Delhi',
    'District Court - Mumbai',
    'District Court - Kolkata',
    'District Court - Chennai',
    'District Court - Bangalore',
    'District Court - Hyderabad',
    'District Court - Pune',
    'District Court - Ahmedabad',
    'Family Court',
    'Commercial Court',
    'Consumer Court',
    'Labour Court',
    'Income Tax Appellate Tribunal',
    'National Company Law Tribunal (NCLT)',
    'National Company Law Appellate Tribunal (NCLAT)',
    'Debt Recovery Tribunal (DRT)',
    'Armed Forces Tribunal'
  ];

  const documentTypes = [
    'Contract Agreement',
    'Legal Notice',
    'Affidavit',
    'Power of Attorney',
    'Lease Agreement',
    'Employment Contract',
    'Non-Disclosure Agreement',
    'Terms of Service'
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'hi', name: 'Hindi' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ar', name: 'Arabic' }
  ];

  const generateDraft = async () => {
    if (!selectedJurisdiction || !selectedDocType) return;
    
    setIsDrafting(true);
    // Simulate AI drafting
    setTimeout(() => {
      setDraftContent(`SAMPLE ${selectedDocType.toUpperCase()} - ${selectedJurisdiction}

THIS AGREEMENT is made this _____ day of _________, 2024, between:

FIRST PARTY: _________________________
Address: _____________________________

SECOND PARTY: _______________________
Address: ____________________________

WHEREAS, the parties desire to enter into this agreement for the purpose of...

NOW, THEREFORE, in consideration of the mutual covenants contained herein, the parties agree as follows:

1. TERMS AND CONDITIONS
   The terms of this agreement shall be...

2. OBLIGATIONS
   Each party shall be responsible for...

3. GOVERNING LAW
   This agreement shall be governed by the laws of ${selectedJurisdiction}.

4. DISPUTE RESOLUTION
   Any disputes arising from this agreement shall be resolved through...

IN WITNESS WHEREOF, the parties have executed this agreement on the date first written above.

_________________________        _________________________
First Party Signature             Second Party Signature`);
      setIsDrafting(false);
    }, 2000);
  };

  const translateDocument = async () => {
    if (!translationContent.trim() || !sourceLanguage || !targetLanguage) return;
    
    setIsTranslating(true);
    // Simulate AI translation
    setTimeout(() => {
      const targetLang = languages.find(l => l.code === targetLanguage)?.name;
      setTranslationContent(`[Translated to ${targetLang}]

${translationContent}

[Translation Note: This is a professional legal translation. All legal terminology has been adapted for the target jurisdiction and language requirements.]`);
      setIsTranslating(false);
    }, 2000);
  };

  const copyToClipboard = async (content: string) => {
    console.log('Copy button clicked, content:', content?.slice(0, 100));
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Content copied to clipboard');
      console.log('Copy successful');
    } catch (err) {
      console.error('Copy failed:', err);
      toast.error('Failed to copy content');
    }
  };

  const downloadAsWord = async (content: string, filename: string) => {
    console.log('Download button clicked, filename:', filename, 'content length:', content?.length);
    try {
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: content.split('\n').map(
              (line) =>
                new Paragraph({
                  children: [new TextRun(line || ' ')],
                })
            ),
          },
        ],
      });

      console.log('Document created, generating buffer...');
      const buffer = await Packer.toBuffer(doc);
      console.log('Buffer generated, size:', buffer.length);
      
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('Download completed successfully');
      toast.success('Document downloaded successfully');
    } catch (err) {
      console.error('Download failed:', err);
      toast.error('Failed to download document');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Drafting & Translation Tools</h1>
        <p className="text-muted-foreground mt-2">AI-powered legal document drafting and translation</p>
      </div>

      <Tabs defaultValue="drafting" className="space-y-6">
        <TabsList>
          <TabsTrigger value="drafting">Document Drafting</TabsTrigger>
          <TabsTrigger value="translation">Document Translation</TabsTrigger>
        </TabsList>

        <TabsContent value="drafting">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PenTool className="h-5 w-5" />
                  Draft Configuration
                </CardTitle>
                <CardDescription>Configure document type and jurisdiction</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Jurisdiction</label>
                  <Select value={selectedJurisdiction} onValueChange={setSelectedJurisdiction}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select jurisdiction" />
                    </SelectTrigger>
                    <SelectContent>
                      {jurisdictions.map((jurisdiction) => (
                        <SelectItem key={jurisdiction} value={jurisdiction}>
                          {jurisdiction}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Document Type</label>
                  <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={generateDraft} 
                  disabled={isDrafting || !selectedJurisdiction || !selectedDocType}
                  className="w-full"
                >
                  {isDrafting ? 'Generating Draft...' : 'Generate Draft'}
                </Button>

                {selectedJurisdiction && selectedDocType && (
                  <div className="space-y-2">
                    <Badge variant="secondary">{selectedJurisdiction}</Badge>
                    <Badge variant="outline">{selectedDocType}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generated Draft</CardTitle>
                <CardDescription>AI-generated legal document template</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  placeholder="Generated draft will appear here..."
                  className="min-h-[400px]"
                />
                {draftContent && (
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(draftContent)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const filename = `${selectedDocType?.replace(/\s+/g, '_') || 'Document'}_${selectedJurisdiction?.replace(/\s+/g, '_') || 'Draft'}.docx`;
                        downloadAsWord(draftContent, filename);
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="translation">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  Translation Settings
                </CardTitle>
                <CardDescription>Configure languages and input document</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">From</label>
                    <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Source language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">To</label>
                    <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Target language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Textarea
                  placeholder="Paste document content to translate..."
                  value={translationContent}
                  onChange={(e) => setTranslationContent(e.target.value)}
                  className="min-h-[300px]"
                />

                <Button 
                  onClick={translateDocument} 
                  disabled={isTranslating || !translationContent.trim() || !sourceLanguage || !targetLanguage}
                  className="w-full"
                >
                  {isTranslating ? 'Translating...' : 'Translate Document'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Translation Result</CardTitle>
                <CardDescription>Professional legal translation</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={translationContent}
                  readOnly
                  placeholder="Translation will appear here..."
                  className="min-h-[400px]"
                />
                {translationContent && (
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(translationContent)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Translation
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const sourceLang = languages.find(l => l.code === sourceLanguage)?.name || 'Source';
                        const targetLang = languages.find(l => l.code === targetLanguage)?.name || 'Target';
                        const filename = `Translation_${sourceLang}_to_${targetLang}.docx`;
                        downloadAsWord(translationContent, filename);
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DraftingTranslation;