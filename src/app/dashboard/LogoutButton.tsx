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
      className="rounded-lg border border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-blue-600/10 px-4 py-2 text-sm font-medium text-purple-700 transition hover:border-purple-500/50 hover:bg-gradient-to-r hover:from-purple-500/15 hover:to-blue-600/15 hover:shadow-lg hover:shadow-purple-500/10"
    >
      Log Out
    </button>
  );
}
