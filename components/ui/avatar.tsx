import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  name: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  role?: string;
}

const sizeClasses = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-11 w-11 text-base",
  xl: "h-14 w-14 text-lg font-semibold",
};

export function Avatar({ src, name, className, size = "md" }: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  // Generate initials
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Vibrant gradients with clean white borders
  const colors = [
    "from-blue-600 to-indigo-600",
    "from-cyan-600 to-blue-600",
    "from-violet-600 to-purple-600",
    "from-sky-600 to-blue-700",
    "from-emerald-600 to-teal-700",
  ];
  const charCode = name.charCodeAt(0) || 0;
  const bgGradient = colors[charCode % colors.length];

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center shrink-0 rounded-full border border-slate-200 overflow-hidden shadow-sm font-semibold text-white",
        sizeClasses[size],
        className
      )}
    >
      {src && !imageError ? (
        <Image
          src={src}
          alt={name}
          fill
          className="object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div
          className={cn(
            "w-full h-full flex items-center justify-center bg-gradient-to-br tracking-wider",
            bgGradient
          )}
        >
          {initials}
        </div>
      )}
    </div>
  );
}
