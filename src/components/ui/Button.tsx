"use client";

import { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variants = {
  primary: "bg-brand-primary text-white hover:bg-brand-primary/90",
  secondary: "bg-brand-accent text-white hover:bg-brand-accent/90",
  outline: "border-2 border-brand-primary text-brand-primary hover:bg-brand-primary/5",
  ghost: "text-slate-600 hover:bg-slate-100",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-8 py-3 text-lg",
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
      className={`inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
}
