"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2451EB]/20 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.02] active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 text-white shadow-xs hover:bg-blue-700 active:bg-blue-800 border border-transparent",
        secondary:
          "bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 shadow-xs",
        outline:
          "border border-slate-200/90 bg-transparent text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300",
        ghost:
          "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900",
        destructive:
          "bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100 hover:border-rose-300",
        link: "text-blue-600 underline-offset-4 hover:underline font-medium",
        glow:
          "bg-blue-600 text-white shadow-xs hover:bg-blue-700",
      },
      size: {
        default: "h-9 px-4 py-2 text-xs sm:text-sm",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-10.5 rounded-xl px-5 text-sm font-semibold",
        icon: "h-9 w-9 p-0 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
