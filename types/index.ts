import { Database, UserRole, ExpenseCategory as DbExpenseCategory } from "./database.types";
import { Client, ClientStatus, ClientSource, ClientFormData, ClientStats, ClientWithDetails, ClientSortOption } from "./client";
import {
  Project,
  ProjectStatus,
  ProjectPriority,
  ProjectType,
  ProjectMember,
  ProjectWithDetails,
  ProjectFormData,
  ProjectStats,
  ProjectSortOption,
  DeadlineFilterOption,
  PROJECT_STATUS_PROGRESS,
  PROJECT_TYPES_LIST,
  PROJECT_STATUS_LIST,
  PROJECT_PRIORITY_LIST,
} from "./project";
import {
  Task,
  TaskStatus,
  TaskPriority,
  TaskAssignee,
  Subtask,
  TaskWithDetails,
  TaskFormData,
  TaskStats,
  TaskSortOption,
  TaskDueDateFilter,
  TASK_STATUS_LIST,
  TASK_PRIORITY_LIST,
} from "./task";
import {
  Sprint,
  SprintStatus,
  SprintWithDetails,
  SprintFormData,
  SprintStats,
} from "./sprint";
import {
  TeamMember,
  TeamMemberWithDetails,
  TeamMemberFormData,
  TeamMemberSkill,
  Skill,
  MemberStatus,
  AvailabilityStatus,
  EmploymentType,
  SkillCategory,
  ProficiencyLevel,
  WorkloadStatus,
  TeamStats,
  TeamWorkloadFilter,
  TeamSortOption,
  MEMBER_STATUS_LIST,
  AVAILABILITY_STATUS_LIST,
  EMPLOYMENT_TYPE_LIST,
  SKILL_CATEGORIES,
  PROFICIENCY_LEVELS,
} from "./team";
import {
  Invoice,
  InvoiceItem,
  InvoiceWithDetails,
  InvoiceFormData,
  InvoiceStats,
  InvoiceType,
  InvoiceStatus,
  InvoiceSortOption,
  InvoiceDueFilter,
  INVOICE_TYPE_LIST,
  INVOICE_STATUS_LIST,
} from "./invoice";
import {
  Payment,
  PaymentWithDetails,
  PaymentFormData,
  PaymentStats,
  PaymentMethod,
  PaymentStatus,
  PaymentSortOption,
  PAYMENT_METHOD_LIST,
  PAYMENT_STATUS_LIST,
} from "./payment";
import {
  FinanceStats,
  MonthlyRevenueTrendItem,
  ClientRevenueItem,
  ProjectRevenueItem,
  PaymentMethodDistributionItem,
  InvoiceStatusDistributionItem,
  FinanceInsights,
} from "./finance";
import {
  Expense,
  ExpenseWithDetails,
  ExpenseFormData,
  ExpenseStats,
  ExpenseCategory,
  ExpenseCategoryStats,
  ExpensePaymentStatus,
  RecurringFrequency,
  ExpenseSortOption,
  ExpenseDateFilter,
  EXPENSE_PAYMENT_STATUS_LIST,
  RECURRING_FREQUENCY_LIST,
  DEFAULT_EXPENSE_CATEGORIES,
} from "./expense";
import {
  CompanyProfitability,
  ProjectProfitability,
  ClientProfitability,
  MonthlyProfitTrendItem,
  CategoryExpenseDistributionItem,
  ProfitabilityInsights,
} from "./profitability";
import {
  Lead,
  LeadWithDetails,
  LeadFormData,
  LeadStats,
  LeadSource,
  LeadStatus,
  LeadPriority,
  ServiceInterest,
  LeadLostReason,
  LeadSortOption,
  LeadQuickFilter,
  PIPELINE_STAGES,
  ALL_LEAD_STATUSES,
  LEAD_STAGE_PROBABILITIES,
  LEAD_SOURCES_LIST,
  SERVICE_INTERESTS_LIST,
  LEAD_PRIORITIES_LIST,
  LEAD_LOST_REASONS_LIST,
} from "./lead";
import {
  LeadActivity,
  LeadActivityType,
  LeadActivityFormData,
  LEAD_ACTIVITY_TYPES_LIST,
} from "./lead-activity";
import {
  LeadFollowUp,
  LeadFollowUpWithDetails,
  LeadFollowUpFormData,
  FollowUpType,
  FollowUpStatus,
  FOLLOW_UP_TYPES_LIST,
  FOLLOW_UP_STATUS_LIST,
} from "./lead-followup";
import {
  SalesPipelineStage,
  SalesPipelineStats,
  LeadSourcePerformance,
  ServicePerformance,
  SalesTrendItem,
  SalesInsights,
} from "./sales";

