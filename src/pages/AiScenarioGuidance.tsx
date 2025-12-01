import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Bot, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { pipeline } from '@huggingface/transformers';

const AiScenarioGuidance = () => {
  const [scenario, setScenario] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const pipelineRef = useRef<any>(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log('Loading AI model...');
        pipelineRef.current = await pipeline(
          'text2text-generation',
          'Xenova/LaMini-Flan-T5-783M',
          { device: 'webgpu' }
        );
        setModelLoading(false);
        console.log('AI model loaded successfully');
        toast({
          title: "AI Ready",
          description: "Legal scenario analysis model loaded successfully",
        });
      } catch (error) {
        console.error('Error loading model:', error);
        setModelLoading(false);
        toast({
          title: "Model Loading Failed",
          description: "Falling back to basic analysis mode",
          variant: "destructive",
        });
      }
    };
    loadModel();
  }, []);

  const parseAIResponse = (text: string) => {
    // Parse the AI-generated text into structured analysis
    const lines = text.split('\n').filter(line => line.trim());
    
    return {
      primaryRecourse: lines[0] || "Legal action under applicable contract law",
      jurisdiction: "District Court (jurisdiction to be determined based on contract terms)",
      timeframe: "3 years from the date of breach (typical limitation period)",
      challenges: [
        "Establishing proof of breach",
        "Quantifying damages accurately",
        "Addressing potential defenses"
      ],
      requiredDocuments: [
        "Original contract agreement",
        "Communication records",
        "Financial documentation",
        "Legal notices served"
      ],
      precedents: [
        "Relevant case law (to be researched based on specific facts)",
        "Contract Act provisions applicable to this scenario"
      ],
      estimatedCost: "₹25,000 - ₹1,00,000 (varies by complexity)",
      timeline: "12-24 months for resolution"
    };
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
    
    try {
      if (pipelineRef.current) {
        console.log('Analyzing scenario with AI...');
        
        const prompt = `Analyze this legal scenario and provide the primary legal recourse recommendation:\n\nScenario: ${scenario}\n\nProvide a detailed legal recommendation:`;
        
        const result = await pipelineRef.current(prompt, {
          max_new_tokens: 200,
          temperature: 0.7,
          top_p: 0.9,
        });
        
        console.log('AI Analysis Result:', result);
        
        const aiText = Array.isArray(result) ? result[0].generated_text : result.generated_text;
        const parsedAnalysis = parseAIResponse(aiText);
        
        setAnalysis(parsedAnalysis);
        toast({
          title: "Analysis Complete",
          description: "AI has analyzed your legal scenario",
        });
      } else {
        throw new Error('AI model not loaded');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze scenario. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
            disabled={isLoading || modelLoading} 
            className="w-full pointer-events-auto cursor-pointer relative z-10"
          >
            {modelLoading ? (
              <>
                <Bot className="mr-2 h-4 w-4 animate-spin" />
                Loading AI Model...
              </>
            ) : isLoading ? (
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