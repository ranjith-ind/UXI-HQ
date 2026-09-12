export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "Admin" | "Manager" | "Developer";
export type ClientStatus = "Lead" | "Active" | "Inactive" | "Completed";
export type ClientSource =
  | "Referral"
  | "Instagram"
  | "WhatsApp"
  | "Website"
  | "LinkedIn"
  | "Direct Contact"
  | "Other";

export type ProjectStatus =
  | "Lead"
  | "Discussion"
  | "Confirmed"
  | "Designing"
  | "Development"
  | "Testing"
  | "Client Review"
  | "Delivered"
  | "Completed"
  | "On Hold"
  | "Cancelled";

export type ProjectPriority = "Low" | "Medium" | "High" | "Urgent";
export type ProjectType =
  | "Business Website"
  | "Portfolio Website"
  | "E-Commerce Website"
  | "Landing Page"
  | "Web Application"
  | "Admin Dashboard"
  | "SaaS Platform"
  | "Custom Software"
  | "UI/UX Design"
  | "Website Redesign"
  | "Maintenance"
  | "Other";

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type PaymentStatus = "pending" | "paid" | "overdue" | "cancelled";
export type ExpenseCategory = "software" | "infrastructure" | "marketing" | "hardware" | "contractor" | "office" | "other";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          role: UserRole;
          avatar_url: string | null;
          bio: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          role?: UserRole;
          avatar_url?: string | null;
          bio?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          role?: UserRole;
          avatar_url?: string | null;
          bio?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      team_members: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          email: string;
          role: UserRole;
          title: string;
          specialization: string[];
          is_founder: boolean;
          joined_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          email: string;
          role: UserRole;
          title: string;
          specialization?: string[];
          is_founder?: boolean;
          joined_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          email?: string;
          role?: UserRole;
          title?: string;
          specialization?: string[];
          is_founder?: boolean;
          joined_at?: string;
          created_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          full_name: string;
          company_name: string | null;
          email: string | null;
          phone: string | null;
          whatsapp_number: string | null;
          location: string | null;
          website: string | null;
          client_status: ClientStatus;
          source: ClientSource;
          notes: string | null;
          avatar_url: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          company_name?: string | null;
          email?: string | null;
          phone?: string | null;
          whatsapp_number?: string | null;
          location?: string | null;
          website?: string | null;
          client_status?: ClientStatus;
          source?: ClientSource;
          notes?: string | null;
          avatar_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          company_name?: string | null;
          email?: string | null;
          phone?: string | null;
          whatsapp_number?: string | null;
          location?: string | null;
          website?: string | null;
          client_status?: ClientStatus;
          source?: ClientSource;
          notes?: string | null;
          avatar_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          client_id: string;
          project_name: string;
          project_code: string;
          project_type: ProjectType;
          description: string | null;
          requirements: string | null;
          project_status: ProjectStatus;
          priority: ProjectPriority;
          estimated_budget: number;
          final_budget: number;
          currency: string;
          advance_amount: number;
          total_paid_amount: number;
          pending_amount: number;
          start_date: string | null;
          estimated_deadline: string | null;
          actual_completion_date: string | null;
          project_url: string | null;
          repository_url: string | null;
          project_notes: string | null;
          is_archived: boolean;
          archived_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          project_name: string;
          project_code: string;
          project_type?: ProjectType;
          description?: string | null;
          requirements?: string | null;
          project_status?: ProjectStatus;
          priority?: ProjectPriority;
          estimated_budget?: number;
          final_budget?: number;
          currency?: string;
          advance_amount?: number;
          total_paid_amount?: number;
          pending_amount?: number;
          start_date?: string | null;
          estimated_deadline?: string | null;
          actual_completion_date?: string | null;
          project_url?: string | null;
          repository_url?: string | null;
          project_notes?: string | null;
          is_archived?: boolean;
          archived_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          project_name?: string;
          project_code?: string;
          project_type?: ProjectType;
          description?: string | null;
          requirements?: string | null;
          project_status?: ProjectStatus;
          priority?: ProjectPriority;
          estimated_budget?: number;
          final_budget?: number;
          currency?: string;
          advance_amount?: number;
          total_paid_amount?: number;
          pending_amount?: number;
          start_date?: string | null;
          estimated_deadline?: string | null;
          actual_completion_date?: string | null;
          project_url?: string | null;
          repository_url?: string | null;
          project_notes?: string | null;
          is_archived?: boolean;
          archived_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      project_members: {
        Row: {
          id: string;
          project_id: string;
          team_member_id: string | null;
          user_id: string | null;
          role_in_project: string | null;
          assigned_at: string;
          assigned_by: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          team_member_id?: string | null;
          user_id?: string | null;
          role_in_project?: string | null;
          assigned_at?: string;
          assigned_by?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          team_member_id?: string | null;
          user_id?: string | null;
          role_in_project?: string | null;
          assigned_at?: string;
          assigned_by?: string | null;
        };
      };
      tasks: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string | null;
          status: TaskStatus;
          priority: TaskPriority;
          assigned_to: string | null;
          due_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string | null;
          status?: TaskStatus;
          priority?: TaskPriority;
          assigned_to?: string | null;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          description?: string | null;
          status?: TaskStatus;
          priority?: TaskPriority;
          assigned_to?: string | null;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          project_id: string | null;
          client_id: string | null;
          invoice_number: string;
          amount: number;
          currency: string;
          status: PaymentStatus;
          due_date: string;
          payment_date: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          client_id?: string | null;
          invoice_number: string;
          amount: number;
          currency?: string;
          status?: PaymentStatus;
          due_date: string;
          payment_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          client_id?: string | null;
          invoice_number?: string;
          amount?: number;
          currency?: string;
          status?: PaymentStatus;
          due_date?: string;
          payment_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          title: string;
          amount: number;
          currency: string;
          category: ExpenseCategory;
          logged_by: string | null;
          expense_date: string;
          description: string | null;
          receipt_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          amount: number;
          currency?: string;
          category?: ExpenseCategory;
          logged_by?: string | null;
          expense_date?: string;
          description?: string | null;
          receipt_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          amount?: number;
          currency?: string;
          category?: ExpenseCategory;
          logged_by?: string | null;
          expense_date?: string;
          description?: string | null;
          receipt_url?: string | null;
          created_at?: string;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string | null;
          actor_name: string;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          actor_name: string;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          actor_name?: string;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
      };
      project_credentials: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          credential_type: string;
          url: string | null;
          username: string | null;
          encrypted_password: string | null;
          notes: string | null;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          credential_type: string;
          url?: string | null;
          username?: string | null;
          encrypted_password?: string | null;
          notes?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          credential_type?: string;
          url?: string | null;
          username?: string | null;
          encrypted_password?: string | null;
          notes?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      credential_custom_fields: {
        Row: {
          id: string;
          credential_id: string;
          field_name: string;
          field_value: string;
          is_sensitive: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          credential_id: string;
          field_name: string;
          field_value: string;
          is_sensitive?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          credential_id?: string;
          field_name?: string;
          field_value?: string;
          is_sensitive?: boolean;
          created_at?: string;
        };
      };
      credential_activity_logs: {
        Row: {
          id: string;
          credential_id: string;
          user_id: string | null;
          user_name: string;
          action: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          credential_id: string;
          user_id?: string | null;
          user_name: string;
          action: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          credential_id?: string;
          user_id?: string | null;
          user_name?: string;
          action?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
