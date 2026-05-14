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
      className={`rounded-lg border p-6 transition-all duration-300 ${
        onClick ? "cursor-pointer hover:-translate-y-0.5" : ""
      } ${
        selected
          ? "border-brand-primary/60 bg-gradient-to-br from-brand-layer6/55 to-white/45 shadow-[0_0_40px_rgba(42,111,227,0.18)] ring-2 ring-brand-primary/25 dark:from-brand-primary/20 dark:to-brand-dark/70"
          : "border-brand-layer5/45 bg-gradient-to-br from-white/65 to-brand-layer6/25 hover:border-brand-layer3/65 hover:bg-gradient-to-br hover:from-white/78 hover:to-brand-layer6/35 hover:shadow-[0_0_20px_rgba(42,111,227,0.12)] dark:border-brand-layer3/25 dark:from-brand-dark/60 dark:to-brand-deep/70 dark:hover:from-brand-dark/75 dark:hover:to-brand-deep/85"
      } ${className}`}
    >
      {children}
    </div>
  );
}
