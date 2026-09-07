import React, { useState } from "react";
import { X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FOLLOW_UP_TYPES_LIST,
  FollowUpType,
  LeadFollowUpFormData,
} from "@/types/lead-followup";

interface LeadFollowUpFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: LeadFollowUpFormData) => Promise<void>;
  leadName?: string;
}

export function LeadFollowUpForm({
  isOpen,
  onClose,
  onSubmit,
  leadName,
}: LeadFollowUpFormProps) {
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpType, setFollowUpType] = useState<FollowUpType>("Call");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpDate) return;

    setLoading(true);
    try {
      await onSubmit({
        follow_up_date: followUpDate,
        follow_up_type: followUpType,
        notes: notes.trim() || undefined,
      });
      onClose();
      setFollowUpDate("");
      setNotes("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in font-sans">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Schedule Follow-up
              </h3>
              {leadName && <p className="text-xs text-slate-500 font-medium">With {leadName}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 font-display">
              Action Date & Time <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 font-display">Communication Channel</label>
            <select
              value={followUpType}
              onChange={(e) => setFollowUpType(e.target.value as FollowUpType)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
            >
              {FOLLOW_UP_TYPES_LIST.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 font-display">Follow-Up Agenda / Goals</label>
            <textarea
              rows={3}
              placeholder="e.g. Discuss revised scope pricing, share case study PDF..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              isLoading={loading}
              className="font-bold shadow-sm bg-blue-600 hover:bg-blue-700"
            >
              Set Reminder
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
