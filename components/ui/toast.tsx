"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (props: Omit<Toast, "id">) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ title, description, type = "success", duration = 4000 }: Omit<Toast, "id">) => {
      const id = "toast-" + Math.random().toString(36).substring(2, 9);
      const newToast: Toast = { id, title, description, type, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, description?: string) => {
      addToast({ title, description, type: "success" });
    },
    [addToast]
  );

  const error = useCallback(
    (title: string, description?: string) => {
      addToast({ title, description, type: "error" });
    },
    [addToast]
  );

  const info = useCallback(
    (title: string, description?: string) => {
      addToast({ title, description, type: "info" });
    },
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info }}>
      {children}
      {/* Toast viewport container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const typeStyles = {
            success: "border-emerald-200 bg-white text-slate-900 shadow-xl shadow-emerald-900/5",
            error: "border-rose-200 bg-white text-slate-900 shadow-xl shadow-rose-900/5",
            warning: "border-amber-200 bg-white text-slate-900 shadow-xl shadow-amber-900/5",
            info: "border-blue-200 bg-white text-slate-900 shadow-xl shadow-blue-900/5",
          }[t.type || "success"];

          const iconColor = {
            success: "text-emerald-600",
            error: "text-rose-600",
            warning: "text-amber-600",
            info: "text-blue-600",
          }[t.type || "success"];

          const Icon = {
            success: CheckCircle2,
            error: AlertCircle,
            warning: AlertCircle,
            info: Info,
          }[t.type || "success"];

          return (
            <div
              key={t.id}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all duration-200 animate-in slide-in-from-bottom-5 fade-in",
                typeStyles
              )}
            >
              <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", iconColor)} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {t.title}
                </p>
                {t.description && (
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                    {t.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
