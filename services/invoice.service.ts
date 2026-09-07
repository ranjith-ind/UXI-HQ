import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  Invoice,
  InvoiceDueFilter,
  InvoiceFormData,
  InvoiceItem,
  InvoiceSortOption,
  InvoiceStats,
  InvoiceStatus,
  InvoiceType,
  InvoiceWithDetails,
} from "@/types/invoice";
import { ClientService } from "./client.service";
import { ProjectService } from "./project.service";

const LOCAL_INVOICES_KEY = "uxi_invoices_store";
const LOCAL_INVOICE_ITEMS_KEY = "uxi_invoice_items_store";

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: "inv-1",
    invoice_number: "UXI-INV-2026-001",
    client_id: "client-1",
    project_id: "proj-1",
    invoice_title: "FinPulse Platform Kickoff & Sprint 1 Advance",
    description: "Initial 50% advance milestone for system architecture, OAuth2 infrastructure, and core API integration.",
    invoice_type: "Advance",
    invoice_status: "Paid",
    subtotal: 250000,
    discount_amount: 0,
    tax_amount: 0,
    total_amount: 250000,
    amount_paid: 250000,
    amount_due: 0,
    issue_date: "2026-08-01",
    due_date: "2026-08-10",
    sent_at: "2026-08-01T10:00:00Z",
    paid_at: "2026-08-05T14:30:00Z",
    notes: "Payment received in full via HDFC Bank Wire Transfer.",
    created_by: "f1-ranjith-uuid",
    created_at: "2026-08-01T09:00:00Z",
    updated_at: "2026-08-05T14:30:00Z",
  },
  {
    id: "inv-2",
    invoice_number: "UXI-INV-2026-002",
    client_id: "client-2",
    project_id: "proj-2",
    invoice_title: "Aura Living Headless Storefront 50% Kickoff Advance",
    description: "Phase 1 advance invoice covering Shopify Plus architecture, Three.js 3D viewer, and checkout prototype.",
    invoice_type: "Advance",
    invoice_status: "Paid",
    subtotal: 175000,
    discount_amount: 0,
    tax_amount: 0,
    total_amount: 175000,
    amount_paid: 175000,
    amount_due: 0,
    issue_date: "2026-08-05",
    due_date: "2026-08-15",
    sent_at: "2026-08-05T11:00:00Z",
    paid_at: "2026-08-09T16:00:00Z",
    notes: "Settled via ICICI Bank Corporate Transfer.",
    created_by: "f1-ranjith-uuid",
    created_at: "2026-08-05T10:00:00Z",
    updated_at: "2026-08-09T16:00:00Z",
  },
  {
    id: "inv-3",
    invoice_number: "UXI-INV-2026-003",
    client_id: "client-2",
    project_id: "proj-2",
    invoice_title: "Aura Living Final Delivery & Staging Signoff",
    description: "Remaining 50% balance milestone for production deployment and headless Shopify go-live.",
    invoice_type: "Final Payment",
    invoice_status: "Sent",
    subtotal: 175000,
    discount_amount: 0,
    tax_amount: 0,
    total_amount: 175000,
    amount_paid: 0,
    amount_due: 175000,
    issue_date: "2026-08-25",
    due_date: "2026-09-05",
    sent_at: "2026-08-25T14:00:00Z",
    paid_at: null,
    notes: "Invoice sent to accounts@auraliving.co.",
    created_by: "f1-ranjith-uuid",
    created_at: "2026-08-25T12:00:00Z",
    updated_at: "2026-08-25T14:00:00Z",
  },
  {
    id: "inv-4",
    invoice_number: "UXI-INV-2026-004",
    client_id: "client-3",
    project_id: "proj-3",
    invoice_title: "OmniHealth HIPAA Cloud Telehealth Advance",
    description: "Kickoff retainer for telehealth platform database schema, encryption, and doctor appointment engine.",
    invoice_type: "Advance",
    invoice_status: "Paid",
    subtotal: 300000,
    discount_amount: 0,
    tax_amount: 0,
    total_amount: 300000,
    amount_paid: 300000,
    amount_due: 0,
    issue_date: "2026-08-10",
    due_date: "2026-08-20",
    sent_at: "2026-08-10T10:00:00Z",
    paid_at: "2026-08-12T11:20:00Z",
    notes: "Wire transfer confirmed.",
    created_by: "f2-hafi-uuid",
    created_at: "2026-08-10T09:00:00Z",
    updated_at: "2026-08-12T11:20:00Z",
  },
  {
    id: "inv-5",
    invoice_number: "UXI-INV-2026-005",
    client_id: "client-4",
    project_id: "proj-4",
    invoice_title: "Nexus Global Fleet Tracking System Advance",
    description: "Milestone 1 for IoT telemetry gateway and freight dispatch dashboard.",
    invoice_type: "Advance",
    invoice_status: "Overdue",
    subtotal: 200000,
    discount_amount: 0,
    tax_amount: 0,
    total_amount: 200000,
    amount_paid: 0,
    amount_due: 200000,
    issue_date: "2026-08-15",
    due_date: "2026-08-25",
    sent_at: "2026-08-15T15:00:00Z",
    paid_at: null,
    notes: "Follow up with David Sterling regarding pending advance wire.",
    created_by: "f1-ranjith-uuid",
    created_at: "2026-08-15T14:00:00Z",
    updated_at: "2026-08-26T00:00:00Z",
  },
];

