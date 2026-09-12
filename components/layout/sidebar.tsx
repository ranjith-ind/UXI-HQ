"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Users2,
  CheckSquare,
  ShieldCheck,
  CreditCard,
  TrendingUp,
  Receipt,
  FileText,
  BarChart3,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  Target,
  Calendar,
  AlertCircle,
  Bell,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UxiLogo } from "@/components/brand/uxi-logo";
import { Avatar } from "@/components/ui/avatar";
import { Tooltip } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  mobile?: boolean;
  onCloseMobile?: () => void;
}

interface NavItemConfig {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  isNew?: boolean;
}

interface NavGroup {
  group: string;
  items: NavItemConfig[];
}

const navigationGroups: NavGroup[] = [
  {
    group: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    group: "Sales CRM",
    items: [
      {
        title: "Leads & Pipeline",
        href: "/leads",
        icon: Target,
      },
      {
        title: "Follow-ups",
        href: "/leads/follow-ups",
        icon: Calendar,
      },
      {
        title: "Sales Analytics",
        href: "/leads/analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    group: "Management",
    items: [
      {
        title: "Projects",
        href: "/projects",
        icon: FolderKanban,
      },
      {
        title: "Clients",
        href: "/clients",
        icon: Users2,
      },
      {
        title: "Tasks & Sprints",
        href: "/tasks",
        icon: CheckSquare,
      },
      {
        title: "Team & Workload",
        href: "/team",
        icon: ShieldCheck,
      },
      {
        title: "Credentials",
        href: "/credentials",
        icon: KeyRound,
      },
    ],
  },
  {
    group: "Finance",
    items: [
      {
        title: "Finance Overview",
        href: "/finance",
        icon: TrendingUp,
      },
      {
        title: "Invoices",
        href: "/finance/invoices",
        icon: FileText,
      },
      {
        title: "Payments",
        href: "/finance/payments",
        icon: CreditCard,
      },
      {
        title: "Expenses",
        href: "/expenses",
        icon: Receipt,
      },
    ],
  },
  {
    group: "Operations",
    items: [
      {
        title: "Activity Center",
        href: "/activity",
        icon: Activity,
      },
      {
        title: "Business Alerts",
        href: "/alerts",
        icon: AlertCircle,
      },
      {
        title: "Notifications",
        href: "/notifications",
        icon: Bell,
      },
    ],
  },
  {
    group: "Insights",
    items: [
      {
        title: "Reports",
        href: "/reports",
        icon: BarChart3,
      },
    ],
  },
  {
    group: "System",
    items: [
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
];

export function Sidebar({
  collapsed = false,
  onToggleCollapse,
  mobile = false,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full bg-[#F7F9FC] border-r border-[#E6EAF2] text-slate-700 transition-all duration-300 select-none z-30",
        collapsed ? "w-20" : "w-[248px]",
        mobile && "w-72"
      )}
    >
      {/* Brand Header */}
      <div
        className={cn(
          "flex items-center h-16 px-4 border-b border-[#E6EAF2] justify-between shrink-0 bg-[#F7F9FC]",
          collapsed && "justify-center px-2"
        )}
      >
        <Link
          href="/dashboard"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 group"
        >
          {collapsed ? (
            <UxiLogo size="sm" showText={false} />
          ) : (
            <UxiLogo size="sm" showText={true} />
          )}
        </Link>

        {!mobile && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "p-1 rounded-md text-[#5B6472] hover:text-slate-900 hover:bg-slate-200/50 border border-transparent transition-colors",
              collapsed && "hidden group-hover:flex"
            )}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-[#2451EB]" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-[#5B6472]" />
            )}
          </button>
        )}
      </div>

      {/* Primary Navigation List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 space-y-5 scrollbar-thin scrollbar-thumb-slate-200">
        {navigationGroups.map((group) => (
          <div key={group.group} className="space-y-0.5">
            {!collapsed && (
              <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#8A93A3]">
                {group.group}
              </div>
            )}
            {group.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;

              const navLink = (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={cn(
                    "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150",
                    isActive
                      ? "bg-[#EFF4FE] text-[#2451EB] font-semibold"
                      : "text-[#5B6472] hover:bg-slate-200/50 hover:text-slate-900",
                    collapsed && "justify-center px-2 py-2.5"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0 transition-transform duration-150",
                      isActive ? "text-[#2451EB]" : "text-[#8A93A3] group-hover:text-slate-700"
                    )}
                  />

                  {!collapsed && (
                    <span className="flex-1 truncate tracking-tight">
                      {item.title}
                    </span>
                  )}

                  {!collapsed && item.badge && (
                    <span
                      className={cn(
                        "shrink-0 px-1.5 py-0.2 text-[10px] font-semibold rounded-md transition-colors",
                        isActive
                          ? "bg-[#2451EB] text-white"
                          : "bg-slate-200/70 text-[#5B6472]"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.href} content={item.title} side="right">
                    {navLink}
                  </Tooltip>
                );
              }

              return navLink;
            })}
          </div>
        ))}
      </div>

      {/* User Footer Profile */}
      <div className="shrink-0 p-3 border-t border-[#E6EAF2] bg-[#F7F9FC]">
        <div
          className={cn(
            "flex items-center gap-2.5 p-2 rounded-lg bg-white border border-[#E6EAF2] hover:border-[#D6DCE8] transition-all",
            collapsed && "justify-center p-1 bg-transparent border-transparent"
          )}
        >
          <Avatar
            src={user?.avatarUrl}
            name={user?.fullName || "UXI Member"}
            size="sm"
            className="ring-1 ring-[#2451EB]/20"
          />

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate leading-tight">
                {user?.fullName || "Ranjith"}
              </p>
              <span className="inline-block text-[10px] text-[#2451EB] font-medium">
                {user?.role || "Admin"}
              </span>
            </div>
          )}

          {!collapsed ? (
            <button
              onClick={() => logout()}
              title="Logout from UXI HQ"
              className="p-1.5 text-[#8A93A3] hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <Tooltip content="Logout" side="right">
              <button
                onClick={() => logout()}
                className="p-2 text-[#8A93A3] hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </Tooltip>
          )}
        </div>
      </div>
    </aside>
  );
}
