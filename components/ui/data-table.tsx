import * as React from "react";
import { cn } from "@/lib/utils";

interface DataTableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  wrapperClassName?: string;
}

export function DataTable({
  className,
  wrapperClassName,
  children,
  ...props
}: DataTableProps) {
  return (
    <div
      className={cn(
        "w-full overflow-x-auto rounded-xl border border-[#E6EAF2] bg-white",
        wrapperClassName
      )}
    >
      <table className={cn("saas-table w-full", className)} {...props}>
        {children}
      </table>
    </div>
  );
}

