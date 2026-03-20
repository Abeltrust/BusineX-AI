export type UserType = 'founder' | 'investor';

export interface UserProfile {
  type: UserType;
  name: string;
  location: {
    city: string;
    country: string;
  };
  background: string;
  skills: string[];
  interests: string[];
  capital: number;
  wallet: Wallet;
  investorProfile?: {
    riskAppetite: 'low' | 'medium' | 'high';
    industryPreferences: string[];
    minInvestment: number;
    maxInvestment: number;
  };
}

export interface Wallet {
  balance: number;
  investments: Investment[];
  receivedFunds: number;
  returns: number;
}

export interface Investment {
  id: string;
  businessId: string;
  businessName: string;
  amount: number;
  equity: number;
  date: string;
}

export interface BusinessIdea {
  id: string;
  name: string;
  concept: string;
  problem: string;
  solution: string;
  targetMarket: string;
  competitiveAdvantage: string;
  roadmap?: Roadmap;
  investorReady?: PitchDeck;
}

export interface Roadmap {
  day1: string;
  first30Days: string;
  sixMonths: string;
  fiveToTenYears: string;
  tools: string[];
  costBreakdown: string;
  revenueStreams: string[];
  risks: string[];
}

export interface PitchDeck {
  executiveSummary: string;
  marketOpportunity: string;
  businessModel: string;
  financialProjections: string;
  fundingRequired: number;
  suggestedEquity: number;
}

export interface BusinessClinicReport {
  diagnosis: string;
  recoveryStrategies: string[];
  growthHacks: string[];
  pivotOpportunities: string[];
  investmentReadySteps: string[];
}
