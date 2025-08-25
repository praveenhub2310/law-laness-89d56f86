import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, FileText } from 'lucide-react';

interface Case {
  id: string;
  case_number: string;
  title: string;
  status: string;
  client_id?: string;
  lawyer_id?: string;
}

interface CaseSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  showStatus?: boolean;
  filterByUser?: boolean;
}

const CaseSelector: React.FC<CaseSelectorProps> = ({
  value,
  onValueChange,
  placeholder = "Select a case",
  disabled = false,
  required = false,
  className = "",
  showStatus = true,
  filterByUser = true
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch cases with real-time updates
  const {
    data: cases,
    loading,
    error
  } = useSupabaseData<Case>({
    table: 'projects',
    select: 'id, case_number, title, status, client_id, lawyer_id',
    filters: filterByUser && user ? (
      user.role === 'client' 
        ? { client_id: user.id }
        : user.role === 'advocate'
        ? { lawyer_id: user.id }
        : {}
    ) : {},
    orderBy: { column: 'created_at', ascending: false },
    realtime: true
  });

  // Filter cases based on search term
  const filteredCases = cases.filter(case_ =>
    case_.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    case_.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'closed': 'bg-gray-100 text-gray-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'draft': 'bg-blue-100 text-blue-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const selectedCase = cases.find(case_ => case_.id === value);

  if (error) {
    return (
      <Select disabled>
        <SelectTrigger className={`bg-red-50 border-red-200 ${className}`}>
          <SelectValue placeholder="Error loading cases" />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled || loading} required={required}>
      <SelectTrigger className={`bg-white border border-gray-300 ${className}`}>
        <div className="flex items-center gap-2 w-full">
          <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading cases...</span>
              </div>
            ) : selectedCase ? (
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium truncate">{selectedCase.case_number}</span>
                {showStatus && (
                  <Badge className={`text-xs ${getStatusColor(selectedCase.status)}`}>
                    {selectedCase.status}
                  </Badge>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
        </div>
      </SelectTrigger>
      <SelectContent className="bg-white border border-gray-200 shadow-xl z-[9999] max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span>Loading cases...</span>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No cases available</p>
            {filterByUser && (
              <p className="text-xs mt-1">
                {user?.role === 'client' ? 'No cases assigned to you' : 'No cases found'}
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Search input */}
            <div className="p-2 border-b">
              <input
                type="text"
                placeholder="Search cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {filteredCases.map((case_) => (
              <SelectItem
                key={case_.id}
                value={case_.id}
                className="cursor-pointer hover:bg-gray-50 p-3"
              >
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{case_.case_number}</span>
                    {showStatus && (
                      <Badge className={`text-xs ${getStatusColor(case_.status)}`}>
                        {case_.status}
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-gray-600 truncate">{case_.title}</span>
                </div>
              </SelectItem>
            ))}
          </>
        )}
      </SelectContent>
    </Select>
  );
};

export default CaseSelector;