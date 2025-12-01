import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Bot, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AiScenarioGuidance = () => {
  const [scenario, setScenario] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const mockAIAnalysis = {
    primaryRecourse: "File a civil suit for breach of contract under Section 73 of the Indian Contract Act, 1872",
    jurisdiction: "District Court having jurisdiction over the place where the contract was executed",
    timeframe: "3 years from the date of breach as per Limitation Act, 1963",
    challenges: [
      "Burden of proof lies on the plaintiff to establish breach",
      "Proving actual damages incurred due to breach",
      "Defendant may claim force majeure or frustration of contract"
    ],
    requiredDocuments: [
      "Original contract agreement",
      "Communication records showing breach",
      "Financial records showing damages",
      "Notice served to the defaulting party"
    ],
    precedents: [
      "Hadley v. Baxendale (1854) - Rule for consequential damages",
      "Fateh Chand v. Balkishan Das (1963) - Indian Contract Act application"
    ],
    estimatedCost: "₹25,000 - ₹75,000 (excluding court fees)",
    timeline: "12-18 months for trial court proceedings"
  };

  const handleAnalyze = async () => {
    if (!scenario.trim()) {
      toast({
        title: "Error",
        description: "Please enter a legal scenario to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate AI processing
    setTimeout(() => {
      setAnalysis(mockAIAnalysis);
      setIsLoading(false);
      toast({
        title: "Analysis Complete",
        description: "AI has analyzed your scenario and provided guidance",
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bot className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Scenario-Based Guidance</h1>
          <p className="text-muted-foreground">Enter a legal scenario to get AI-powered recourse recommendations</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Scenario Input
          </CardTitle>
          <CardDescription>
            Describe the legal scenario in detail for comprehensive analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Example: A client entered into a contract with a vendor for supply of goods worth ₹5 lakhs. The vendor delivered defective goods and is refusing to replace them despite multiple notices..."
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            rows={6}
            className="resize-none"
          />
          <Button 
            onClick={handleAnalyze} 
            disabled={isLoading} 
            className="w-full pointer-events-auto cursor-pointer relative z-10"
          >
            {isLoading ? (
              <>
                <Bot className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Scenario...
              </>
            ) : (
              <>
                <Bot className="mr-2 h-4 w-4" />
                Analyze with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                Primary Recourse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground font-medium">{analysis.primaryRecourse}</p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Jurisdiction</h4>
                  <p className="text-sm">{analysis.jurisdiction}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Limitation Period</h4>
                  <p className="text-sm">{analysis.timeframe}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
                Potential Challenges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.challenges.map((challenge, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">
                      {index + 1}
                    </Badge>
                    <span className="text-sm">{challenge}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Required Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.requiredDocuments.map((doc, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{doc}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Legal Precedents</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.precedents.map((precedent, index) => (
                    <li key={index} className="text-sm">
                      <span className="font-medium">{precedent.split(' - ')[0]}</span>
                      <span className="text-muted-foreground"> - {precedent.split(' - ')[1]}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estimated Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">{analysis.estimatedCost}</p>
                <p className="text-sm text-muted-foreground mt-1">Legal fees estimate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Expected Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">{analysis.timeline}</p>
                <p className="text-sm text-muted-foreground mt-1">For resolution</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiScenarioGuidance;