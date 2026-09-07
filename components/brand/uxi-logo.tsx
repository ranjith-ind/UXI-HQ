"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface UxiLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  showText?: boolean;
  subtitle?: string;
  withGlow?: boolean;
}

const sizeMap = {
  sm: { icon: 28, text: "text-base", sub: "text-[9px]" },
  md: { icon: 36, text: "text-lg", sub: "text-[10px]" },
  lg: { icon: 48, text: "text-xl", sub: "text-xs" },
  xl: { icon: 64, text: "text-2xl", sub: "text-sm" },
  hero: { icon: 96, text: "text-3xl", sub: "text-base" },
};

export function UxiLogo({
  className,
  size = "md",
  showText = true,
  subtitle = "Unified Xperience Intelligence",
  withGlow = false,
}: UxiLogoProps) {
  const currentSize = sizeMap[size];

  return (
    <div className={cn("inline-flex items-center gap-3 select-none", className)}>
      <div className="relative flex items-center justify-center">
        {withGlow && (
          <div
            className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-blue-400/20 via-blue-600/30 to-indigo-500/20 blur-md pointer-events-none"
            aria-hidden="true"
          />
        )}
        <div
          className={cn(
            "relative rounded-xl overflow-hidden flex items-center justify-center bg-white border border-slate-200/80 shadow-sm",
            size === "sm" && "w-7 h-7 rounded-lg",
            size === "md" && "w-9 h-9",
            size === "lg" && "w-12 h-12 shadow-md shadow-blue-500/5",
            size === "xl" && "w-16 h-16 shadow-lg shadow-blue-500/10",
            size === "hero" && "w-24 h-24 shadow-xl shadow-blue-500/15"
          )}
        >
          <Image
            src="/uxi-logo.png"
            alt="UXI Logo"
            width={currentSize.icon * 2}
            height={currentSize.icon * 2}
            className="object-contain w-full h-full p-0.5"
            priority
          />
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={cn(
                "font-black tracking-tight text-slate-900 uppercase font-display",
                currentSize.text
              )}
            >
              UXI{" "}
              <span className="text-blue-600 font-extrabold text-[0.9em] tracking-normal">
                HQ
              </span>
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600" />
          </div>
          {subtitle && (
            <span
              className={cn(
                "text-slate-500 font-medium tracking-normal leading-tight mt-0.5",
                currentSize.sub
              )}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
