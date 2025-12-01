import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

const ExcelUpload = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    if (files.length === 0) return;
    
    files.forEach(file => {
      // Validate file type
      if (!file.type.includes('spreadsheet') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload Excel files (.xlsx or .xls) only.',
          variant: 'destructive'
        });
        return;
      }
      
      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast({
          title: 'File Too Large',
          description: 'File size must be less than 10MB.',
          variant: 'destructive'
        });
        return;
      }
      
      const newFile = {
        id: Date.now() + Math.random(), // Ensure unique ID
        name: file.name,
        uploadDate: new Date().toISOString().split('T')[0],
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        status: 'processing' as const,
        records: 0,
        errors: 0
      };
      
      setUploadedFiles(prev => [newFile, ...prev]);
      
      toast({
        title: 'Upload Started',
        description: `Processing ${file.name}...`
      });
      
      // Process Excel file
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          // Simulate processing delay
          setTimeout(() => {
            setUploadedFiles(prev => prev.map(f => 
              f.id === newFile.id 
                ? { 
                    ...f, 
                    status: 'processed' as const, 
                    records: jsonData.length,
                    errors: 0
                  }
                : f
            ));
            
            toast({
              title: 'Upload Successful',
              description: `Processed ${jsonData.length} records from ${file.name}.`
            });
          }, 2000);
        } catch (error) {
          console.error('Error processing Excel file:', error);
          setUploadedFiles(prev => prev.map(f => 
            f.id === newFile.id 
              ? { ...f, status: 'error' as const, errors: 1 }
              : f
          ));
          
          toast({
            title: 'Processing Failed',
            description: 'Failed to process Excel file. Please check the file format.',
            variant: 'destructive'
          });
        }
      };
      
      reader.onerror = () => {
        toast({
          title: 'Read Error',
          description: 'Failed to read the file.',
          variant: 'destructive'
        });
      };
      
      reader.readAsArrayBuffer(file);
    });
  };
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleDownloadReport = (file: typeof uploadedFiles[0]) => {
    // Create a sample report
    const reportData = [
      ['File Name', file.name],
      ['Upload Date', file.uploadDate],
      ['File Size', file.size],
      ['Total Records', file.records],
      ['Errors', file.errors],
      ['Status', file.status],
      [''],
      ['Sample Data Report'],
      ['Record #', 'Case Number', 'Client Name', 'Status'],
    ];
    
    // Add sample records
    for (let i = 1; i <= Math.min(file.records, 10); i++) {
      reportData.push([
        i.toString(),
        `CASE-${1000 + i}`,
        `Client ${i}`,
        'Active'
      ]);
    }
    
    // Create workbook and worksheet
    const ws = XLSX.utils.aoa_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    
    // Generate and download
    XLSX.writeFile(wb, `${file.name.replace(/\.[^/.]+$/, '')}_report.xlsx`);
    
    toast({
      title: 'Download Started',
      description: 'Report is being downloaded.'
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
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            multiple
            onChange={handleFileInputChange}
            className="hidden"
          />
          
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
            <Button 
              onClick={handleBrowseClick}
              className="pointer-events-auto cursor-pointer relative z-10"
            >
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
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadReport(file)}
                      className="pointer-events-auto cursor-pointer relative z-10"
                    >
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