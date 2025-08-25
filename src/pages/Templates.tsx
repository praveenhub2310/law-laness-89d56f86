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

interface Template {
  id: string;
  title: string;
  category: string;
  file_url: string;
  preview_type: 'pdf' | 'docx';
  description?: string;
  file_size?: number;
  download_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const Templates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [isPopulating, setIsPopulating] = useState(false);

  const categories = ['all', 'Legal Documents', 'Court Forms', 'Contract Templates', 'Marriage', 'Association', 'Miscellaneous'];

  useEffect(() => {
    fetchTemplates();
  }, []);

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
      toast.info('Populating templates from online sources...');

      const { data, error } = await supabase.functions.invoke('scrape-templates');

      if (error) throw error;

      toast.success(data.message);
      fetchTemplates(); // Refresh the templates list
    } catch (error) {
      console.error('Error populating templates:', error);
      toast.error('Failed to populate templates');
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

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
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
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Upload Template
          </Button>
        </div>
      </div>

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
        <div className="sm:w-64">
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
              Get started by populating templates from online sources or uploading your own.
            </p>
            <Button onClick={populateTemplates} disabled={isPopulating}>
              {isPopulating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Populate Templates
            </Button>
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
                          <Badge variant="outline" className="text-xs">
                            {template.preview_type.toUpperCase()}
                          </Badge>
                        </div>
                        {template.description && (
                          <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                        )}
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs text-muted-foreground">
                            {template.download_count} downloads
                          </span>
                          {template.file_size && (
                            <span className="text-xs text-muted-foreground">
                              {(template.file_size / 1024).toFixed(1)} KB
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
                <p className="text-muted-foreground">No templates found in this category.</p>
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
                      <Badge variant="outline" className="text-xs">
                        {template.preview_type.toUpperCase()}
                      </Badge>
                    </div>
                    {template.description && (
                      <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                    )}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-muted-foreground">
                        {template.download_count} downloads
                      </span>
                      {template.file_size && (
                        <span className="text-xs text-muted-foreground">
                          {(template.file_size / 1024).toFixed(1)} KB
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
    </div>
  );
};

export default Templates;