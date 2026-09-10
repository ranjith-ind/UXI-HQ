import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  Payment,
  PaymentFormData,
  PaymentMethod,
  PaymentSortOption,
  PaymentStats,
  PaymentStatus,
  PaymentWithDetails,
} from "@/types/payment";
import { ClientService } from "./client.service";
import { ProjectService } from "./project.service";
import { InvoiceService } from "./invoice.service";

const LOCAL_PAYMENTS_KEY = "uxi_payments_store";
const LOCAL_INVOICES_KEY = "uxi_invoices_store";

export const INITIAL_PAYMENTS: Payment[] = [];


export class PaymentService {
  private static getLocalPayments(): Payment[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(LOCAL_PAYMENTS_KEY);
      if (stored) return JSON.parse(stored);
      return [];
    } catch {
      return [];
    }
  }

  private static saveLocalPayments(payments: Payment[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LOCAL_PAYMENTS_KEY, JSON.stringify(payments));
    } catch (err) {
      console.error("Failed to save local payments:", err);
    }
  }

  static async getPayments(params?: {
    search?: string;
    status?: PaymentStatus | "All";
    method?: PaymentMethod | "All";
    clientId?: string;
    projectId?: string;
    invoiceId?: string;
    sortBy?: PaymentSortOption;
  }): Promise<PaymentWithDetails[]> {
    let rawPayments: Payment[] = [];

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        let query = supabase.from("payments").select("*");

        if (params?.status && params.status !== "All") {
          query = query.eq("payment_status", params.status);
        }
        if (params?.method && params.method !== "All") {
          query = query.eq("payment_method", params.method);
        }
        if (params?.clientId) {
          query = query.eq("client_id", params.clientId);
        }
        if (params?.projectId) {
          query = query.eq("project_id", params.projectId);
        }
        if (params?.invoiceId) {
          query = query.eq("invoice_id", params.invoiceId);
        }

        const { data, error } = await query;
        if (error || !data) {
          rawPayments = this.getLocalPayments();
        } else {
          rawPayments = data as unknown as Payment[];
        }
      } catch {
        rawPayments = this.getLocalPayments();
      }
    } else {
      rawPayments = this.getLocalPayments();
      if (params?.status && params.status !== "All") {
        rawPayments = rawPayments.filter((p) => p.payment_status === params.status);
      }
      if (params?.method && params.method !== "All") {
        rawPayments = rawPayments.filter((p) => p.payment_method === params.method);
      }
      if (params?.clientId) {
        rawPayments = rawPayments.filter((p) => p.client_id === params.clientId);
      }
      if (params?.projectId) {
        rawPayments = rawPayments.filter((p) => p.project_id === params.projectId);
      }
      if (params?.invoiceId) {
        rawPayments = rawPayments.filter((p) => p.invoice_id === params.invoiceId);
      }
    }

    const [clients, projects, invoices] = await Promise.all([
      ClientService.getClients(),
      ProjectService.getProjects({ isArchived: false }),
      InvoiceService.getInvoices(),
    ]);

    let detailedPayments: PaymentWithDetails[] = rawPayments.map((p) => {
      const client = clients.find((c) => c.id === p.client_id);
      const project = projects.find((proj) => proj.id === p.project_id);
      const invoice = invoices.find((inv) => inv.id === p.invoice_id);

      return {
        ...p,
        client_name: client?.full_name || "Enterprise Client",
        client_company: client?.company_name || client?.full_name || "Enterprise Client",
        client_email: client?.email || "billing@client.com",
        project_name: project?.project_name || null,
        project_code: project?.project_code || null,
        invoice_number: invoice?.invoice_number || null,
        invoice_title: invoice?.invoice_title || null,
      };
    });

    // Search filter
    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      detailedPayments = detailedPayments.filter(
        (p) =>
          p.client_name.toLowerCase().includes(q) ||
          p.client_company.toLowerCase().includes(q) ||
          (p.project_name && p.project_name.toLowerCase().includes(q)) ||
          (p.project_code && p.project_code.toLowerCase().includes(q)) ||
          (p.invoice_number && p.invoice_number.toLowerCase().includes(q)) ||
          (p.transaction_reference && p.transaction_reference.toLowerCase().includes(q))
      );
    }

    // Sorting
    const sort = params?.sortBy || "recently_paid";
    detailedPayments.sort((a, b) => {
      if (sort === "oldest") return new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime();
      if (sort === "highest_amount") return b.amount - a.amount;
      if (sort === "lowest_amount") return a.amount - b.amount;
      if (sort === "client_asc") return a.client_company.localeCompare(b.client_company);
      return new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime();
    });

    return detailedPayments;
  }

  static async getPaymentById(id: string): Promise<PaymentWithDetails | null> {
    const all = await this.getPayments();
    return all.find((p) => p.id === id) || null;
  }

  static async getStats(): Promise<PaymentStats> {
    const payments = await this.getPayments();
    const completed = payments.filter((p) => p.payment_status === "Completed");
    const totalCollected = completed.reduce((sum, p) => sum + Number(p.amount), 0);

    const thisMonth = new Date().toISOString().substring(0, 7);
    const thisMonthCollections = completed
      .filter((p) => p.payment_date.startsWith(thisMonth))
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      totalPayments: payments.length,
      completedPayments: completed.length,
      pendingPayments: payments.filter((p) => p.payment_status === "Pending").length,
      failedPayments: payments.filter((p) => p.payment_status === "Failed").length,
      totalCollected,
      thisMonthCollections,
    };
  }

  static async recordPayment(
    data: PaymentFormData,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; payment?: Payment; error?: string }> {
    const amount = Number(data.amount);
    if (!amount || amount <= 0) {
      return { success: false, error: "Payment amount must be greater than zero." };
    }

    let invoice = data.invoice_id ? await InvoiceService.getInvoiceById(data.invoice_id) : null;

    if (invoice) {
      if (amount > invoice.amount_due && invoice.amount_due > 0) {
        return {
          success: false,
          error: `Payment amount (₹${amount.toLocaleString()}) exceeds invoice balance due (₹${invoice.amount_due.toLocaleString()}).`,
        };
      }
    }

    const newPayment: Payment = {
      id: "pay-" + Math.random().toString(36).substring(2, 9) + Date.now(),
      invoice_id: data.invoice_id || null,
      client_id: data.client_id,
      project_id: data.project_id || (invoice?.project_id || null),
      amount,
      payment_date: data.payment_date || new Date().toISOString().split("T")[0],
      payment_method: data.payment_method || "Bank Transfer",
      transaction_reference: data.transaction_reference?.trim() || null,
      payment_status: data.payment_status || "Completed",
      notes: data.notes?.trim() || null,
      recorded_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: authData } = await supabase.auth.getUser();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: inserted, error } = await (supabase.from("payments") as any)
          .insert({
            invoice_id: newPayment.invoice_id,
            client_id: newPayment.client_id,
            project_id: newPayment.project_id,
            amount: newPayment.amount,
            payment_date: newPayment.payment_date,
            payment_method: newPayment.payment_method,
            transaction_reference: newPayment.transaction_reference,
            payment_status: newPayment.payment_status,
            notes: newPayment.notes,
            recorded_by: authData?.user?.id || null,
          })
          .select()
          .single();

        if (error) return { success: false, error: error.message };
        const payment = inserted as unknown as Payment;

        // Recalculate attached invoice & project
        await this.syncInvoiceAndProjectTotals(payment);

        await ClientService.logActivity(
          actorName,
          `recorded ₹${amount.toLocaleString()} payment for`,
          invoice?.invoice_number || "Client Account",
          payment.id
        );

        return { success: true, payment };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to record payment";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalPayments();
      local.unshift(newPayment);
      this.saveLocalPayments(local);

      await this.syncInvoiceAndProjectTotals(newPayment);

      await ClientService.logActivity(
        actorName,
        `recorded ₹${amount.toLocaleString()} payment for`,
        invoice?.invoice_number || "Client Account",
        newPayment.id
      );

      return { success: true, payment: newPayment };
    }
  }

  static async updatePayment(
    id: string,
    data: Partial<PaymentFormData>,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; error?: string }> {
    const existing = await this.getPaymentById(id);
    if (!existing) return { success: false, error: "Payment not found" };

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from("payments") as any)
          .update({
            ...(data.amount !== undefined ? { amount: Number(data.amount) } : {}),
            ...(data.payment_date ? { payment_date: data.payment_date } : {}),
            ...(data.payment_method ? { payment_method: data.payment_method } : {}),
            ...(data.payment_status ? { payment_status: data.payment_status } : {}),
            ...(data.transaction_reference !== undefined ? { transaction_reference: data.transaction_reference } : {}),
            ...(data.notes !== undefined ? { notes: data.notes } : {}),
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);
        if (error) return { success: false, error: error.message };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to update payment";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalPayments();
      const idx = local.findIndex((p) => p.id === id);
      if (idx !== -1) {
        local[idx] = {
          ...local[idx],
          ...data,
          amount: data.amount !== undefined ? Number(data.amount) : local[idx].amount,
          updated_at: new Date().toISOString(),
        };
        this.saveLocalPayments(local);
      }
    }

    const updated = await this.getPaymentById(id);
    if (updated) {
      await this.syncInvoiceAndProjectTotals(updated);
    }

    await ClientService.logActivity(actorName, "updated payment record", `₹${existing.amount.toLocaleString()}`, id);
    return { success: true };
  }

  static async deletePayment(
    id: string,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; error?: string }> {
    const existing = await this.getPaymentById(id);
    if (!existing) return { success: false, error: "Payment not found" };

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from("payments").delete().eq("id", id);
        if (error) return { success: false, error: error.message };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to delete payment";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalPayments().filter((p) => p.id !== id);
      this.saveLocalPayments(local);
    }

    // Recalculate invoice & project
    if (existing.invoice_id) {
      await this.recalculateInvoiceBalance(existing.invoice_id);
    }
    if (existing.project_id) {
      await this.recalculateProjectFinances(existing.project_id);
    }

    await ClientService.logActivity(actorName, "deleted payment record", `₹${existing.amount.toLocaleString()}`, id);
    return { success: true };
  }

  private static async syncInvoiceAndProjectTotals(payment: Payment) {
    if (payment.invoice_id) {
      await this.recalculateInvoiceBalance(payment.invoice_id);
    }
    if (payment.project_id) {
      await this.recalculateProjectFinances(payment.project_id);
    }
  }

  private static async recalculateInvoiceBalance(invoiceId: string) {
    const allPayments = this.getLocalPayments();
    const invoicePayments = allPayments.filter(
      (p) => p.invoice_id === invoiceId && p.payment_status === "Completed"
    );
    const totalPaid = invoicePayments.reduce((sum, p) => sum + Number(p.amount), 0);

    const storedInvoices = localStorage.getItem(LOCAL_INVOICES_KEY);
    if (storedInvoices) {
      const invoices: any[] = JSON.parse(storedInvoices);
      const idx = invoices.findIndex((i) => i.id === invoiceId);
      if (idx !== -1) {
        const totalAmount = Number(invoices[idx].total_amount);
        const amountDue = Math.max(0, totalAmount - totalPaid);
        let status = invoices[idx].invoice_status;

        if (totalPaid >= totalAmount && totalAmount > 0) {
          status = "Paid";
        } else if (totalPaid > 0) {
          status = "Partially Paid";
        }

        invoices[idx].amount_paid = totalPaid;
        invoices[idx].amount_due = amountDue;
        invoices[idx].invoice_status = status;
        invoices[idx].paid_at = status === "Paid" ? new Date().toISOString() : null;
        invoices[idx].updated_at = new Date().toISOString();

        localStorage.setItem(LOCAL_INVOICES_KEY, JSON.stringify(invoices));
      }
    }
  }

  private static async recalculateProjectFinances(projectId: string) {
    const allPayments = this.getLocalPayments();
    const projectPayments = allPayments.filter(
      (p) => p.project_id === projectId && p.payment_status === "Completed"
    );
    const totalPaid = projectPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    const storedProjects = localStorage.getItem("uxi_projects_store");
    if (storedProjects) {
      const projects: any[] = JSON.parse(storedProjects);
      const idx = projects.findIndex((p) => p.id === projectId);
      if (idx !== -1) {
        const finalBudget = Number(projects[idx].final_budget || 0);
        projects[idx].total_paid_amount = totalPaid;
        projects[idx].pending_amount = Math.max(0, finalBudget - totalPaid);
        projects[idx].updated_at = new Date().toISOString();
        localStorage.setItem("uxi_projects_store", JSON.stringify(projects));
      }
    }
  }
}
