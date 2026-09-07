import * as React from "react";
import { cn } from "@/lib/utils";

interface DetailLayoutProps {
  primary: React.ReactNode;
  secondary: React.ReactNode;
  className?: string;
}

export function DetailLayout({
  primary,
  secondary,
  className,
}: DetailLayoutProps) {
  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-6", className)}>
      <div className="lg:col-span-2 space-y-6">{primary}</div>
      <div className="lg:col-span-1 space-y-6">{secondary}</div>
    </div>
  );
}

