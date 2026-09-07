import React from "react";
import Link from "next/link";
import {
  MoreVertical,
  Edit2,
  Trash2,
  Calendar,
  CheckCircle2,
  Eye,
  ArrowUpRight,
} from "lucide-react";
import { LeadStatus, LeadWithDetails } from "@/types/lead";
import { LeadStatusBadge } from "./lead-status-badge";
import { LeadPriorityBadge } from "./lead-priority-badge";
import { Avatar } from "@/components/ui/avatar";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DataTable } from "@/components/ui/data-table";
import {
  Dropdown,
  DropdownItem,
  DropdownSeparator,
} from "@/components/ui/dropdown";

interface LeadTableProps {
  leads: LeadWithDetails[];
  onEdit: (lead: LeadWithDetails) => void;
  onDelete: (lead: LeadWithDetails) => void;
  onAddFollowUp: (lead: LeadWithDetails) => void;
  onConvert: (lead: LeadWithDetails) => void;
  onStatusChange: (lead: LeadWithDetails, newStatus: LeadStatus) => void;
  canManage?: boolean;
}

export function LeadTable({
  leads,
  onEdit,
  onDelete,
  onAddFollowUp,
  onConvert,
  canManage = true,
}: LeadTableProps) {
  if (leads.length === 0) {
    return (
      <div className="rounded-xl border border-[#E6EAF2] bg-white p-12 text-center shadow-xs space-y-3 font-sans">
        <div className="w-12 h-12 rounded-xl bg-[#EFF4FE] border border-blue-100 text-[#2451EB] flex items-center justify-center mx-auto">
          <Eye className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#0F172A]">No Deals Found</h3>
        <p className="text-xs text-[#5B6472] max-w-sm mx-auto font-medium">
          No sales prospects match your search criteria or active pipeline filter.
        </p>
      </div>
    );
  }

  return (
    <DataTable className="font-sans">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs saas-table">
          <thead>
            <tr className="border-b border-[#E6EAF2] bg-[#F7F9FC] text-[#5B6472] font-semibold uppercase tracking-wider text-[11px]">
              <th scope="col" className="py-3 px-4">
                Contact & Company
              </th>
              <th scope="col" className="py-3 px-4">
                Pipeline Stage
              </th>
              <th scope="col" className="py-3 px-4">
                Priority
              </th>
              <th scope="col" className="py-3 px-4 text-right">
                Deal Value
              </th>
              <th scope="col" className="py-3 px-4">
                Assigned Owner
              </th>
              <th scope="col" className="py-3 px-4">
                Next Follow-Up
              </th>
              <th scope="col" className="py-3 px-4 text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E6EAF2]">
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className="hover:bg-[#F7F9FC] transition-colors group cursor-pointer"
              >
                {/* Contact & Company */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={lead.full_name} size="sm" />
                    <div className="min-w-0">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="font-semibold text-[#0F172A] hover:text-[#2451EB] transition-colors flex items-center gap-1"
                      >
                        <span className="truncate">{lead.full_name}</span>
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      <p className="text-[11px] text-[#5B6472] truncate mt-0.5 font-medium">
                        {lead.company_name || "Independent"} • {lead.service_interest}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Stage */}
                <td className="py-3 px-4">
                  <LeadStatusBadge status={lead.lead_status} size="sm" />
                </td>

                {/* Priority */}
                <td className="py-3 px-4">
                  <LeadPriorityBadge priority={lead.priority} size="sm" />
                </td>

                {/* Deal Value */}
                <td className="py-3 px-4 text-right font-mono font-bold text-[#0F172A] font-tabular">
                  {lead.estimated_value ? formatCurrency(lead.estimated_value, "INR") : "—"}
                </td>

                {/* Deal Owner */}
                <td className="py-4 px-4">
                  {lead.assigned_member_name ? (
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Avatar name={lead.assigned_member_name} size="sm" />
                      <span className="truncate max-w-[100px] font-medium">{lead.assigned_member_name}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                  )}
                </td>

                {/* Next Follow-Up */}
                <td className="py-4 px-4 font-medium">
                  {lead.next_follow_up_date ? (
                    <span
                      className={`text-xs ${
                        lead.is_followup_overdue
                          ? "text-rose-600 font-bold"
                          : "text-slate-700"
                      }`}
                    >
                      {formatDate(lead.next_follow_up_date)}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">No call scheduled</span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                  <Dropdown
                    align="right"
                    trigger={
                      <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    }
                  >
                    <Link href={`/leads/${lead.id}`}>
                      <DropdownItem>
                        <Eye className="w-3.5 h-3.5 text-blue-600 mr-2" />
                        <span>View Deal Record</span>
                      </DropdownItem>
                    </Link>

                    {canManage && (
                      <DropdownItem onClick={() => onAddFollowUp(lead)}>
                        <Calendar className="w-3.5 h-3.5 text-purple-600 mr-2" />
                        <span>Schedule Follow-Up</span>
                      </DropdownItem>
                    )}

                    {canManage && lead.lead_status !== "Won" && lead.lead_status !== "Lost" && (
                      <DropdownItem onClick={() => onConvert(lead)}>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-2" />
                        <span>Convert to Client & Project</span>
                      </DropdownItem>
                    )}

                    {canManage && (
                      <DropdownItem onClick={() => onEdit(lead)}>
                        <Edit2 className="w-3.5 h-3.5 text-slate-500 mr-2" />
                        <span>Edit Lead</span>
                      </DropdownItem>
                    )}

                    {canManage && (
                      <>
                        <DropdownSeparator />
                        <DropdownItem onClick={() => onDelete(lead)} destructive>
                          <Trash2 className="w-3.5 h-3.5 mr-2" />
                          <span>Delete Lead</span>
                        </DropdownItem>
                      </>
                    )}
                  </Dropdown>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DataTable>
  );
}
