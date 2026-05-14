"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import LogoutButton from "@/app/dashboard/LogoutButton";
import ThemeToggle from "@/components/ThemeToggle";

interface NavbarProps {
  onMenuToggle: (isOpen: boolean) => void;
  userName?: string | null;
  isMenuOpen: boolean;
}

export default function Navbar({ onMenuToggle, userName, isMenuOpen }: NavbarProps) {
  const handleMenuToggle = () => {
    onMenuToggle(!isMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-brand-layer5/40 bg-white/82 shadow-[0_8px_32px_rgba(31,38,135,0.08)] backdrop-blur-md dark:border-brand-layer3/20 dark:bg-[#060B14]/95 dark:shadow-[0_8px_32px_rgba(0,0,0,0.34)]">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo/Title */}
        <div className="flex items-center">
          <Image
            src="/brandBhavaLogo-transparent.png"
            alt="Brand Bhava"
            width={32}
            height={12}
            className="w-10 h-auto object-contain"
          />
        </div>

        {/* User Info and Logout */}
        <div className="flex items-center gap-4">
          {userName && (
            <span className="text-sm text-slate-600 hidden sm:inline dark:text-brand-star/80">
              Welcome, {userName}
            </span>
          )}
          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
}
