import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Brand Bhava - Content Creator",
  description: "Create LinkedIn content that resonates with your audience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-slate-50">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
