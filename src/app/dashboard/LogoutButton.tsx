import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded-full border border-brand-primary/45 bg-white/65 px-5 py-2 text-sm font-bold text-brand-primary shadow-[0_12px_28px_rgba(42,111,227,0.12)] transition hover:border-brand-primary hover:bg-[#2f74ea] hover:text-white dark:border-brand-layer3/35 dark:bg-[#101b2e] dark:text-brand-star dark:shadow-[0_12px_28px_rgba(0,0,0,0.24)] dark:hover:border-brand-layer3 dark:hover:bg-[#2f74ea]"
    >
      Log Out
    </button>
  );
}
