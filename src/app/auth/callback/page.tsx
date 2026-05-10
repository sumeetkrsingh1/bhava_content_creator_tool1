"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Verifying your session...");

  useEffect(() => {
    const completeAuth = async () => {
      const next = searchParams.get("next") || "/dashboard";
      const code = searchParams.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          setStatus(error.message);
          router.replace("/login");
          return;
        }
      } else {
        await supabase.auth.getSession();
      }

      router.replace(next.startsWith("/") ? next : "/dashboard");
    };

    completeAuth();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#dfe3f1] px-6">
      <div className="rounded-2xl border border-slate-200 bg-white/85 p-8 text-center shadow-2xl backdrop-blur-xl">
        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-[#5637ed]" />
        <p className="text-sm font-medium text-slate-700">{status}</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#dfe3f1] px-6">
          <div className="rounded-2xl border border-slate-200 bg-white/85 p-8 text-center shadow-2xl backdrop-blur-xl">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-[#5637ed]" />
            <p className="text-sm font-medium text-slate-700">Verifying your session...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
