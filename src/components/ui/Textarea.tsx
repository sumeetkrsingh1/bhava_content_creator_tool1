"use client";

import { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export default function Textarea({ label, error, className = "", ...props }: TextareaProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <textarea
        className={`w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-colors resize-none ${
          error ? "border-red-500 focus:ring-red-500/30" : ""
        } ${className}`}
        rows={3}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
