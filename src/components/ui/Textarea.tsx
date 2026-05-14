"use client";

import { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export default function Textarea({ label, error, className = "", ...props }: TextareaProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-primary">{label}</label>
      <textarea
        className={`w-full resize-none rounded-lg border border-brand-layer5/70 bg-gradient-to-r from-white/80 to-brand-layer6/30 px-4 py-3 text-brand-dark placeholder:text-slate-400/70 shadow-inner shadow-brand-layer6/30 outline-none transition focus:border-brand-primary/70 focus:shadow-[0_0_20px_rgba(42,111,227,0.13)] focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-layer3/30 dark:bg-none dark:bg-[#08111f]/82 dark:text-brand-star dark:placeholder:text-brand-star/38 dark:shadow-none ${
          error ? "border-red-400/60 focus:ring-red-400/30" : ""
        } ${className}`}
        rows={3}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
