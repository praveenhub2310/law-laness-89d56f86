import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PenTool, Download, Copy, FileText, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const DraftingTool = () => {
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [caseDetails, setCaseDetails] = useState('');
  const [partyDetails, setPartyDetails] = useState('');
  const [generatedDraft, setGeneratedDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const jurisdictions = [
    'Delhi High Court',
    'Mumbai High Court', 
    'Calcutta High Court',
    'Madras High Court',
    'Supreme Court of India',
    'Karnataka High Court',
    'Rajasthan High Court',
    'Punjab & Haryana High Court'
  ];

  const documentTypes = [
    'Civil Suit',
    'Criminal Complaint',
    'Writ Petition',
    'Appeal Petition',
    'Bail Application',
    'Divorce Petition',
    'Injunction Application',
    'Arbitration Petition',
    'Company Law Petition',
    'Constitutional Petition'
  ];

  const sampleDrafts = {
    'Civil Suit': `IN THE COURT OF SENIOR CIVIL JUDGE
${selectedJurisdiction}

Civil Suit No. ___/2024

BETWEEN:

[Plaintiff Name]
S/o [Father's Name]
R/o [Address]
                                                    ....Plaintiff

VERSUS

[Defendant Name]  
S/o [Father's Name]
R/o [Address]
                                                    ....Defendant

PLAINT UNDER ORDER VII RULE 1 OF CODE OF CIVIL PROCEDURE, 1908

TO,
THE HON'BLE COURT

The Plaintiff most respectfully submits as under:

1. PARTIES:
   That the Plaintiff is a [profession/business] and resident of [address].
   
   That the Defendant is [details about defendant].

2. JURISDICTION:
   That this Hon'ble Court has jurisdiction to try and decide this suit as the cause of action arose within the jurisdiction of this Court.

3. FACTS:
   [Case specific facts to be inserted]

4. CAUSE OF ACTION:
   The cause of action arose on [date] when [details of breach/issue].

5. RELIEF SOUGHT:
   In the premises, it is most respectfully prayed that this Hon'ble Court may be pleased to:
   
   a) [Primary relief]
   b) [Secondary relief] 
   c) Cost of the suit
   d) Any other relief as this Hon'ble Court deems fit and proper

PLAINTIFF
Through Counsel

PLACE: [City]
DATE: [Date]

VERIFICATION
I, [Name], the Plaintiff above named do hereby verify that the contents of paras 1 to 5 of the above plaint are true to my knowledge and belief and no part of it is false and nothing material has been concealed therein.

Verified at [Place] on this [Date].

                                                    PLAINTIFF`,

    'Writ Petition': `BEFORE THE HON'BLE HIGH COURT OF ${selectedJurisdiction}

W.P.(C) No. ___/2024

IN THE MATTER OF:
[Brief description of the matter]

AND

IN THE MATTER OF:
Articles 14, 19, 21 and 226 of the Constitution of India

BETWEEN:

[Petitioner Name]
S/o [Father's Name]
R/o [Address]
                                                    ....Petitioner

VERSUS

1. [Respondent 1]
2. [Respondent 2]
                                                    ....Respondents

PETITION UNDER ARTICLE 226 OF THE CONSTITUTION OF INDIA

TO,
THE HON'BLE CHIEF JUSTICE AND HIS COMPANION JUSTICES OF THE HIGH COURT OF ${selectedJurisdiction}

THE HUMBLE PETITION OF THE PETITIONER ABOVE NAMED

MOST RESPECTFULLY SHOWETH:

1. That the Petitioner is filing this Writ Petition seeking [relief sought] against the [action/order] dated [date] passed by [authority].

2. BRIEF FACTS:
   [Detailed facts of the case]

3. GROUNDS:
   a) The impugned order is violative of Article 14 of the Constitution as it is arbitrary and discriminatory.
   b) The order violates the principles of natural justice as no opportunity of hearing was provided.
   c) [Other grounds]

4. RELIEF SOUGHT:
   In the premises, it is most respectfully prayed that this Hon'ble Court may be pleased to:
   
   a) Issue a writ of certiorari quashing the impugned order
   b) Issue appropriate directions
   c) Cost of the petition
   d) Any other relief

PETITIONER
Through Counsel

PLACE: [City]  
DATE: [Date]`
  };

  const handleGenerate = async () => {
    if (!selectedJurisdiction || !documentType) {
      toast({
        title: "Missing Information",
        description: "Please select jurisdiction and document type",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      let draft = sampleDrafts[documentType] || sampleDrafts['Civil Suit'];
      
      // Replace placeholders with actual details if provided
      if (partyDetails) {
        draft = draft.replace('[Plaintiff Name]', partyDetails.split(',')[0] || '[Plaintiff Name]');
      }
      
      setGeneratedDraft(draft);
      setIsGenerating(false);
      
      toast({
        title: "Draft Generated",
        description: `${documentType} draft has been generated for ${selectedJurisdiction}`,
      });
    }, 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDraft);
    toast({
      title: "Copied to Clipboard",
      description: "Draft has been copied to clipboard",
    });
  };

  const handleDownload = () => {
    const blob = new Blob([generatedDraft], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${documentType.replace(/\s+/g, '_')}_Draft_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Download Successful",
      description: "Draft has been downloaded as text file",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <PenTool className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Jurisdiction-Specific Drafting Tool</h1>
          <p className="text-muted-foreground">Generate legal documents tailored to specific court jurisdictions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Configuration
            </CardTitle>
            <CardDescription>
              Configure the document details and jurisdiction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Select Jurisdiction
              </label>
              <Select value={selectedJurisdiction} onValueChange={setSelectedJurisdiction}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose court jurisdiction" />
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
              <label className="text-sm font-medium text-foreground mb-2 block">
                Document Type
              </label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose document type" />
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

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Party Details
              </label>
              <Textarea
                placeholder="Enter party names and details (Plaintiff, Defendant, etc.)"
                value={partyDetails}
                onChange={(e) => setPartyDetails(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Case Details
              </label>
              <Textarea
                placeholder="Enter brief case details and facts"
                value={caseDetails}
                onChange={(e) => setCaseDetails(e.target.value)}
                rows={4}
              />
            </div>

            <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating Draft...
                </>
              ) : (
                <>
                  <PenTool className="mr-2 h-4 w-4" />
                  Generate Draft
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Draft</CardTitle>
            {generatedDraft && (
              <div className="flex gap-2">
                <Button onClick={handleCopy} variant="outline" size="sm">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button onClick={handleDownload} variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {generatedDraft ? (
              <div className="bg-muted/30 rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-sm font-mono max-h-96 overflow-y-auto">
                  {generatedDraft}
                </pre>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 opacity-30" />
                <p className="mt-4">Generated draft will appear here</p>
                <p className="text-sm">Configure document details and click Generate Draft</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedJurisdiction && (
        <Card>
          <CardHeader>
            <CardTitle>Jurisdiction Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Selected Court</h4>
                <Badge variant="secondary">{selectedJurisdiction}</Badge>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Applicable Rules</h4>
                <p className="text-sm">CPC, 1908 & Local Rules</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Filing Fees</h4>
                <p className="text-sm">As per Court Fee Act</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DraftingTool;