export type BusinessStage = 'idea' | 'mvp' | 'traction' | 'scale';
export type TaskStatus = 'backlog' | 'in_progress' | 'done';
export type LeadStage = 'new' | 'contacted' | 'proposal' | 'won';

export interface FounderProfile {
  founderName: string;
  businessName: string;
  stage: BusinessStage;
  location: {
    city: string;
    country: string;
  };
  industry: string;
  targetCustomer: string;
  businessModel: string;
  background: string;
  goals: string[];
  capital: number;
  monthlyBurn: number;
}

export interface FounderTask {
  id: string;
  title: string;
  owner: string;
  dueDate: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
}

export interface SalesLead {
  id: string;
  name: string;
  company: string;
  stage: LeadStage;
  value: number;
  nextAction: string;
}

export interface FounderStrategy {
  summary: string;
  valueProposition: string;
  priorities: string[];
  milestones: string[];
  goToMarket: string[];
  operations: string[];
  financeNotes: string[];
  risks: string[];
}

export interface BusinessClinicReport {
  diagnosis: string;
  recoveryStrategies: string[];
  growthRecommendations: string[];
  pivotOpportunities: string[];
  investmentReadySteps: string[];
}
