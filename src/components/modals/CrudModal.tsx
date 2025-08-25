
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import CaseSelector from '@/components/CaseSelector';

interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'number' | 'email' | 'tel' | 'case_select';
  options?: string[] | { label: string; value: any }[];
  required?: boolean;
  readonly?: boolean;
}

interface CrudModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  data?: any;
  fields: FieldConfig[];
  title: string;
  mode: 'add' | 'edit' | 'view';
}

const CrudModal = ({ isOpen, onClose, onSave, data, fields, title, mode }: CrudModalProps) => {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (isOpen) {
      if (data && Object.keys(data).length > 0) {
        setFormData({ ...data });
      } else {
        const initialData: any = {};
        fields.forEach(field => {
          initialData[field.key] = '';
        });
        setFormData(initialData);
      }
    }
  }, [isOpen, data]);

  const handleSave = () => {
    // Validate required fields
    const missingFields = fields
      .filter(field => field.required && (!formData[field.key] || formData[field.key].toString().trim() === ''))
      .map(field => field.label);

    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return;
    }

    onSave(formData);
    onClose();
  };

  const handleDateSelect = (key: string, date: Date | undefined) => {
    if (date) {
      // Ensure consistent date formatting for storage
      const formattedDate = format(date, 'yyyy-MM-dd');
      setFormData(prev => ({ ...prev, [key]: formattedDate }));
    } else {
      // Handle clearing the date
      setFormData(prev => ({ ...prev, [key]: '' }));
    }
  };

  const renderField = (field: FieldConfig) => {
    const isReadonly = mode === 'view' || field.readonly;
    
    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            value={formData[field.key] || ''}
            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
            readOnly={isReadonly}
            className={isReadonly ? 'bg-gray-100' : ''}
          />
        );
        
      case 'select':
        return (
          <Select
            value={formData[field.key] || ''}
            onValueChange={(value) => setFormData({ ...formData, [field.key]: value })}
            disabled={isReadonly}
          >
            <SelectTrigger className={isReadonly ? 'bg-gray-100' : ''}>
              <SelectValue placeholder={`Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
                  {field.options?.map((option) => {
                    const optionValue = typeof option === 'string' ? option : String(option.value);
                    const optionLabel = typeof option === 'string' ? option : option.label;
                    return (
                      <SelectItem key={optionValue} value={optionValue}>
                        {optionLabel}
                      </SelectItem>
                    );
                  })}
            </SelectContent>
          </Select>
        );
        
      case 'date':
        const isValidDate = formData[field.key] && !isNaN(new Date(formData[field.key]).getTime());
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData[field.key] && "text-muted-foreground",
                  isReadonly && "bg-gray-100"
                )}
                disabled={isReadonly}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {isValidDate ? format(new Date(formData[field.key]), "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={isValidDate ? new Date(formData[field.key]) : undefined}
                onSelect={(date) => handleDateSelect(field.key, date)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        );

      case 'case_select':
        return (
          <CaseSelector
            value={formData[field.key] || ''}
            onValueChange={(value) => setFormData(prev => ({ ...prev, [field.key]: value }))}
            placeholder={`Select ${field.label}`}
            disabled={isReadonly}
            required={field.required}
            className={isReadonly ? 'bg-gray-100' : ''}
          />
        );
        
      default:
        return (
          <Input
            type={field.type}
            value={formData[field.key] || ''}
            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
            readOnly={isReadonly}
            className={isReadonly ? 'bg-gray-100' : ''}
          />
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? `Add New ${title}` : mode === 'edit' ? `Edit ${title}` : `View ${title}`}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              {renderField(field)}
            </div>
          ))}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {mode !== 'view' && (
            <Button onClick={handleSave} className="legal-gradient">
              {mode === 'add' ? 'Add' : 'Save Changes'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CrudModal;
