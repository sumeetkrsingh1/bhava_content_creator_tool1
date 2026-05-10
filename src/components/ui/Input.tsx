"use client";

import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <input
        className={`w-full rounded-xl border border-purple-300/40 bg-gradient-to-r from-white/70 to-purple-50/50 px-4 py-3 text-slate-900 placeholder:text-slate-400/60 shadow-inner shadow-purple-100/20 outline-none transition focus:border-purple-400/60 focus:shadow-[0_0_20px_rgba(168,85,247,0.15)] focus:ring-2 focus:ring-purple-400/30 ${
          error ? "border-red-400/60 focus:ring-red-400/30" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
