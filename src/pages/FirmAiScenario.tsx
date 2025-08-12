import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Lightbulb, AlertTriangle, CheckCircle, Users } from 'lucide-react';

const FirmAiScenario = () => {
  const [scenarios] = useState([
    {
      id: 1,
      title: 'Multi-Client Contract Dispute Resolution',
      caseTypes: ['Contract Law', 'Commercial Disputes'],
      clients: ['Client A Corp', 'Client B LLC', 'Client C Inc'],
      description: 'Three simultaneous contract disputes requiring coordinated strategy...',
      status: 'active'
    },
    {
      id: 2,
      title: 'Employment Law Class Action',
      caseTypes: ['Employment Law', 'Class Action'],
      clients: ['50+ Employees vs XYZ Corp'],
      description: 'Large-scale employment discrimination case requiring resource allocation...',
      status: 'planning'
    }
  ]);

  const [selectedScenario, setSelectedScenario] = useState('');
  const [customScenario, setCustomScenario] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeScenario = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setAnalysis({
        riskLevel: 'Medium',
        estimatedDuration: '8-12 months',
        resourceRequirement: 'High',
        strategies: [
          'Coordinate discovery schedules across all cases',
          'Establish common defense strategy framework',
          'Consider consolidation opportunities',
          'Implement parallel negotiation tracks'
        ],
        challenges: [
          'Resource allocation conflicts',
          'Conflicting client interests',
          'Timeline coordination complexity',
          'Regulatory compliance variations'
        ],
        recommendations: [
          'Assign dedicated case coordinator',
          'Weekly cross-case strategy meetings',
          'Shared document management system',
          'Early settlement exploration'
        ],
        costEstimate: '$250,000 - $400,000',
        successProbability: '78%'
      });
      setIsAnalyzing(false);
    }, 2500);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">AI Scenario Guidance</h1>
        <p className="text-muted-foreground mt-2">Multi-case scenario analysis and strategic guidance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active Scenarios
            </CardTitle>
            <CardDescription>Ongoing multi-case scenarios in your firm</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scenarios.map((scenario) => (
                <div key={scenario.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium">{scenario.title}</h4>
                    <Badge variant={scenario.status === 'active' ? 'default' : 'secondary'}>
                      {scenario.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{scenario.description}</p>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {scenario.caseTypes.map((type, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Clients: {scenario.clients.join(', ')}
                    </div>
                  </div>
                  <Button size="sm" className="mt-3" onClick={() => setSelectedScenario(scenario.title)}>
                    Analyze Scenario
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Custom Scenario Analysis
            </CardTitle>
            <CardDescription>Describe a new multi-case scenario for AI analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Describe your multi-case scenario... Include case types, clients involved, timeline constraints, and any specific challenges..."
              value={customScenario}
              onChange={(e) => setCustomScenario(e.target.value)}
              className="min-h-[200px]"
            />
            <Button 
              onClick={analyzeScenario}
              disabled={isAnalyzing || (!customScenario.trim() && !selectedScenario)}
              className="w-full"
            >
              {isAnalyzing ? 'Analyzing...' : 'Get AI Guidance'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>AI Analysis Results</CardTitle>
            <CardDescription>Strategic guidance for your multi-case scenario</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 border rounded-lg">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                <div className="font-semibold">Risk Level</div>
                <div className="text-lg font-bold text-yellow-600">{analysis.riskLevel}</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <div className="font-semibold">Success Rate</div>
                <div className="text-lg font-bold text-green-600">{analysis.successProbability}</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Bot className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="font-semibold">Duration</div>
                <div className="text-lg font-bold text-blue-600">{analysis.estimatedDuration}</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Users className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <div className="font-semibold">Cost Estimate</div>
                <div className="text-lg font-bold text-purple-600">{analysis.costEstimate}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Recommended Strategies
                </h4>
                <ul className="space-y-2">
                  {analysis.strategies.map((strategy: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {strategy}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Potential Challenges
                </h4>
                <ul className="space-y-2">
                  {analysis.challenges.map((challenge: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      {challenge}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  AI Recommendations
                </h4>
                <ul className="space-y-2">
                  {analysis.recommendations.map((recommendation: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Bot className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FirmAiScenario;