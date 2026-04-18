"use client";

import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <input
        className={`w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-colors ${
          error ? "border-red-500 focus:ring-red-500/30" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
