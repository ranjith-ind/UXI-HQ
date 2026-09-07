import React, { useState } from "react";
import { X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LEAD_ACTIVITY_TYPES_LIST,
  LeadActivityFormData,
  LeadActivityType,
} from "@/types/lead-activity";

interface LeadActivityFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: LeadActivityFormData) => Promise<void>;
  leadName?: string;
}

export function LeadActivityForm({
  isOpen,
  onClose,
  onSubmit,
  leadName,
}: LeadActivityFormProps) {
  const [activityType, setActivityType] = useState<LeadActivityType>("Note");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onSubmit({
        activity_type: activityType,
        title: title.trim(),
        description: description.trim() || undefined,
      });
      onClose();
      setTitle("");
      setDescription("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in font-sans">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Log Sales Activity
              </h3>
              {leadName && <p className="text-xs text-slate-500 font-medium">For {leadName}</p>}
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
            <label className="text-xs font-bold text-slate-700 font-display">Activity Type</label>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value as LeadActivityType)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
            >
              {LEAD_ACTIVITY_TYPES_LIST.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 font-display">
              Activity Summary / Headline <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Discovery Call with CEO & CTO"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 font-display">Detailed Notes & Action Items</label>
            <textarea
              rows={4}
              placeholder="Client expressed strong interest in Next.js micro-frontend architecture..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              Save Activity
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
