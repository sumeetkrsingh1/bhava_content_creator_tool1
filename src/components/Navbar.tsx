"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import LogoutButton from "@/app/dashboard/LogoutButton";

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
    <nav className="sticky top-0 z-40 bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Hamburger Menu */}
        <button
          onClick={handleMenuToggle}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Menu className="w-6 h-6 text-white" />
          )}
        </button>

        {/* Logo/Title */}
        <div className="flex items-center gap-2 ">
          <Image
            src="/brandBhavaLogo.png"
            alt="Brand Bhava"
            width={120}
            height={32}
            className="w-10  scale-800 "
          />
          {/* <span className="text-white font-semibold hidden sm:inline">
            Brand Bhava
          </span> */}
        </div>

        {/* User Info and Logout */}
        <div className="flex items-center gap-4">
          {userName && (
            <span className="text-sm text-gray-300 hidden sm:inline">
              Welcome, {userName}
            </span>
          )}
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
}
