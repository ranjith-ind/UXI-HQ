import React, { useState, useEffect } from "react";
import {
  Trophy,
  X,
  CheckCircle2,
  AlertCircle,
  Building,
  FolderKanban,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeadWithDetails } from "@/types/lead";
import { ClientFormData } from "@/types/client";
import {
  ProjectFormData,
  PROJECT_TYPES_LIST,
  PROJECT_PRIORITY_LIST,
  ProjectType,
  ProjectPriority,
} from "@/types/project";
import { TeamMember } from "@/types/team";
import { TeamService } from "@/services/team.service";
import { formatCurrency } from "@/lib/utils";

interface LeadConvertModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: LeadWithDetails | null;
  onConvert: (
    leadId: string,
    clientData: ClientFormData,
    projectData?: ProjectFormData
  ) => Promise<{ success: boolean; error?: string }>;
}

export function LeadConvertModal({
  isOpen,
  onClose,
  lead,
  onConvert,
}: LeadConvertModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Step 1: Client Fields
  const [clientName, setClientName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");

  // Step 2: Project Fields (Optional)
  const [createProjectImmediately, setCreateProjectImmediately] = useState(true);
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState<ProjectType>("Web Application");
  const [projectBudget, setProjectBudget] = useState<number>(0);
  const [projectPriority, setProjectPriority] = useState<ProjectPriority>("High");
  const [projectDeadline, setProjectDeadline] = useState("");
  const [projectLeadMember, setProjectLeadMember] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  useEffect(() => {
    TeamService.getTeamMembers().then(setTeamMembers);
  }, []);

  useEffect(() => {
    if (lead) {
      setClientName(lead.full_name || "");
      setCompanyName(lead.company_name || "");
      setEmail(lead.email || "");
      setPhone(lead.phone || "");
      setWhatsappNumber(lead.whatsapp_number || lead.phone || "");
      setLocation(lead.location || "");
      setWebsite(lead.website || "");

      // Default project name from company or lead name + service interest
      const defaultProj = lead.company_name
        ? `${lead.company_name} - ${lead.service_interest}`
        : `${lead.full_name} - ${lead.service_interest}`;
      setProjectName(defaultProj);
      setProjectBudget(Number(lead.estimated_value) || 0);

      // Map service interest to project type
      if (lead.service_interest === "UI/UX Design") setProjectType("UI/UX Design");
      else if (lead.service_interest === "E-Commerce") setProjectType("E-Commerce Website");
      else if (lead.service_interest === "SaaS Product") setProjectType("SaaS Platform");
      else if (lead.service_interest === "Portfolio Website") setProjectType("Portfolio Website");
      else if (lead.service_interest === "Business Website") setProjectType("Business Website");
      else if (lead.service_interest === "Custom Software") setProjectType("Custom Software");
      else setProjectType("Web Application");

      setProjectPriority(lead.priority === "Urgent" ? "Urgent" : lead.priority === "High" ? "High" : "Medium");
      setProjectDeadline(lead.expected_close_date || "");
      setProjectLeadMember(lead.assigned_to || "");
      setProjectDescription(lead.requirements || lead.notes || "");

      setStep(1);
      setError(null);
    }
  }, [lead, isOpen]);

  if (!isOpen || !lead) return null;

  if (lead.converted_client_id) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in font-sans">
        <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl p-6 text-center space-y-4">
          <div className="p-3 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 w-fit mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 font-display">Lead Already Converted</h3>
          <p className="text-xs text-slate-500">
            This sales lead has already been converted into an active customer account.
          </p>
          <Button variant="default" size="sm" onClick={onClose} className="w-full text-xs font-bold">
            Close
          </Button>
        </div>
      </div>
    );
  }

  const handleConfirmConversion = async () => {
    setLoading(true);
    setError(null);
    try {
      const clientPayload: ClientFormData = {
        company_name: companyName.trim() || clientName.trim(),
        full_name: clientName.trim(),
        email: email.trim() || "client@placeholder.com",
        phone: phone.trim() || undefined,
        whatsapp_number: whatsappNumber.trim() || undefined,
        location: location.trim() || undefined,
        website: website.trim() || undefined,
        client_status: "Active",
        source: "Direct Contact",
        notes: `Converted from Sales Lead ${lead.lead_code}.\nOriginal Notes: ${lead.notes || "None"}`,
      };

      let projectPayload: ProjectFormData | undefined = undefined;

      if (createProjectImmediately && projectName.trim()) {
        projectPayload = {
          project_name: projectName.trim(),
          client_id: "", // Will be assigned during atomic transaction
          project_code: "", // Will be auto-generated by ProjectService if empty
          project_type: projectType,
          project_status: "Discussion",
          priority: projectPriority,
          estimated_budget: Number(projectBudget) || 0,
          final_budget: Number(projectBudget) || 0,
          advance_amount: 0,
          estimated_deadline: projectDeadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          team_member_ids: projectLeadMember ? [projectLeadMember] : [],
          description: projectDescription.trim() || undefined,
        };
      }

      const res = await onConvert(lead.id, clientPayload, projectPayload);
      if (!res.success) {
        setError(res.error || "Failed to execute conversion.");
      } else {
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Conversion error occurred";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in font-sans">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 shadow-sm">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Convert Sales Lead to Customer
              </h3>
              <p className="text-xs text-slate-500">
                Transform {lead.lead_code} into an active client account and initialize delivery project
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 text-xs">
          <div className={`flex items-center gap-1.5 ${step === 1 ? "text-blue-600 font-bold" : step > 1 ? "text-emerald-600" : "text-slate-400"}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 1 ? "bg-blue-600 text-white" : step > 1 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"}`}>1</span>
            <span>1. Client Record</span>
          </div>
          <div className={`flex items-center gap-1.5 ${step === 2 ? "text-blue-600 font-bold" : step > 2 ? "text-emerald-600" : "text-slate-400"}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 2 ? "bg-blue-600 text-white" : step > 2 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"}`}>2</span>
            <span>2. Project Delivery</span>
          </div>
          <div className={`flex items-center gap-1.5 ${step === 3 ? "text-blue-600 font-bold" : "text-slate-400"}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 3 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>3</span>
            <span>3. Review & Convert</span>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Client Information */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-display">
                  Primary Contact Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-display">Company / Brand Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-display">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-display">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Project Information */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in text-xs">
            <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50">
              <input
                type="checkbox"
                id="createProject"
                checked={createProjectImmediately}
                onChange={(e) => setCreateProjectImmediately(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="createProject" className="text-xs font-bold text-slate-900 cursor-pointer">
                Automatically initialize project delivery workspace for this client
              </label>
            </div>

            {createProjectImmediately && (
              <div className="space-y-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-display">Project Name</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 font-display">Project Type</label>
                    <select
                      value={projectType}
                      onChange={(e) => setProjectType(e.target.value as ProjectType)}
                      className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
                    >
                      {PROJECT_TYPES_LIST.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 font-display">Contract Budget (INR)</label>
                    <input
                      type="number"
                      min="0"
                      value={projectBudget}
                      onChange={(e) => setProjectBudget(Number(e.target.value))}
                      className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in text-xs font-sans">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm font-display">{clientName}</h3>
                  <p className="text-slate-500">{companyName || "Individual Client"}</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Ready to Convert
                </span>
              </div>

              {createProjectImmediately && (
                <div className="space-y-1 text-slate-600">
                  <p className="font-bold text-slate-900 font-display">Project to be initialized:</p>
                  <p className="text-blue-600 font-semibold">{projectName}</p>
                  <p className="font-mono">Budget: {formatCurrency(projectBudget, "INR")}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {step > 1 ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setStep(step - 1)}
              className="gap-1 font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {step < 3 ? (
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => setStep(step + 1)}
                className="gap-1 font-semibold shadow-sm"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleConfirmConversion}
                isLoading={loading}
                className="font-bold shadow-sm bg-emerald-600 hover:bg-emerald-700"
              >
                Confirm & Convert Lead
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
