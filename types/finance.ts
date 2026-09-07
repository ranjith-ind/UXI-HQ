import { InvoiceStatus, InvoiceType, InvoiceWithDetails } from "./invoice";
import { PaymentMethod, PaymentWithDetails } from "./payment";

export interface FinanceStats {
  totalRevenue: number;
  outstandingAmount: number;
  overdueAmount: number;
  thisMonthRevenue: number;
  thisYearRevenue: number;
  totalInvoices: number;
  collectionRate: number;
}

export interface MonthlyRevenueTrendItem {
  month: string;
  revenue: number;
  invoiced: number;
  collectionsCount: number;
}

export interface ClientRevenueItem {
  clientId: string;
  clientName: string;
  companyName: string;
  totalContractValue: number;
  totalPaid: number;
  pendingAmount: number;
  totalInvoices: number;
  overdueInvoices: number;
  paymentCompletionPercent: number;
}

export interface ProjectRevenueItem {
  projectId: string;
  projectName: string;
  projectCode: string;
  clientName: string;
  budget: number;
  totalPaid: number;
  pendingAmount: number;
  invoicesCount: number;
}

export interface PaymentMethodDistributionItem {
  method: PaymentMethod;
  amount: number;
  count: number;
  percentage: number;
}

export interface InvoiceStatusDistributionItem {
  status: InvoiceStatus;
  count: number;
  amount: number;
  percentage: number;
}

export interface FinanceInsights {
  topPayingClient?: ClientRevenueItem;
  largestOutstandingClient?: ClientRevenueItem;
  overdueInvoicesCount: number;
  totalOverdueAmount: number;
  averagePaymentProcessingDays: number;
  thisMonthGrowthRate: number;
}
