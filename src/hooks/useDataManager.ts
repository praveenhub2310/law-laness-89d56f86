
import { useState, useMemo } from 'react';
import { toast } from '@/hooks/use-toast';

export interface DataManagerConfig<T> {
  initialData: T[];
  entityName: string;
}

export const useDataManager = <T extends { id: string }>({ initialData, entityName }: DataManagerConfig<T>) => {
  const [data, setData] = useState<T[]>(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  
  const itemsPerPage = 10;

  console.log('useDataManager hook - data state:', data);
  console.log('useDataManager hook - initialData:', initialData);

  const filteredData = useMemo(() => {
    let filtered = data.filter(item =>
      Object.values(item).some(value =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    // Apply additional filters
    Object.entries(selectedFilters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(item => 
          (item as any)[key]?.toString().toLowerCase().includes(value.toLowerCase())
        );
      }
    });

    console.log('useDataManager - filtered data:', filtered);
    return filtered;
  }, [data, searchTerm, selectedFilters]);

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aVal = (a as any)[sortKey];
      const bVal = (b as any)[sortKey];
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortOrder]);

  // Return ALL data instead of paginated data for the DataTable to handle pagination
  const addItem = (newItem: Omit<T, 'id'>) => {
    const item = {
      ...newItem,
      id: `${entityName.toUpperCase().replace(/\s+/g, '-')}-${Date.now()}`
    } as T;
    
    setData(prev => [item, ...prev]);
    toast({
      title: "Success",
      description: `${entityName} added successfully.`,
    });
  };

  const updateItem = (id: string, updates: Partial<T>) => {
    setData(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
    toast({
      title: "Success",
      description: `${entityName} updated successfully.`,
    });
  };

  const deleteItem = (id: string) => {
    setData(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Success",
      description: `${entityName} deleted successfully.`,
    });
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const exportData = () => {
    const csvContent = convertToCSV(sortedData);
    downloadCSV(csvContent, `${entityName}_export.csv`);
    toast({
      title: "Success",
      description: `${entityName} data exported successfully.`,
    });
  };

  console.log('useDataManager - returning data:', sortedData);

  return {
    data: sortedData, // Return all data, let DataTable handle pagination
    totalItems: sortedData.length,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages: Math.ceil(sortedData.length / itemsPerPage),
    sortKey,
    sortOrder,
    selectedFilters,
    setSelectedFilters,
    addItem,
    updateItem,
    deleteItem,
    handleSort,
    exportData
  };
};

const convertToCSV = (data: any[]): string => {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
    });
    csvRows.push(values.join(','));
  });
  
  return csvRows.join('\n');
};

const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
