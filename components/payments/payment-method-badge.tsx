import React from "react";
import { PaymentMethod } from "@/types/payment";
import { Landmark, QrCode, Banknote, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentMethodBadgeProps {
  method: PaymentMethod;
  size?: "sm" | "md";
  className?: string;
}

const methodConfig: Record<
  PaymentMethod,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  "Bank Transfer": {
    label: "Bank Transfer",
    icon: Landmark,
  },
  UPI: {
    label: "UPI Transfer",
    icon: QrCode,
  },
  Cash: {
    label: "Cash Settlement",
    icon: Banknote,
  },
  "Credit Card": {
    label: "Credit Card",
    icon: CreditCard,
  },
  "Debit Card": {
    label: "Debit Card",
    icon: CreditCard,
  },
  Other: {
    label: "Other Method",
    icon: Landmark,
  },
};

export function PaymentMethodBadge({
  method,
  size = "md",
  className,
}: PaymentMethodBadgeProps) {
  const config = methodConfig[method] || methodConfig["Bank Transfer"];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-slate-700 bg-slate-50 border border-slate-200 rounded-md select-none font-bold",
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs",
        className
      )}
    >
      <Icon className={size === "sm" ? "w-3 h-3 text-blue-600 shrink-0" : "w-3.5 h-3.5 text-blue-600 shrink-0"} />
      <span>{config.label}</span>
    </span>
  );
}
