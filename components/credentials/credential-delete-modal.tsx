"use client";

import React, { useState } from "react";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectCredential } from "@/types/credential";

interface CredentialDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  credential: ProjectCredential | null;
  onConfirm: (id: string) => Promise<void>;
}

export function CredentialDeleteModal({
  isOpen,
  onClose,
  credential,
  onConfirm,
}: CredentialDeleteModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !credential) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onConfirm(credential.id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 font-sans">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-rose-600">
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-100">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Delete Credential
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-2 text-xs text-slate-600 leading-relaxed">
          <p>
            Are you sure you want to delete{" "}
            <strong className="text-slate-900 font-semibold">{credential.name}</strong>?
          </p>
          <p className="text-slate-500">
            This action will permanently remove this secret from the vault and cannot be undone.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            isLoading={loading}
            className="gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Credential</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
