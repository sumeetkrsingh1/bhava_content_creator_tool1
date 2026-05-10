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
      className="rounded-lg border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:border-cyan-500/50 hover:bg-gradient-to-r hover:from-cyan-500/15 hover:to-blue-600/15 hover:shadow-lg hover:shadow-cyan-500/10"
    >
      Log Out
    </button>
  );
}
