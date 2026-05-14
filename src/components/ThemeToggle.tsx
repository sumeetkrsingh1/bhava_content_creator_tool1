"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-primary/55 bg-white text-brand-primary shadow-[0_12px_28px_rgba(42,111,227,0.16)] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary/20 dark:border-brand-layer3/35 dark:bg-[#101b2e] dark:text-brand-star dark:shadow-[0_12px_28px_rgba(0,0,0,0.24)] dark:focus-visible:ring-brand-star/20 ${className}`}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      <Moon className="h-5 w-5 dark:hidden" />
      <Sun className="hidden h-5 w-5 dark:block" />
    </button>
  );
}
