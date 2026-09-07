"use client";

import React from "react";
import Link from "next/link";
import { User, Settings, LogOut, Shield, Check, Users } from "lucide-react";
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/ui/dropdown";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { FOUNDING_MEMBERS } from "@/lib/supabase/mock-data";

export function UserMenu() {
  const { user, logout, loginAsFounder } = useAuth();

  return (
    <Dropdown
      align="right"
      trigger={
        <div className="flex items-center gap-2.5 p-1 pl-2.5 rounded-xl border border-[#E6EAF2] bg-white hover:border-[#D6DCE8] hover:bg-[#F7F9FC] transition-all duration-150 cursor-pointer group scalemorphic-button">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-xs font-semibold text-[#0F172A] group-hover:text-[#2451EB] transition-colors leading-tight">
              {user?.fullName || "Ranjith"}
            </span>
            <span className="text-[10px] text-[#2451EB] font-medium">
              {user?.role || "Admin"} • UXI HQ
            </span>
          </div>

          <Avatar
            src={user?.avatarUrl}
            name={user?.fullName || "UXI"}
            size="sm"
            className="ring-1 ring-[#2451EB]/20"
          />
        </div>
      }
    >
      {/* User Header Details */}
      <div className="p-3.5 pb-2.5 border-b border-slate-100">
        <p className="text-xs font-bold text-slate-900 leading-tight">
          {user?.fullName || "Ranjith"}
        </p>
        <p className="text-[11px] text-slate-500 truncate mt-0.5">
          {user?.email || "ranjith@uxitech.in"}
        </p>
        <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100 text-[10px] font-semibold text-blue-700 font-mono">
          <Shield className="w-3 h-3 text-blue-600" />
          {user?.role || "Admin"} Privileges
        </div>
      </div>

      <div className="p-1 space-y-0.5">
        <Link href="/settings">
          <DropdownItem>
            <User className="w-4 h-4 text-slate-400 mr-2" />
            <span>My Profile</span>
          </DropdownItem>
        </Link>
        <Link href="/settings">
          <DropdownItem>
            <Settings className="w-4 h-4 text-slate-400 mr-2" />
            <span>Workspace Settings</span>
          </DropdownItem>
        </Link>
      </div>

      {/* Quick Founder Switcher (for team convenience) */}
      <DropdownSeparator />
      <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
        <Users className="w-3 h-3 text-blue-600" /> Switch Profile
      </div>
      <div className="p-1 space-y-0.5">
        {FOUNDING_MEMBERS.map((founder) => {
          const isCurrent = user?.email.toLowerCase() === founder.email.toLowerCase();
          return (
            <DropdownItem
              key={founder.email}
              onClick={() => loginAsFounder(founder.email)}
              className={isCurrent ? "bg-blue-50 text-blue-700 font-bold" : ""}
            >
              <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mr-2" />
              <span className="flex-1">{founder.fullName}</span>
              {isCurrent && <Check className="w-3.5 h-3.5 text-blue-600 ml-2" />}
            </DropdownItem>
          );
        })}
      </div>

      <DropdownSeparator />
      <div className="p-1">
        <DropdownItem onClick={() => logout()} destructive>
          <LogOut className="w-4 h-4 mr-2" />
          <span>Sign out of UXI HQ</span>
        </DropdownItem>
      </div>
    </Dropdown>
  );
}
