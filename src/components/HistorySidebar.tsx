import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useWizard } from '@/context/WizardContext';

interface HistorySidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function HistorySidebar({ isOpen = true, onClose }: HistorySidebarProps) {
  const [sessions, setSessions] = useState<Array<{ id: string; title: string; created_at: string }>>([]);
  const { dispatch } = useWizard();

  useEffect(() => {
    const fetchSessions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('generation_sessions')
        .select('id, title, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!error && data) setSessions(data);
    };
    fetchSessions();
  }, []);

  const loadSession = async (sessionId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('User not authenticated');
      return;
    }

    const res = await fetch(`/api/history/${sessionId}?userId=${user.id}`);
    if (!res.ok) {
      console.error('Failed to load session');
      return;
    }
    const data = await res.json();
    // Populate wizard state
    dispatch({ type: 'SET_FULL_SESSION', payload: {
      businessData: data.businessData,
      icps: [], // not needed
      selectedICP: data.selectedICP,
      pillars: data.pillars,
      customizationAnswers: data.customizationAnswers,
      selectedStyles: data.selectedStyles,
      generatedContent: data.generatedContent,
      currentStep: 7, // show content editor
    } });
    // Close sidebar on mobile after selecting
    if (onClose) onClose();
  };

  return (
    <>
      {/* Desktop Sidebar - Fixed Position */}
      <div className="hidden md:fixed md:block md:left-0 md:top-16 md:h-[calc(100vh-4rem)] md:w-64 bg-white/10 backdrop-blur-md border-r border-white/20 p-4 overflow-y-auto z-10">
        <h3 className="text-lg font-semibold mb-4 text-white">History</h3>
        {sessions.length === 0 ? (
          <p className="text-gray-400 text-sm">No sessions yet</p>
        ) : (
          sessions.map((s) => (
            <button
              key={s.id}
              className="w-full text-left py-2 px-2 rounded hover:bg-white/20 transition-colors duration-200"
              onClick={() => loadSession(s.id)}
            >
              <div className="font-medium text-white">{s.title || 'Untitled'}</div>
              <div className="text-sm text-gray-400">{new Date(s.created_at).toLocaleDateString()}</div>
            </button>
          ))
        )}
      </div>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          
          {/* Sidebar */}
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white/10 backdrop-blur-md border-r border-white/20 p-4 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-white">Sessions</h3>
            {sessions.length === 0 ? (
              <p className="text-gray-400 text-sm">No sessions yet</p>
            ) : (
              sessions.map((s) => (
                <button
                  key={s.id}
                  className="w-full text-left py-2 px-2 rounded hover:bg-white/20 transition-colors duration-200"
                  onClick={() => loadSession(s.id)}
                >
                  <div className="font-medium text-white">{s.title || 'Untitled'}</div>
                  <div className="text-sm text-gray-400">{new Date(s.created_at).toLocaleDateString()}</div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}
