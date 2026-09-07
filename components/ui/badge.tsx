import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-blue-200/80 bg-blue-50 text-blue-700 hover:bg-blue-100",
        secondary:
          "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200/70",
        success:
          "border-emerald-200/80 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
        warning:
          "border-amber-200/80 bg-amber-50 text-amber-700 hover:bg-amber-100",
        danger:
          "border-rose-200/80 bg-rose-50 text-rose-700 hover:bg-rose-100",
        purple:
          "border-purple-200/80 bg-purple-50 text-purple-700 hover:bg-purple-100",
        outline: "text-slate-600 border-slate-200 bg-white",
        glow: "border-blue-200 bg-blue-50 text-blue-700 shadow-sm shadow-blue-500/10 font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
