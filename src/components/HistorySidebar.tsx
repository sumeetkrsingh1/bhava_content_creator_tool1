"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useWizard } from '@/context/WizardContext';
import { Layers } from 'lucide-react';
import { GeneratedContent } from '@/types';

interface HistorySidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface Session {
  id: string;
  title: string;
  created_at: string;
}

interface SessionContent {
  businessData: any;
  selectedICP: any;
  pillars: any[];
  customizationAnswers: any;
  selectedStyles: any[];
  generatedContent: GeneratedContent[];
}

interface GenerationGroup {
  group: number;
  versions: GeneratedContent[];
}

export default function HistorySidebar({ isOpen = true, onClose }: HistorySidebarProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionContent, setSessionContent] = useState<Record<string, SessionContent>>({});
  const [allLoaded, setAllLoaded] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const { dispatch } = useWizard();

  // Fetch ALL sessions with ALL their data on mount — one API call
  useEffect(() => {
    const fetchAllData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const res = await fetch(`/api/history/batch?userId=${user.id}`);
      if (!res.ok) {
        console.error('Failed to fetch history batch');
        return;
      }
      const data = await res.json();
      if (!data.sessions || data.sessions.length === 0) return;

      const sessionList: Session[] = [];
      const contentMap: Record<string, SessionContent> = {};

      data.sessions.forEach((s: any) => {
        sessionList.push({
          id: s.session.id,
          title: s.session.title,
          created_at: s.session.created_at,
        });
        contentMap[s.session.id] = {
          businessData: s.businessData,
          selectedICP: s.selectedICP,
          pillars: s.pillars,
          customizationAnswers: s.customizationAnswers,
          selectedStyles: s.selectedStyles,
          generatedContent: s.generatedContent || [],
        };
      });

      setSessions(sessionList);
      setSessionContent(contentMap);
      setAllLoaded(true);
    };

    fetchAllData();
  }, []);

  // Toggle session selection — data already loaded
  const toggleSession = (sessionId: string) => {
    setSelectedSessionId(prev => prev === sessionId ? null : sessionId);
  };

  // Load a specific generation group into the editor
  const loadGenerationIntoEditor = (sessionId: string, group: number) => {
    const content = sessionContent[sessionId];
    if (!content) return;

    const groupContent = content.generatedContent.filter(
      c => c.generationGroup === group
    );
    if (groupContent.length === 0) return;

    dispatch({
      type: 'SET_FULL_SESSION',
      payload: {
        businessData: content.businessData,
        icps: [],
        selectedICP: content.selectedICP,
        pillars: content.pillars,
        customizationAnswers: content.customizationAnswers,
        selectedStyles: content.selectedStyles,
        generatedContent: groupContent,
        currentStep: 7,
      },
    });

    if (onClose) onClose();
  };

  // Group content by generation_group
  const getGroups = (sessionId: string): GenerationGroup[] => {
    const content = sessionContent[sessionId];
    if (!content) return [];

    const groupMap = new Map<number, GeneratedContent[]>();
    content.generatedContent.forEach(c => {
      const g = c.generationGroup ?? 1;
      if (!groupMap.has(g)) groupMap.set(g, []);
      groupMap.get(g)!.push(c);
    });

    return Array.from(groupMap.entries())
      .sort(([a], [b]) => b - a)
      .map(([group, versions]) => ({ group, versions }));
  };

  const renderSessionButton = (s: Session) => {
    const isSelected = selectedSessionId === s.id;
    const groups = getGroups(s.id);
    const hasGroups = groups.length > 0;

    return (
      <div key={s.id} className="mb-1">
        {/* Session header button */}
        <button
          className={`w-full text-left py-2 px-2 rounded-lg transition-colors duration-200 flex items-center justify-between ${
            isSelected
              ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30 shadow-sm shadow-brand-primary/10 dark:bg-brand-primary/10 dark:text-brand-star dark:border-brand-primary/40'
              : 'hover:bg-brand-primary/10 dark:hover:bg-white/10'
          }`}
          onClick={() => toggleSession(s.id)}
        >
          <div className="flex-1 min-w-0">
            <div className="font-medium text-brand-dark dark:text-brand-star truncate">
              {s.title || 'Untitled'}
            </div>
            <div className="text-sm text-slate-500 dark:text-brand-star/55">
              {/* {new Date(s.created_at).toLocaleDateString()} */}
              {hasGroups && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs">
                  {/* <Layers className="w-3 h-3" /> */}
                  {groups.length} {groups.length === 1 ? 'generation' : 'generations'}
                </span>
              )}
            </div>
          </div>
          {hasGroups && (
            <Layers className="w-4 h-4 shrink-0 text-brand-primary/50" />
          )}
        </button>

        {/* Generation groups — shown when session is selected */}
        {isSelected && hasGroups && (
          <div className="ml-3 mt-1 border-l-2 border-brand-primary/20 dark:border-brand-primary/30 pl-2 space-y-1">
            {groups.map((g) => (
              <button
                key={g.group}
                className="w-full text-left py-2 px-3 rounded-md transition-colors duration-200 text-sm text-slate-600 hover:bg-brand-primary/10 hover:text-brand-primary dark:text-brand-star/80 dark:hover:bg-white/10 dark:hover:text-brand-star"
                onClick={() => loadGenerationIntoEditor(s.id, g.group)}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Layers className="w-3.5 h-3.5" />
                    Generation {g.group}
                  </span>
                </div>
                {(() => {
                  const content = sessionContent[s.id];
                  const icpName = content?.selectedICP?.name;
                  const pillarNames = content?.pillars?.map((p: any) => p.name).filter(Boolean);
                  const pillarTopics = content?.pillars?.flatMap((p: any) =>
                    (p.topics || []).map((t: any) => t.title || t)
                  ).filter(Boolean);
                  return (
                    <div className="text-[10px] text-slate-400 dark:text-brand-star/40 ml-6 mt-0.5 leading-tight">
                      {icpName && <div className="truncate" title={icpName}>ICP: {icpName}</div>}
                      {pillarNames && pillarNames.length > 0 && (
                        <div className="truncate" title={pillarNames.join(', ')}>Pillar: {pillarNames.join(', ')}</div>
                      )}
                      {pillarTopics && pillarTopics.length > 0 && (
                        <div className="truncate" title={pillarTopics.join(', ')}>Topics: {pillarTopics.join(', ')}</div>
                      )}
                    </div>
                  );
                })()}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const sidebarContent = (
    <>
      <h3 className="text-lg font-semibold mb-4 text-brand-dark dark:text-brand-star">History</h3>
      {sessions.length === 0 ? (
        <p className="text-slate-500 text-sm dark:text-brand-star/55">
          {allLoaded ? 'No sessions yet' : 'Loading...'}
        </p>
      ) : (
        sessions.map(renderSessionButton)
      )}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:fixed md:block md:left-0 md:top-16 md:h-[calc(100vh-4rem)] md:w-64 bg-white/70 backdrop-blur-md border-r border-brand-layer5/45 p-4 overflow-y-auto z-10 dark:border-brand-layer3/20 dark:bg-[#060B14]/92">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white/90 backdrop-blur-md border-r border-brand-layer5/45 p-4 overflow-y-auto dark:border-brand-layer3/20 dark:bg-[#060B14]/95">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}