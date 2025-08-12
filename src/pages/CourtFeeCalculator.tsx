import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calculator, IndianRupee, FileText, Download, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const CourtFeeCalculator = () => {
  const [caseType, setCaseType] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [claimAmount, setClaimAmount] = useState('');
  const [propertyValue, setPropertyValue] = useState('');
  const [calculatedFee, setCalculatedFee] = useState(null);

  const caseTypes = [
    { value: 'civil_suit', label: 'Civil Suit', needsAmount: true },
    { value: 'money_suit', label: 'Money Suit', needsAmount: true },
    { value: 'property_suit', label: 'Property Suit', needsAmount: true },
    { value: 'criminal_complaint', label: 'Criminal Complaint', needsAmount: false },
    { value: 'writ_petition', label: 'Writ Petition', needsAmount: false },
    { value: 'appeal', label: 'Appeal', needsAmount: true },
    { value: 'revision', label: 'Revision Petition', needsAmount: false },
    { value: 'execution', label: 'Execution Petition', needsAmount: true },
    { value: 'injunction', label: 'Injunction', needsAmount: false },
    { value: 'divorce', label: 'Divorce Petition', needsAmount: false }
  ];

  const jurisdictions = [
    { value: 'delhi', label: 'Delhi Courts', multiplier: 1.0 },
    { value: 'mumbai', label: 'Mumbai Courts', multiplier: 1.1 },
    { value: 'bangalore', label: 'Bangalore Courts', multiplier: 0.9 },
    { value: 'chennai', label: 'Chennai Courts', multiplier: 0.95 },
    { value: 'kolkata', label: 'Kolkata Courts', multiplier: 0.85 },
    { value: 'hyderabad', label: 'Hyderabad Courts', multiplier: 0.9 },
    { value: 'pune', label: 'Pune Courts', multiplier: 1.0 },
    { value: 'ahmedabad', label: 'Ahmedabad Courts', multiplier: 0.95 }
  ];

  const calculateCourtFee = () => {
    if (!caseType || !jurisdiction) {
      toast({
        title: "Missing Information",
        description: "Please select case type and jurisdiction",
        variant: "destructive",
      });
      return;
    }

    const selectedCaseType = caseTypes.find(ct => ct.value === caseType);
    const selectedJurisdiction = jurisdictions.find(j => j.value === jurisdiction);
    
    if (selectedCaseType.needsAmount && !claimAmount) {
      toast({
        title: "Missing Amount",
        description: "Please enter the claim/property value",
        variant: "destructive",
      });
      return;
    }

    let baseFee = 0;
    const amount = parseFloat(claimAmount || propertyValue || '0');
    const multiplier = selectedJurisdiction.multiplier;

    // Court fee calculation based on Indian Court Fee Act
    switch (caseType) {
      case 'civil_suit':
      case 'money_suit':
        if (amount <= 20000) {
          baseFee = Math.max(amount * 0.075, 50); // 7.5% or minimum ₹50
        } else if (amount <= 100000) {
          baseFee = 1500 + (amount - 20000) * 0.05;
        } else if (amount <= 2000000) {
          baseFee = 5500 + (amount - 100000) * 0.04;
        } else {
          baseFee = 81500 + (amount - 2000000) * 0.03;
        }
        break;
        
      case 'property_suit':
        baseFee = Math.max(amount * 0.06, 100); // 6% or minimum ₹100
        break;
        
      case 'appeal':
        baseFee = Math.max(amount * 0.03, 500); // 3% or minimum ₹500
        break;
        
      case 'execution':
        baseFee = Math.max(amount * 0.025, 200); // 2.5% or minimum ₹200
        break;
        
      case 'criminal_complaint':
        baseFee = 100;
        break;
        
      case 'writ_petition':
        baseFee = 500;
        break;
        
      case 'revision':
        baseFee = 300;
        break;
        
      case 'injunction':
        baseFee = 250;
        break;
        
      case 'divorce':
        baseFee = 150;
        break;
        
      default:
        baseFee = 100;
    }

    const adjustedFee = Math.round(baseFee * multiplier);
    const processFeee = Math.round(adjustedFee * 0.1); // 10% process fee
    const totalFee = adjustedFee + processFeee;

    setCalculatedFee({
      baseFee: adjustedFee,
      processFee: processFeee,
      totalFee: totalFee,
      caseType: selectedCaseType.label,
      jurisdiction: selectedJurisdiction.label,
      claimAmount: amount
    });

    toast({
      title: "Fee Calculated",
      description: `Total court fee: ₹${totalFee.toLocaleString()}`,
    });
  };

  const generateReport = () => {
    if (!calculatedFee) return;

    const report = `COURT FEE CALCULATION REPORT
    
Case Type: ${calculatedFee.caseType}
Jurisdiction: ${calculatedFee.jurisdiction}
${calculatedFee.claimAmount > 0 ? `Claim Amount: ₹${calculatedFee.claimAmount.toLocaleString()}` : ''}

FEE BREAKDOWN:
Base Court Fee: ₹${calculatedFee.baseFee.toLocaleString()}
Process Fee (10%): ₹${calculatedFee.processFee.toLocaleString()}
TOTAL PAYABLE: ₹${calculatedFee.totalFee.toLocaleString()}

Generated on: ${new Date().toLocaleDateString()}
Generated by: Akralegal Court Fee Calculator

Note: This calculation is based on general court fee rules and may vary based on specific circumstances. Please verify with the respective court for exact fees.`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `court_fee_calculation_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Report Downloaded",
      description: "Court fee calculation report has been downloaded",
    });
  };

  const selectedCaseType = caseTypes.find(ct => ct.value === caseType);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calculator className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Court Fee Calculator</h1>
          <p className="text-muted-foreground">Calculate accurate court fees based on jurisdiction and case type</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Case Information
            </CardTitle>
            <CardDescription>
              Enter case details to calculate court fees
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Case Type
              </label>
              <Select value={caseType} onValueChange={setCaseType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select case type" />
                </SelectTrigger>
                <SelectContent>
                  {caseTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Court Jurisdiction
              </label>
              <Select value={jurisdiction} onValueChange={setJurisdiction}>
                <SelectTrigger>
                  <SelectValue placeholder="Select jurisdiction" />
                </SelectTrigger>
                <SelectContent>
                  {jurisdictions.map((j) => (
                    <SelectItem key={j.value} value={j.value}>
                      {j.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCaseType?.needsAmount && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {caseType === 'property_suit' ? 'Property Value (₹)' : 'Claim Amount (₹)'}
                </label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={caseType === 'property_suit' ? propertyValue : claimAmount}
                  onChange={(e) => {
                    if (caseType === 'property_suit') {
                      setPropertyValue(e.target.value);
                    } else {
                      setClaimAmount(e.target.value);
                    }
                  }}
                />
              </div>
            )}

            <Button onClick={calculateCourtFee} className="w-full">
              <Calculator className="mr-2 h-4 w-4" />
              Calculate Court Fee
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fee Calculation Result</CardTitle>
            {calculatedFee && (
              <Button onClick={generateReport} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {calculatedFee ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <IndianRupee className="h-5 w-5 text-primary" />
                    <span className="font-medium">Fee Breakdown</span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Base Court Fee:</span>
                      <span>₹{calculatedFee.baseFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Process Fee (10%):</span>
                      <span>₹{calculatedFee.processFee.toLocaleString()}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total Payable:</span>
                      <span className="text-primary">₹{calculatedFee.totalFee.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Case Type:</span>
                    <Badge variant="secondary">{calculatedFee.caseType}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Jurisdiction:</span>
                    <span>{calculatedFee.jurisdiction}</span>
                  </div>
                  {calculatedFee.claimAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Claim Amount:</span>
                      <span>₹{calculatedFee.claimAmount.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-xs text-blue-800 dark:text-blue-200">
                      <p className="font-medium">Important Notes:</p>
                      <ul className="mt-1 space-y-1 list-disc list-inside">
                        <li>Fees calculated as per Court Fee Act</li>
                        <li>Additional fees may apply for specific procedures</li>
                        <li>Verify with respective court for final amount</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Calculator className="mx-auto h-12 w-12 opacity-30" />
                <p className="mt-4">Calculated fee will appear here</p>
                <p className="text-sm">Enter case details and click Calculate</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fee Structure Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border border-border rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Civil Suits</h4>
              <p className="text-xs text-muted-foreground">
                7.5% of claim value (minimum ₹50) for claims up to ₹20,000
              </p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Property Suits</h4>
              <p className="text-xs text-muted-foreground">
                6% of property value (minimum ₹100)
              </p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Appeals</h4>
              <p className="text-xs text-muted-foreground">
                3% of disputed amount (minimum ₹500)
              </p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Writ Petitions</h4>
              <p className="text-xs text-muted-foreground">
                Fixed fee of ₹500 in most High Courts
              </p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Criminal Cases</h4>
              <p className="text-xs text-muted-foreground">
                Fixed fee of ₹100 for complaint filing
              </p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Execution</h4>
              <p className="text-xs text-muted-foreground">
                2.5% of execution amount (minimum ₹200)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourtFeeCalculator;