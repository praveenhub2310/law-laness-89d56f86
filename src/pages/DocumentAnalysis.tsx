import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from '@/hooks/use-toast';

const DocumentAnalysis = () => {
  const [document, setDocument] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const readFileContent = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = (e) => reject(e);
      
      if (file.type === 'application/pdf') {
        toast({
          title: "PDF files not supported",
          description: "Please upload a text document (.txt, .doc, .docx)",
          variant: "destructive",
        });
        reject(new Error('PDF not supported'));
        return;
      }
      
      reader.readAsText(file);
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setUploadedFile(file);
    
    try {
      const content = await readFileContent(file);
      setDocument(content);
      toast({
        title: "File uploaded successfully",
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
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/rtf': ['.rtf']
    },
    multiple: false,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold">AI Document Analysis</h1>
        <p className="text-muted-foreground mt-2">Grammar and terminology analysis for legal documents</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Input
            </CardTitle>
            <CardDescription>Paste your legal document for AI analysis</CardDescription>
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
                        {(uploadedFile.size / 1024).toFixed(1)} KB
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
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary hover:bg-primary/5'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                {isDragActive ? (
                  <p className="text-muted-foreground">Drop the document here...</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-muted-foreground">
                      Drag & drop a document here, or click to select
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supports: .txt, .doc, .docx, .rtf (Max 5MB)
                    </p>
                  </div>
                )}
              </div>
            )}
            <Button onClick={analyzeDocument} disabled={isAnalyzing || !document.trim()}>
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
                Upload a document to see analysis results
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocumentAnalysis;