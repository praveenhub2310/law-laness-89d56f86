
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Upload, 
  Bot, 
  User, 
  Send, 
  Mic, 
  Paperclip,
  Copy,
  Download,
  Globe,
  ChevronDown,
  FileText,
  X
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface AiToolLayoutProps {
  title: string;
  description: string;
  botName: string;
  children?: React.ReactNode;
}

const AiToolLayout = ({ title, description, botName }: AiToolLayoutProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Check if there's a selected document from navigation state
    if (location.state && location.state.selectedDocument) {
      setSelectedDocument(location.state.selectedDocument);
    }
  }, [location.state]);

  const handleRemoveDocument = () => {
    setSelectedDocument(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Bot className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Globe className="h-4 w-4 mr-2" />
              EN
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
            
            <Button className="bg-blue-600 hover:bg-blue-700">
              Create Doc
            </Button>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Panel - Search & Upload */}
        <div className="w-80 bg-white border-r border-gray-200 p-6">
          <div className="space-y-6">
            {/* Search Section */}
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Document Section */}
            <div>
              {selectedDocument ? (
                <div className="border-2 border-blue-300 bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900 text-sm">Selected Document</p>
                        <p className="text-blue-700 text-xs truncate max-w-[180px]" title={selectedDocument}>
                          {selectedDocument}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveDocument}
                      className="text-blue-600 hover:text-blue-700 h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full h-12 border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              )}
            </div>

            {/* Additional content can be added here */}
          </div>
        </div>

        {/* Right Panel - Chat Interface */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white p-6 border-b border-gray-200">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
              <p className="text-gray-600 mb-4">{description}</p>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="max-w-4xl mx-auto">
              {/* Bot Header */}
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bot className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{botName}</h3>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Welcome Message */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-gray-700">
                  Hello! I am here to help with your legal {title.toLowerCase()} questions. Whether its regulations or procedures, feel 
                  free to ask and ensure you are meeting the latest legal standards!
                </p>
                {selectedDocument && (
                  <div className="mt-3 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                    <p className="text-sm text-blue-800">
                      Document loaded: <span className="font-medium">{selectedDocument}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="pr-20"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Mic className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiToolLayout;
