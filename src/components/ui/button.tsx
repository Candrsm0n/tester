import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "neon" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const variants: Record<string, string> = {
      default:
        "bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white hover:opacity-95 shadow-neon",
      neon: "bg-cyan-400 text-slate-950 font-bold hover:bg-cyan-300 shadow-neon-blue",
      outline:
        "border border-purple-500/40 bg-slate-900/60 text-slate-100 hover:border-cyan-400 hover:bg-slate-800/80",
      ghost: "bg-transparent text-slate-300 hover:text-white hover:bg-slate-800/60",
      destructive: "bg-rose-600 text-white hover:bg-rose-500",
    };

    const sizes: Record<string, string> = {
      sm: "px-3 py-1.5 text-xs rounded-lg",
      md: "px-4 py-2.5 text-sm rounded-xl",
      lg: "px-6 py-3.5 text-base rounded-xl font-semibold",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99]",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
