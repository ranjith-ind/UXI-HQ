import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeadWithDetails } from "@/types/lead";

interface LeadDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: LeadWithDetails | null;
  onConfirm: (leadId: string) => Promise<void>;
}

export function LeadDeleteModal({
  isOpen,
  onClose,
  lead,
  onConfirm,
}: LeadDeleteModalProps) {
  const [loading, setLoading] = React.useState(false);

  if (!isOpen || !lead) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onConfirm(lead.id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">Delete Sales Lead?</h3>
              <p className="text-xs text-slate-500">Irreversible CRM action</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-5 space-y-3 text-xs text-slate-600">
          <p className="leading-relaxed">
            Are you sure you want to permanently delete lead{" "}
            <span className="font-bold text-slate-900">{lead.full_name}</span> (
            <span className="font-mono font-bold text-slate-900">{lead.lead_code}</span>)?
            All logged follow-ups and communication activities associated with this lead will be removed.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            isLoading={loading}
            className="font-bold"
          >
            Yes, Delete Lead
          </Button>
        </div>
      </div>
    </div>
  );
}
