"use client";

import React, { useState } from "react";
import {
  KeyRound,
  ExternalLink,
  Eye,
  EyeOff,
  Copy,
  Check,
  MoreVertical,
  Edit2,
  Trash2,
  History,
  Shield,
  FolderKanban,
  User,
  Globe,
  Lock,
} from "lucide-react";
import { ProjectCredential, CredentialCustomField } from "@/types/credential";
import { CredentialService } from "@/services/credential.service";
import { Badge } from "@/components/ui/badge";
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/ui/dropdown";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";

interface CredentialCardProps {
  credential: ProjectCredential;
  onEdit: (credential: ProjectCredential) => void;
  onDelete: (credential: ProjectCredential) => void;
  onViewActivity: (credential: ProjectCredential) => void;
}

export function CredentialCard({
  credential,
  onEdit,
  onDelete,
  onViewActivity,
}: CredentialCardProps) {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [revealedPassword, setRevealedPassword] = useState<string | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedUsername, setCopiedUsername] = useState(false);
  const [copiedCustomFieldId, setCopiedCustomFieldId] = useState<string | null>(null);

  // Decrypted cache for sensitive custom fields
  const [revealedCustomFields, setRevealedCustomFields] = useState<Record<string, string>>({});

  const canManage = user?.role === "Admin" || user?.role === "Manager";

  const handleToggleReveal = async () => {
    if (revealedPassword !== null) {
      setRevealedPassword(null);
      return;
    }

    if (!credential.encrypted_password) {
      setRevealedPassword("");
      return;
    }

    setIsRevealing(true);
    try {
      const res = await CredentialService.revealSecret({
        credentialId: credential.id,
        fieldType: "password",
        action: "Viewed",
      });

      if (res.success && res.plaintext !== undefined) {
        setRevealedPassword(res.plaintext);
      } else {
        toastError("Access Denied", res.error || "Could not decrypt secret.");
      }
    } finally {
      setIsRevealing(false);
    }
  };

  const handleCopyPassword = async () => {
    if (!credential.encrypted_password) return;

    let textToCopy = revealedPassword;
    if (!textToCopy) {
      const res = await CredentialService.revealSecret({
        credentialId: credential.id,
        fieldType: "password",
        action: "Copied",
      });
      if (res.success && res.plaintext !== undefined) {
        textToCopy = res.plaintext;
      } else {
        toastError("Access Denied", res.error || "Could not copy secret.");
        return;
      }
    }

    if (textToCopy) {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedPassword(true);
      success("Password copied", "Copied to clipboard.");
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  const handleCopyUsername = async () => {
    if (!credential.username) return;
    await navigator.clipboard.writeText(credential.username);
    setCopiedUsername(true);
    success("Username copied", "Copied to clipboard.");
    setTimeout(() => setCopiedUsername(false), 2000);
  };

  const handleToggleRevealCustomField = async (field: CredentialCustomField, index: number) => {
    const key = field.id || `idx-${index}`;
    if (revealedCustomFields[key] !== undefined) {
      const next = { ...revealedCustomFields };
      delete next[key];
      setRevealedCustomFields(next);
      return;
    }

    if (field.is_sensitive) {
      const res = await CredentialService.revealSecret({
        credentialId: credential.id,
        fieldType: "custom_field",
        customFieldId: field.id,
        action: "Viewed",
      });
      if (res.success && res.plaintext !== undefined) {
        setRevealedCustomFields((prev) => ({ ...prev, [key]: res.plaintext! }));
      } else {
        toastError("Access Denied", res.error || "Could not decrypt custom field.");
      }
    }
  };

  const handleCopyCustomField = async (
    field: CredentialCustomField,
    index: number
  ) => {
    const key = field.id || `idx-${index}`;
    let val = revealedCustomFields[key];

    if (val === undefined) {
      if (field.is_sensitive) {
        const res = await CredentialService.revealSecret({
          credentialId: credential.id,
          fieldType: "custom_field",
          customFieldId: field.id,
          action: "Copied",
        });
        if (res.success && res.plaintext !== undefined) {
          val = res.plaintext;
        } else {
          toastError("Access Denied", res.error || "Could not copy parameter.");
          return;
        }
      } else {
        val = field.field_value;
      }
    }

    if (val !== undefined) {
      await navigator.clipboard.writeText(val);
      setCopiedCustomFieldId(key);
      success(`${field.field_name} copied`, "Copied to clipboard.");
      setTimeout(() => setCopiedCustomFieldId(null), 2000);
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "Domain":
      case "Hosting":
        return "default";
      case "Database":
        return "purple";
      case "Cloudflare":
      case "Vercel":
      case "GitHub":
        return "secondary";
      case "API Key":
      case "Server / SSH":
        return "warning";
      default:
        return "outline";
    }
  };

  return (
    <div className="flex flex-col justify-between rounded-xl border border-[#E6EAF2] bg-white p-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all duration-150">
      {/* Top row: Title, Type Badge, and Actions */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-[#0F172A] tracking-tight truncate">
                {credential.name}
              </span>
              <Badge variant={getTypeBadgeVariant(credential.credential_type)} className="text-[10px]">
                {credential.credential_type}
              </Badge>
            </div>

            {/* Project / Client indicator */}
            <div className="flex items-center gap-1.5 text-xs text-[#5B6472] truncate">
              <FolderKanban className="w-3.5 h-3.5 shrink-0 text-[#2451EB]" />
              <span className="font-semibold text-slate-800 truncate">
                {credential.project_name || "Project Vault"}
              </span>
              {credential.project_code && (
                <span className="font-mono text-[10px] text-slate-400">
                  ({credential.project_code})
                </span>
              )}
            </div>
          </div>

          {/* Context menu */}
          <div className="shrink-0 flex items-center gap-1">
            <button
              onClick={() => onViewActivity(credential)}
              title="Audit Logs"
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#2451EB] hover:bg-[#EFF4FE] transition-colors"
            >
              <History className="w-4 h-4" />
            </button>

            {canManage && (
              <Dropdown
                align="right"
                trigger={
                  <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                }
              >
                <DropdownItem onClick={() => onEdit(credential)}>
                  <Edit2 className="w-3.5 h-3.5 mr-2 text-blue-600" />
                  <span>Edit Credential</span>
                </DropdownItem>
                <DropdownItem onClick={() => onViewActivity(credential)}>
                  <History className="w-3.5 h-3.5 mr-2 text-purple-600" />
                  <span>View Activity Logs</span>
                </DropdownItem>
                <DropdownSeparator />
                <DropdownItem onClick={() => onDelete(credential)} destructive>
                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                  <span>Delete</span>
                </DropdownItem>
              </Dropdown>
            )}
          </div>
        </div>

        {/* URL Link if available */}
        {credential.url && (
          <div className="mt-3 flex items-center gap-1.5 text-xs">
            <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <a
              href={credential.url.startsWith("http") ? credential.url : `https://${credential.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2451EB] hover:underline font-mono text-[11px] truncate flex items-center gap-1"
            >
              <span>{credential.url}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Credentials Box */}
        <div className="mt-4 rounded-lg bg-[#F7F9FC] border border-[#E6EAF2] p-3 space-y-2 text-xs">
          {/* Username */}
          {credential.username && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-[#5B6472] uppercase tracking-wider flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                Username:
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs text-slate-800 font-medium select-all">
                  {credential.username}
                </span>
                <button
                  onClick={handleCopyUsername}
                  title="Copy Username"
                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                >
                  {copiedUsername ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Password */}
          {credential.encrypted_password && (
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
              <span className="text-[11px] font-semibold text-[#5B6472] uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                Password:
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs font-medium text-slate-800 select-all">
                  {revealedPassword !== null
                    ? revealedPassword || "—"
                    : "••••••••••••"}
                </span>

                <button
                  onClick={handleToggleReveal}
                  disabled={isRevealing}
                  title={revealedPassword ? "Hide Password" : "Reveal Password"}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                >
                  {revealedPassword ? (
                    <EyeOff className="w-3.5 h-3.5 text-blue-600" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>

                <button
                  onClick={handleCopyPassword}
                  title="Copy Password"
                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                >
                  {copiedPassword ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Custom Fields (Server IP, Port, DB Name, etc.) */}
        {credential.custom_fields && credential.custom_fields.length > 0 && (
          <div className="mt-3 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Additional Parameters
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
              {credential.custom_fields.map((f, idx) => {
                const key = f.id || `idx-${idx}`;
                const isRevealed = revealedCustomFields[key] !== undefined;
                const displayVal = f.is_sensitive
                  ? isRevealed
                    ? revealedCustomFields[key]
                    : "••••••••"
                  : f.field_value;

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px]"
                  >
                    <span className="text-slate-500 font-medium truncate max-w-[90px]">
                      {f.field_name}:
                    </span>
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="font-mono text-slate-800 font-semibold truncate">
                        {displayVal}
                      </span>
                      {f.is_sensitive && (
                        <button
                          onClick={() => handleToggleRevealCustomField(f, idx)}
                          className="p-0.5 text-slate-400 hover:text-slate-700"
                        >
                          {isRevealed ? (
                            <EyeOff className="w-3 h-3" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => handleCopyCustomField(f, idx)}
                        className="p-0.5 text-slate-400 hover:text-slate-700"
                      >
                        {copiedCustomFieldId === key ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Notes */}
        {credential.notes && (
          <p className="mt-3 text-xs text-slate-500 line-clamp-2 leading-relaxed bg-amber-50/50 p-2 rounded-lg border border-amber-100">
            {credential.notes}
          </p>
        )}
      </div>

      {/* Footer Timestamp */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
        <span>Updated {formatDate(credential.updated_at || credential.created_at)}</span>
        <span className="inline-flex items-center gap-1 text-slate-500">
          <Shield className="w-3 h-3 text-emerald-600" />
          AES-256 Vault
        </span>
      </div>
    </div>
  );
}
