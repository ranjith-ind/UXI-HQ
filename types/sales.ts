import { LeadSource, LeadStatus, ServiceInterest } from "./lead";

export interface SalesPipelineStage {
  stage: LeadStatus;
  label: string;
  count: number;
  totalValue: number;
  weightedValue: number;
  percentageOfPipeline: number;
}

export interface SalesPipelineStats {
  totalLeads: number;
  activeOpportunities: number;
  totalPipelineValue: number;
  totalWeightedValue: number;
  winRate: number;
  averageDealSize: number;
  averageSalesCycleDays: number;
  stages: SalesPipelineStage[];
}

export interface LeadSourcePerformance {
  source: LeadSource;
  leadsCount: number;
  wonCount: number;
  conversionRate: number;
  pipelineValue: number;
  wonValue: number;
}

export interface ServicePerformance {
  service: ServiceInterest;
  leadsCount: number;
  wonCount: number;
  conversionRate: number;
  pipelineValue: number;
  wonValue: number;
}

export interface SalesTrendItem {
  month: string;
  newLeads: number;
  wonLeads: number;
  lostLeads: number;
  wonRevenue: number;
}

export interface SalesInsights {
  topSource?: LeadSourcePerformance;
  topService?: ServicePerformance;
  topOpportunities: {
    leadId: string;
    leadCode: string;
    leadName: string;
    companyName?: string | null;
    estimatedValue: number;
    probability: number;
    weightedValue: number;
    expectedCloseDate?: string | null;
  }[];
  observations: string[];
}
