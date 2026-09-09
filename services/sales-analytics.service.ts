import {
  LEAD_SOURCES_LIST,
  PIPELINE_STAGES,
  SERVICE_INTERESTS_LIST,
  LeadSource,
  LeadStatus,
  ServiceInterest,
} from "@/types/lead";
import {
  LeadSourcePerformance,
  SalesInsights,
  SalesPipelineStage,
  SalesPipelineStats,
  SalesTrendItem,
  ServicePerformance,
} from "@/types/sales";
import { LeadService } from "./lead.service";

export class SalesAnalyticsService {
  static async getPipelineStats(): Promise<SalesPipelineStats> {
    const leads = await LeadService.getLeads();

    const activeLeads = leads.filter((l) => l.lead_status !== "Won" && l.lead_status !== "Lost");
    const totalPipelineValue = activeLeads.reduce((sum, l) => sum + Number(l.estimated_value), 0);
    const totalWeightedValue = activeLeads.reduce((sum, l) => sum + Number(l.weighted_value), 0);

    const wonLeads = leads.filter((l) => l.lead_status === "Won");
    const lostLeads = leads.filter((l) => l.lead_status === "Lost");
    const totalDecided = wonLeads.length + lostLeads.length;
    const winRate = totalDecided > 0 ? Math.round((wonLeads.length / totalDecided) * 100) : 0;

    const averageDealSize =
      wonLeads.length > 0
        ? Math.round(wonLeads.reduce((sum, l) => sum + Number(l.estimated_value), 0) / wonLeads.length)
        : activeLeads.length > 0
        ? Math.round(totalPipelineValue / activeLeads.length)
        : 0;

    // Average Sales Cycle Days for converted/won leads
    let totalCycleDays = 0;
    let countedLeads = 0;
    wonLeads.forEach((l) => {
      if (l.converted_at || l.updated_at) {
        const start = new Date(l.created_at).getTime();
        const end = new Date(l.converted_at || l.updated_at).getTime();
        const days = Math.max(1, Math.floor((end - start) / (1000 * 60 * 60 * 24)));
        totalCycleDays += days;
        countedLeads++;
      }
    });
    const averageSalesCycleDays = countedLeads > 0 ? Math.round(totalCycleDays / countedLeads) : 0;

    // Build Stages
    const stages: SalesPipelineStage[] = PIPELINE_STAGES.map((stage) => {
      const stageLeads = leads.filter((l) => l.lead_status === stage);
      const stageValue = stageLeads.reduce((sum, l) => sum + Number(l.estimated_value), 0);
      const stageWeighted = stageLeads.reduce((sum, l) => sum + Number(l.weighted_value), 0);
      const percentage = totalPipelineValue > 0 ? Math.round((stageValue / totalPipelineValue) * 100) : 0;

      return {
        stage,
        label: stage,
        count: stageLeads.length,
        totalValue: stageValue,
        weightedValue: stageWeighted,
        percentageOfPipeline: percentage,
      };
    });

    return {
      totalLeads: leads.length,
      activeOpportunities: activeLeads.length,
      totalPipelineValue,
      totalWeightedValue,
      winRate,
      averageDealSize,
      averageSalesCycleDays,
      stages,
    };
  }

  static async getSourcePerformance(): Promise<LeadSourcePerformance[]> {
    const leads = await LeadService.getLeads();

    return LEAD_SOURCES_LIST.map((source) => {
      const sourceLeads = leads.filter((l) => l.lead_source === source);
      const wonLeads = sourceLeads.filter((l) => l.lead_status === "Won");
      const lostLeads = sourceLeads.filter((l) => l.lead_status === "Lost");
      const totalDecided = wonLeads.length + lostLeads.length;

      const conversionRate =
        totalDecided > 0
          ? Math.round((wonLeads.length / totalDecided) * 100)
          : sourceLeads.length > 0 && wonLeads.length > 0
          ? Math.round((wonLeads.length / sourceLeads.length) * 100)
          : 0;

      const pipelineValue = sourceLeads
        .filter((l) => l.lead_status !== "Won" && l.lead_status !== "Lost")
        .reduce((sum, l) => sum + Number(l.estimated_value), 0);

      const wonValue = wonLeads.reduce((sum, l) => sum + Number(l.estimated_value), 0);

      return {
        source,
        leadsCount: sourceLeads.length,
        wonCount: wonLeads.length,
        conversionRate,
        pipelineValue,
        wonValue,
      };
    }).sort((a, b) => b.leadsCount - a.leadsCount);
  }

  static async getServicePerformance(): Promise<ServicePerformance[]> {
    const leads = await LeadService.getLeads();

    return SERVICE_INTERESTS_LIST.map((service) => {
      const serviceLeads = leads.filter((l) => l.service_interest === service);
      const wonLeads = serviceLeads.filter((l) => l.lead_status === "Won");
      const lostLeads = serviceLeads.filter((l) => l.lead_status === "Lost");
      const totalDecided = wonLeads.length + lostLeads.length;

      const conversionRate =
        totalDecided > 0
          ? Math.round((wonLeads.length / totalDecided) * 100)
          : serviceLeads.length > 0 && wonLeads.length > 0
          ? Math.round((wonLeads.length / serviceLeads.length) * 100)
          : 0;

      const pipelineValue = serviceLeads
        .filter((l) => l.lead_status !== "Won" && l.lead_status !== "Lost")
        .reduce((sum, l) => sum + Number(l.estimated_value), 0);

      const wonValue = wonLeads.reduce((sum, l) => sum + Number(l.estimated_value), 0);

      return {
        service,
        leadsCount: serviceLeads.length,
        wonCount: wonLeads.length,
        conversionRate,
        pipelineValue,
        wonValue,
      };
    }).sort((a, b) => b.leadsCount - a.leadsCount);
  }

  static async getSalesTrends(): Promise<SalesTrendItem[]> {
    const leads = await LeadService.getLeads();
    const months = ["Mar 2026", "Apr 2026", "May 2026", "Jun 2026", "Jul 2026", "Aug 2026"];

    return months.map((m) => {
      const leadsInMonth = leads.filter((l) => {
        if (!l.created_at) return false;
        const d = new Date(l.created_at);
        const label = d.toLocaleString("en-US", { month: "short", year: "numeric" });
        return label === m;
      });

      const newLeads = leadsInMonth.filter((l) => l.lead_status !== "Won" && l.lead_status !== "Lost").length;
      const wonLeads = leadsInMonth.filter((l) => l.lead_status === "Won").length;
      const lostLeads = leadsInMonth.filter((l) => l.lead_status === "Lost").length;
      const wonRevenue = leadsInMonth
        .filter((l) => l.lead_status === "Won")
        .reduce((sum, l) => sum + Number(l.estimated_value || 0), 0);

      return {
        month: m,
        newLeads,
        wonLeads,
        lostLeads,
        wonRevenue,
      };
    });
  }

  static async getSalesInsights(): Promise<SalesInsights> {
    const [leads, sources, services, stats] = await Promise.all([
      LeadService.getLeads(),
      this.getSourcePerformance(),
      this.getServicePerformance(),
      LeadService.getLeadStats(),
    ]);

    const activeOpportunities = leads
      .filter((l) => l.lead_status !== "Won" && l.lead_status !== "Lost")
      .sort((a, b) => b.weighted_value - a.weighted_value)
      .slice(0, 5)
      .map((l) => ({
        leadId: l.id,
        leadCode: l.lead_code,
        leadName: l.full_name,
        companyName: l.company_name,
        estimatedValue: l.estimated_value,
        probability: l.probability,
        weightedValue: l.weighted_value,
        expectedCloseDate: l.expected_close_date,
      }));

    const topSource = sources.find((s) => s.leadsCount > 0);
    const topService = services.find((s) => s.leadsCount > 0);

    const observations: string[] = [];

    if (topSource && topSource.leadsCount > 0) {
      observations.push(
        `"${topSource.source}" is the highest volume acquisition channel with ${topSource.leadsCount} prospects logged.`
      );
    }

    if (topService && topService.leadsCount > 0) {
      observations.push(
        `"${topService.service}" represents the strongest product interest across inbound inquiries.`
      );
    }

    if (stats.overdueFollowupsCount > 0) {
      observations.push(
        `Attention Required: ${stats.overdueFollowupsCount} prospective deal follow-ups are past due.`
      );
    } else {
      observations.push("Sales follow-up cadence is fully up to date with zero overdue actions.");
    }

    if (activeOpportunities.length > 0) {
      const topDeal = activeOpportunities[0];
      observations.push(
        `Top Pipeline Deal: ${topDeal.leadName} (${topDeal.companyName || "Direct"}) with ₹${topDeal.estimatedValue.toLocaleString()} value at ${topDeal.probability}% probability.`
      );
    }

    return {
      topSource,
      topService,
      topOpportunities: activeOpportunities,
      observations,
    };
  }
}
