import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Download, Plus, Edit, Trash2, Eye, ChevronDown, FileText, Zap } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import CrudModal from '@/components/modals/CrudModal';
import ConfirmModal from '@/components/modals/ConfirmModal';
import AiToolSelectionModal from '@/components/modals/AiToolSelectionModal';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  filterOptions?: string[];
  render?: (value: any, row: any) => React.ReactNode;
  className?: string;
}

interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'number' | 'email' | 'tel';
  options?: string[];
  required?: boolean;
  readonly?: boolean;
}

interface DataTableProps {
  title: string;
  columns: Column[];
  data: any[];
  fields?: FieldConfig[];
  searchPlaceholder?: string;
  onAdd?: (item: any) => void;
  onEdit?: (id: string, item: any) => void;
  onDelete?: (id: string) => void;
  onView?: (item: any) => void;
  onExport?: () => void;
  onPreview?: (item: any) => void;
  onDownload?: (item: any) => void;
  onAiTools?: (item: any, toolName: string) => void;
  entityName?: string;
  showPreviewAction?: boolean;
  showAiToolsAction?: boolean;
  className?: string;
}

const DataTable = ({ 
  title, 
  columns, 
  data, 
  fields = [],
  searchPlaceholder = "Search...",
  onAdd,
  onEdit,
  onDelete,
  onView,
  onExport,
  onPreview,
  onDownload,
  onAiTools,
  entityName = 'Item',
  showPreviewAction = false,
  showAiToolsAction = false,
  className
}: DataTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal states
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit' | 'view';
    data?: any;
  }>({ isOpen: false, mode: 'add' });
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    itemId?: string;
    itemName?: string;
  }>({ isOpen: false });

  const [aiToolModal, setAiToolModal] = useState<{
    isOpen: boolean;
    selectedItem?: any;
  }>({ isOpen: false });

  const itemsPerPage = 10;

  // Filter and sort data
  const processedData = React.useMemo(() => {
    let filtered = data.filter(item =>
      Object.values(item).some(value =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    // Apply column filters
    Object.entries(columnFilters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        filtered = filtered.filter(item => 
          item[key]?.toString().toLowerCase().includes(value.toLowerCase())
        );
      }
    });

    // Sort data
    if (sortKey) {
      filtered.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, columnFilters, sortKey, sortOrder]);

  const paginatedData = processedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(processedData.length / itemsPerPage);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleAdd = () => {
    setModalState({ isOpen: true, mode: 'add' });
  };

  const handleEdit = (item: any) => {
    setModalState({ isOpen: true, mode: 'edit', data: item });
  };

  const handleView = (item: any) => {
    if (onView) {
      onView(item);
    } else {
      setModalState({ isOpen: true, mode: 'view', data: item });
    }
  };

  const handleDeleteClick = (item: any) => {
    setConfirmModal({ 
      isOpen: true, 
      itemId: item.id, 
      itemName: item.name || item.title || item.id 
    });
  };

  const handleConfirmDelete = () => {
    if (confirmModal.itemId && onDelete) {
      onDelete(confirmModal.itemId);
    }
    setConfirmModal({ isOpen: false });
  };

  const handleSave = (formData: any) => {
    if (modalState.mode === 'add' && onAdd) {
      onAdd(formData);
    } else if (modalState.mode === 'edit' && onEdit && modalState.data) {
      onEdit(modalState.data.id, formData);
    }
    setModalState({ isOpen: false, mode: 'add' });
  };

  const handleExport = () => {
    if (onExport) {
      onExport();
    }
  };

  const handlePreview = (item: any) => {
    if (onPreview) {
      onPreview(item);
    }
  };

  const handleDownload = (item: any) => {
    if (onDownload) {
      onDownload(item);
    }
  };

  const handleAiToolsClick = (item: any) => {
    setAiToolModal({ isOpen: true, selectedItem: item });
  };

  const handleAiToolSelect = (toolName: string) => {
    if (aiToolModal.selectedItem && onAiTools) {
      onAiTools(aiToolModal.selectedItem, toolName);
    }
    setAiToolModal({ isOpen: false });
  };

  const renderFilterPopover = () => (
    <Popover open={showFilters} onOpenChange={setShowFilters}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filters
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 bg-white border border-gray-200 shadow-xl z-[9999] p-4"
        side="bottom"
        align="end"
        sideOffset={5}
      >
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Filter Options</h4>
          {columns.filter(col => col.filterable).map((column) => (
            <div key={column.key} className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{column.label}</label>
              {column.filterOptions ? (
                <Select
                  value={columnFilters[column.key] || 'all'}
                  onValueChange={(value) => 
                    setColumnFilters(prev => ({ ...prev, [column.key]: value === 'all' ? '' : value }))
                  }
                >
                  <SelectTrigger className="bg-white border border-gray-300">
                    <SelectValue placeholder={`Filter by ${column.label}`} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-xl z-[10000] max-h-60 overflow-y-auto">
                    <SelectItem value="all">All</SelectItem>
                    {column.filterOptions.map((option) => (
                      <SelectItem key={option} value={option} className="cursor-pointer hover:bg-gray-50">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  placeholder={`Filter by ${column.label}`}
                  value={columnFilters[column.key] || ''}
                  onChange={(e) => 
                    setColumnFilters(prev => ({ ...prev, [column.key]: e.target.value }))
                  }
                  className="bg-white border border-gray-300"
                />
              )}
            </div>
          ))}
          <div className="flex space-x-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setColumnFilters({})}
              className="flex-1"
            >
              Clear All
            </Button>
            <Button 
              size="sm" 
              onClick={() => setShowFilters(false)}
              className="legal-gradient flex-1"
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">{title}</CardTitle>
            <div className="flex items-center space-x-2">
              {renderFilterPopover()}
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              {onAdd && (
                <Button onClick={handleAdd} size="sm" className="legal-gradient">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Badge variant="secondary">
              {processedData.length} results
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column) => (
                    <th 
                      key={column.key}
                      className={`px-4 py-3 text-left text-sm font-medium text-gray-900 ${
                        column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                      } ${column.className || ''}`}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{column.label}</span>
                        {column.sortable && sortKey === column.key && (
                          <span className="text-blue-600">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-gray-50 transition-colors">
                    {columns.map((column) => (
                      <td key={column.key} className={`px-4 py-3 text-sm text-gray-900 ${column.className || ''}`}>
                        {column.render ? column.render(item[column.key], item) : item[column.key]}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {showAiToolsAction && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleAiToolsClick(item)}
                            title="AI Tools"
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                          >
                            <Zap className="h-4 w-4" />
                          </Button>
                        )}
                        {showPreviewAction && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handlePreview(item)}
                            title="Preview & Download"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleView(item)}
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {onEdit && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEdit(item)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteClick(item)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-700">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, processedData.length)} of{' '}
                {processedData.length} results
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CRUD Modal */}
      <CrudModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, mode: 'add' })}
        onSave={handleSave}
        data={modalState.data}
        fields={fields}
        title={entityName}
        mode={modalState.mode}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false })}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        description={`Are you sure you want to delete "${confirmModal.itemName}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
      />

      {/* AI Tool Selection Modal */}
      <AiToolSelectionModal
        isOpen={aiToolModal.isOpen}
        onClose={() => setAiToolModal({ isOpen: false })}
        onSelect={handleAiToolSelect}
        itemName={aiToolModal.selectedItem?.title || aiToolModal.selectedItem?.filename || aiToolModal.selectedItem?.id}
      />
    </>
  );
};

export default DataTable;
