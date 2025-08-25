import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Plus, Eye, Upload, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import TemplatePreviewModal from '@/components/TemplatePreviewModal';
import UploadTemplateDialog from '@/components/UploadTemplateDialog';

interface Template {
  id: string;
  title: string;
  category: string;
  language?: string;
  file_url: string;
  source_url?: string;
  storage_path?: string;
  mime_type?: string;
  size_bytes?: number;
  sha256_hash?: string;
  preview_type: 'pdf' | 'docx';
  description?: string;
  file_size?: number;
  download_count: number;
  synced_at?: string;
  version?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SyncStatus {
  id: string;
  sync_type: string;
  started_at: string;
  completed_at?: string;
  status: string;
  total_found: number;
  total_inserted: number;
  total_updated: number;
  total_skipped: number;
  total_errors: number;
  error_details: any; // Changed from string[] to any to match Supabase Json type
}

const Templates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [isPopulating, setIsPopulating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [lastSync, setLastSync] = useState<SyncStatus | null>(null);

  const categories = [
    'all', 
    'Draft Document Models', 
    'Miscellaneous', 
    'Hindu Marriage', 
    'Separate Special Marriage', 
    'Tamil Nadu Marriage Registration Act 2009',
    'Kural Marriage',
    'Association Registration',
    'Joint Company'
  ];

  useEffect(() => {
    fetchTemplates();
    fetchLastSync();
  }, []);

  const fetchLastSync = async () => {
    try {
      const { data, error } = await supabase
        .from('sync_status')
        .select('*')
        .eq('sync_type', 'tnreginet_templates')
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setLastSync(data);
      }
    } catch (error) {
      console.error('Error fetching sync status:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates((data || []) as Template[]);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const populateTemplates = async () => {
    try {
      setIsPopulating(true);
      toast.info('Syncing templates from TN Reginet portal...');

      const { data, error } = await supabase.functions.invoke('scrape-templates');

      if (error) throw error;

      if (data.success) {
        toast.success(`${data.message}. Found: ${data.totalFound}, Processed: ${data.totalInserted}`);
        fetchTemplates();
        fetchLastSync();
      } else {
        toast.error(data.message || 'Failed to sync templates');
      }
    } catch (error) {
      console.error('Error syncing templates:', error);
      toast.error('Failed to sync templates');
    } finally {
      setIsPopulating(false);
    }
  };

  const handleDownload = async (template: Template) => {
    try {
      // Update download count
      await supabase
        .from('templates')
        .update({ download_count: template.download_count + 1 })
        .eq('id', template.id);

      // Download file
      const response = await fetch(template.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.title}.${template.preview_type}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Template downloaded successfully');
      fetchTemplates(); // Refresh to show updated download count
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download template');
    }
  };

  const handleUploadTemplate = async (formData: {
    title: string;
    category: string;
    description: string;
    file: File;
  }) => {
    try {
      setIsUploading(true);
      toast.info('Uploading template...');

      const { title, category, description, file } = formData;
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only PDF and DOCX files are allowed');
      }

      // Generate unique filename
      const fileExtension = file.type === 'application/pdf' ? 'pdf' : 'docx';
      const fileName = `${Date.now()}-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${fileExtension}`;

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('templates')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('templates')
        .getPublicUrl(fileName);

      // Insert template record
      const { error: insertError } = await supabase
        .from('templates')
        .insert({
          title,
          category,
          description,
          file_url: publicUrl,
          preview_type: fileExtension as 'pdf' | 'docx',
          file_size: file.size,
          is_active: true,
          download_count: 0
        });

      if (insertError) throw insertError;

      toast.success('Template uploaded successfully');
      setShowUploadDialog(false);
      fetchTemplates(); // Refresh templates list
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload template');
    } finally {
      setIsUploading(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesLanguage = selectedLanguage === 'all' || template.language === selectedLanguage || (!template.language && selectedLanguage === 'en');
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesLanguage && matchesSearch;
  });

  const groupedTemplates = categories.reduce((acc, category) => {
    if (category === 'all') return acc;
    acc[category] = filteredTemplates.filter(template => template.category === category);
    return acc;
  }, {} as Record<string, Template[]>);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Document Templates</h1>
        </div>
        <div className="flex items-center gap-2">
          {templates.length === 0 && !loading && (
            <Button 
              onClick={populateTemplates}
              disabled={isPopulating}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isPopulating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Populate Templates
            </Button>
          )}
          <Button 
            onClick={() => setShowUploadDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Upload Template
          </Button>
        </div>
      </div>

      {/* Sync Status Panel */}
      {lastSync && (
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="font-semibold">Last Sync Status</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(lastSync.started_at).toLocaleString()}
                  </p>
                </div>
                <Badge variant={lastSync.status === 'completed' ? 'default' : 'secondary'}>
                  {lastSync.status.replace('_', ' ')}
                </Badge>
              </div>
              <div className="text-right text-sm">
                <p>Found: {lastSync.total_found} | Processed: {lastSync.total_inserted}</p>
                {lastSync.total_errors > 0 && (
                  <p className="text-destructive">Errors: {lastSync.total_errors}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="sm:w-48">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="sm:w-32">
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger>
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ta">Tamil</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Templates Found</h3>
            <p className="text-muted-foreground mb-4">
              The template database is empty. You can manually upload templates using the "Upload Template" button above, or use "Populate Templates" to fetch from online sources.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => setShowUploadDialog(true)} variant="default">
                <Plus className="h-4 w-4 mr-2" />
                Upload Template
              </Button>
              <Button onClick={populateTemplates} disabled={isPopulating} variant="outline">
                {isPopulating ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Populate Templates
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : selectedCategory === 'all' ? (
        /* Show all templates grouped by category */
        <div className="grid gap-6">
          {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => 
            categoryTemplates.length > 0 && (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center justify-between">
                    {category}
                    <Badge variant="secondary">{categoryTemplates.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryTemplates.map((template) => (
                      <div key={template.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <FileText className={`h-5 w-5 ${template.preview_type === 'pdf' ? 'text-red-600' : 'text-blue-600'}`} />
                            <h3 className="font-semibold text-sm">{template.title}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            {template.language && (
                              <Badge variant="secondary" className="text-xs">
                                {template.language.toUpperCase()}
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {template.preview_type.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        {template.description && (
                          <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                        )}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-muted-foreground">
                              {template.download_count} downloads
                            </span>
                            {template.synced_at && (
                              <span className="text-xs text-muted-foreground">
                                Synced: {new Date(template.synced_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          {(template.size_bytes || template.file_size) && (
                            <span className="text-xs text-muted-foreground">
                              {((template.size_bytes || template.file_size || 0) / 1024).toFixed(1)} KB
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex items-center gap-1 flex-1"
                            onClick={() => setPreviewTemplate(template)}
                          >
                            <Eye className="h-3 w-3" />
                            Preview
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex items-center gap-1"
                            onClick={() => handleDownload(template)}
                          >
                            <Download className="h-3 w-3" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      ) : (
        /* Show filtered templates */
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center justify-between">
              {selectedCategory}
              <Badge variant="secondary">{filteredTemplates.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Templates in {selectedCategory}</h3>
                <p className="text-muted-foreground mb-4">
                  This category is empty. Upload templates using the "Upload Template" button above.
                </p>
                <Button onClick={() => setShowUploadDialog(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Template
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className={`h-5 w-5 ${template.preview_type === 'pdf' ? 'text-red-600' : 'text-blue-600'}`} />
                        <h3 className="font-semibold text-sm">{template.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {template.language && (
                          <Badge variant="secondary" className="text-xs">
                            {template.language.toUpperCase()}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {template.preview_type.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    {template.description && (
                      <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                    )}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground">
                          {template.download_count} downloads
                        </span>
                        {template.synced_at && (
                          <span className="text-xs text-muted-foreground">
                            Synced: {new Date(template.synced_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {(template.size_bytes || template.file_size) && (
                        <span className="text-xs text-muted-foreground">
                          {((template.size_bytes || template.file_size || 0) / 1024).toFixed(1)} KB
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex items-center gap-1 flex-1"
                        onClick={() => setPreviewTemplate(template)}
                      >
                        <Eye className="h-3 w-3" />
                        Preview
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex items-center gap-1"
                        onClick={() => handleDownload(template)}
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <TemplatePreviewModal
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        template={previewTemplate}
      />

      {/* Upload Template Dialog */}
      {showUploadDialog && (
        <UploadTemplateDialog
          isOpen={showUploadDialog}
          onClose={() => setShowUploadDialog(false)}
          onUpload={handleUploadTemplate}
          isUploading={isUploading}
          categories={categories.filter(cat => cat !== 'all')}
        />
      )}
    </div>
  );
};

export default Templates;