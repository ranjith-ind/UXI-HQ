"use client";

import React, { useState, useEffect } from "react";
import { X, Building, Mail, Phone, Globe, MapPin, MessageSquare, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Client, ClientFormData, ClientSource, ClientStatus } from "@/types/client";

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClientFormData) => Promise<void>;
  initialData?: Client | null;
  mode?: "add" | "edit";
}

const statusOptions: ClientStatus[] = ["Active", "Lead", "Completed", "Inactive"];
const sourceOptions: ClientSource[] = [
  "Direct Contact",
  "Referral",
  "Website",
  "LinkedIn",
  "WhatsApp",
  "Instagram",
  "Other",
];

export function ClientForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = "add",
}: ClientFormProps) {
  const [formData, setFormData] = useState<ClientFormData>({
    full_name: "",
    company_name: "",
    email: "",
    phone: "",
    whatsapp_number: "",
    location: "",
    website: "",
    client_status: "Active",
    source: "Direct Contact",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData && mode === "edit") {
      setFormData({
        full_name: initialData.full_name || "",
        company_name: initialData.company_name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        whatsapp_number: initialData.whatsapp_number || initialData.phone || "",
        location: initialData.location || "",
        website: initialData.website || "",
        client_status: initialData.client_status || "Active",
        source: initialData.source || "Direct Contact",
        notes: initialData.notes || "",
      });
    } else {
      setFormData({
        full_name: "",
        company_name: "",
        email: "",
        phone: "",
        whatsapp_number: "",
        location: "",
        website: "",
        client_status: "Active",
        source: "Direct Contact",
        notes: "",
      });
    }
    setErrors({});
  }, [initialData, mode, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.full_name.trim()) {
      newErrors.full_name = "Contact full name is required";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
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

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                {mode === "add" ? "Add New Client" : "Edit Client Information"}
              </h3>
              <p className="text-xs text-slate-500">
                {mode === "add"
                  ? "Register a new business account into UXI HQ"
                  : `Update account records for ${formData.full_name || "Client"}`}
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

        {/* Modal Form Scrollable Area */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
          {/* Section 1: Client Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 font-display flex items-center gap-2">
              <Building className="w-3.5 h-3.5" /> 1. Contact & Identity
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  placeholder="e.g. Vikramaditya Sharma"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  icon={<User className="w-4 h-4 text-slate-400" />}
                />
                {errors.full_name && (
                  <p className="text-[11px] text-rose-600 font-medium">{errors.full_name}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Company Name</label>
                <Input
                  placeholder="e.g. FinPulse Technologies"
                  value={formData.company_name || ""}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  icon={<Building className="w-4 h-4 text-slate-400" />}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Email Address</label>
                <Input
                  type="email"
                  placeholder="contact@company.com"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  icon={<Mail className="w-4 h-4 text-slate-400" />}
                />
                {errors.email && (
                  <p className="text-[11px] text-rose-600 font-medium">{errors.email}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Phone Number</label>
                <Input
                  placeholder="+91 98450 11223"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  icon={<Phone className="w-4 h-4 text-slate-400" />}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  WhatsApp Number <span className="text-slate-400 font-normal">(for 1-click messaging)</span>
                </label>
                <Input
                  placeholder="+91 98450 11223"
                  value={formData.whatsapp_number || ""}
                  onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                  icon={<MessageSquare className="w-4 h-4 text-slate-400" />}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Location / City</label>
                <Input
                  placeholder="e.g. Mumbai, India"
                  value={formData.location || ""}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  icon={<MapPin className="w-4 h-4 text-slate-400" />}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700">Website URL</label>
                <Input
                  placeholder="e.g. https://finpulse.io"
                  value={formData.website || ""}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  icon={<Globe className="w-4 h-4 text-slate-400" />}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Account Status & Source */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 font-display flex items-center gap-2">
              <Building className="w-3.5 h-3.5" /> 2. Lifecycle & Acquisition
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Client Status</label>
                <select
                  value={formData.client_status}
                  onChange={(e) => setFormData({ ...formData, client_status: e.target.value as ClientStatus })}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer shadow-sm"
                >
                  {statusOptions.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Acquisition Source</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value as ClientSource })}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer shadow-sm"
                >
                  {sourceOptions.map((sc) => (
                    <option key={sc} value={sc}>
                      {sc}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Notes & Key Context */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 font-display flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" /> 3. Strategic Notes & Requirements
            </h4>
            <textarea
              rows={3}
              placeholder="Add key notes, project scope expectations, preferred communication channels, billing terms..."
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-4 px-6 border-t border-slate-100 bg-slate-50/70">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleSubmit}
            isLoading={loading}
            className="shadow-sm"
          >
            {mode === "add" ? "Create Client Profile" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
