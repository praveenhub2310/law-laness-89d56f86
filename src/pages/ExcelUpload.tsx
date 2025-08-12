import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle, Download } from 'lucide-react';

const ExcelUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState([
    {
      id: 1,
      name: 'case_data_Q1_2024.xlsx',
      uploadDate: '2024-01-10',
      size: '2.3 MB',
      status: 'processed',
      records: 156,
      errors: 0
    },
    {
      id: 2,
      name: 'client_contacts.xlsx',
      uploadDate: '2024-01-08',
      size: '1.8 MB',
      status: 'processing',
      records: 89,
      errors: 3
    }
  ]);

  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    files.forEach(file => {
      if (file.type.includes('spreadsheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const newFile = {
          id: Date.now(),
          name: file.name,
          uploadDate: new Date().toISOString().split('T')[0],
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          status: 'processing' as const,
          records: 0,
          errors: 0
        };
        
        setUploadedFiles(prev => [newFile, ...prev]);
        
        // Simulate processing
        setTimeout(() => {
          setUploadedFiles(prev => prev.map(f => 
            f.id === newFile.id 
              ? { ...f, status: 'processed' as const, records: Math.floor(Math.random() * 200) + 50 }
              : f
          ));
        }, 3000);
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return 'default';
      case 'processing': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Excel File Upload</h1>
        <p className="text-muted-foreground mt-2">Upload and process Excel files for case data</p>
      </div>

      {/* Upload Area */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Excel Files</CardTitle>
          <CardDescription>Drag and drop Excel files or click to browse</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Drop Excel files here</h3>
            <p className="text-muted-foreground mb-4">
              Supports .xlsx and .xls files up to 10MB
            </p>
            <Button>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Browse Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Processing Guidelines */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Supported Formats</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Excel 2007+ (.xlsx)</li>
                <li>• Excel 97-2003 (.xls)</li>
                <li>• Maximum file size: 10MB</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Required Columns</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Case Number (required)</li>
                <li>• Client Name (required)</li>
                <li>• Case Type</li>
                <li>• Status</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Files</CardTitle>
          <CardDescription>Recently processed Excel files</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <FileSpreadsheet className="h-8 w-8 text-green-600" />
                  <div>
                    <h4 className="font-medium">{file.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {file.uploadDate} • {file.size} • {file.records} records
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge variant={getStatusColor(file.status)}>
                    {file.status === 'processed' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {file.status === 'processing' && <div className="animate-spin h-3 w-3 mr-1 border-2 border-current border-t-transparent rounded-full" />}
                    {file.status === 'error' && <AlertTriangle className="h-3 w-3 mr-1" />}
                    {file.status}
                  </Badge>
                  
                  {file.status === 'processed' && (
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExcelUpload;