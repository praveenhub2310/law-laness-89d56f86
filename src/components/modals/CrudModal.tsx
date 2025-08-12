
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

interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'number' | 'email' | 'tel';
  options?: string[];
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
    if (data) {
      setFormData(data);
    } else {
      const initialData: any = {};
      fields.forEach(field => {
        initialData[field.key] = '';
      });
      setFormData(initialData);
    }
  }, [data, fields]);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleDateSelect = (key: string, date: Date | undefined) => {
    if (date) {
      setFormData({ ...formData, [key]: format(date, 'yyyy-MM-dd') });
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
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        
      case 'date':
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
                {formData[field.key] ? format(new Date(formData[field.key]), "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData[field.key] ? new Date(formData[field.key]) : undefined}
                onSelect={(date) => handleDateSelect(field.key, date)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
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
