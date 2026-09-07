"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Users,
  Briefcase,
  ShieldCheck,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AvailabilityStatus,
  EmploymentType,
  MemberStatus,
  TeamMember,
  TeamMemberFormData,
  AVAILABILITY_STATUS_LIST,
  EMPLOYMENT_TYPE_LIST,
  MEMBER_STATUS_LIST,
} from "@/types/team";
import { UserRole } from "@/types/database.types";

interface TeamMemberFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TeamMemberFormData) => Promise<void>;
  initialData?: TeamMember | null;
  mode?: "add" | "edit";
}

export function TeamMemberForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = "add",
}: TeamMemberFormProps) {
  const [formData, setFormData] = useState<TeamMemberFormData>({
    full_name: "",
    email: "",
    phone: "",
    avatar_url: "",
    employee_code: "",
    role: "Developer",
    department: "Software Engineering",
    designation: "",
    bio: "",
    joined_date: new Date().toISOString().split("T")[0],
    member_status: "Active",
    employment_type: "Full Time",
    availability_status: "Available",
    weekly_capacity_hours: 40,
    timezone: "Asia/Kolkata",
    skills: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData && mode === "edit") {
      setFormData({
        full_name: initialData.full_name,
        email: initialData.email,
        phone: initialData.phone || "",
        avatar_url: initialData.avatar_url || "",
        employee_code: initialData.employee_code,
        role: initialData.role,
        department: initialData.department,
        designation: initialData.designation,
        bio: initialData.bio || "",
        joined_date: initialData.joined_date,
        member_status: initialData.member_status,
        employment_type: initialData.employment_type,
        availability_status: initialData.availability_status,
        weekly_capacity_hours: initialData.weekly_capacity_hours,
        timezone: initialData.timezone,
        skills: [],
      });
    } else {
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        avatar_url: "",
        employee_code: "",
        role: "Developer",
        department: "Software Engineering",
        designation: "",
        bio: "",
        joined_date: new Date().toISOString().split("T")[0],
        member_status: "Active",
        employment_type: "Full Time",
        availability_status: "Available",
        weekly_capacity_hours: 40,
        timezone: "Asia/Kolkata",
        skills: [],
      });
    }
    setErrors({});
  }, [initialData, mode, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.full_name.trim()) newErrors.full_name = "Full name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    if (!formData.designation.trim()) newErrors.designation = "Designation is required.";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                {mode === "add" ? "Add Team Member" : "Edit Profile"}
              </h3>
              <p className="text-xs text-slate-500">
                {mode === "add"
                  ? "Onboard new founder, developer, designer, or contractor"
                  : `Update details for ${formData.full_name}`}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 font-display">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g. Ranjith Kumar"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
              {errors.full_name && (
                <p className="text-[11px] text-rose-600 font-medium">{errors.full_name}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 font-display">
                Work Email <span className="text-rose-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="ranjith@uxihq.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {errors.email && (
                <p className="text-[11px] text-rose-600 font-medium">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 font-display">
                Designation <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g. Founder & Lead Full-Stack Architect"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              />
              {errors.designation && (
                <p className="text-[11px] text-rose-600 font-medium">{errors.designation}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 font-display">Department</label>
              <Input
                placeholder="Software Engineering, Product, UI/UX"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 font-display">System Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
              >
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Developer">Developer</option>
                <option value="Designer">Designer</option>
                <option value="QA">QA Engineer</option>
                <option value="Contractor">Contractor</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 font-display">Employment Type</label>
              <select
                value={formData.employment_type}
                onChange={(e) => setFormData({ ...formData, employment_type: e.target.value as EmploymentType })}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
              >
                {EMPLOYMENT_TYPE_LIST.map((et) => (
                  <option key={et} value={et}>
                    {et}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 font-display">Live Availability</label>
              <select
                value={formData.availability_status}
                onChange={(e) => setFormData({ ...formData, availability_status: e.target.value as AvailabilityStatus })}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
              >
                {AVAILABILITY_STATUS_LIST.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 font-display">Weekly Hours Capacity</label>
              <Input
                type="number"
                value={formData.weekly_capacity_hours}
                onChange={(e) => setFormData({ ...formData, weekly_capacity_hours: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 font-display">Bio & Experience</label>
            <textarea
              rows={3}
              placeholder="Short bio or technical background..."
              value={formData.bio || ""}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>
        </form>

        {/* Footer */}
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
            className="font-bold shadow-sm"
          >
            {mode === "add" ? "Onboard Member" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
