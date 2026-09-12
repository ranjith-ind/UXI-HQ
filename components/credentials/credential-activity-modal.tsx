"use client";

import React, { useEffect, useState } from "react";
import { History, X, ShieldCheck, User, Clock } from "lucide-react";
import { CredentialActivityLog, ProjectCredential } from "@/types/credential";
import { CredentialService } from "@/services/credential.service";
import { formatRelativeTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface CredentialActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  credential: ProjectCredential | null;
}

export function CredentialActivityModal({
  isOpen,
  onClose,
  credential,
}: CredentialActivityModalProps) {
  const [logs, setLogs] = useState<CredentialActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && credential) {
      setLoading(true);
      CredentialService.getActivityLogs(credential.id)
        .then((res) => setLogs(res))
        .finally(() => setLoading(false));
    }
  }, [isOpen, credential]);

  if (!isOpen || !credential) return null;

  const getActionBadge = (action: string) => {
    switch (action) {
      case "Created":
        return <Badge variant="success">Created</Badge>;
      case "Updated":
        return <Badge variant="default">Updated</Badge>;
      case "Viewed":
        return <Badge variant="warning">Viewed</Badge>;
      case "Copied":
        return <Badge variant="purple">Copied</Badge>;
      case "Deleted":
        return <Badge variant="danger">Deleted</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 font-sans overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Access & Audit Log
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {credential.name} ({credential.credential_type})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Logs List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {loading ? (
            <p className="text-xs text-slate-400 text-center py-6">Loading audit trails...</p>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">No activity recorded yet for this secret.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      {getActionBadge(log.action)}
                      <span className="font-semibold text-slate-800">{log.user_name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(log.created_at).toLocaleString()}</span>
                      <span>•</span>
                      <span>{formatRelativeTime(log.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
