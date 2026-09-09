import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  DEFAULT_EXPENSE_CATEGORIES,
  Expense,
  ExpenseCategory,
  ExpenseCategoryStats,
  ExpenseDateFilter,
  ExpenseFormData,
  ExpensePaymentStatus,
  ExpenseSortOption,
  ExpenseStats,
  ExpenseWithDetails,
  RecurringFrequency,
} from "@/types/expense";
import { ClientService } from "./client.service";
import { ProjectService } from "./project.service";

const LOCAL_EXPENSES_KEY = "uxi_expenses_store";
const LOCAL_CATEGORIES_KEY = "uxi_expense_categories_store";

export const INITIAL_EXPENSE_CATEGORIES: ExpenseCategory[] = DEFAULT_EXPENSE_CATEGORIES.map(
  (name, idx) => ({
    id: `cat-${idx + 1}`,
    name,
    description: `Company expenditures related to ${name.toLowerCase()}`,
    icon: "Receipt",
    is_active: true,
    created_at: "2026-08-01T00:00:00Z",
  })
);

export const INITIAL_EXPENSES: Expense[] = [];

export class ExpenseService {
  private static getLocalExpenses(): Expense[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(LOCAL_EXPENSES_KEY);
      if (stored) return JSON.parse(stored);
      return [];
    } catch {
      return [];
    }
  }


  private static saveLocalExpenses(expenses: Expense[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LOCAL_EXPENSES_KEY, JSON.stringify(expenses));
    } catch (err) {
      console.error("Failed to save local expenses:", err);
    }
  }

  private static getLocalCategories(): ExpenseCategory[] {
    if (typeof window === "undefined") return INITIAL_EXPENSE_CATEGORIES;
    try {
      const stored = localStorage.getItem(LOCAL_CATEGORIES_KEY);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(INITIAL_EXPENSE_CATEGORIES));
      return INITIAL_EXPENSE_CATEGORIES;
    } catch {
      return INITIAL_EXPENSE_CATEGORIES;
    }
  }

  private static saveLocalCategories(categories: ExpenseCategory[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(categories));
    } catch (err) {
      console.error("Failed to save local expense categories:", err);
    }
  }

  static async generateExpenseNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const all = await this.getExpenses();
    const yearExpenses = all.filter((exp) => exp.expense_number.includes(`UXI-EXP-${year}`));
    const nextSeq = yearExpenses.length + 1;
    const padded = nextSeq.toString().padStart(3, "0");
    return `UXI-EXP-${year}-${padded}`;
  }

  static async getCategories(): Promise<ExpenseCategory[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from("expense_categories").select("*").order("name");
        if (error || !data || data.length === 0) {
          return this.getLocalCategories();
        }
        return data as unknown as ExpenseCategory[];
      } catch {
        return this.getLocalCategories();
      }
    }
    return this.getLocalCategories();
  }

  static async createCategory(
    name: string,
    description?: string,
    icon?: string
  ): Promise<{ success: boolean; category?: ExpenseCategory; error?: string }> {
    const newCat: ExpenseCategory = {
      id: "cat-" + Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      description: description?.trim() || null,
      icon: icon || "Receipt",
      is_active: true,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from("expense_categories") as any)
          .insert(newCat)
          .select()
          .single();
        if (error) return { success: false, error: error.message };
        return { success: true, category: data as unknown as ExpenseCategory };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to create category";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalCategories();
      local.push(newCat);
      this.saveLocalCategories(local);
      return { success: true, category: newCat };
    }
  }

  static async updateCategory(
    id: string,
    data: Partial<ExpenseCategory>
  ): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from("expense_categories") as any)
          .update(data)
          .eq("id", id);
        if (error) return { success: false, error: error.message };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to update category";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalCategories();
      const idx = local.findIndex((c) => c.id === id);
      if (idx !== -1) {
        local[idx] = { ...local[idx], ...data };
        this.saveLocalCategories(local);
      }
    }
    return { success: true };
  }

  static async getExpenses(params?: {
    search?: string;
    status?: ExpensePaymentStatus | "All";
    category?: string | "All";
    projectId?: string;
    clientId?: string;
    isRecurring?: boolean;
    dateFilter?: ExpenseDateFilter;
    sortBy?: ExpenseSortOption;
  }): Promise<ExpenseWithDetails[]> {
    let rawExpenses: Expense[] = [];

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        let query = supabase.from("expenses").select("*");

        if (params?.status && params.status !== "All") {
          query = query.eq("payment_status", params.status);
        }
        if (params?.category && params.category !== "All") {
          query = query.eq("category_name", params.category);
        }
        if (params?.projectId) {
          query = query.eq("project_id", params.projectId);
        }
        if (params?.clientId) {
          query = query.eq("client_id", params.clientId);
        }
        if (params?.isRecurring !== undefined) {
          query = query.eq("is_recurring", params.isRecurring);
        }

        const { data, error } = await query;
        if (error) {
          console.error("Supabase expense query error:", error);
          rawExpenses = [];
        } else if (!data) {
          rawExpenses = [];
        } else {
          rawExpenses = data as unknown as Expense[];
        }
      } catch (err) {
        console.error("Supabase expense query exception:", err);
        rawExpenses = [];
      }
    } else {
      rawExpenses = this.getLocalExpenses();
      if (params?.status && params.status !== "All") {
        rawExpenses = rawExpenses.filter((e) => e.payment_status === params.status);
      }
      if (params?.category && params.category !== "All") {
        rawExpenses = rawExpenses.filter((e) => e.category_name === params.category);
      }
      if (params?.projectId) {
        rawExpenses = rawExpenses.filter((e) => e.project_id === params.projectId);
      }
      if (params?.clientId) {
        rawExpenses = rawExpenses.filter((e) => e.client_id === params.clientId);
      }
      if (params?.isRecurring !== undefined) {
        rawExpenses = rawExpenses.filter((e) => e.is_recurring === params.isRecurring);
      }
    }

    const [clients, projects, categories] = await Promise.all([
      ClientService.getClients(),
      ProjectService.getProjects({ isArchived: false }),
      this.getCategories(),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let detailed: ExpenseWithDetails[] = rawExpenses.map((exp) => {
      const client = clients.find((c) => c.id === exp.client_id);
      const project = projects.find((p) => p.id === exp.project_id);
      const category = categories.find((c) => c.id === exp.expense_category_id || c.name === exp.category_name);

      let isOverdue = false;
      let daysUntilDue: number | null = null;

      if (exp.due_date) {
        const dDate = new Date(exp.due_date);
        dDate.setHours(0, 0, 0, 0);
        daysUntilDue = Math.ceil((dDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilDue < 0 && exp.payment_status === "Pending") {
          isOverdue = true;
          exp.payment_status = "Overdue";
        }
      }

      return {
        ...exp,
        category_description: category?.description || null,
        project_name: project?.project_name || null,
        project_code: project?.project_code || null,
        client_name: client?.full_name || null,
        client_company: client?.company_name || client?.full_name || null,
        is_overdue: isOverdue,
        days_until_due: daysUntilDue,
      };
    });

    // Date range filter
    if (params?.dateFilter && params.dateFilter !== "all") {
      const now = new Date();
      const currentMonth = now.toISOString().substring(0, 7);
      const currentYear = now.getFullYear().toString();

      if (params.dateFilter === "this_month") {
        detailed = detailed.filter((e) => e.expense_date.startsWith(currentMonth));
      } else if (params.dateFilter === "this_year") {
        detailed = detailed.filter((e) => e.expense_date.startsWith(currentYear));
      } else if (params.dateFilter === "last_month") {
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthStr = lastMonthDate.toISOString().substring(0, 7);
        detailed = detailed.filter((e) => e.expense_date.startsWith(lastMonthStr));
      } else if (params.dateFilter === "this_quarter") {
        const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
        const qStart = new Date(now.getFullYear(), quarterMonth, 1);
        detailed = detailed.filter((e) => new Date(e.expense_date) >= qStart);
      }
    }

    // Search query
    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      detailed = detailed.filter(
        (e) =>
          e.expense_number.toLowerCase().includes(q) ||
          e.expense_title.toLowerCase().includes(q) ||
          e.category_name.toLowerCase().includes(q) ||
          (e.vendor_name && e.vendor_name.toLowerCase().includes(q)) ||
          (e.project_name && e.project_name.toLowerCase().includes(q)) ||
          (e.project_code && e.project_code.toLowerCase().includes(q)) ||
          (e.client_company && e.client_company.toLowerCase().includes(q))
      );
    }

    // Sorting
    const sort = params?.sortBy || "recently_created";
    detailed.sort((a, b) => {
      if (sort === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sort === "highest_amount") return b.amount - a.amount;
      if (sort === "lowest_amount") return a.amount - b.amount;
      if (sort === "expense_date_newest") return new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime();
      if (sort === "expense_date_oldest") return new Date(a.expense_date).getTime() - new Date(b.expense_date).getTime();
      if (sort === "due_date_nearest") {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return detailed;
  }

  static async getExpenseById(id: string): Promise<ExpenseWithDetails | null> {
    const all = await this.getExpenses();
    return all.find((e) => e.id === id) || null;
  }

  static async getExpenseStats(): Promise<ExpenseStats> {
    const expenses = await this.getExpenses();
    const paidExpenses = expenses.filter((e) => e.payment_status === "Paid");
    const totalExpenses = paidExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

    const now = new Date();
    const currentMonth = now.toISOString().substring(0, 7);
    const currentYear = now.getFullYear().toString();

    const paidThisMonth = paidExpenses
      .filter((e) => e.expense_date.startsWith(currentMonth))
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const paidThisYear = paidExpenses
      .filter((e) => e.expense_date.startsWith(currentYear))
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const pendingExpenses = expenses.filter((e) => e.payment_status === "Pending");
    const pendingAmount = pendingExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

    const overdueExpenses = expenses.filter((e) => e.is_overdue || e.payment_status === "Overdue");
    const overdueAmount = overdueExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

    const categories = await this.getCategories();
    const recurringCount = expenses.filter((e) => e.is_recurring).length;

    return {
      totalExpenses,
      paidThisMonth,
      paidThisYear,
      pendingAmount,
      overdueAmount,
      activeCategoriesCount: categories.filter((c) => c.is_active).length,
      recurringExpensesCount: recurringCount,
    };
  }

  static async getCategoryStats(): Promise<ExpenseCategoryStats[]> {
    const [categories, expenses] = await Promise.all([
      this.getCategories(),
      this.getExpenses(),
    ]);

    const paidExpenses = expenses.filter((e) => e.payment_status === "Paid");
    const totalSpending = paidExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

    return categories.map((cat) => {
      const catExpenses = paidExpenses.filter(
        (e) => e.expense_category_id === cat.id || e.category_name === cat.name
      );
      const spending = catExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const percentage = totalSpending > 0 ? Math.round((spending / totalSpending) * 100) : 0;

      return {
        id: cat.id,
        name: cat.name,
        description: cat.description,
        expenseCount: catExpenses.length,
        totalSpending: spending,
        percentage,
        is_active: cat.is_active,
      };
    }).sort((a, b) => b.totalSpending - a.totalSpending);
  }

  static async createExpense(
    data: ExpenseFormData,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; expense?: Expense; error?: string }> {
    const expenseNumber = await this.generateExpenseNumber();

    const newExpense: Expense = {
      id: "exp-" + Math.random().toString(36).substring(2, 9) + Date.now(),
      expense_number: expenseNumber,
      expense_title: data.expense_title.trim(),
      description: data.description?.trim() || null,
      expense_category_id: data.expense_category_id || null,
      category_name: data.category_name || "Miscellaneous",
      project_id: data.project_id || null,
      client_id: data.client_id || null,
      vendor_name: data.vendor_name?.trim() || null,
      vendor_contact: data.vendor_contact?.trim() || null,
      amount: Number(data.amount) || 0,
      expense_date: data.expense_date || new Date().toISOString().split("T")[0],
      due_date: data.due_date || null,
      payment_status: data.payment_status || "Paid",
      payment_method: data.payment_method || "Bank Transfer",
      transaction_reference: data.transaction_reference?.trim() || null,
      receipt_url: data.receipt_url?.trim() || null,
      is_recurring: !!data.is_recurring,
      recurring_frequency: data.is_recurring ? data.recurring_frequency || "Monthly" : null,
      next_recurring_date: data.is_recurring ? data.next_recurring_date || null : null,
      notes: data.notes?.trim() || null,
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: inserted, error } = await (supabase.from("expenses") as any)
          .insert(newExpense)
          .select()
          .single();
        if (error) return { success: false, error: error.message };

        await ClientService.logActivity(
          actorName,
          `recorded expense ₹${newExpense.amount.toLocaleString()} for`,
          newExpense.expense_title,
          newExpense.id
        );

        return { success: true, expense: inserted as unknown as Expense };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to record expense";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalExpenses();
      local.unshift(newExpense);
      this.saveLocalExpenses(local);

      await ClientService.logActivity(
        actorName,
        `recorded expense ₹${newExpense.amount.toLocaleString()} for`,
        newExpense.expense_title,
        newExpense.id
      );

      return { success: true, expense: newExpense };
    }
  }

  static async updateExpense(
    id: string,
    data: Partial<ExpenseFormData>,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; error?: string }> {
    const existing = await this.getExpenseById(id);
    if (!existing) return { success: false, error: "Expense not found" };

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from("expenses") as any)
          .update({
            ...data,
            amount: data.amount !== undefined ? Number(data.amount) : existing.amount,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);
        if (error) return { success: false, error: error.message };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to update expense";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalExpenses();
      const idx = local.findIndex((e) => e.id === id);
      if (idx !== -1) {
        local[idx] = {
          ...local[idx],
          ...data,
          amount: data.amount !== undefined ? Number(data.amount) : local[idx].amount,
          updated_at: new Date().toISOString(),
        };
        this.saveLocalExpenses(local);
      }
    }

    await ClientService.logActivity(actorName, "updated expense", existing.expense_number, id);
    return { success: true };
  }

  static async markExpensePaid(
    id: string,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; error?: string }> {
    const existing = await this.getExpenseById(id);
    if (!existing) return { success: false, error: "Expense not found" };

    return this.updateExpense(id, { payment_status: "Paid" }, actorName);
  }

  static async deleteExpense(
    id: string,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; error?: string }> {
    const existing = await this.getExpenseById(id);
    const expNum = existing?.expense_number || "Expense";

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from("expenses").delete().eq("id", id);
        if (error) return { success: false, error: error.message };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to delete expense";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalExpenses().filter((e) => e.id !== id);
      this.saveLocalExpenses(local);
    }

    await ClientService.logActivity(actorName, "deleted expense record", expNum, id);
    return { success: true };
  }

  static async generateRecurringExpense(
    templateId: string,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; newExpense?: Expense; error?: string }> {
    const template = await this.getExpenseById(templateId);
    if (!template) return { success: false, error: "Template expense not found" };
    if (!template.is_recurring) return { success: false, error: "Expense is not marked as recurring" };

    // Advance next recurring date based on frequency
    const curNextDate = template.next_recurring_date ? new Date(template.next_recurring_date) : new Date();
    const nextDate = new Date(curNextDate);

    const freq = template.recurring_frequency || "Monthly";
    if (freq === "Weekly") nextDate.setDate(nextDate.getDate() + 7);
    else if (freq === "Monthly") nextDate.setMonth(nextDate.getMonth() + 1);
    else if (freq === "Quarterly") nextDate.setMonth(nextDate.getMonth() + 3);
    else if (freq === "Yearly") nextDate.setFullYear(nextDate.getFullYear() + 1);

    const updatedNextStr = nextDate.toISOString().split("T")[0];

    // Create the new entry for current cycle
    const res = await this.createExpense(
      {
        expense_title: template.expense_title,
        description: `Recurring renewal: ${template.description || ""}`.trim(),
        expense_category_id: template.expense_category_id || undefined,
        category_name: template.category_name,
        project_id: template.project_id || undefined,
        client_id: template.client_id || undefined,
        vendor_name: template.vendor_name || undefined,
        vendor_contact: template.vendor_contact || undefined,
        amount: template.amount,
        expense_date: new Date().toISOString().split("T")[0],
        due_date: new Date().toISOString().split("T")[0],
        payment_status: "Paid",
        payment_method: template.payment_method,
        transaction_reference: template.transaction_reference || undefined,
        is_recurring: false,
        notes: `Generated from recurring template ${template.expense_number}`,
      },
      actorName
    );

    if (res.success) {
      // Update template's next recurring date
      await this.updateExpense(
        templateId,
        { next_recurring_date: updatedNextStr },
        actorName
      );
    }

    return res;
  }
}
