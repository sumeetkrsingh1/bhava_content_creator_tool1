"use client";

import { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variants = {
  primary:
    "border border-purple-400/50 bg-gradient-to-r from-purple-500/60 to-blue-600/60 text-white shadow-[0_0_20px_rgba(168,85,247,0.25)] hover:from-purple-500/70 hover:to-blue-600/70 hover:shadow-[0_0_30px_rgba(168,85,247,0.35)]",
  secondary:
    "border border-purple-400/40 bg-gradient-to-r from-purple-100/80 to-blue-100/80 text-purple-900 shadow-[0_0_15px_rgba(168,85,247,0.12)] hover:border-purple-400/60 hover:shadow-[0_0_25px_rgba(168,85,247,0.2)]",
  outline: "border border-purple-400/40 text-purple-700 bg-purple-100/30 hover:bg-purple-100/50 hover:border-purple-400/60",
  ghost: "text-slate-700 hover:bg-purple-100/30 hover:text-purple-700",
};

const sizes = {
  sm: "px-3.5 py-2 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-8 py-3 text-base md:text-lg",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl font-semibold tracking-tight transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
}
