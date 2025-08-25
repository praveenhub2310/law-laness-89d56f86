import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface CaseNumberInputProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  label?: string;
}

const CASE_ABBREVIATIONS = [
  { value: 'CR', label: 'CR - Criminal Case', description: 'Criminal proceedings' },
  { value: 'WP', label: 'WP - Writ Petition', description: 'Constitutional matters' },
  { value: 'CP', label: 'CP - Civil Petition', description: 'Civil matters' },
  { value: 'CRL', label: 'CRL - Criminal Misc.', description: 'Criminal miscellaneous' },
  { value: 'SA', label: 'SA - Second Appeal', description: 'Appellate matters' },
  { value: 'RA', label: 'RA - Regular Appeal', description: 'Regular appellate matters' },
  { value: 'RC', label: 'RC - Revision Case', description: 'Revision petitions' },
  { value: 'CC', label: 'CC - Company Case', description: 'Corporate matters' },
  { value: 'CS', label: 'CS - Civil Suit', description: 'Civil litigation' },
  { value: 'MA', label: 'MA - Misc. Application', description: 'Miscellaneous applications' },
  { value: 'PIL', label: 'PIL - Public Interest', description: 'Public interest litigation' },
  { value: 'FAO', label: 'FAO - First Appeal', description: 'First appellate matters' },
  { value: 'RFA', label: 'RFA - Regular First Appeal', description: 'Regular first appeals' },
  { value: 'CMP', label: 'CMP - Contempt Petition', description: 'Contempt proceedings' },
  { value: 'ARB', label: 'ARB - Arbitration', description: 'Arbitration matters' },
];

const CaseNumberInput: React.FC<CaseNumberInputProps> = ({
  value = '',
  onValueChange,
  placeholder = "Enter case number",
  disabled = false,
  required = false,
  className = "",
  label = "Case Number"
}) => {
  const [abbreviation, setAbbreviation] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());

  // Parse existing value on component mount or when value changes
  useEffect(() => {
    if (value && value !== `${abbreviation}/${caseNumber}/${year}`) {
      const parts = value.split('/');
      if (parts.length >= 2) {
        setAbbreviation(parts[0] || '');
        setCaseNumber(parts[1] || '');
        setYear(parts[2] || new Date().getFullYear().toString());
      }
    }
  }, [value]);

  // Update combined value when any part changes
  useEffect(() => {
    if (abbreviation && caseNumber) {
      const combinedValue = `${abbreviation}/${caseNumber}/${year}`;
      if (combinedValue !== value) {
        onValueChange(combinedValue);
      }
    } else {
      onValueChange('');
    }
  }, [abbreviation, caseNumber, year, onValueChange]);

  const handleAbbreviationChange = (newAbbreviation: string) => {
    setAbbreviation(newAbbreviation);
  };

  const handleCaseNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers
    setCaseNumber(newNumber);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newYear = e.target.value.replace(/[^0-9]/g, '').slice(0, 4); // Only numbers, max 4 digits
    setYear(newYear);
  };

  const selectedAbbreviation = CASE_ABBREVIATIONS.find(abbr => abbr.value === abbreviation);

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <Label className="text-sm font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Case Abbreviation Dropdown */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Case Type</Label>
          <Select
            value={abbreviation}
            onValueChange={handleAbbreviationChange}
            disabled={disabled}
            required={required}
          >
            <SelectTrigger className="bg-white border border-gray-300">
              <SelectValue placeholder="Select type">
                {selectedAbbreviation && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {selectedAbbreviation.value}
                    </Badge>
                    <span className="text-sm truncate">{selectedAbbreviation.label.split(' - ')[1]}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-xl z-[9999] max-h-80 overflow-y-auto">
              {CASE_ABBREVIATIONS.map((abbr) => (
                <SelectItem
                  key={abbr.value}
                  value={abbr.value}
                  className="cursor-pointer hover:bg-gray-50 p-3"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-mono">
                        {abbr.value}
                      </Badge>
                      <span className="font-medium">{abbr.label.split(' - ')[1]}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{abbr.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Case Number Input */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Case Number</Label>
          <Input
            type="text"
            value={caseNumber}
            onChange={handleCaseNumberChange}
            placeholder="0000"
            disabled={disabled || !abbreviation}
            required={required}
            className="bg-white border border-gray-300"
            maxLength={6}
          />
        </div>

        {/* Year Input */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Year</Label>
          <Input
            type="text"
            value={year}
            onChange={handleYearChange}
            placeholder="2024"
            disabled={disabled}
            required={required}
            className="bg-white border border-gray-300"
            maxLength={4}
          />
        </div>
      </div>

      {/* Preview of combined case number */}
      {abbreviation && caseNumber && (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
          <Badge variant="default" className="font-mono">
            Case Number Preview
          </Badge>
          <span className="font-mono text-sm font-semibold">
            {abbreviation}/{caseNumber}/{year}
          </span>
        </div>
      )}

      {/* Helper text */}
      <p className="text-xs text-muted-foreground">
        Select case type, enter number and year to create a complete case number (e.g., CR/123/2024)
      </p>
    </div>
  );
};

export default CaseNumberInput;