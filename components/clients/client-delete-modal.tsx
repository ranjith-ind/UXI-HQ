"use client";

import React, { useState } from "react";
import { AlertTriangle, X, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientWithDetails } from "@/types/client";
import { useAuth } from "@/hooks/use-auth";

interface ClientDeleteModalProps {
  client: ClientWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (clientId: string) => Promise<void>;
}

export function ClientDeleteModal({
  client,
  isOpen,
  onClose,
  onConfirm,
}: ClientDeleteModalProps) {
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);

  if (!isOpen || !client) return null;

  const canDelete = user?.role === "Admin" || user?.role === "Manager";

  const handleDelete = async () => {
    if (!canDelete) return;
    setDeleting(true);
    try {
      await onConfirm(client.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">Delete Client Profile?</h3>
              <p className="text-xs text-slate-500">Irreversible database action</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-5 space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-bold text-slate-900">
              {client.full_name}
              {client.company_name ? ` (${client.company_name})` : ""}
            </span>
            ? This action cannot be undone.
          </p>

          {client.projects_count > 0 && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                This client has {client.projects_count} associated project(s). Historical project records will be unlinked safely.
              </span>
            </div>
          )}

          {!canDelete && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-800 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
              <span>
                Only <strong>Admin</strong> and <strong>Manager</strong> roles have permission to delete client records. Your current role is <strong>{user?.role}</strong>.
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={deleting}>
            Cancel
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            isLoading={deleting}
            disabled={!canDelete || deleting}
            className="font-bold"
          >
            Yes, Delete Client
          </Button>
        </div>
      </div>
    </div>
  );
}
