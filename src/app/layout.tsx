import type { Metadata } from "next";
import { DM_Sans, Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import BackgroundWrapper from "@/components/BackgroundWrapper";
import { ThemeProvider } from "@/context/ThemeContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('brand-bhava-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'};document.documentElement.classList.toggle('dark',t==='dark');document.documentElement.style.colorScheme=t;}catch(e){}",
          }}
        />
        <ThemeProvider>
          <BackgroundWrapper />
          {children}
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
