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
            className="w-full pl-3 pr-3 py-2 bg-white/5 border border-white/15 rounded text-white/60 placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/30"
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
          className="w-full pl-3 pr-3 py-2 bg-white/5 border border-white/15 rounded text-white/60 placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/30"
          required
        />
      </div>
      <div className="relative">
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full pl-3 pr-3 py-2 bg-white/5 border border-white/15 rounded text-white/60 placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/30"
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
              className="mt-2 text-xs text-blue-300 underline"
            >
              Resend confirmation email
            </button>
          )}
        </>
      )}
      <button
        type="submit"
        disabled={loading}
        className="mt-2 py-2 bg-[#2d3b39] text-white uppercase tracking-wider text-xs rounded-[3px] hover:brightness-108 transition duration-200"
      >
        {loading ? 'Processing…' : type === 'login' ? 'Login' : 'Sign Up'}
      </button>
    </form>
  );
}
