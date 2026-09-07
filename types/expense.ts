import { PaymentMethod } from "./payment";

export type ExpensePaymentStatus =
  | "Draft"
  | "Pending"
  | "Paid"
  | "Overdue"
  | "Cancelled";

export type RecurringFrequency = "Weekly" | "Monthly" | "Quarterly" | "Yearly";

export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Expense {
  id: string;
  expense_number: string;
  expense_title: string;
  description?: string | null;
  expense_category_id?: string | null;
  category_name: string;
  project_id?: string | null;
  client_id?: string | null;
  vendor_name?: string | null;
  vendor_contact?: string | null;
  amount: number;
  expense_date: string;
  due_date?: string | null;
  payment_status: ExpensePaymentStatus;
  payment_method: PaymentMethod;
  transaction_reference?: string | null;
  receipt_url?: string | null;
  is_recurring: boolean;
  recurring_frequency?: RecurringFrequency | null;
  next_recurring_date?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseWithDetails extends Expense {
  category_description?: string | null;
  project_name?: string | null;
  project_code?: string | null;
  client_name?: string | null;
  client_company?: string | null;
  is_overdue: boolean;
  days_until_due: number | null;
}

export interface ExpenseFormData {
  expense_title: string;
  description?: string;
  expense_category_id?: string;
  category_name: string;
  project_id?: string;
  client_id?: string;
  vendor_name?: string;
  vendor_contact?: string;
  amount: number;
  expense_date: string;
  due_date?: string;
  payment_status: ExpensePaymentStatus;
  payment_method: PaymentMethod;
  transaction_reference?: string;
  receipt_url?: string;
  is_recurring?: boolean;
  recurring_frequency?: RecurringFrequency;
  next_recurring_date?: string;
  notes?: string;
}

export interface ExpenseStats {
  totalExpenses: number;
  paidThisMonth: number;
  paidThisYear: number;
  pendingAmount: number;
  overdueAmount: number;
  activeCategoriesCount: number;
  recurringExpensesCount: number;
}

export interface ExpenseCategoryStats {
  id: string;
  name: string;
  description?: string | null;
  expenseCount: number;
  totalSpending: number;
  percentage: number;
  is_active: boolean;
}

export type ExpenseSortOption =
  | "recently_created"
  | "oldest"
  | "highest_amount"
  | "lowest_amount"
  | "expense_date_newest"
  | "expense_date_oldest"
  | "due_date_nearest";

export type ExpenseDateFilter =
  | "all"
  | "this_month"
  | "last_month"
  | "this_quarter"
  | "this_year";

export const EXPENSE_PAYMENT_STATUS_LIST: ExpensePaymentStatus[] = [
  "Paid",
  "Pending",
  "Draft",
  "Overdue",
  "Cancelled",
];

export const RECURRING_FREQUENCY_LIST: RecurringFrequency[] = [
  "Weekly",
  "Monthly",
  "Quarterly",
  "Yearly",
];

export const DEFAULT_EXPENSE_CATEGORIES = [
  "Hosting & Infrastructure",
  "Domains",
  "Software & Subscriptions",
  "Team Payments",
  "Freelancer Payments",
  "Marketing",
  "Advertising",
  "Office Expenses",
  "Equipment",
  "Travel",
  "Client Project Expenses",
  "Legal & Compliance",
  "Training & Education",
  "Miscellaneous",
];
