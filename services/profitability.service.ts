import {
  ClientProfitability,
  CompanyProfitability,
  MonthlyProfitTrendItem,
  ProjectProfitability,
  ProfitabilityInsights,
} from "@/types/profitability";
import { PaymentService } from "./payment.service";
import { ExpenseService } from "./expense.service";
import { ProjectService } from "./project.service";
import { ClientService } from "./client.service";

export class ProfitabilityService {
  static async getCompanyProfitability(
    timeframe: "6M" | "12M" | "YEAR" = "6M"
  ): Promise<CompanyProfitability> {
    const [payments, expenses] = await Promise.all([
      PaymentService.getPayments({ status: "Completed" }),
      ExpenseService.getExpenses({ status: "Paid" }),
    ]);

    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 1000) / 10 : 0;

    // Monthly Trend
    const now = new Date();
    const monthsCount = timeframe === "6M" ? 6 : timeframe === "12M" ? 12 : now.getMonth() + 1;
    const monthlyTrend: MonthlyProfitTrendItem[] = [];

    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = d.toISOString().substring(0, 7);
      const monthLabel = d.toLocaleString("default", { month: "short", year: "2-digit" });

      const monthRevenue = payments
        .filter((p) => p.payment_date.startsWith(monthStr))
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const monthExpenses = expenses
        .filter((e) => e.expense_date.startsWith(monthStr))
        .reduce((sum, e) => sum + Number(e.amount), 0);

      const monthProfit = monthRevenue - monthExpenses;
      const monthMargin = monthRevenue > 0 ? Math.round((monthProfit / monthRevenue) * 1000) / 10 : 0;

      monthlyTrend.push({
        month: monthLabel,
        revenue: monthRevenue,
        expenses: monthExpenses,
        profit: monthProfit,
        margin: monthMargin,
      });
    }

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      monthlyTrend,
    };
  }

  static async getProjectProfitability(projectId: string): Promise<ProjectProfitability | null> {
    const [project, payments, expenses] = await Promise.all([
      ProjectService.getProjectById(projectId),
      PaymentService.getPayments({ projectId, status: "Completed" }),
      ExpenseService.getExpenses({ projectId, status: "Paid" }),
    ]);

    if (!project) return null;

    const revenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalExp = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const profit = revenue - totalExp;
    const profitMargin = revenue > 0 ? Math.round((profit / revenue) * 1000) / 10 : 0;

    return {
      projectId: project.id,
      projectName: project.project_name,
      projectCode: project.project_code,
      clientName: project.client_name,
      contractValue: project.final_budget,
      revenue,
      expenses: totalExp,
      profit,
      profitMargin,
      paymentCount: payments.length,
      expenseCount: expenses.length,
      isProfitable: profit >= 0,
    };
  }

  static async getAllProjectsProfitability(): Promise<ProjectProfitability[]> {
    const [projects, payments, expenses] = await Promise.all([
      ProjectService.getProjects({ isArchived: false }),
      PaymentService.getPayments({ status: "Completed" }),
      ExpenseService.getExpenses({ status: "Paid" }),
    ]);

    const result: ProjectProfitability[] = projects.map((proj) => {
      const projPayments = payments.filter((p) => p.project_id === proj.id);
      const projExpenses = expenses.filter((e) => e.project_id === proj.id);

      const revenue = projPayments.reduce((sum, p) => sum + Number(p.amount), 0);
      const totalExp = projExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const profit = revenue - totalExp;
      const profitMargin = revenue > 0 ? Math.round((profit / revenue) * 1000) / 10 : 0;

      return {
        projectId: proj.id,
        projectName: proj.project_name,
        projectCode: proj.project_code,
        clientName: proj.client_name,
        contractValue: proj.final_budget,
        revenue,
        expenses: totalExp,
        profit,
        profitMargin,
        paymentCount: projPayments.length,
        expenseCount: projExpenses.length,
        isProfitable: profit >= 0,
      };
    });

    return result.sort((a, b) => b.profit - a.profit);
  }

  static async getClientProfitability(clientId: string): Promise<ClientProfitability | null> {
    const [client, clientProjects, payments, expenses] = await Promise.all([
      ClientService.getClientById(clientId),
      ClientService.getClientProjects(clientId),
      PaymentService.getPayments({ clientId, status: "Completed" }),
      ExpenseService.getExpenses({ status: "Paid" }),
    ]);

    if (!client) return null;

    const projectIds = new Set(clientProjects.map((p) => p.id));
    const relevantExpenses = expenses.filter(
      (e) => e.client_id === clientId || (e.project_id && projectIds.has(e.project_id))
    );

    const revenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalExp = relevantExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const profit = revenue - totalExp;
    const profitMargin = revenue > 0 ? Math.round((profit / revenue) * 1000) / 10 : 0;

    return {
      clientId: client.id,
      clientName: client.full_name,
      companyName: client.company_name || client.full_name,
      totalContractValue: client.total_project_value,
      revenue,
      expenses: totalExp,
      profit,
      profitMargin,
      projectsCount: clientProjects.length,
    };
  }

  static async getAllClientsProfitability(): Promise<ClientProfitability[]> {
    const [clients, payments, expenses] = await Promise.all([
      ClientService.getClients(),
      PaymentService.getPayments({ status: "Completed" }),
      ExpenseService.getExpenses({ status: "Paid" }),
    ]);

    const result: ClientProfitability[] = clients.map((client) => {
      const clientPayments = payments.filter((p) => p.client_id === client.id);
      const clientExpenses = expenses.filter((e) => e.client_id === client.id);

      const revenue = clientPayments.reduce((sum, p) => sum + Number(p.amount), 0);
      const totalExp = clientExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const profit = revenue - totalExp;
      const profitMargin = revenue > 0 ? Math.round((profit / revenue) * 1000) / 10 : 0;

      return {
        clientId: client.id,
        clientName: client.full_name,
        companyName: client.company_name || client.full_name,
        totalContractValue: client.total_project_value,
        revenue,
        expenses: totalExp,
        profit,
        profitMargin,
        projectsCount: client.projects_count,
      };
    });

    return result.sort((a, b) => b.profit - a.profit);
  }

  static async getProfitabilityInsights(): Promise<ProfitabilityInsights> {
    const [companyProf, projectsProf, categoryStats] = await Promise.all([
      this.getCompanyProfitability("12M"),
      this.getAllProjectsProfitability(),
      ExpenseService.getCategoryStats(),
    ]);

    const mostProfitableProject = projectsProf.length > 0 ? projectsProf[0] : undefined;
    const leastProfitableProject = projectsProf.length > 0 ? projectsProf[projectsProf.length - 1] : undefined;
    const highestSpendingCategory =
      categoryStats.length > 0
        ? {
            categoryId: categoryStats[0].id,
            categoryName: categoryStats[0].name,
            amount: categoryStats[0].totalSpending,
            count: categoryStats[0].expenseCount,
            percentage: categoryStats[0].percentage,
          }
        : undefined;

    let overallHealthStatus: "Excellent" | "Healthy" | "Watch" | "Critical" = "Healthy";
    if (companyProf.profitMargin >= 65) overallHealthStatus = "Excellent";
    else if (companyProf.profitMargin >= 40) overallHealthStatus = "Healthy";
    else if (companyProf.profitMargin >= 15) overallHealthStatus = "Watch";
    else overallHealthStatus = "Critical";

    const observations: string[] = [];

    if (companyProf.profitMargin > 0) {
      observations.push(
        `UXI operates at a healthy net profit margin of ${companyProf.profitMargin}% with ₹${companyProf.netProfit.toLocaleString()} in realized net earnings.`
      );
    }

    if (highestSpendingCategory && highestSpendingCategory.amount > 0) {
      observations.push(
        `"${highestSpendingCategory.categoryName}" is the primary cost driver, accounting for ${highestSpendingCategory.percentage}% (₹${highestSpendingCategory.amount.toLocaleString()}) of company expenditures.`
      );
    }

    if (mostProfitableProject && mostProfitableProject.profit > 0) {
      observations.push(
        `"${mostProfitableProject.projectName}" leads enterprise profitability with ₹${mostProfitableProject.profit.toLocaleString()} profit at a ${mostProfitableProject.profitMargin}% gross margin.`
      );
    }

    if (leastProfitableProject && leastProfitableProject.profitMargin < 30 && leastProfitableProject.revenue > 0) {
      observations.push(
        `"${leastProfitableProject.projectName}" exhibits a compressed margin of ${leastProfitableProject.profitMargin}% due to specialized third-party contractor and infrastructure costs.`
      );
    }

    return {
      mostProfitableProject,
      leastProfitableProject,
      highestSpendingCategory,
      overallHealthStatus,
      observations,
    };
  }
}
