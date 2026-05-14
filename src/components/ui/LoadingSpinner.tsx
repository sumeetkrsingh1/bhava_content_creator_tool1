"use client";

import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4">
      <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-blue-600/10 px-5 py-4 backdrop-blur-xl shadow-lg shadow-purple-500/10">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
      </div>
      <p className="text-slate-600/90 text-lg font-medium animate-pulse">{message}</p>
    </div>
  );
}
