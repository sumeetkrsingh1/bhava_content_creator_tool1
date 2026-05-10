"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function Card({
  children,
  selected = false,
  onClick,
  className = "",
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border p-6 transition-all duration-300 ${
        onClick ? "cursor-pointer hover:-translate-y-0.5" : ""
      } ${
        selected
          ? "border-purple-400/60 bg-gradient-to-br from-purple-200/40 to-blue-100/30 shadow-[0_0_40px_rgba(168,85,247,0.2)] ring-2 ring-purple-400/40"
          : "border-purple-300/30 bg-gradient-to-br from-white/60 to-purple-50/40 hover:border-purple-400/50 hover:bg-gradient-to-br hover:from-white/70 hover:to-purple-50/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.12)]"
      } ${className}`}
    >
      {children}
    </div>
  );
}