export type {
  UserRole,
  ProjectStatus,
  ProjectPriority,
  ProjectType,
  ProjectMember,
  ProjectWithDetails,
  ProjectFormData,
  ProjectStats,
  ProjectSortOption,
  DeadlineFilterOption,
  TaskPriority,
  TaskStatus,
  DbExpenseCategory as ExpenseCategoryEnum,
  Client,
  ClientStatus,
  ClientSource,
  ClientFormData,
  ClientStats,
  ClientWithDetails,
  ClientSortOption,
  Project,
  Task,
  TaskAssignee,
  Subtask,
  TaskWithDetails,
  TaskFormData,
  TaskStats,
  TaskSortOption,
  TaskDueDateFilter,
  Sprint,
  SprintStatus,
  SprintWithDetails,
  SprintFormData,
  SprintStats,
  TeamMember,
  TeamMemberWithDetails,
  TeamMemberFormData,
  TeamMemberSkill,
  Skill,
  MemberStatus,
  AvailabilityStatus,
  EmploymentType,
  SkillCategory,
  ProficiencyLevel,
  WorkloadStatus,
  TeamStats,
  TeamWorkloadFilter,
  TeamSortOption,
  Invoice,
  InvoiceItem,
  InvoiceWithDetails,
  InvoiceFormData,
  InvoiceStats,
  InvoiceType,
  InvoiceStatus,
  InvoiceSortOption,
  InvoiceDueFilter,
  Payment,
  PaymentWithDetails,
  PaymentFormData,
  PaymentStats,
  PaymentMethod,
  PaymentStatus,
  PaymentSortOption,
  FinanceStats,
  MonthlyRevenueTrendItem,
  ClientRevenueItem,
  ProjectRevenueItem,
  PaymentMethodDistributionItem,
  InvoiceStatusDistributionItem,
  FinanceInsights,
  Expense,
  ExpenseWithDetails,
  ExpenseFormData,
  ExpenseStats,
  ExpenseCategory,
  ExpenseCategoryStats,
  ExpensePaymentStatus,
  RecurringFrequency,
  ExpenseSortOption,
  ExpenseDateFilter,
  CompanyProfitability,
  ProjectProfitability,
  ClientProfitability,
  MonthlyProfitTrendItem,
  CategoryExpenseDistributionItem,
  ProfitabilityInsights,
  Lead,
  LeadWithDetails,
  LeadFormData,
  LeadStats,
  LeadSource,
  LeadStatus,
  LeadPriority,
  ServiceInterest,
  LeadLostReason,
  LeadSortOption,
  LeadQuickFilter,
  LeadActivity,
  LeadActivityType,
  LeadActivityFormData,
  LeadFollowUp,
  LeadFollowUpWithDetails,
  LeadFollowUpFormData,
  FollowUpType,
  FollowUpStatus,
  SalesPipelineStage,
  SalesPipelineStats,
  LeadSourcePerformance,
  ServicePerformance,
  SalesTrendItem,
  SalesInsights,
};

export {
  PROJECT_STATUS_PROGRESS,
  PROJECT_TYPES_LIST,
  PROJECT_STATUS_LIST,
  PROJECT_PRIORITY_LIST,
  TASK_STATUS_LIST,
  TASK_PRIORITY_LIST,
  MEMBER_STATUS_LIST,
  AVAILABILITY_STATUS_LIST,
  EMPLOYMENT_TYPE_LIST,
  SKILL_CATEGORIES,
  PROFICIENCY_LEVELS,
  INVOICE_TYPE_LIST,
  INVOICE_STATUS_LIST,
  PAYMENT_METHOD_LIST,
  PAYMENT_STATUS_LIST,
  EXPENSE_PAYMENT_STATUS_LIST,
  RECURRING_FREQUENCY_LIST,
  DEFAULT_EXPENSE_CATEGORIES,
  PIPELINE_STAGES,
  ALL_LEAD_STATUSES,
  LEAD_STAGE_PROBABILITIES,
  LEAD_SOURCES_LIST,
  SERVICE_INTERESTS_LIST,
  LEAD_PRIORITIES_LIST,
  LEAD_LOST_REASONS_LIST,
  LEAD_ACTIVITY_TYPES_LIST,
  FOLLOW_UP_TYPES_LIST,
  FOLLOW_UP_STATUS_LIST,
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ActivityLog = Database["public"]["Tables"]["activity_logs"]["Row"];

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string | null;
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalClients: number;
  totalRevenue: number;
  totalRevenueChangePercent: number;
  activeProjectsChangePercent: number;
  totalClientsChangePercent: number;
  totalTasksCount: number;
}

export interface ProjectSummary {
  id: string;
  name: string;
  code: string;
  clientName: string;
  status: ProjectStatus;
  deadline: string;
  progressPercent: number;
  budget: number;
  leadName: string;
}

export interface UpcomingDeadline {
  id: string;
  title: string;
  projectName: string;
  dueDate: string;
  priority: "low" | "medium" | "high" | "urgent";
  daysRemaining: number;
}

export interface ActivityItem {
  id: string;
  actorName: string;
  actorAvatar?: string;
  action: string;
  targetName: string;
  timestamp: string;
  category: "project" | "client" | "payment" | "task" | "system";
}

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: string;
  isNew?: boolean;
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

// Phase 9 Exports
export * from "./notification";
export * from "./activity";
export * from "./alert";

