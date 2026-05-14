"use client";

import { usePathname } from "next/navigation";

export default function BackgroundWrapper() {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup");

  if (isAuthPage) return null;

  return (
    <div
      className="fixed inset-0 -z-50 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/uiBackground.png")' }}
    />
  );
}
