import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, CheckCircle, AlertTriangle, Info } from 'lucide-react';

const DocumentAnalysis = () => {
  const [document, setDocument] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
            <Textarea
              placeholder="Paste your legal document here..."
              value={document}
              onChange={(e) => setDocument(e.target.value)}
              className="min-h-[300px]"
            />
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