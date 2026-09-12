"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  KeyRound,
  Shield,
  Plus,
  Trash2,
  FolderKanban,
  Globe,
  User,
  Lock,
  FileText,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CredentialFormData,
  CredentialType,
  CREDENTIAL_TYPES_LIST,
  ProjectCredential,
} from "@/types/credential";
import { CredentialService } from "@/services/credential.service";
import { ProjectWithDetails } from "@/types/project";
import { cn } from "@/lib/utils";

interface CredentialFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CredentialFormData) => Promise<void>;
  projectsList: ProjectWithDetails[];
  initialData?: ProjectCredential | null;
  preselectedProjectId?: string;
  mode?: "add" | "edit";
}

export function CredentialFormModal({
  isOpen,
  onClose,
  onSubmit,
  projectsList,
  initialData,
  preselectedProjectId,
  mode = "add",
}: CredentialFormModalProps) {
  const [formData, setFormData] = useState<CredentialFormData>({
    project_id: preselectedProjectId || "",
    name: "",
    credential_type: "Domain",
    url: "",
    username: "",
    password: "",
    notes: "",
    custom_fields: [],
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      // In edit mode, populate fields. If password was previously set, leave input empty unless user chooses to overwrite.
      setFormData({
        project_id: initialData.project_id || preselectedProjectId || "",
        name: initialData.name || "",
        credential_type: initialData.credential_type || "Domain",
        url: initialData.url || "",
        username: initialData.username || "",
        password: "",
        notes: initialData.notes || "",
        custom_fields: (initialData.custom_fields || []).map((f) => ({
          field_name: f.field_name,
          field_value: f.field_value,
          is_sensitive: f.is_sensitive,
        })),
      });

      // Optionally fetch plain password for pre-filling edit form
      if (initialData.encrypted_password) {
        CredentialService.revealSecret({
          credentialId: initialData.id,
          fieldType: "password",
        }).then((res) => {
          if (res.success && res.plaintext !== undefined) {
            setFormData((prev) => ({ ...prev, password: res.plaintext }));
          }
        });
      }
    } else {
      setFormData({
        project_id: preselectedProjectId || (projectsList.length > 0 ? projectsList[0].id : ""),
        name: "",
        credential_type: "Domain",
        url: "",
        username: "",
        password: "",
        notes: "",
        custom_fields: [],
      });
    }
    setErrors({});
  }, [initialData, preselectedProjectId, projectsList, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.project_id) newErrors.project_id = "Project selection is required";
    if (!formData.name.trim()) newErrors.name = "Credential name is required";
    if (!formData.credential_type) newErrors.credential_type = "Credential type is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || loading) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=";
    let pw = "";
    for (let i = 0; i < 20; i++) {
      pw += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: pw }));
    setShowPassword(true);
  };

  const handleAddCustomField = () => {
    setFormData((prev) => ({
      ...prev,
      custom_fields: [
        ...(prev.custom_fields || []),
        { field_name: "", field_value: "", is_sensitive: false },
      ],
    }));
  };

  const handleRemoveCustomField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      custom_fields: (prev.custom_fields || []).filter((_, i) => i !== index),
    }));
  };

  const handleCustomFieldChange = (
    index: number,
    field: "field_name" | "field_value" | "is_sensitive",
    value: any
  ) => {
    setFormData((prev) => {
      const updated = [...(prev.custom_fields || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, custom_fields: updated };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-xs">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                {mode === "add" ? "Add New Credential" : "Edit Credential"}
              </h3>
              <p className="text-xs text-slate-500">
                Encrypted in-browser using AES-256 before storage in vault
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Project Selection */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <FolderKanban className="w-3.5 h-3.5 text-blue-600" />
              <span>Project Assignment *</span>
            </label>
            <select
              value={formData.project_id}
              onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
              disabled={!!preselectedProjectId}
              className={cn(
                "w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20",
                preselectedProjectId && "bg-slate-50 opacity-80 cursor-not-allowed",
                errors.project_id && "border-rose-400"
              )}
            >
              <option value="">Select project...</option>
              {projectsList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.project_name} ({p.project_code}) {p.client_company ? `— ${p.client_company}` : ""}
                </option>
              ))}
            </select>
            {errors.project_id && <p className="text-rose-600 text-[11px]">{errors.project_id}</p>}
          </div>

          {/* Name & Type Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">
                Credential Name *
              </label>
              <Input
                placeholder="e.g. Production Database, Main Admin Panel"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={errors.name ? "border-rose-400" : ""}
              />
              {errors.name && <p className="text-rose-600 text-[11px]">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">
                Credential Type *
              </label>
              <select
                value={formData.credential_type}
                onChange={(e) =>
                  setFormData({ ...formData, credential_type: e.target.value as CredentialType })
                }
                className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
              >
                {CREDENTIAL_TYPES_LIST.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* URL / Host */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>URL / Host / IP (optional)</span>
            </label>
            <Input
              placeholder="https://app.client.com or db.provider.internal"
              value={formData.url || ""}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            />
          </div>

          {/* Username & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Username / Email / API User</span>
              </label>
              <Input
                placeholder="admin, dev@uxitech.in, api_key_id"
                value={formData.username || ""}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Password / Secret Key</span>
                </label>

                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="text-[10px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Generate</span>
                </button>
              </div>

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter or generate secret"
                  value={formData.password || ""}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Custom Fields (Dynamic Parameters) */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-xs">Custom Fields & Parameters</h4>
                <p className="text-[11px] text-slate-400">
                  Add server ports, database names, SSH keys, or environment parameters
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddCustomField}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 p-1 rounded-md hover:bg-blue-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Field</span>
              </button>
            </div>

            {formData.custom_fields && formData.custom_fields.length > 0 ? (
              <div className="space-y-2">
                {formData.custom_fields.map((field, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <Input
                      placeholder="Field Name (e.g. Port, DB Name)"
                      value={field.field_name}
                      onChange={(e) =>
                        handleCustomFieldChange(idx, "field_name", e.target.value)
                      }
                      className="w-full sm:w-1/3 text-xs"
                    />
                    <Input
                      placeholder="Value"
                      value={field.field_value}
                      type={field.is_sensitive ? "password" : "text"}
                      onChange={(e) =>
                        handleCustomFieldChange(idx, "field_value", e.target.value)
                      }
                      className="w-full sm:w-1/2 text-xs"
                    />

                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2 shrink-0">
                      <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={field.is_sensitive}
                          onChange={(e) =>
                            handleCustomFieldChange(idx, "is_sensitive", e.target.checked)
                          }
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>Mask</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => handleRemoveCustomField(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic">No custom fields added.</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Notes & Access Instructions</span>
            </label>
            <textarea
              rows={3}
              placeholder="Provide context, rotation schedules, internal staging notes..."
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          {/* Security Notice */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-[11px]">
            <Shield className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>
              Values are protected with client-side Web Crypto AES-GCM encryption before persistence.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="default" type="submit" isLoading={loading}>
              {mode === "add" ? "Save Credential" : "Update Credential"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
