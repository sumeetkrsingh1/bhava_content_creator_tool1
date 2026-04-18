"use client";

import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4">
      <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
      <p className="text-slate-600 text-lg font-medium animate-pulse">{message}</p>
    </div>
  );
}
