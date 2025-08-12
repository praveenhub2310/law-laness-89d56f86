import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Languages, Upload, Download, Copy, FileText, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const DocumentTranslation = () => {
  const [sourceLanguage, setSourceLanguage] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'bn', name: 'Bengali' },
    { code: 'te', name: 'Telugu' },
    { code: 'mr', name: 'Marathi' },
    { code: 'ta', name: 'Tamil' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'pa', name: 'Punjabi' },
    { code: 'or', name: 'Odia' },
    { code: 'as', name: 'Assamese' },
    { code: 'ur', name: 'Urdu' }
  ];

  const sampleTranslations = {
    'en-hi': {
      'contract': 'अनुबंध',
      'agreement': 'समझौता', 
      'plaintiff': 'वादी',
      'defendant': 'प्रतिवादी',
      'court': 'न्यायालय',
      'evidence': 'साक्ष्य',
      'witness': 'गवाह',
      'judgment': 'निर्णय'
    },
    'hi-en': {
      'अनुबंध': 'contract',
      'समझौता': 'agreement',
      'वादी': 'plaintiff', 
      'प्रतिवादी': 'defendant',
      'न्यायालय': 'court',
      'साक्ष्य': 'evidence',
      'गवाह': 'witness',
      'निर्णय': 'judgment'
    }
  };

  const translateText = (text, fromLang, toLang) => {
    // Mock translation logic
    const langPair = `${fromLang}-${toLang}`;
    const translations = sampleTranslations[langPair] || {};
    
    let translated = text;
    Object.entries(translations).forEach(([source, target]) => {
      const regex = new RegExp(`\\b${source}\\b`, 'gi');
      translated = translated.replace(regex, target);
    });
    
    // If no specific translations found, return a mock translation
    if (translated === text) {
      if (toLang === 'hi') {
        translated = text + " (हिंदी अनुवाद)";
      } else if (toLang === 'en') {
        translated = text + " (English Translation)";
      } else {
        translated = text + ` (${languages.find(l => l.code === toLang)?.name} Translation)`;
      }
    }
    
    return translated;
  };

  const handleTranslate = async () => {
    if (!sourceLanguage || !targetLanguage || !sourceText.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select languages and enter text to translate",
        variant: "destructive",
      });
      return;
    }

    if (sourceLanguage === targetLanguage) {
      toast({
        title: "Invalid Selection",
        description: "Source and target languages cannot be the same",
        variant: "destructive",
      });
      return;
    }

    setIsTranslating(true);
    
    // Simulate translation API call
    setTimeout(() => {
      const translated = translateText(sourceText, sourceLanguage, targetLanguage);
      setTranslatedText(translated);
      setIsTranslating(false);
      
      toast({
        title: "Translation Complete",
        description: `Text translated from ${languages.find(l => l.code === sourceLanguage)?.name} to ${languages.find(l => l.code === targetLanguage)?.name}`,
      });
    }, 2000);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'text/plain' || file.type === 'application/pdf') {
        setUploadedFile(file);
        
        // For demo purposes, read text file content
        if (file.type === 'text/plain') {
          const reader = new FileReader();
          reader.onload = (e) => {
            setSourceText(e.target?.result as string || '');
          };
          reader.readAsText(file);
        }
        
        toast({
          title: "File Uploaded",
          description: `${file.name} has been uploaded successfully`,
        });
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload only text (.txt) or PDF files",
          variant: "destructive",
        });
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    toast({
      title: "Copied to Clipboard",
      description: "Translation has been copied to clipboard",
    });
  };

  const handleDownload = () => {
    const content = `Original Text (${languages.find(l => l.code === sourceLanguage)?.name}):\n${sourceText}\n\nTranslated Text (${languages.find(l => l.code === targetLanguage)?.name}):\n${translatedText}`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `translation_${sourceLanguage}_to_${targetLanguage}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Download Successful",
      description: "Translation has been downloaded as text file",
    });
  };

  const swapLanguages = () => {
    const tempLang = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(tempLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Languages className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Document Translation Tool</h1>
          <p className="text-muted-foreground">Translate legal documents between multiple Indian languages</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Translation Configuration
          </CardTitle>
          <CardDescription>
            Select source and target languages for translation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Source Language
              </label>
              <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end justify-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={swapLanguages}
                disabled={!sourceLanguage || !targetLanguage}
              >
                <Languages className="h-4 w-4" />
              </Button>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Target Language
              </label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Upload Document (Optional)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept=".txt,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
              </label>
              {uploadedFile && (
                <Badge variant="secondary">
                  {uploadedFile.name}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              Source Text
              {sourceLanguage && (
                <Badge variant="outline" className="ml-2">
                  {languages.find(l => l.code === sourceLanguage)?.name}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter text to translate or upload a document..."
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              rows={12}
              className="resize-none"
            />
            <Button 
              onClick={handleTranslate} 
              disabled={isTranslating} 
              className="w-full mt-4"
            >
              {isTranslating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <Languages className="mr-2 h-4 w-4" />
                  Translate
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Translated Text
              {targetLanguage && (
                <Badge variant="outline" className="ml-2">
                  {languages.find(l => l.code === targetLanguage)?.name}
                </Badge>
              )}
            </CardTitle>
            {translatedText && (
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
            {translatedText ? (
              <div className="bg-muted/30 rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-sm max-h-72 overflow-y-auto">
                  {translatedText}
                </pre>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Languages className="mx-auto h-12 w-12 opacity-30" />
                <p className="mt-4">Translation will appear here</p>
                <p className="text-sm">Enter source text and click Translate</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Common Legal Terms Translation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(sampleTranslations['en-hi'] || {}).map(([english, hindi]) => (
              <div key={english} className="p-3 bg-muted/30 rounded-lg">
                <div className="font-medium text-sm">{english}</div>
                <div className="text-sm text-muted-foreground">{hindi}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentTranslation;