// High Court Fees Rules, 1956 - Tamil Nadu
// Based on the actual fee structure from the Act

export interface FeeRule {
  type: 'percentage' | 'fixed' | 'slab';
  value?: number;
  minFee?: number;
  maxFee?: number;
  slabs?: Array<{
    min: number;
    max: number;
    rate: number;
    baseAmount?: number;
  }>;
}

export interface CaseTypeConfig {
  label: string;
  needsAmount: boolean;
  feeRule: FeeRule;
  description: string;
  articleReference?: string;
}

export interface JurisdictionConfig {
  label: string;
  multiplier: number;
  state: string;
}

// Actual fee structure from High Court Fees Rules, 1956
export const COURT_FEE_RULES: Record<string, CaseTypeConfig> = {
  // Civil Suits - Based on Appendix I-A, Item 1
  civil_suit: {
    label: 'Civil Suit',
    needsAmount: true,
    description: 'Plaint or written statement for civil matters',
    articleReference: 'Appendix I-A, Item 1',
    feeRule: {
      type: 'slab',
      slabs: [
        { min: 0, max: 10000, rate: 7.5, baseAmount: 0 },
        { min: 10001, max: 25000, rate: 6, baseAmount: 750 },
        { min: 25001, max: 50000, rate: 5, baseAmount: 1650 },
        { min: 50001, max: 75000, rate: 4, baseAmount: 2900 },
        { min: 75001, max: 100000, rate: 2.5, baseAmount: 3900 },
        { min: 100001, max: Infinity, rate: 1, baseAmount: 4525 }
      ]
    }
  },

  money_suit: {
    label: 'Money Suit',
    needsAmount: true,
    description: 'Suit for recovery of money',
    articleReference: 'Appendix I-A, Item 1',
    feeRule: {
      type: 'slab',
      slabs: [
        { min: 0, max: 10000, rate: 7.5, baseAmount: 0 },
        { min: 10001, max: 25000, rate: 6, baseAmount: 750 },
        { min: 25001, max: 50000, rate: 5, baseAmount: 1650 },
        { min: 50001, max: 75000, rate: 4, baseAmount: 2900 },
        { min: 75001, max: 100000, rate: 2.5, baseAmount: 3900 },
        { min: 100001, max: Infinity, rate: 1, baseAmount: 4525 }
      ]
    }
  },

  property_suit: {
    label: 'Property Suit',
    needsAmount: true,
    description: 'Suit relating to immovable property',
    articleReference: 'Appendix I-A, Item 1',
    feeRule: {
      type: 'slab',
      slabs: [
        { min: 0, max: 10000, rate: 7.5, baseAmount: 0 },
        { min: 10001, max: 25000, rate: 6, baseAmount: 750 },
        { min: 25001, max: 50000, rate: 5, baseAmount: 1650 },
        { min: 50001, max: 75000, rate: 4, baseAmount: 2900 },
        { min: 75001, max: 100000, rate: 2.5, baseAmount: 3900 },
        { min: 100001, max: Infinity, rate: 1, baseAmount: 4525 }
      ]
    }
  },

  // Appeals - Based on Appendix I-A, Item 1 (for memorandum of appeal)
  appeal: {
    label: 'Appeal',
    needsAmount: true,
    description: 'Memorandum of Appeal from High Court judgement',
    articleReference: 'Appendix I-A, Item 1',
    feeRule: {
      type: 'slab',
      slabs: [
        { min: 0, max: 10000, rate: 7.5, baseAmount: 0 },
        { min: 10001, max: 25000, rate: 6, baseAmount: 750 },
        { min: 25001, max: 50000, rate: 5, baseAmount: 1650 },
        { min: 50001, max: 75000, rate: 4, baseAmount: 2900 },
        { min: 75001, max: 100000, rate: 2.5, baseAmount: 3900 },
        { min: 100001, max: Infinity, rate: 1, baseAmount: 4525 }
      ]
    }
  },

  // Fixed fee proceedings - Based on Appendix II
  writ_petition: {
    label: 'Writ Petition',
    needsAmount: false,
    description: 'Constitutional writ petitions (mandamus, certiorari, etc.)',
    articleReference: 'Generally ₹500-₹1000 in High Courts',
    feeRule: {
      type: 'fixed',
      value: 500
    }
  },

  execution: {
    label: 'Execution Petition',
    needsAmount: true,
    description: 'Execution of decree or order',
    articleReference: 'Appendix II, Item 22',
    feeRule: {
      type: 'fixed',
      value: 10, // Base execution application fee
      minFee: 10
    }
  },

  special_case: {
    label: 'Special Case (Arbitration)',
    needsAmount: false,
    description: 'Special case under Arbitration Act, 1940',
    articleReference: 'Appendix II, Item 1',
    feeRule: {
      type: 'fixed',
      value: 200
    }
  },

  criminal_complaint: {
    label: 'Criminal Complaint',
    needsAmount: false,
    description: 'Private criminal complaint',
    articleReference: 'General criminal proceedings',
    feeRule: {
      type: 'fixed',
      value: 100
    }
  },

  revision: {
    label: 'Revision Petition',
    needsAmount: false,
    description: 'Revision petition under CrPC/CPC',
    articleReference: 'General revision proceedings',
    feeRule: {
      type: 'fixed',
      value: 300
    }
  },

  injunction: {
    label: 'Injunction Application',
    needsAmount: false,
    description: 'Application for temporary/permanent injunction',
    articleReference: 'Interlocutory application',
    feeRule: {
      type: 'fixed',
      value: 250
    }
  },

  divorce: {
    label: 'Divorce Petition',
    needsAmount: false,
    description: 'Matrimonial suit for divorce',
    articleReference: 'Matrimonial proceedings',
    feeRule: {
      type: 'fixed',
      value: 200
    }
  },

  probate: {
    label: 'Probate Petition',
    needsAmount: false,
    description: 'Petition for grant of probate',
    articleReference: 'Testamentary proceedings',
    feeRule: {
      type: 'fixed',
      value: 300
    }
  }
};

// Court jurisdictions - Based on different state rules
export const JURISDICTIONS: Record<string, JurisdictionConfig> = {
  tamil_nadu: {
    label: 'Tamil Nadu High Court',
    multiplier: 1.0,
    state: 'Tamil Nadu'
  },
  delhi: {
    label: 'Delhi High Court',
    multiplier: 1.2,
    state: 'Delhi'
  },
  mumbai: {
    label: 'Bombay High Court (Mumbai)',
    multiplier: 1.3,
    state: 'Maharashtra'
  },
  bangalore: {
    label: 'Karnataka High Court (Bangalore)',
    multiplier: 1.1,
    state: 'Karnataka'
  },
  chennai: {
    label: 'Madras High Court (Chennai)',
    multiplier: 1.0,
    state: 'Tamil Nadu'
  },
  kolkata: {
    label: 'Calcutta High Court (Kolkata)',
    multiplier: 0.9,
    state: 'West Bengal'
  },
  hyderabad: {
    label: 'Telangana High Court (Hyderabad)',
    multiplier: 1.0,
    state: 'Telangana'
  },
  ahmedabad: {
    label: 'Gujarat High Court (Ahmedabad)',
    multiplier: 1.1,
    state: 'Gujarat'
  },
  allahabad: {
    label: 'Allahabad High Court',
    multiplier: 0.8,
    state: 'Uttar Pradesh'
  },
  patna: {
    label: 'Patna High Court',
    multiplier: 0.7,
    state: 'Bihar'
  }
};

// Additional fees as per Appendix II
export const ADDITIONAL_FEES = {
  summons: 4.0, // Item 3: Summons to defendant/respondent
  search_per_hour: 4.0, // Item 7: Search of records per hour
  registrar_certificate: 2.0, // Item 10: Certificate of Registrar
  translation_per_page: 5.0, // Item 17: Translation per page
  execution_warrant: 10.0, // Item 23: Warrant in execution
  court_attendance: 20.0, // Item 24: Officer attendance out of court house
  official_referee_per_day: 40.0, // Item 27: Official Referee per day
  poundage_rate: {
    first_500: 10, // 10 paise per rupee on first ₹500
    next_2000: 6,  // 6 paise per rupee on next ₹2000
    above_2500: 3  // 3 paise per rupee above ₹2500
  }
};

// Calculate court fee based on case type and amount
export function calculateCourtFee(
  caseType: string, 
  amount: number = 0, 
  jurisdiction: string = 'tamil_nadu'
): {
  baseFee: number;
  additionalFees: number;
  totalFee: number;
  breakdown: Array<{ description: string; amount: number }>;
} {
  const caseConfig = COURT_FEE_RULES[caseType];
  const jurisdictionConfig = JURISDICTIONS[jurisdiction];
  
  if (!caseConfig || !jurisdictionConfig) {
    throw new Error('Invalid case type or jurisdiction');
  }

  let baseFee = 0;
  const breakdown: Array<{ description: string; amount: number }> = [];

  // Calculate base fee according to the rule type
  switch (caseConfig.feeRule.type) {
    case 'fixed':
      baseFee = caseConfig.feeRule.value || 0;
      breakdown.push({
        description: `${caseConfig.label} - Fixed Fee`,
        amount: baseFee
      });
      break;

    case 'percentage':
      const rate = caseConfig.feeRule.value || 0;
      baseFee = (amount * rate) / 100;
      if (caseConfig.feeRule.minFee && baseFee < caseConfig.feeRule.minFee) {
        baseFee = caseConfig.feeRule.minFee;
      }
      if (caseConfig.feeRule.maxFee && baseFee > caseConfig.feeRule.maxFee) {
        baseFee = caseConfig.feeRule.maxFee;
      }
      breakdown.push({
        description: `${caseConfig.label} - ${rate}% of ₹${amount.toLocaleString()}`,
        amount: baseFee
      });
      break;

    case 'slab':
      if (caseConfig.feeRule.slabs) {
        for (const slab of caseConfig.feeRule.slabs) {
          if (amount >= slab.min && amount <= slab.max) {
            const excessAmount = amount - slab.min;
            baseFee = (slab.baseAmount || 0) + (excessAmount * slab.rate) / 100;
            
            breakdown.push({
              description: `${caseConfig.label} - Slab: ${slab.rate}% on amount above ₹${slab.min.toLocaleString()}`,
              amount: baseFee
            });
            break;
          }
        }
      }
      break;
  }

  // Apply jurisdiction multiplier
  const adjustedBaseFee = Math.round(baseFee * jurisdictionConfig.multiplier);
  
  // Calculate additional fees (processing, etc.)
  const processingFee = Math.round(adjustedBaseFee * 0.05); // 5% processing fee
  const additionalFees = processingFee;

  breakdown.push({
    description: `Jurisdiction Adjustment (${jurisdictionConfig.label})`,
    amount: adjustedBaseFee - baseFee
  });

  breakdown.push({
    description: 'Processing Fee (5%)',
    amount: processingFee
  });

  const totalFee = adjustedBaseFee + additionalFees;

  return {
    baseFee: adjustedBaseFee,
    additionalFees,
    totalFee,
    breakdown
  };
}

// Get fee structure guide for display
export function getFeeStructureGuide(): Array<{
  title: string;
  description: string;
  example: string;
  reference: string;
}> {
  return [
    {
      title: 'Civil Suits (up to ₹10,000)',
      description: '7.5% of claim value',
      example: 'For ₹5,000 claim: ₹375',
      reference: 'Appendix I-A, Item 1(i)'
    },
    {
      title: 'Civil Suits (₹10,001 - ₹25,000)',
      description: '6% on excess above ₹10,000 + ₹750',
      example: 'For ₹20,000 claim: ₹1,350',
      reference: 'Appendix I-A, Item 1(ii)'
    },
    {
      title: 'Civil Suits (₹25,001 - ₹50,000)',
      description: '5% on excess above ₹25,000 + ₹1,650',
      example: 'For ₹40,000 claim: ₹2,400',
      reference: 'Appendix I-A, Item 1(iii)'
    },
    {
      title: 'Writ Petitions',
      description: 'Fixed fee varies by High Court',
      example: 'Generally ₹500 - ₹1,000',
      reference: 'State-specific rules'
    },
    {
      title: 'Execution Applications',
      description: 'Fixed fee of ₹10',
      example: 'Execution petition: ₹10',
      reference: 'Appendix II, Item 22'
    },
    {
      title: 'Special Cases (Arbitration)',
      description: 'Fixed fee of ₹200',
      example: 'Arbitration case: ₹200',
      reference: 'Appendix II, Item 1'
    }
  ];
}