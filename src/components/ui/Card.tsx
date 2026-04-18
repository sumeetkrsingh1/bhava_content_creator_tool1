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
      className={`bg-white rounded-xl border-2 p-6 transition-all duration-200 ${
        onClick ? "cursor-pointer hover:shadow-md" : ""
      } ${
        selected
          ? "border-brand-primary shadow-lg ring-2 ring-brand-primary/20"
          : "border-slate-200"
      } ${className}`}
    >
      {children}
    </div>
  );
}
