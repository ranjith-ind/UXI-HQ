"use client";

import React from "react";
import Link from "next/link";
import {
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Mail,
  Phone,
  MessageSquare,
  Globe,
  MapPin,
  FolderKanban,
  ExternalLink,
} from "lucide-react";
import { ClientWithDetails, ClientStatus } from "@/types/client";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/ui/dropdown";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ClientTableProps {
  clients: ClientWithDetails[];
  onEdit: (client: ClientWithDetails) => void;
  onDelete: (client: ClientWithDetails) => void;
  loading?: boolean;
}

export function ClientTable({
  clients,
  onEdit,
  onDelete,
  loading,
}: ClientTableProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-[#E6EAF2] bg-white p-5 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#E6EAF2] bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs saas-table">
          <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400 font-display">
            <tr>
              <th scope="col" className="px-5 py-3.5">
                Client & Contact Person
              </th>
              <th scope="col" className="px-4 py-3.5">
                Company & Location
              </th>
              <th scope="col" className="px-4 py-3.5">
                Quick Contact
              </th>
              <th scope="col" className="px-4 py-3.5">
                Status
              </th>
              <th scope="col" className="px-4 py-3.5">
                Projects
              </th>
              <th scope="col" className="px-4 py-3.5">
                Total Value
              </th>
              <th scope="col" className="px-4 py-3.5">
                Pending
              </th>
              <th scope="col" className="px-4 py-3.5">
                Added
              </th>
              <th scope="col" className="px-5 py-3.5 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clients.map((client) => {
              return (
                <tr
                  key={client.id}
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                >
                  {/* Client & Person */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={client.full_name} size="md" />
                      <div className="flex flex-col min-w-0">
                        <Link
                          href={`/clients/${client.id}`}
                          className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate"
                        >
                          {client.full_name}
                        </Link>
                        {client.company_name && (
                          <span className="text-[11px] text-slate-500 font-medium truncate">
                            {client.company_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Company & Location */}
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-0.5">
                      {client.location ? (
                        <span className="flex items-center gap-1 text-slate-600 font-medium">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{client.location}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}

                      {client.website && (
                        <a
                          href={client.website.startsWith("http") ? client.website : `https://${client.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
                        >
                          <Globe className="w-3 h-3" />
                          <span className="truncate max-w-[120px]">
                            {client.website.replace(/^https?:\/\//, "")}
                          </span>
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Quick Contact Icons */}
                  <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1.5">
                      {client.email && (
                        <a
                          href={`mailto:${client.email}`}
                          title={`Email ${client.email}`}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:text-blue-600 text-slate-500 transition-colors shadow-2xs"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {client.phone && (
                        <a
                          href={`tel:${client.phone}`}
                          title={`Call ${client.phone}`}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-emerald-50 hover:text-emerald-600 text-slate-500 transition-colors shadow-2xs"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {client.whatsapp_number && (
                        <a
                          href={`https://wa.me/${client.whatsapp_number.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open WhatsApp Chat"
                          className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors shadow-2xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="px-4 py-4">
                    <StatusBadge status={client.client_status} size="sm" />
                  </td>

                  {/* Projects count */}
                  <td className="px-4 py-4">
                    <Link
                      href={`/clients/${client.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      <FolderKanban className="w-3.5 h-3.5" />
                      <span>{client.projects_count}</span>
                    </Link>
                  </td>

                  {/* Total Value */}
                  <td className="px-4 py-4 font-mono font-bold text-slate-900">
                    {formatCurrency(client.total_project_value, "INR")}
                  </td>

                  {/* Pending Amount */}
                  <td className="px-4 py-4 font-mono font-semibold">
                    {client.pending_amount > 0 ? (
                      <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80">
                        {formatCurrency(client.pending_amount, "INR")}
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-medium">Cleared</span>
                    )}
                  </td>

                  {/* Created date */}
                  <td className="px-4 py-4 font-medium text-slate-500">
                    {formatDate(client.created_at)}
                  </td>

                  {/* Actions Dropdown */}
                  <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <Dropdown
                      align="right"
                      trigger={
                        <button
                          aria-label="Actions"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      }
                    >
                      <Link href={`/clients/${client.id}`}>
                        <DropdownItem>
                          <Eye className="w-4 h-4 text-blue-600 mr-2" />
                          <span>View Profile</span>
                        </DropdownItem>
                      </Link>

                      <DropdownItem onClick={() => onEdit(client)}>
                        <Edit2 className="w-4 h-4 text-slate-500 mr-2" />
                        <span>Edit Client</span>
                      </DropdownItem>

                      <DropdownSeparator />

                      <DropdownItem onClick={() => onDelete(client)} destructive>
                        <Trash2 className="w-4 h-4 mr-2" />
                        <span>Delete Client</span>
                      </DropdownItem>
                    </Dropdown>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
