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
    "border border-brand-primary bg-[#2f74ea] text-white shadow-[0_20px_44px_rgba(42,111,227,0.22)] hover:border-[#0050ff] hover:bg-[#0050ff] hover:shadow-[0_24px_52px_rgba(42,111,227,0.28)]",
  secondary:
    "border border-brand-primary bg-white/80 text-brand-primary shadow-[0_14px_30px_rgba(42,111,227,0.1)] hover:bg-brand-primary hover:text-white hover:shadow-[0_18px_38px_rgba(42,111,227,0.18)] dark:bg-white/8 dark:text-brand-star dark:hover:bg-brand-primary",
  outline: "border border-brand-primary/60 bg-transparent text-brand-primary hover:border-brand-primary hover:bg-brand-primary/10 hover:text-brand-primary hover:shadow-[0_18px_40px_rgba(42,111,227,0.18)] hover:-translate-y-0.5 dark:text-brand-star dark:hover:bg-brand-primary/20 dark:hover:text-brand-star",
  ghost: "border border-brand-primary/30 bg-transparent text-slate-700 hover:border-brand-primary/60 hover:bg-white/55 hover:text-brand-primary hover:shadow-[0_12px_24px_rgba(15,23,42,0.16)] hover:-translate-y-0.5 dark:border-brand-primary/40 dark:text-brand-star/80 dark:hover:bg-white/10 dark:hover:text-brand-star", 
};

const sizes = {
  sm: "px-5 py-2 text-sm",
  md: "px-7 py-3 text-base",
  lg: "px-10 py-4 text-base md:text-lg",
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
      className={`inline-flex items-center justify-center rounded-full font-bold tracking-tight transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
}
