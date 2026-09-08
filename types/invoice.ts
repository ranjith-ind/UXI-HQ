export type InvoiceType =
  | "Advance"
  | "Milestone"
  | "Final Payment"
  | "Full Payment"
  | "Maintenance"
  | "Other";

export type InvoiceStatus =
  | "Draft"
  | "Sent"
  | "Partially Paid"
  | "Paid"
  | "Overdue"
  | "Cancelled";

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  item_name: string;
  description?: string | null;
  quantity: number;
  unit_price: number;
  total: number;
  created_at?: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  project_id?: string | null;
  invoice_title: string;
  description?: string | null;
  invoice_type: InvoiceType;
  invoice_status: InvoiceStatus;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  amount_paid: number;
  amount_due: number;
  issue_date: string;
  due_date?: string | null;
  sent_at?: string | null;
  paid_at?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceWithDetails extends Invoice {
  status: any;
  client: any;
  project: any;
  payment_status: string;
  client_name: string;
  client_company: string;
  client_email: string;
  client_phone?: string | null;
  client_location?: string | null;
  project_name?: string | null;
  project_code?: string | null;
  items: InvoiceItem[];
  is_overdue: boolean;
  days_until_due: number | null;
}

export interface InvoiceFormData {
  client_id: string;
  project_id?: string;
  invoice_title: string;
  description?: string;
  invoice_type: InvoiceType;
  invoice_status?: InvoiceStatus;
  discount_amount?: number;
  tax_amount?: number;
  issue_date: string;
  due_date?: string;
  notes?: string;
  items: Array<{
    item_name: string;
    description?: string;
    quantity: number;
    unit_price: number;
  }>;
}

export interface InvoiceStats {
  totalInvoices: number;
  draftInvoices: number;
  sentInvoices: number;
  partiallyPaidInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  totalInvoicedAmount: number;
  totalPaidAmount: number;
  totalDueAmount: number;
}

export type InvoiceSortOption =
  | "recently_created"
  | "oldest"
  | "highest_amount"
  | "lowest_amount"
  | "due_date_nearest"
  | "due_date_furthest"
  | "client_asc";

export type InvoiceDueFilter =
  | "all"
  | "overdue"
  | "due_soon"
  | "paid"
  | "partially_paid";

export const INVOICE_TYPE_LIST: InvoiceType[] = [
  "Advance",
  "Milestone",
  "Final Payment",
  "Full Payment",
  "Maintenance",
  "Other",
];

export const INVOICE_STATUS_LIST: InvoiceStatus[] = [
  "Draft",
  "Sent",
  "Partially Paid",
  "Paid",
  "Overdue",
  "Cancelled",
];
