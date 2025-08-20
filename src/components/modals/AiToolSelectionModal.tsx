
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bot, Search, FileText, Scale, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AiToolSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (toolName: string) => void;
  itemName?: string;
  caseData?: any;
}

const AiToolSelectionModal = ({ isOpen, onClose, onSelect, itemName, caseData }: AiToolSelectionModalProps) => {
  const navigate = useNavigate();

  const aiTools = [
    {
      name: 'Case Analyser',
      route: '/ai-tools/case-analyser',
      icon: Search,
      description: 'Analyze case details and evidence with AI assistance',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      name: 'Compliance',
      route: '/ai-tools/compliance',
      icon: Scale,
      description: 'Check legal compliance and regulatory requirements',
      color: 'bg-green-100 text-green-600'
    },
    {
      name: 'Case Summary',
      route: '/ai-tools/case-summary',
      icon: FileText,
      description: 'Generate comprehensive case summaries and reports',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      name: 'Scenario Guidance',
      route: '/ai-tools/scenario-guidance',
      icon: Lightbulb,
      description: 'Get AI-powered guidance for case scenarios and strategies',
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  const handleToolSelect = (tool: any) => {
    onSelect(tool.name);
    navigate(tool.route, { 
      state: { 
        selectedCase: itemName,
        caseData: caseData
      } 
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[85vh] overflow-hidden p-0 mx-4">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <Bot className="h-6 w-6 text-blue-600" />
            <span>Select AI Tool</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="px-6 py-4 overflow-hidden">
          <p className="text-sm text-gray-600 mb-6">
            Choose an AI tool to analyze "{itemName}"
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {aiTools.map((tool) => (
              <Button
                key={tool.name}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-3 text-center hover:bg-gray-50 border border-gray-200 hover:shadow-md transition-all duration-200 hover-scale"
                onClick={() => handleToolSelect(tool)}
              >
                <div className={`p-3 rounded-xl ${tool.color} flex-shrink-0`}>
                  <tool.icon className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-gray-900 text-base">{tool.name}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{tool.description}</p>
                </div>
              </Button>
            ))}
          </div>
          
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AiToolSelectionModal;
