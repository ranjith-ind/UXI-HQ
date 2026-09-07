"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationDropdown } from "./notification-dropdown";

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, refresh } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const displayCount = unreadCount > 9 ? "9+" : unreadCount > 0 ? String(unreadCount) : null;

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (!isOpen) refresh();
        }}
        className="relative p-2 rounded-xl border border-[#E6EAF2] bg-white hover:bg-[#F7F9FC] hover:border-[#D6DCE8] text-[#5B6472] hover:text-[#0F172A] transition-all focus:outline-none focus:ring-2 focus:ring-[#2451EB]/20 scalemorphic-button"
        aria-label="Open notifications"
      >
        <Bell className="w-4 h-4 text-[#5B6472]" />

        {/* Pulsing indicator badge */}
        {displayCount && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white shadow-xs">
            {displayCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <NotificationDropdown
            notifications={notifications.slice(0, 5)}
            unreadCount={unreadCount}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onClose={() => setIsOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
