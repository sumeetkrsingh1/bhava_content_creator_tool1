'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signUp, resendConfirmation } from '@/app/auth/supabaseAuth';

interface AuthFormProps {
  type: 'login' | 'signup';
}

export default function AuthForm({ type }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (type === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password, fullName);
      }
      router.replace('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {type === 'signup' && (
        <div className="relative">
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="w-full pl-3 pr-3 py-2 bg-white/80 border border-brand-layer5/70 rounded text-brand-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 dark:bg-white/5 dark:border-white/15 dark:text-white/70 dark:placeholder:text-white/35 dark:focus:ring-white/30"
            required
          />
        </div>
      )}
      <div className="relative">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full pl-3 pr-3 py-2 bg-white/80 border border-brand-layer5/70 rounded text-brand-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 dark:bg-white/5 dark:border-white/15 dark:text-white/70 dark:placeholder:text-white/35 dark:focus:ring-white/30"
          required
        />
      </div>
      <div className="relative">
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full pl-3 pr-3 py-2 bg-white/80 border border-brand-layer5/70 rounded text-brand-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 dark:bg-white/5 dark:border-white/15 dark:text-white/70 dark:placeholder:text-white/35 dark:focus:ring-white/30"
          required
        />
      </div>
            {error && (
        <>
          <p className="text-sm text-red-400">{error}</p>
          {error.toLowerCase().includes('confirm') && (
            <button
              type="button"
              onClick={async () => {
                try {
                  await resendConfirmation(email);
                  setError('Confirmation email sent. Please check your inbox.');
                } catch (e: unknown) {
                  setError(e instanceof Error ? e.message : 'Failed to resend confirmation');
                }
              }}
              className="mt-2 w-fit rounded-full border border-brand-primary/40 px-4 py-2 text-xs font-bold text-brand-primary transition hover:bg-brand-primary hover:text-white"
            >
              Resend confirmation email
            </button>
          )}
        </>
      )}
      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-full border border-brand-primary bg-[#2f74ea] px-7 py-3 text-sm font-bold text-white shadow-[0_20px_44px_rgba(42,111,227,0.22)] transition hover:border-[#0050ff] hover:bg-[#0050ff] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
      >
        {loading ? 'Processing…' : type === 'login' ? 'Login' : 'Sign Up'}
      </button>
    </form>
  );
}
