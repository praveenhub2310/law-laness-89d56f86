import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calculator, IndianRupee, FileText, Download, Info, BookOpen, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { 
  COURT_FEE_RULES, 
  JURISDICTIONS, 
  calculateCourtFee, 
  getFeeStructureGuide 
} from '@/config/courtFees';

const CourtFeeCalculator = () => {
  const [caseType, setCaseType] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [claimAmount, setClaimAmount] = useState('');
  const [propertyValue, setPropertyValue] = useState('');
  const [calculatedFee, setCalculatedFee] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Use actual case types from the High Court Fees Rules
  const caseTypes = Object.entries(COURT_FEE_RULES).map(([key, config]) => ({
    value: key,
    label: config.label,
    needsAmount: config.needsAmount
  }));

  // Use actual jurisdictions with real multipliers
  const jurisdictions = Object.entries(JURISDICTIONS).map(([key, config]) => ({
    value: key,
    label: config.label,
    multiplier: config.multiplier
  }));

  const handleCalculateCourtFee = () => {
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
    
    if (selectedCaseType?.needsAmount && !claimAmount) {
      toast({
        title: "Missing Amount",
        description: "Please enter the claim/property value",
        variant: "destructive",
      });
      return;
    }

    try {
      const amount = parseFloat(claimAmount || propertyValue || '0');
      
      // Use the actual High Court Fees Rules calculation
      const feeCalculation = calculateCourtFee(caseType, amount, jurisdiction);
      
      setCalculatedFee({
        baseFee: feeCalculation.baseFee,
        additionalFees: feeCalculation.additionalFees,
        totalFee: feeCalculation.totalFee,
        breakdown: feeCalculation.breakdown,
        caseType: selectedCaseType?.label || '',
        jurisdiction: selectedJurisdiction?.label || '',
        claimAmount: amount,
        caseConfig: COURT_FEE_RULES[caseType]
      });

      toast({
        title: "Fee Calculated",
        description: `Total court fee: ₹{feeCalculation.totalFee.toLocaleString()}`,
      });
    } catch (error) {
      toast({
        title: "Calculation Error",
        description: error instanceof Error ? error.message : "Failed to calculate fee",
        variant: "destructive",
      });
    }
  };

  const generatePDFReport = async () => {
    if (!calculatedFee) return;
    
    setIsGeneratingPDF(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = 25;

      // Helper function for aligned text rows
      const addRow = (leftText: string, rightText: string = '', fontSize = 11, isBold = false, leftIndent = 0) => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        
        // Left text
        pdf.text(leftText, margin + leftIndent, yPosition);
        
        // Right text (right-aligned)
        if (rightText) {
          const rightTextWidth = pdf.getTextWidth(rightText);
          pdf.text(rightText, pageWidth - margin - rightTextWidth, yPosition);
        }
        
        yPosition += fontSize * 0.7;
      };

      // Helper function to format currency with proper rupee symbol
      const formatCurrency = (amount: number) => {
        return `Rs ${amount.toLocaleString()}`;
      };

      // Header
      pdf.setFillColor(59, 130, 246);
      pdf.rect(0, 0, pageWidth, 20, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('HIGH COURT FEE CALCULATION REPORT', pageWidth / 2, 13, { align: 'center' });
      
      pdf.setTextColor(0, 0, 0);
      yPosition = 35;

      // Subtitle
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      const subtitle = 'Based on High Court Fees Rules, 1956';
      const subtitleWidth = pdf.getTextWidth(subtitle);
      pdf.text(subtitle, (pageWidth - subtitleWidth) / 2, yPosition);
      yPosition += 15;

      // Case Details Section
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CASE DETAILS', margin, yPosition);
      yPosition += 3;
      
      pdf.setDrawColor(59, 130, 246);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      addRow(`Case Type: ${calculatedFee.caseType} ₹, '', 11);
      addRow(`Court Jurisdiction: ${calculatedFee.jurisdiction} ₹, '', 11);
      
      if (calculatedFee.claimAmount > 0) {
        addRow(`Claim/Property Value: ${formatCurrency(calculatedFee.claimAmount)} ₹, '', 11);
      }
      
      if (calculatedFee.caseConfig?.articleReference) {
        addRow(`Legal Reference: ${calculatedFee.caseConfig.articleReference} ₹, '', 11);
      }
      
      yPosition += 10;

      // Fee Breakdown Section
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DETAILED FEE BREAKDOWN', margin, yPosition);
      yPosition += 3;
      
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Fee breakdown with perfect alignment
      if (calculatedFee.breakdown?.length) {
        calculatedFee.breakdown.forEach((item) => {
          addRow(item.description, formatCurrency(item.amount), 11);
        });
        yPosition += 5;
      }

      // Summary Section
      pdf.setFillColor(248, 250, 252);
      pdf.rect(margin, yPosition, pageWidth - (margin * 2), 35, 'F');
      pdf.setDrawColor(226, 232, 240);
      pdf.rect(margin, yPosition, pageWidth - (margin * 2), 35);
      
      yPosition += 10;
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SUMMARY', margin + 5, yPosition);
      yPosition += 8;
      
      addRow('Base Court Fee:', formatCurrency(calculatedFee.baseFee), 11, false, 5);
      addRow('Additional Fees:', formatCurrency(calculatedFee.additionalFees), 11, false, 5);
      
      yPosition += 3;
      
      // Total line
      pdf.setDrawColor(59, 130, 246);
      pdf.line(margin + 5, yPosition, pageWidth - margin - 5, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(59, 130, 246);
      pdf.text('TOTAL PAYABLE:', margin + 5, yPosition);
      
      const totalText = formatCurrency(calculatedFee.totalFee);
      const totalWidth = pdf.getTextWidth(totalText);
      pdf.text(totalText, pageWidth - margin - 5 - totalWidth, yPosition);
      
      pdf.setTextColor(0, 0, 0);
      yPosition += 20;

      // Disclaimer Section
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('IMPORTANT DISCLAIMER', margin, yPosition);
      yPosition += 3;
      
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      const disclaimerText = 'This calculation is based on the High Court Fees Rules, 1956 (Tamil Nadu) and general court fee provisions. Actual fees may vary based on:';
      const lines = pdf.splitTextToSize(disclaimerText, pageWidth - (margin * 2));
      pdf.text(lines, margin, yPosition);
      yPosition += lines.length * 4 + 3;

      const points = [
        '• Specific court rules and local amendments',
        '• Updated fee schedules',
        '• Special circumstances of the case',
        '• Additional procedural requirements'
      ];

      points.forEach(point => {
        pdf.text(point, margin, yPosition);
        yPosition += 4;
      });

      yPosition += 3;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Always verify the exact fee amount with the respective court registry before payment.', margin, yPosition);
      
      // Footer
      const footerY = pdf.internal.pageSize.getHeight() - 25;
      pdf.setFillColor(248, 250, 252);
      pdf.rect(0, footerY, pageWidth, 25, 'F');
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, margin, footerY + 8);
      pdf.text('Generated by: Akralegal Court Fee Calculator', margin, footerY + 16);
      
      const referenceText = 'Legal Database Reference: High Court Fees Rules, 1956';
      const referenceWidth = pdf.getTextWidth(referenceText);
      pdf.text(referenceText, pageWidth - margin - referenceWidth, footerY + 16);

      // Save the PDF
      const fileName = `court_fee_calculation_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast({
        title: "PDF Report Generated",
        description: "Professional court fee calculation report has been downloaded",
      });
    } catch (error) {
      toast({
        title: "PDF Generation Failed",
        description: "Failed to generate PDF report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
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

            <Button onClick={handleCalculateCourtFee} className="w-full">
              <Calculator className="mr-2 h-4 w-4" />
              Calculate Court Fee
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>Fee Calculation Result</CardTitle>
              <CardDescription className="mt-1">
                Professional court fee calculation based on High Court Rules
              </CardDescription>
            </div>
            {calculatedFee && (
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={generatePDFReport} 
                  variant="default" 
                  size="sm"
                  disabled={isGeneratingPDF}
                  className="relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
                >
                  {isGeneratingPDF ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF Report
                    </>
                  )}
                </Button>
                <div className="text-xs text-muted-foreground text-center">
                  Professional format
                </div>
              </div>
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
                    {calculatedFee.breakdown?.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-xs">{item.description}:</span>
                        <span>₹{item.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    <hr className="my-2" />
                    <div className="flex justify-between">
                      <span>Base Court Fee:</span>
                      <span>₹{calculatedFee.baseFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Additional Fees:</span>
                      <span>₹{calculatedFee.additionalFees.toLocaleString()}</span>
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
                  {calculatedFee.caseConfig?.articleReference && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Legal Reference:</span>
                      <span className="text-xs">{calculatedFee.caseConfig.articleReference}</span>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-xs text-blue-800 dark:text-blue-200">
                      <p className="font-medium">Based on High Court Fees Rules, 1956:</p>
                      <ul className="mt-1 space-y-1 list-disc list-inside">
                        <li>Calculation follows official Tamil Nadu court fee structure</li>
                        <li>Fees may vary by jurisdiction and recent amendments</li>
                        <li>Additional court costs (summons, process fees) may apply</li>
                        <li>Always verify final amount with court registry</li>
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
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            High Court Fees Rules, 1956 - Fee Structure Guide
          </CardTitle>
          <CardDescription>
            Official fee structure based on Tamil Nadu High Court Fees Rules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFeeStructureGuide().map((guide, index) => (
              <div key={index} className="p-4 border border-border rounded-lg">
                <h4 className="font-semibold text-sm mb-2">{guide.title}</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  {guide.description}
                </p>
                <p className="text-xs font-mono text-primary">
                  {guide.example}
                </p>
                <p className="text-xs text-muted-foreground mt-1 italic">
                  {guide.reference}
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-xs text-amber-800 dark:text-amber-200">
                <p className="font-medium">Legal Reference: High Court Fees Rules, 1956</p>
                <p className="mt-1">
                  This calculator implements the actual fee structure from the Tamil Nadu High Court Fees Rules, 1956, 
                  including Appendix I-A (slab-based fees for civil suits) and Appendix II (fixed fees for various proceedings). 
                  Fees are calculated according to the exact formulas specified in the Act.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourtFeeCalculator;