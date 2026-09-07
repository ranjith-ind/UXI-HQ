import { AuthUser, DashboardStats, ProjectSummary, UpcomingDeadline, ActivityItem } from "@/types";

export const FOUNDING_MEMBERS: AuthUser[] = [
  {
    id: "f1-ranjith-uuid",
    email: "ranjith@uxitech.in",
    fullName: "Ranjith",
    role: "Admin",
    avatarUrl: "/avatars/ranjith.png",
  },
  {
    id: "f2-hafi-uuid",
    email: "hafi@uxitech.in",
    fullName: "Hafi",
    role: "Admin",
    avatarUrl: "/avatars/hafi.png",
  },
  {
    id: "f3-vedesh-uuid",
    email: "vedesh@uxitech.in",
    fullName: "Vedesh",
    role: "Admin",
    avatarUrl: "/avatars/vedesh.png",
  },
  {
    id: "f4-praneeth-uuid",
    email: "praneeth@uxitech.in",
    fullName: "Praneeth",
    role: "Admin",
    avatarUrl: "/avatars/praneeth.png",
  },
];

export const INITIAL_DASHBOARD_STATS: DashboardStats = {
  totalProjects: 14,
  activeProjects: 6,
  totalClients: 9,
  totalRevenue: 1850000, // ₹18,50,000 INR
  totalRevenueChangePercent: 24.5,
  activeProjectsChangePercent: 12.0,
  totalClientsChangePercent: 18.2,
  totalTasksCount: 38,
};

export const RECENT_PROJECTS: ProjectSummary[] = [
  {
    id: "proj-1",
    name: "FinPulse Banking Portal",
    code: "UXI-2026-001",
    clientName: "FinPulse Technologies",
    status: "Development",
    deadline: "2026-09-15",
    progressPercent: 55,
    budget: 450000,
    leadName: "Praneeth",
  },
  {
    id: "proj-2",
    name: "Aura Luxury Ecommerce",
    code: "UXI-2026-002",
    clientName: "Aura Brands Inc",
    status: "Client Review",
    deadline: "2026-09-05",
    progressPercent: 80,
    budget: 320000,
    leadName: "Vedesh",
  },
  {
    id: "proj-3",
    name: "OmniHealth Patient Cloud",
    code: "UXI-2026-003",
    clientName: "OmniHealth Care",
    status: "Designing",
    deadline: "2026-09-28",
    progressPercent: 35,
    budget: 680000,
    leadName: "Hafi",
  },
  {
    id: "proj-4",
    name: "Nexus Global Logistics CMS",
    code: "UXI-2026-004",
    clientName: "Nexus Freight Ltd",
    status: "Discussion",
    deadline: "2026-10-12",
    progressPercent: 10,
    budget: 520000,
    leadName: "Ranjith",
  },
  {
    id: "proj-5",
    name: "Krypton Web3 Exchange UI",
    code: "UXI-2026-005",
    clientName: "Krypton Labs",
    status: "Completed",
    deadline: "2026-08-20",
    progressPercent: 100,
    budget: 380000,
    leadName: "Praneeth",
  },
];

export const UPCOMING_DEADLINES: UpcomingDeadline[] = [
  {
    id: "dl-1",
    title: "Final UI Signoff & QA Staging",
    projectName: "Aura Luxury Ecommerce",
    dueDate: "2026-09-05",
    priority: "urgent",
    daysRemaining: 7,
  },
  {
    id: "dl-2",
    title: "Backend API Auth & Ledger Integration",
    projectName: "FinPulse Banking Portal",
    dueDate: "2026-09-15",
    priority: "high",
    daysRemaining: 17,
  },
  {
    id: "dl-3",
    title: "HIPAA Compliant Data Layer Audit",
    projectName: "OmniHealth Patient Cloud",
    dueDate: "2026-09-28",
    priority: "medium",
    daysRemaining: 30,
  },
];

export const RECENT_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    actorName: "Ranjith",
    action: "approved milestone invoice for",
    targetName: "FinPulse Technologies (₹2,25,000)",
    timestamp: "2026-08-29T14:30:00Z",
    category: "payment",
  },
  {
    id: "act-2",
    actorName: "Hafi",
    action: "deployed staging build v1.4 for",
    targetName: "OmniHealth Patient Cloud",
    timestamp: "2026-08-29T12:15:00Z",
    category: "project",
  },
  {
    id: "act-3",
    actorName: "Vedesh",
    action: "finalized design system components for",
    targetName: "Aura Luxury Ecommerce",
    timestamp: "2026-08-29T10:45:00Z",
    category: "task",
  },
  {
    id: "act-4",
    actorName: "Praneeth",
    action: "completed contract onboarding for new client",
    targetName: "Nexus Freight Ltd",
    timestamp: "2026-08-28T18:20:00Z",
    category: "client",
  },
  {
    id: "act-5",
    actorName: "Ranjith",
    action: "scheduled sprint kickoff meeting for",
    targetName: "Nexus Global Logistics CMS",
    timestamp: "2026-08-28T15:00:00Z",
    category: "system",
  },
];

export const MONTHLY_REVENUE_DATA = [
  { month: "Mar", revenue: 210000, target: 200000 },
  { month: "Apr", revenue: 280000, target: 250000 },
  { month: "May", revenue: 340000, target: 300000 },
  { month: "Jun", revenue: 410000, target: 350000 },
  { month: "Jul", revenue: 490000, target: 450000 },
  { month: "Aug", revenue: 620000, target: 500000 },
];
