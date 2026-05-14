"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff, Mail, Lock, UserPlus, LogIn, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/app/auth/supabaseAuth";
import ThemeToggle from "@/components/ThemeToggle";

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
    <main className="min-h-screen bg-[linear-gradient(135deg,#F8F9FC,#FFFFFF)] px-4 py-8 text-primary sm:px-8 lg:px-12 dark:bg-[linear-gradient(160deg,#060B14,#0B1221,#060B14)]">
      <div className="mx-auto mb-4 flex max-w-6xl justify-end">
        <ThemeToggle />
      </div>
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl overflow-hidden rounded-lg border border-brand-layer5/70 bg-white/82 shadow-[0_28px_90px_rgba(11,18,33,0.18)] backdrop-blur-xl dark:border-brand-layer3/25 dark:bg-slate-950/90 dark:shadow-[0_28px_90px_rgba(0,0,0,0.36)] lg:grid-cols-[0.94fr_1fr]">
        <div className="flex items-center justify-center bg-gradient-to-b from-slate-50 to-white px-7 py-10 sm:px-12 lg:px-16 dark:from-slate-900 dark:to-slate-950">
          <div className="w-full max-w-[380px]">
            <div className="mb-10">
              <div className="mb-6 flex items-center justify-start">
                <Image src="/brandBhavaLogo.png" alt="brandbhava" width={80} height={80} />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-primary">
                {isSignup ? "Create account!" : "Welcome back!"}
              </h1>
              <p className="mt-3 text-sm font-medium text-secondary">
                {isSignup
                  ? "Create your workspace to start generating LinkedIn content."
                  : "Enter to get unlimited access to data and information."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignup && (
                <label className="block">
                  <span className="text-sm font-bold text-primary">
                    Full Name <span className="text-brand-primary">*</span>
                  </span>
                  <div className="relative mt-2">
                    <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="Enter your name"
                      className="h-12 w-full rounded-lg border border-brand-layer5/70 bg-white pl-11 pr-4 text-sm font-medium text-brand-dark outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 dark:border-brand-layer3/25 dark:bg-slate-900/90 dark:text-white dark:placeholder:text-slate-500"
                      required
                    />
                  </div>
                </label>
              )}

              <label className="block">
                <span className="text-sm font-bold text-primary">
                  Email <span className="text-brand-primary">*</span>
                </span>
                <div className="relative mt-2">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Enter your mail address"
                    className="h-12 w-full rounded-lg border border-brand-layer5/70 bg-white pl-11 pr-4 text-sm font-medium text-brand-dark outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 dark:border-brand-layer3/25 dark:bg-slate-900/90 dark:text-white dark:placeholder:text-slate-500"
                    required
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-sm font-bold text-primary">
                  Password <span className="text-brand-primary">*</span>
                </span>
                <div className="relative mt-2">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter password"
                    className="h-12 w-full rounded-lg border border-brand-layer5/70 bg-white pl-11 pr-12 text-sm font-medium text-brand-dark outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 dark:border-brand-layer3/25 dark:bg-slate-900/90 dark:text-white dark:placeholder:text-slate-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-brand-primary dark:text-slate-500 dark:hover:text-brand-primary"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              {isSignup && (
                <label className="block">
                  <span className="text-sm font-bold text-primary">
                    Confirm Password <span className="text-brand-primary">*</span>
                  </span>
                  <div className="relative mt-2">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Repeat password"
                      className="h-12 w-full rounded-lg border border-brand-layer5/70 bg-white pl-11 pr-4 text-sm font-medium text-brand-dark outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 dark:border-brand-layer3/25 dark:bg-slate-900/90 dark:text-white dark:placeholder:text-slate-500"
                      required
                    />
                  </div>
                </label>
              )}

              {error && (
                <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </p>
              )}

              {/* <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2 font-semibold text-slate-600">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-slate-300 accent-brand-primary"
                  />
                  Remember me
                </label>
                <button type="button" className="font-bold text-brand-primary hover:underline">
                  Forgot your password?
                </button>
              </div> */}

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-brand-primary bg-[#2f74ea] text-sm font-bold text-white shadow-[0_20px_44px_rgba(42,111,227,0.22)] transition hover:border-[#0050ff] hover:bg-[#0050ff] hover:shadow-[0_24px_52px_rgba(42,111,227,0.28)] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
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

            <p className="mt-8 text-center text-sm font-semibold text-primary">
              {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={switchMode}
                className="rounded-full px-2 py-1 font-extrabold text-brand-primary transition hover:bg-brand-primary/10"
              >
                {isSignup ? "Login here" : "Register here"}
              </button>
            </p>
          </div>
        </div>

        <div className="relative hidden min-h-[640px] bg-brand-deep lg:block">
          <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_24%_18%,rgba(0,210,255,0.22),transparent_32%),radial-gradient(circle_at_76%_72%,rgba(42,111,227,0.26),transparent_34%)]" />
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
