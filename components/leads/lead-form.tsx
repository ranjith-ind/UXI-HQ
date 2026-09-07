import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ALL_LEAD_STATUSES,
  LEAD_PRIORITIES_LIST,
  LEAD_SOURCES_LIST,
  LEAD_STAGE_PROBABILITIES,
  SERVICE_INTERESTS_LIST,
  LeadFormData,
  LeadPriority,
  LeadSource,
  LeadStatus,
  LeadWithDetails,
  ServiceInterest,
} from "@/types/lead";
import { TeamMember } from "@/types/team";
import { TeamService } from "@/services/team.service";

interface LeadFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: LeadFormData) => Promise<void>;
  initialData?: LeadWithDetails | null;
  mode?: "add" | "edit";
  defaultStage?: LeadStatus;
}

export function LeadForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode = "add",
  defaultStage = "New",
}: LeadFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Form State
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");

  const [leadSource, setLeadSource] = useState<LeadSource>("Website");
  const [serviceInterest, setServiceInterest] = useState<ServiceInterest>("Web Application");
  const [estimatedValue, setEstimatedValue] = useState<number>(150000);
  const [priority, setPriority] = useState<LeadPriority>("Medium");
  const [assignedTo, setAssignedTo] = useState<string>("");

  const [leadStatus, setLeadStatus] = useState<LeadStatus>(defaultStage);
  const [probability, setProbability] = useState<number>(10);
  const [expectedCloseDate, setExpectedCloseDate] = useState("");
  const [nextFollowUpDate, setNextFollowUpDate] = useState("");

  const [requirements, setRequirements] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      TeamService.getTeamMembers({ memberStatus: "Active" }).then((members) => {
        setTeamMembers(members);
      });

      if (initialData && mode === "edit") {
        setFullName(initialData.full_name || "");
        setCompanyName(initialData.company_name || "");
        setEmail(initialData.email || "");
        setPhone(initialData.phone || "");
        setWhatsappNumber(initialData.whatsapp_number || "");
        setLocation(initialData.location || "");
        setWebsite(initialData.website || "");
        setLeadSource(initialData.lead_source || "Website");
        setServiceInterest(initialData.service_interest || "Web Application");
        setEstimatedValue(Number(initialData.estimated_value) || 0);
        setPriority(initialData.priority || "Medium");
        setAssignedTo(initialData.assigned_to || "");
        setLeadStatus(initialData.lead_status || "New");
        setProbability(initialData.probability ?? 10);
        setExpectedCloseDate(initialData.expected_close_date || "");
        setNextFollowUpDate(initialData.next_follow_up_date || "");
        setRequirements(initialData.requirements || "");
        setNotes(initialData.notes || "");
      } else {
        setFullName("");
        setCompanyName("");
        setEmail("");
        setPhone("");
        setWhatsappNumber("");
        setLocation("");
        setWebsite("");
        setLeadSource("Website");
        setServiceInterest("Web Application");
        setEstimatedValue(150000);
        setPriority("Medium");
        setAssignedTo("");
        setLeadStatus(defaultStage);
        setProbability(LEAD_STAGE_PROBABILITIES[defaultStage] || 10);
        setExpectedCloseDate("");
        setNextFollowUpDate("");
        setRequirements("");
        setNotes("");
      }
      setCurrentStep(1);
      setErrors({});
    }
  }, [isOpen, initialData, mode, defaultStage]);

  if (!isOpen) return null;

  const handleStageChange = (newStage: LeadStatus) => {
    setLeadStatus(newStage);
    setProbability(LEAD_STAGE_PROBABILITIES[newStage] || 10);
  };

  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {};
    if (s === 1) {
      if (!fullName.trim()) errs.fullName = "Contact name is required";
    }
    if (s === 2) {
      if (estimatedValue < 0) errs.estimatedValue = "Estimated deal value cannot be negative";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrev = () => {
    setErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) return;

    setLoading(true);
    try {
      const payload: LeadFormData = {
        full_name: fullName.trim(),
        company_name: companyName.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        whatsapp_number: whatsappNumber.trim() || undefined,
        location: location.trim() || undefined,
        website: website.trim() || undefined,
        lead_source: leadSource,
        service_interest: serviceInterest,
        estimated_value: Number(estimatedValue) || 0,
        priority,
        lead_status: leadStatus,
        probability,
        assigned_to: assignedTo || undefined,
        expected_close_date: expectedCloseDate || undefined,
        next_follow_up_date: nextFollowUpDate || undefined,
        requirements: requirements.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      await onSubmit(payload);
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

      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 font-display">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>{mode === "add" ? "Create Prospective Deal" : "Edit Sales Lead"}</span>
            </h2>
            <p className="text-xs text-slate-500">Step {currentStep} of 4 — CRM Deal Capture</p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between py-3 border-b border-slate-100 shrink-0">
          {[
            { num: 1, label: "Contact Info" },
            { num: 2, label: "Deal Details" },
            { num: 3, label: "Pipeline Stage" },
            { num: 4, label: "Requirements" },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => {
                if (s.num < currentStep || validateStep(currentStep)) setCurrentStep(s.num);
              }}
              className={`flex items-center gap-2 text-xs font-semibold ${
                currentStep === s.num
                  ? "text-blue-600 font-bold"
                  : currentStep > s.num
                  ? "text-emerald-600"
                  : "text-slate-400"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                  currentStep === s.num
                    ? "bg-blue-600 text-white shadow-sm"
                    : currentStep > s.num
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-500 border border-slate-200"
                }`}
              >
                {currentStep > s.num ? "✓" : s.num}
              </div>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Form Body Steps */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-5 space-y-4">
          {/* STEP 1 */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-display">
                  Primary Contact Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
                />
                {errors.fullName && <p className="text-[11px] text-rose-600 font-medium">{errors.fullName}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-display">Company / Brand Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Labs Technologies"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-display">Email Address</label>
                  <input
                    type="email"
                    placeholder="sarah@apexlabs.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-display">Phone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-display">Website URL</label>
                  <input
                    type="text"
                    placeholder="https://apexlabs.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-display">Lead Source</label>
                  <select
                    value={leadSource}
                    onChange={(e) => setLeadSource(e.target.value as LeadSource)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
                  >
                    {LEAD_SOURCES_LIST.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-display">Service Required</label>
                  <select
                    value={serviceInterest}
                    onChange={(e) => setServiceInterest(e.target.value as ServiceInterest)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
                  >
                    {SERVICE_INTERESTS_LIST.map((srv) => (
                      <option key={srv} value={srv}>
                        {srv}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-display">Estimated Deal Value (INR)</label>
                  <input
                    type="number"
                    min="0"
                    value={estimatedValue}
                    onChange={(e) => setEstimatedValue(Number(e.target.value))}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-display">Deal Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as LeadPriority)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
                  >
                    {LEAD_PRIORITIES_LIST.map((p) => (
                      <option key={p} value={p}>
                        {p} Priority
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-display">Assigned Sales Owner</label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-display">Pipeline Stage</label>
                  <select
                    value={leadStatus}
                    onChange={(e) => handleStageChange(e.target.value as LeadStatus)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
                  >
                    {ALL_LEAD_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-display">Win Probability (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={probability}
                    onChange={(e) => setProbability(Number(e.target.value))}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-display">Target Close Date</label>
                  <input
                    type="date"
                    value={expectedCloseDate}
                    onChange={(e) => setExpectedCloseDate(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 font-display">Next Follow-Up Date</label>
                  <input
                    type="date"
                    value={nextFollowUpDate}
                    onChange={(e) => setNextFollowUpDate(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-display">Requirement Summary / Scope</label>
                <textarea
                  rows={4}
                  placeholder="Detail client deliverables, tech stack preference, features requested..."
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-display">Internal Sales Notes</label>
                <textarea
                  rows={3}
                  placeholder="Budget flexibility, key stakeholders, competitor mentions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>
            </div>
          )}

          {/* Footer Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 shrink-0">
            {currentStep > 1 ? (
              <Button type="button" variant="secondary" size="sm" onClick={handlePrev} className="gap-1 font-semibold">
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              {currentStep < 4 ? (
                <Button type="button" variant="default" size="sm" onClick={handleNext} className="gap-1 font-semibold shadow-sm">
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  isLoading={loading}
                  className="font-bold shadow-sm bg-blue-600 hover:bg-blue-700"
                >
                  {mode === "add" ? "Register Sales Lead" : "Save Changes"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
