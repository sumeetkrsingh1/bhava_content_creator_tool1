import { supabase } from '@/lib/supabase';

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Supabase signIn error:', error);
      throw error;
    }
    return data.user;
  } catch (e) {
    console.error('Unexpected signIn exception:', e);
    throw e;
  }
};

export const signUp = async (email: string, password: string, fullName?: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      console.error('Supabase signUp error:', error);
      throw error;
    }
    const user = data.user;
    // Insert into custom users table
    if (user) {
      await supabase.from('users').insert({
        id: user.id,
        email,
        full_name: fullName ?? null,
        created_at: new Date().toISOString(),
      });
    }
    return user;
  } catch (e) {
    console.error('Unexpected signUp exception:', e);
    throw e;
  }
};

export const resendConfirmation = async (email: string) => {
  try {
    const { error } = await supabase.auth.resend({
      email,
      // 'signup' triggers a confirmation email for new sign‑ups
      type: 'signup',
    });
    if (error) {
      console.error('Resend confirmation error:', error);
      throw error;
    }
    return true;
  } catch (e) {
    console.error('Unexpected resend exception:', e);
    throw e;
  }
};
