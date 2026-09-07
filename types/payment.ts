export type PaymentMethod =
  | "Bank Transfer"
  | "UPI"
  | "Cash"
  | "Credit Card"
  | "Debit Card"
  | "Other";

export type PaymentStatus = "Pending" | "Completed" | "Failed" | "Refunded";

export interface Payment {
  id: string;
  invoice_id?: string | null;
  client_id: string;
  project_id?: string | null;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  transaction_reference?: string | null;
  payment_status: PaymentStatus;
  notes?: string | null;
  recorded_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentWithDetails extends Payment {
  client_name: string;
  client_company: string;
  client_email: string;
  project_name?: string | null;
  project_code?: string | null;
  invoice_number?: string | null;
  invoice_title?: string | null;
}

export interface PaymentFormData {
  invoice_id?: string;
  client_id: string;
  project_id?: string;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  transaction_reference?: string;
  payment_status?: PaymentStatus;
  notes?: string;
}

export interface PaymentStats {
  totalPayments: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
  totalCollected: number;
  thisMonthCollections: number;
}

export type PaymentSortOption =
  | "recently_paid"
  | "oldest"
  | "highest_amount"
  | "lowest_amount"
  | "client_asc";

export const PAYMENT_METHOD_LIST: PaymentMethod[] = [
  "Bank Transfer",
  "UPI",
  "Cash",
  "Credit Card",
  "Debit Card",
  "Other",
];

export const PAYMENT_STATUS_LIST: PaymentStatus[] = [
  "Completed",
  "Pending",
  "Failed",
  "Refunded",
];
