"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff, Mail, Lock, UserPlus, LogIn, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/app/auth/supabaseAuth";

type AuthMode = "login" | "signup";

interface AuthPageViewProps {
  initialMode?: AuthMode;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Authentication failed";
}

export default function AuthPageView({ initialMode = "login" }: AuthPageViewProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isSignup = mode === "signup";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (isSignup && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      if (isSignup) {
        await signUp(email.trim().toLowerCase(), password, fullName.trim());
      } else {
        await signIn(email.trim().toLowerCase(), password);
      }

      router.replace("/dashboard");
    } catch (authError) {
      setError(getErrorMessage(authError));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(isSignup ? "login" : "signup");
    setError("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
  };

  return (
    <main className="min-h-screen bg-[#dfe3f1] px-4 py-8 text-[#090832] sm:px-8 lg:px-12">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-hidden bg-white shadow-[0_28px_90px_rgba(15,23,42,0.22)] lg:grid-cols-[0.94fr_1fr]">
        <div className="flex items-center justify-center px-7 py-10 sm:px-12 lg:px-16">
          <div className="w-full max-w-[380px]">
            <div className="mb-10">
              <div className="mb-10 flex items-center justify-start">
                <Image src="/brandBhavaLogo.png" alt="brandbhava" width={200} height={200} />
              </div>
              <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-[#08072f]">
                {isSignup ? "Create account!" : "Welcome back!"}
              </h1>
              <p className="mt-3 text-sm font-medium text-slate-500">
                {isSignup
                  ? "Create your workspace to start generating LinkedIn content."
                  : "Enter to get unlimited access to data and information."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignup && (
                <label className="block">
                  <span className="text-sm font-bold text-[#171333]">
                    Full Name <span className="text-[#ff6b57]">*</span>
                  </span>
                  <div className="relative mt-2">
                    <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="Enter your name"
                      className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#5637ed] focus:ring-4 focus:ring-[#5637ed]/10"
                      required
                    />
                  </div>
                </label>
              )}

              <label className="block">
                <span className="text-sm font-bold text-[#171333]">
                  Email <span className="text-[#ff6b57]">*</span>
                </span>
                <div className="relative mt-2">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Enter your mail address"
                    className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#5637ed] focus:ring-4 focus:ring-[#5637ed]/10"
                    required
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-sm font-bold text-[#171333]">
                  Password <span className="text-[#ff6b57]">*</span>
                </span>
                <div className="relative mt-2">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter password"
                    className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-12 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#5637ed] focus:ring-4 focus:ring-[#5637ed]/10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#5637ed]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              {isSignup && (
                <label className="block">
                  <span className="text-sm font-bold text-[#171333]">
                    Confirm Password <span className="text-[#ff6b57]">*</span>
                  </span>
                  <div className="relative mt-2">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Repeat password"
                      className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#5637ed] focus:ring-4 focus:ring-[#5637ed]/10"
                      required
                    />
                  </div>
                </label>
              )}

              {error && (
                <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
                  {error}
                </p>
              )}

              {/* <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2 font-semibold text-slate-600">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-slate-300 accent-[#5637ed]"
                  />
                  Remember me
                </label>
                <button type="button" className="font-bold text-[#5637ed] hover:underline">
                  Forgot your password?
                </button>
              </div> */}

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#5637ed] text-sm font-bold text-white shadow-lg shadow-[#5637ed]/25 transition hover:bg-[#482cdb] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSignup ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                {loading ? "Please wait..." : isSignup ? "Sign Up" : "Log In"}
              </button>
            </form>

            {/* <div className="my-7 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-medium text-slate-400">
                Or, {isSignup ? "signup" : "Login"} with
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div> */}

            {/* <button
              type="button"
              className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white text-sm font-bold text-[#171333] transition hover:border-slate-300 hover:bg-slate-50"
            >
              <span className="text-lg font-black text-[#4285f4]">G</span>
              {isSignup ? "Sign up" : "Sign in"} with google
            </button> */}

            <p className="mt-8 text-center text-sm font-semibold text-[#171333]">
              {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={switchMode}
                className="font-extrabold text-[#5637ed] underline underline-offset-2"
              >
                {isSignup ? "Login here" : "Register here"}
              </button>
            </p>
          </div>
        </div>

        <div className="relative hidden min-h-[640px] bg-[#140a67] lg:block">
          <Image
            src="/loginpageUi.png"
            alt="Abstract geometric artwork"
            fill
            priority
            className="object-cover"
            sizes="50vw"
          />
        </div>
      </section>
    </main>
  );
}
