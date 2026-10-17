import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "electric";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const styles: Record<string, string> = {
    default: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    success: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    warning: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    danger: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    electric: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide",
        styles[variant],
        className
      )}
      {...props}
    />
  );
}
