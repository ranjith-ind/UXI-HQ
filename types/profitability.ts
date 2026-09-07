export interface CompanyProfitability {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  monthlyTrend: MonthlyProfitTrendItem[];
}

export interface MonthlyProfitTrendItem {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  margin: number;
}

export interface ProjectProfitability {
  projectId: string;
  projectName: string;
  projectCode: string;
  clientName: string;
  contractValue: number;
  revenue: number;
  expenses: number;
  profit: number;
  profitMargin: number;
  paymentCount: number;
  expenseCount: number;
  isProfitable: boolean;
}

export interface ClientProfitability {
  clientId: string;
  clientName: string;
  companyName: string;
  totalContractValue: number;
  revenue: number;
  expenses: number;
  profit: number;
  profitMargin: number;
  projectsCount: number;
}

export interface CategoryExpenseDistributionItem {
  categoryId?: string;
  categoryName: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface ProfitabilityInsights {
  mostProfitableProject?: ProjectProfitability;
  leastProfitableProject?: ProjectProfitability;
  highestSpendingCategory?: CategoryExpenseDistributionItem;
  overallHealthStatus: "Excellent" | "Healthy" | "Watch" | "Critical";
  observations: string[];
}
