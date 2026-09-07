import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  indicatorClassName?: string;
  size?: "sm" | "default" | "lg";
}

export function Progress({
  value,
  max = 100,
  indicatorClassName,
  size = "default",
  className,
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

  const heightClasses = {
    sm: "h-1.5",
    default: "h-2",
    lg: "h-2.5",
  };

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-full bg-[#E6EAF2]",
        heightClasses[size],
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-full bg-[#2451EB] transition-all duration-300 ease-out",
          indicatorClassName
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

