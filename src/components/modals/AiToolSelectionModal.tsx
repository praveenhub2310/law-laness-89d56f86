
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bot, Search, FileText, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AiToolSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (toolName: string) => void;
  itemName?: string;
}

const AiToolSelectionModal = ({ isOpen, onClose, onSelect, itemName }: AiToolSelectionModalProps) => {
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
    }
  ];

  const handleToolSelect = (tool: any) => {
    onSelect(tool.name);
    navigate(tool.route);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[95vw] max-h-[90vh] overflow-y-auto p-0 mx-4">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4">
          <DialogTitle className="flex items-center space-x-2 text-lg">
            <Bot className="h-5 w-5 text-blue-600" />
            <span>Select AI Tool</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <p className="text-sm text-gray-600 mb-4 sm:mb-6">
            Choose an AI tool to process "{itemName}"
          </p>
          
          <div className="space-y-3 mb-4 sm:mb-6">
            {aiTools.map((tool) => (
              <Button
                key={tool.name}
                variant="outline"
                className="w-full h-auto p-3 sm:p-4 flex items-start space-x-3 text-left hover:bg-gray-50 border border-gray-200"
                onClick={() => handleToolSelect(tool)}
              >
                <div className={`p-2 rounded-lg ${tool.color} flex-shrink-0`}>
                  <tool.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base">{tool.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">{tool.description}</p>
                </div>
              </Button>
            ))}
          </div>
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AiToolSelectionModal;