export const INITIAL_INVOICE_ITEMS: InvoiceItem[] = [
  {
    id: "item-1",
    invoice_id: "inv-1",
    item_name: "FinPulse Backend & Database Architecture",
    description: "Next.js App Router, Supabase PostgreSQL, and OAuth2 security flow",
    quantity: 1,
    unit_price: 150000,
    total: 150000,
  },
  {
    id: "item-2",
    invoice_id: "inv-1",
    item_name: "FinPulse Banking Merchant UI & Dashboard",
    description: "Tailwind CSS responsive executive banking portal",
    quantity: 1,
    unit_price: 100000,
    total: 100000,
  },
  {
    id: "item-3",
    invoice_id: "inv-2",
    item_name: "Aura Living 3D WebGL Storefront Prototyping",
    description: "Three.js luxury product customizer & mobile optimizations",
    quantity: 1,
    unit_price: 175000,
    total: 175000,
  },
  {
    id: "item-4",
    invoice_id: "inv-3",
    item_name: "Aura Living Shopify Plus Integration & Production Go-Live",
    description: "Checkout GraphQL webhooks, CDN caching, and domain setup",
    quantity: 1,
    unit_price: 175000,
    total: 175000,
  },
  {
    id: "item-5",
    invoice_id: "inv-4",
    item_name: "OmniHealth HIPAA Consultation Architecture",
    description: "Video consultation microservices & encrypted electronic health records",
    quantity: 1,
    unit_price: 300000,
    total: 300000,
  },
  {
    id: "item-6",
    invoice_id: "inv-5",
    item_name: "Nexus Global Telemetry GPS Ingestion Engine",
    description: "Real-time socket data streams and driver telemetry dispatch",
    quantity: 1,
    unit_price: 200000,
    total: 200000,
  },
];

export class InvoiceService {
  private static getLocalInvoices(): Invoice[] {
    if (typeof window === "undefined") return INITIAL_INVOICES;
    try {
      const stored = localStorage.getItem(LOCAL_INVOICES_KEY);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(LOCAL_INVOICES_KEY, JSON.stringify(INITIAL_INVOICES));
      return INITIAL_INVOICES;
    } catch {
      return INITIAL_INVOICES;
    }
  }

  private static saveLocalInvoices(invoices: Invoice[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LOCAL_INVOICES_KEY, JSON.stringify(invoices));
    } catch (err) {
      console.error("Failed to save local invoices:", err);
    }
  }

  private static getLocalInvoiceItems(): InvoiceItem[] {
    if (typeof window === "undefined") return INITIAL_INVOICE_ITEMS;
    try {
      const stored = localStorage.getItem(LOCAL_INVOICE_ITEMS_KEY);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(LOCAL_INVOICE_ITEMS_KEY, JSON.stringify(INITIAL_INVOICE_ITEMS));
      return INITIAL_INVOICE_ITEMS;
    } catch {
      return INITIAL_INVOICE_ITEMS;
    }
  }

  private static saveLocalInvoiceItems(items: InvoiceItem[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LOCAL_INVOICE_ITEMS_KEY, JSON.stringify(items));
    } catch (err) {
      console.error("Failed to save local invoice items:", err);
    }
  }

  static async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const all = await this.getInvoices();
    const yearInvoices = all.filter((inv) => inv.invoice_number.includes(`UXI-INV-${year}`));
    const nextSeq = yearInvoices.length + 1;
    const padded = nextSeq.toString().padStart(3, "0");
    return `UXI-INV-${year}-${padded}`;
  }

  static async getInvoices(params?: {
    search?: string;
    status?: InvoiceStatus | "All";
    type?: InvoiceType | "All";
    clientId?: string;
    projectId?: string;
    dueFilter?: InvoiceDueFilter;
    sortBy?: InvoiceSortOption;
  }): Promise<InvoiceWithDetails[]> {
    let rawInvoices: Invoice[] = [];

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        let query = supabase.from("invoices").select("*");

        if (params?.status && params.status !== "All") {
          query = query.eq("invoice_status", params.status);
        }
        if (params?.type && params.type !== "All") {
          query = query.eq("invoice_type", params.type);
        }
        if (params?.clientId) {
          query = query.eq("client_id", params.clientId);
        }
        if (params?.projectId) {
          query = query.eq("project_id", params.projectId);
        }

        const { data, error } = await query;
        if (error || !data) {
          rawInvoices = this.getLocalInvoices();
        } else {
          rawInvoices = data as unknown as Invoice[];
        }
      } catch {
        rawInvoices = this.getLocalInvoices();
      }
    } else {
      rawInvoices = this.getLocalInvoices();
      if (params?.status && params.status !== "All") {
        rawInvoices = rawInvoices.filter((inv) => inv.invoice_status === params.status);
      }
      if (params?.type && params.type !== "All") {
        rawInvoices = rawInvoices.filter((inv) => inv.invoice_type === params.type);
      }
      if (params?.clientId) {
        rawInvoices = rawInvoices.filter((inv) => inv.client_id === params.clientId);
      }
      if (params?.projectId) {
        rawInvoices = rawInvoices.filter((inv) => inv.project_id === params.projectId);
      }
    }

    const [clients, projects] = await Promise.all([
      ClientService.getClients(),
      ProjectService.getProjects({ isArchived: false }),
    ]);

    const allItems = this.getLocalInvoiceItems();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let detailedInvoices: InvoiceWithDetails[] = rawInvoices.map((inv) => {
      const client = clients.find((c) => c.id === inv.client_id);
      const project = projects.find((p) => p.id === inv.project_id);
      const items = allItems.filter((item) => item.invoice_id === inv.id);

      let daysUntilDue: number | null = null;
      let isOverdue = false;

      if (inv.due_date) {
        const dDate = new Date(inv.due_date);
        dDate.setHours(0, 0, 0, 0);
        daysUntilDue = Math.ceil((dDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilDue < 0 && inv.amount_due > 0 && inv.invoice_status !== "Paid" && inv.invoice_status !== "Cancelled") {
          isOverdue = true;
          // Synchronize overdue status
          if (inv.invoice_status !== "Overdue") {
            inv.invoice_status = "Overdue";
          }
        }
      }

      return {
        ...inv,
        client_name: client?.full_name || "Enterprise Client",
        client_company: client?.company_name || client?.full_name || "Enterprise Client",
        client_email: client?.email || "billing@client.com",
        client_phone: client?.phone,
        client_location: client?.location,
        project_name: project?.project_name || null,
        project_code: project?.project_code || null,
        items,
        is_overdue: isOverdue,
        days_until_due: daysUntilDue,
      };
    });

    // Due filter
    if (params?.dueFilter && params.dueFilter !== "all") {
      if (params.dueFilter === "overdue") {
        detailedInvoices = detailedInvoices.filter((i) => i.is_overdue);
      } else if (params.dueFilter === "due_soon") {
        detailedInvoices = detailedInvoices.filter(
          (i) => i.days_until_due !== null && i.days_until_due >= 0 && i.days_until_due <= 7 && i.amount_due > 0
        );
      } else if (params.dueFilter === "paid") {
        detailedInvoices = detailedInvoices.filter((i) => i.invoice_status === "Paid");
      } else if (params.dueFilter === "partially_paid") {
        detailedInvoices = detailedInvoices.filter((i) => i.invoice_status === "Partially Paid");
      }
    }

    // Search
    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      detailedInvoices = detailedInvoices.filter(
        (i) =>
          i.invoice_number.toLowerCase().includes(q) ||
          i.invoice_title.toLowerCase().includes(q) ||
          i.client_name.toLowerCase().includes(q) ||
          i.client_company.toLowerCase().includes(q) ||
          (i.project_name && i.project_name.toLowerCase().includes(q)) ||
          (i.project_code && i.project_code.toLowerCase().includes(q))
      );
    }

    // Sorting
    const sort = params?.sortBy || "recently_created";
    detailedInvoices.sort((a, b) => {
      if (sort === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sort === "highest_amount") return b.total_amount - a.total_amount;
      if (sort === "lowest_amount") return a.total_amount - b.total_amount;
      if (sort === "client_asc") return a.client_company.localeCompare(b.client_company);
      if (sort === "due_date_nearest") {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      if (sort === "due_date_furthest") {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return detailedInvoices;
  }

  static async getInvoiceById(id: string): Promise<InvoiceWithDetails | null> {
    const all = await this.getInvoices();
    return all.find((inv) => inv.id === id) || null;
  }

  static async getStats(): Promise<InvoiceStats> {
    const invoices = await this.getInvoices();
    const totalInvoiced = invoices
      .filter((i) => i.invoice_status !== "Cancelled")
      .reduce((sum, i) => sum + Number(i.total_amount), 0);
    const totalPaid = invoices
      .filter((i) => i.invoice_status !== "Cancelled")
      .reduce((sum, i) => sum + Number(i.amount_paid), 0);
    const totalDue = invoices
      .filter((i) => i.invoice_status !== "Cancelled")
      .reduce((sum, i) => sum + Number(i.amount_due), 0);

    return {
      totalInvoices: invoices.length,
      draftInvoices: invoices.filter((i) => i.invoice_status === "Draft").length,
      sentInvoices: invoices.filter((i) => i.invoice_status === "Sent").length,
      partiallyPaidInvoices: invoices.filter((i) => i.invoice_status === "Partially Paid").length,
      paidInvoices: invoices.filter((i) => i.invoice_status === "Paid").length,
      overdueInvoices: invoices.filter((i) => i.is_overdue).length,
      totalInvoicedAmount: totalInvoiced,
      totalPaidAmount: totalPaid,
      totalDueAmount: totalDue,
    };
  }

  static async createInvoice(
    data: InvoiceFormData,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; invoice?: Invoice; error?: string }> {
    const invoiceNumber = await this.generateInvoiceNumber();

    // Calculate line item totals
    const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const discount = Number(data.discount_amount) || 0;
    const tax = Number(data.tax_amount) || 0;
    const totalAmount = Math.max(0, subtotal - discount + tax);
    const amountDue = totalAmount;

    const newInvoice: Invoice = {
      id: "inv-" + Math.random().toString(36).substring(2, 9) + Date.now(),
      invoice_number: invoiceNumber,
      client_id: data.client_id,
      project_id: data.project_id || null,
      invoice_title: data.invoice_title.trim(),
      description: data.description?.trim() || null,
      invoice_type: data.invoice_type || "Milestone",
      invoice_status: data.invoice_status || "Draft",
      subtotal,
      discount_amount: discount,
      tax_amount: tax,
      total_amount: totalAmount,
      amount_paid: 0,
      amount_due: amountDue,
      issue_date: data.issue_date || new Date().toISOString().split("T")[0],
      due_date: data.due_date || null,
      sent_at: data.invoice_status === "Sent" ? new Date().toISOString() : null,
      paid_at: null,
      notes: data.notes?.trim() || null,
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: inserted, error } = await (supabase.from("invoices") as any)
          .insert(newInvoice)
          .select()
          .single();

        if (error) return { success: false, error: error.message };
        const invoice = inserted as unknown as Invoice;

        // Insert items
        if (data.items.length > 0) {
          const itemsPayload = data.items.map((it) => ({
            invoice_id: invoice.id,
            item_name: it.item_name,
            description: it.description || null,
            quantity: it.quantity,
            unit_price: it.unit_price,
            total: it.quantity * it.unit_price,
          }));
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from("invoice_items") as any).insert(itemsPayload);
        }

        await ClientService.logActivity(actorName, "created invoice", invoice.invoice_number, invoice.id);
        return { success: true, invoice };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to create invoice";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalInvoices();
      local.unshift(newInvoice);
      this.saveLocalInvoices(local);

      const allItems = this.getLocalInvoiceItems();
      data.items.forEach((it) => {
        allItems.push({
          id: "item-" + Math.random().toString(36).substring(2, 8),
          invoice_id: newInvoice.id,
          item_name: it.item_name,
          description: it.description || null,
          quantity: it.quantity,
          unit_price: it.unit_price,
          total: it.quantity * it.unit_price,
        });
      });
      this.saveLocalInvoiceItems(allItems);

      await ClientService.logActivity(actorName, "created invoice", newInvoice.invoice_number, newInvoice.id);
      return { success: true, invoice: newInvoice };
    }
  }

  static async updateInvoice(
    id: string,
    data: Partial<InvoiceFormData>,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; error?: string }> {
    const existing = await this.getInvoiceById(id);
    if (!existing) return { success: false, error: "Invoice not found" };

    let subtotal = existing.subtotal;
    let discount = data.discount_amount !== undefined ? Number(data.discount_amount) : existing.discount_amount;
    let tax = data.tax_amount !== undefined ? Number(data.tax_amount) : existing.tax_amount;

    if (data.items) {
      subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
      const allItems = this.getLocalInvoiceItems().filter((item) => item.invoice_id !== id);
      data.items.forEach((it) => {
        allItems.push({
          id: "item-" + Math.random().toString(36).substring(2, 8),
          invoice_id: id,
          item_name: it.item_name,
          description: it.description || null,
          quantity: it.quantity,
          unit_price: it.unit_price,
          total: it.quantity * it.unit_price,
        });
      });
      this.saveLocalInvoiceItems(allItems);
    }

    const totalAmount = Math.max(0, subtotal - discount + tax);
    const amountDue = Math.max(0, totalAmount - existing.amount_paid);

    let status = existing.invoice_status;
    if (existing.amount_paid >= totalAmount && totalAmount > 0) {
      status = "Paid";
    } else if (existing.amount_paid > 0) {
      status = "Partially Paid";
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from("invoices") as any)
          .update({
            ...(data.client_id ? { client_id: data.client_id } : {}),
            ...(data.project_id !== undefined ? { project_id: data.project_id || null } : {}),
            ...(data.invoice_title ? { invoice_title: data.invoice_title } : {}),
            ...(data.description !== undefined ? { description: data.description } : {}),
            ...(data.invoice_type ? { invoice_type: data.invoice_type } : {}),
            ...(data.issue_date ? { issue_date: data.issue_date } : {}),
            ...(data.due_date !== undefined ? { due_date: data.due_date } : {}),
            ...(data.notes !== undefined ? { notes: data.notes } : {}),
            subtotal,
            discount_amount: discount,
            tax_amount: tax,
            total_amount: totalAmount,
            amount_due: amountDue,
            invoice_status: status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);
        if (error) return { success: false, error: error.message };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to update invoice";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalInvoices();
      const idx = local.findIndex((i) => i.id === id);
      if (idx !== -1) {
        local[idx] = {
          ...local[idx],
          ...data,
          subtotal,
          discount_amount: discount,
          tax_amount: tax,
          total_amount: totalAmount,
          amount_due: amountDue,
          invoice_status: status,
          updated_at: new Date().toISOString(),
        };
        this.saveLocalInvoices(local);
      }
    }

    await ClientService.logActivity(actorName, "updated invoice", existing.invoice_number, id);
    return { success: true };
  }

  static async markInvoiceSent(
    id: string,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; error?: string }> {
    const existing = await this.getInvoiceById(id);
    if (!existing) return { success: false, error: "Invoice not found" };

    const updatePayload = {
      invoice_status: "Sent" as InvoiceStatus,
      sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from("invoices") as any).update(updatePayload).eq("id", id);
        if (error) return { success: false, error: error.message };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to send invoice";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalInvoices();
      const idx = local.findIndex((i) => i.id === id);
      if (idx !== -1) {
        local[idx] = { ...local[idx], ...updatePayload };
        this.saveLocalInvoices(local);
      }
    }

    await ClientService.logActivity(actorName, "sent invoice to client", existing.invoice_number, id);
    return { success: true };
  }

  static async cancelInvoice(
    id: string,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; error?: string }> {
    const existing = await this.getInvoiceById(id);
    if (!existing) return { success: false, error: "Invoice not found" };

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from("invoices") as any)
          .update({ invoice_status: "Cancelled", updated_at: new Date().toISOString() })
          .eq("id", id);
        if (error) return { success: false, error: error.message };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to cancel invoice";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalInvoices();
      const idx = local.findIndex((i) => i.id === id);
      if (idx !== -1) {
        local[idx].invoice_status = "Cancelled";
        local[idx].updated_at = new Date().toISOString();
        this.saveLocalInvoices(local);
      }
    }

    await ClientService.logActivity(actorName, "cancelled invoice", existing.invoice_number, id);
    return { success: true };
  }

  static async deleteInvoice(
    id: string,
    actorName: string = "Ranjith"
  ): Promise<{ success: boolean; error?: string }> {
    const existing = await this.getInvoiceById(id);
    const invoiceNum = existing?.invoice_number || "Invoice";

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from("invoices").delete().eq("id", id);
        if (error) return { success: false, error: error.message };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to delete invoice";
        return { success: false, error: msg };
      }
    } else {
      const local = this.getLocalInvoices().filter((i) => i.id !== id);
      this.saveLocalInvoices(local);

      const items = this.getLocalInvoiceItems().filter((item) => item.invoice_id !== id);
      this.saveLocalInvoiceItems(items);
    }

    await ClientService.logActivity(actorName, "deleted invoice", invoiceNum, id);
    return { success: true };
  }
}
