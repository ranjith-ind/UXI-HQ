"use client";

import React, { useState } from "react";
import { Plus, Trash2, Award } from "lucide-react";
import {
  ProficiencyLevel,
  SkillCategory,
  TeamMemberSkill,
  PROFICIENCY_LEVELS,
  SKILL_CATEGORIES,
} from "@/types/team";
import { Button } from "@/components/ui/button";
import { TeamService } from "@/services/team.service";
import { cn } from "@/lib/utils";

interface TeamSkillsMatrixProps {
  memberId: string;
  skills: TeamMemberSkill[];
  onSkillsChange: () => void;
  canEdit?: boolean;
}

const proficiencyColors: Record<ProficiencyLevel, { bg: string; text: string; border: string }> = {
  Beginner: {
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
  },
  Intermediate: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200/80",
  },
  Advanced: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200/80",
  },
  Expert: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200/80",
  },
};

const categoryBadgeColors: Record<SkillCategory, string> = {
  Frontend: "text-cyan-700 bg-cyan-50 border-cyan-200",
  Backend: "text-blue-700 bg-blue-50 border-blue-200",
  "UI/UX": "text-pink-700 bg-pink-50 border-pink-200",
  Database: "text-amber-700 bg-amber-50 border-amber-200",
  DevOps: "text-indigo-700 bg-indigo-50 border-indigo-200",
  "Project Management": "text-emerald-700 bg-emerald-50 border-emerald-200",
  Marketing: "text-violet-700 bg-violet-50 border-violet-200",
  Other: "text-slate-700 bg-slate-50 border-slate-200",
};

export function TeamSkillsMatrix({
  memberId,
  skills,
  onSkillsChange,
  canEdit = true,
}: TeamSkillsMatrixProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [skillName, setSkillName] = useState("");
  const [category, setCategory] = useState<SkillCategory>("Frontend");
  const [proficiency, setProficiency] = useState<ProficiencyLevel>("Intermediate");
  const [loading, setLoading] = useState(false);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;

    setLoading(true);
    try {
      await TeamService.addMemberSkill(
        memberId,
        skillName.trim(),
        category,
        proficiency
      );
      setSkillName("");
      setIsAdding(false);
      onSkillsChange();
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    try {
      await TeamService.removeMemberSkill(memberId, skillId);
      onSkillsChange();
    } catch (err) {
      console.error("Failed to delete skill:", err);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4 font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900 font-display">Technical Skills & Expertise</h3>
        </div>

        {canEdit && !isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="text-xs text-blue-600 hover:text-blue-700 font-bold hover:underline"
          >
            + Add Skill
          </button>
        )}
      </div>

      {/* Add Skill Form Drawer */}
      {isAdding && (
        <form onSubmit={handleAddSkill} className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-500 font-display">Skill / Framework Name</label>
            <input
              type="text"
              placeholder="e.g. Next.js 15, PostgreSQL, Figma, AWS..."
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              autoFocus
              className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-500 font-display">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SkillCategory)}
                className="w-full h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 focus:outline-none"
              >
                {SKILL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-500 font-display">Proficiency</label>
              <select
                value={proficiency}
                onChange={(e) => setProficiency(e.target.value as ProficiencyLevel)}
                className="w-full h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 focus:outline-none"
              >
                {PROFICIENCY_LEVELS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700"
            >
              Save Skill
            </button>
          </div>
        </form>
      )}

      {/* Skills Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {skills.map((s) => {
          const profCfg = proficiencyColors[s.proficiency_level] || proficiencyColors.Intermediate;
          const catClass = categoryBadgeColors[s.category] || categoryBadgeColors.Other;

          return (
            <div
              key={s.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 hover:bg-slate-100/70 transition-colors group"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {s.skill_name}
                  </span>
                  <span className={cn("px-1.5 py-0.2 rounded text-[9px] font-bold border", catClass)}>
                    {s.category}
                  </span>
                </div>

                <div className="mt-1">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-semibold border",
                      profCfg.bg,
                      profCfg.text,
                      profCfg.border
                    )}
                  >
                    {s.proficiency_level}
                  </span>
                </div>
              </div>

              {canEdit && (
                <button
                  type="button"
                  onClick={() => handleDeleteSkill(s.id)}
                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}

        {skills.length === 0 && !isAdding && (
          <p className="col-span-2 text-xs text-slate-400 py-6 text-center">
            No technical skills tagged for this engineer.
          </p>
        )}
      </div>
    </div>
  );
}
