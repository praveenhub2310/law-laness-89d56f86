import React, { useState, useEffect, useRef } from 'react';
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
  X,
  Loader2,
  Trash2
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAIConversation } from '@/hooks/useAIConversation';
import { useDocumentUpload } from '@/hooks/useDocumentUpload';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';

interface AiToolLayoutProps {
  title: string;
  description: string;
  botName: string;
  children?: React.ReactNode;
}

const AiToolLayout = ({ title, description, botName }: AiToolLayoutProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [uploadedDocument, setUploadedDocument] = useState<any>(null);
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Extract tool type from title
  const toolType = title.toLowerCase().includes('analyser') ? 'case_analyser' 
    : title.toLowerCase().includes('summary') ? 'case_summary'
    : title.toLowerCase().includes('compliance') ? 'compliance'
    : 'scenario_guidance';

  const caseData = location.state?.caseData;
  const caseId = caseData?.id;

  const {
    conversation,
    messages,
    loading,
    sending,
    initializeConversation,
    sendMessage,
    clearConversation
  } = useAIConversation(toolType, caseId);

  const {
    uploadDocument,
    uploading,
    uploadProgress
  } = useDocumentUpload(caseId);

  // Initialize conversation on mount
  useEffect(() => {
    initializeConversation();
  }, [toolType]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await uploadDocument(file);
    if (result) {
      setUploadedDocument(result);
      toast.success('Document uploaded! You can now ask questions about it.');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveDocument = () => {
    setUploadedDocument(null);
    toast.info('Document removed');
  };

  const handleSendMessage = async () => {
    if (!message.trim() || sending) return;

    const messageContent = message.trim();
    setMessage('');

    await sendMessage(messageContent, uploadedDocument);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Message copied to clipboard');
  };

  const handleDownloadConversation = () => {
    const conversationText = messages.map(m => 
      `${m.role.toUpperCase()}: ${m.content}\n\n`
    ).join('');

    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}-conversation-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Conversation downloaded');
  };

  const handleMicClick = () => {
    toast.info('Voice input feature coming soon');
  };

  const handleClearConversation = async () => {
    if (confirm('Are you sure you want to clear this conversation?')) {
      await clearConversation();
      setUploadedDocument(null);
      await initializeConversation();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Bot className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={handleClearConversation}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Chat
            </Button>
            
            <Button onClick={handleDownloadConversation} className="cursor-pointer pointer-events-auto">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Panel - Search & Upload */}
        <div className="w-80 bg-card border-r border-border p-6">
          <div className="space-y-6">
            {/* Case Info if available */}
            {caseData && (
              <Card className="p-4 bg-primary/5 border-primary/20">
                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-sm text-foreground">Case Context</p>
                    <p className="text-xs text-muted-foreground mt-1">{caseData.title}</p>
                    <p className="text-xs text-muted-foreground">{caseData.case_number}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Document Upload Section */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt"
              />
              
              {uploadedDocument ? (
                <Card className="p-4 border-primary bg-primary/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">
                          {uploadedDocument.filename}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {uploadedDocument.file_size}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveDocument}
                      className="text-primary hover:text-primary/80 h-8 w-8 p-0 flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ) : (
                <Button
                  variant="outline"
                  className="w-full h-12 border-2 border-dashed border-primary/30 text-primary hover:bg-primary/5 cursor-pointer pointer-events-auto"
                  onClick={handleUploadClick}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading... {uploadProgress}%
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="text-xs text-muted-foreground space-y-2">
              <p>• Supported formats: PDF, DOC, DOCX, TXT</p>
              <p>• Max file size: 20MB</p>
              <p>• Documents are analyzed using AI</p>
            </div>
          </div>
        </div>

        {/* Right Panel - Chat Interface */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-card p-6 border-b border-border">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
              <p className="text-muted-foreground mb-4">{description}</p>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="max-w-4xl mx-auto space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={msg.id || idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    
                    <div className={`flex-1 max-w-3xl ${msg.role === 'user' ? 'flex justify-end' : ''}`}>
                      <Card className={`p-4 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm whitespace-pre-wrap flex-1">{msg.content}</p>
                          {msg.role === 'assistant' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleCopyMessage(msg.content)}
                              className="h-8 w-8 p-0 flex-shrink-0 cursor-pointer pointer-events-auto"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </Card>
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))
              )}
              
              {sending && (
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <Card className="p-4 bg-card">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">AI is thinking...</span>
                    </div>
                  </Card>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message Input */}
          <div className="bg-card border-t border-border p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={sending}
                    className="pr-20"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleMicClick}
                      className="cursor-pointer pointer-events-auto"
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button 
                  onClick={handleSendMessage}
                  disabled={sending || !message.trim()}
                  className="cursor-pointer pointer-events-auto"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
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