"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-brand-primary to-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-accent/20 mb-4">
            <span className="text-3xl font-bold text-brand-accent">B</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Brand Bhava</h1>
          <p className="text-slate-300 mt-2">Create LinkedIn content that resonates</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-2xl p-8 space-y-5"
        >
          <h2 className="text-xl font-semibold text-slate-800 text-center">
            Sign in to your account
          </h2>

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" className="w-full" size="lg">
            <LogIn className="w-5 h-5 mr-2" />
            Sign In
          </Button>

          <p className="text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="text-brand-primary font-medium hover:underline"
            >
              Get started
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
