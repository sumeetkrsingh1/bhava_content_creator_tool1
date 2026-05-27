"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Check, Sparkles, X, ExternalLink, Save, Database, Trash2, AlertTriangle } from "lucide-react";
import { useWizard } from "@/context/WizardContext";
import { supabase } from "@/lib/supabase";
import { CreatorStyle } from "@/types";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function CreatorStylePicker() {
  const { state, dispatch } = useWizard();
  const [creatorStyles, setCreatorStyles] = useState<CreatorStyle[]>([]);
  const [loadingStyles, setLoadingStyles] = useState(true);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [showLinkedinForm, setShowLinkedinForm] = useState(false);
  const [analyzingProfile, setAnalyzingProfile] = useState(false);
  const [savingStyleId, setSavingStyleId] = useState<string | null>(null);
  const [fetchingSavedStyles, setFetchingSavedStyles] = useState(false);
  const [styleToDelete, setStyleToDelete] = useState<CreatorStyle | null>(null);
  const [deletingStyleId, setDeletingStyleId] = useState<string | null>(null);

  useEffect(() => {
    const loadStyles = async () => {
      try {
        const res = await fetch("/api/creator-styles");
        if (!res.ok) throw new Error("Failed to load creator styles");
        const data = await res.json();
        setCreatorStyles(data.styles || []);
      } catch {
        setCreatorStyles([]);
      } finally {
        setLoadingStyles(false);
      }
    };

    loadStyles();
  }, []);

  const handleToggle = (style: CreatorStyle) => {
    dispatch({ type: "TOGGLE_STYLE", payload: style });
  };

  const isSelected = (id: string) =>
    state.selectedStyles.some((s) => s.id === id);

  const isImportedStyle = (style: CreatorStyle) =>
    style.imported === true || style.id.startsWith("custom-style-");

  const handleGenerate = async () => {
    if (state.selectedStyles.length === 0) return;

    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const res = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessData: state.businessData,
          selectedICP: state.selectedICP,
          pillars: state.pillars,
          selectedPillarId: state.selectedPillarId,
          customizationAnswers: state.customizationAnswers,
          selectedStyles: state.selectedStyles,
          userId: user.id,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate content");

      const data = await res.json();
      dispatch({ type: "SET_CONTENT", payload: data.content });
      dispatch({ type: "SET_STEP", payload: 7 });
    } catch {
      alert("Something went wrong generating content. Please try again.");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const analyzeLinkedinProfile = async () => {
    if (!linkedinUrl.trim()) return;

    setAnalyzingProfile(true);
    try {
      const res = await fetch("/api/analyze-linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkedinUrl: linkedinUrl.trim(),
          businessContext: state.businessData ? {
            businessName: state.businessData.businessName,
            industryNiche: state.businessData.industryNiche,
          } : undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to analyze profile");

      const data = await res.json();
      const newStyle = data.style as CreatorStyle;

      // Add to available styles and auto-select it
      setCreatorStyles(prev => [...prev, newStyle]);
      dispatch({ type: "TOGGLE_STYLE", payload: newStyle });

      setShowLinkedinForm(false);
      setLinkedinUrl("");
    } catch {
      alert("Failed to analyze LinkedIn profile. Please try again.");
    } finally {
      setAnalyzingProfile(false);
    }
  };

  const saveStyleForFuture = async (style: CreatorStyle) => {
    if (style.saved) return;

    setSavingStyleId(style.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user || !session.access_token) {
        throw new Error("User not authenticated");
      }

      const res = await fetch("/api/creator-styles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          style,
          userId: session.user.id,
          accessToken: session.access_token,
        }),
      });

      if (!res.ok) throw new Error("Failed to save creator style");

      const data = await res.json();
      const savedStyle = data.style as CreatorStyle;

      setCreatorStyles((prev) =>
        prev.map((existingStyle) => existingStyle.id === style.id ? savedStyle : existingStyle)
      );

      if (isSelected(style.id)) {
        dispatch({ type: "TOGGLE_STYLE", payload: style });
        dispatch({ type: "TOGGLE_STYLE", payload: savedStyle });
      }
    } catch {
      alert("Failed to save this creator style for future use. Please try again.");
    } finally {
      setSavingStyleId(null);
    }
  };

  const fetchSavedStyles = async () => {
    setFetchingSavedStyles(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("User not authenticated");
      }

      const res = await fetch("/api/creator-styles?mine=true", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch saved styles");

      const data = await res.json();
      const fetchedStyles = (data.styles || []) as CreatorStyle[];

      setCreatorStyles((prev) => {
        const existingIds = new Set(prev.map((style) => style.id));
        const existingHandles = new Set(prev.map((style) => style.handle.trim().toLowerCase()));
        const newStyles = fetchedStyles.filter(
          (style) =>
            !existingIds.has(style.id) &&
            !existingHandles.has(style.handle.trim().toLowerCase())
        );

        return newStyles.length > 0 ? [...prev, ...newStyles] : prev;
      });
    } catch (error) {
      console.error("Fetch saved creator styles error:", error);
      alert("Failed to fetch saved styles. Please try again.");
    } finally {
      setFetchingSavedStyles(false);
    }
  };

  const deleteStylePermanently = async () => {
    if (!styleToDelete) return;

    setDeletingStyleId(styleToDelete.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("User not authenticated");
      }

      const res = await fetch("/api/creator-styles", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          styleId: styleToDelete.id,
          accessToken: session.access_token,
        }),
      });

      if (!res.ok) throw new Error("Failed to delete creator style");

      setCreatorStyles((prev) => prev.filter((style) => style.id !== styleToDelete.id));

      if (isSelected(styleToDelete.id)) {
        dispatch({ type: "TOGGLE_STYLE", payload: styleToDelete });
      }

      setStyleToDelete(null);
    } catch (error) {
      console.error("Delete creator style error:", error);
      alert("Failed to delete this creator style. Please try again.");
    } finally {
      setDeletingStyleId(null);
    }
  };

  // Separate built-in styles from custom imported styles
  const builtInStyles = creatorStyles.filter((style) => !isImportedStyle(style));
  const customStyles = creatorStyles.filter(isImportedStyle);

  return (
    <div className="max-w-4xl mx-auto premium-glass p-8 md:p-12 rounded-lg relative overflow-hidden">
      {/* Decorative blurred blobs */}
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-brand-primary/18 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-[#00d2ff]/18 rounded-full blur-[80px] pointer-events-none" />

      <div className="mb-10 text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gradient mb-3">
          Select Your Favorite Creator Style
        </h2>
        <p className="text-secondary text-lg">
          Pick one or more LinkedIn creators whose writing style you admire.
          We&apos;ll blend their approach into your content.
        </p>
      </div>

      {loadingStyles ? (
        <p className="text-secondary text-center relative z-10">Loading creator styles...</p>
      ) : (
        <>
          {/* Built-in styles */}
          <h3 className="text-sm font-semibold text-brand-primary uppercase tracking-wider mb-3 relative z-10">
            Featured Creators
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10 mb-6">
            {builtInStyles.map((style) => (
              <Card
                key={style.id}
                selected={isSelected(style.id)}
                onClick={() => handleToggle(style)}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-layer6/60 border border-brand-layer3/50 flex items-center justify-center text-brand-dark font-bold text-sm">
                        {style.avatar}
                      </div>
                      <div>
                        <h3 className="font-semibold text-primary">{style.name}</h3>
                        <p className="text-xs text-primary">{style.handle}</p>
                      </div>
                    </div>
                    {isSelected(style.id) && (
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-secondary">{style.description}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {style.styleTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-brand-layer6/60 border border-brand-layer3/50 text-brand-dark text-xs rounded-full font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="bg-white/55 rounded-lg p-3 border border-brand-layer5/60 shadow-sm dark:border-brand-layer3/25 dark:bg-brand-deep/45">
                    <p className="text-xs text-secondary mb-1 font-medium">Sample style:</p>
                    <p className="text-sm text-primary whitespace-pre-line leading-relaxed">
                      {style.sampleSnippet}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Custom imported styles */}
          <div className="mb-3 relative z-10 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-purple-500 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Imported from LinkedIn
              </h3>
            <button
              onClick={fetchSavedStyles}
              disabled={fetchingSavedStyles}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-brand-layer5/45 text-slate-500 hover:text-brand-primary hover:border-brand-primary/40 hover:bg-brand-primary/5 disabled:opacity-50 disabled:cursor-not-allowed dark:border-brand-layer3/25"
            >
              <Database className="w-3.5 h-3.5" />
              {fetchingSavedStyles ? "Fetching..." : "Fetch saved styles"}
            </button>
          </div>
          {customStyles.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10 mb-6">
                {customStyles.map((style) => (
                  <Card
                    key={style.id}
                    selected={isSelected(style.id)}
                    onClick={() => handleToggle(style)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-200/40 border border-purple-400/40 flex items-center justify-center text-purple-600 font-bold text-sm">
                            {style.avatar}
                          </div>
                          <div>
                            <h3 className="font-semibold text-primary">{style.name}</h3>
                            <p className="text-xs text-primary">{style.handle}</p>
                          </div>
                        </div>
                        {isSelected(style.id) && (
                          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-secondary">{style.description}</p>

                      <div className="flex justify-end">
                        {style.saved ? (
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              setStyleToDelete(style);
                            }}
                            disabled={deletingStyleId === style.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-red-500/10 text-red-600 border border-red-500/25 hover:bg-red-500/15 disabled:opacity-50 disabled:cursor-not-allowed dark:text-red-300"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete permanently
                          </button>
                        ) : (
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              saveStyleForFuture(style);
                            }}
                            disabled={savingStyleId === style.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-brand-primary text-white hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Save className="w-3.5 h-3.5" />
                            {savingStyleId === style.id ? "Saving..." : "Save for future use"}
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {style.styleTags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-purple-100/50 border border-purple-300/40 text-purple-700 text-xs rounded-full font-medium dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-500/30"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* LinkedIn Import Form */}
      {showLinkedinForm ? (
        <div className="mt-6 p-4 bg-brand-primary/5 rounded-lg border border-dashed border-brand-primary/30 dark:bg-white/5 dark:border-brand-primary/40 relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-brand-primary uppercase tracking-wider flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" />
              Import LinkedIn Profile
            </span>
            <button
              onClick={() => { setShowLinkedinForm(false); setLinkedinUrl(""); }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-brand-star/80"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <input
            type="url"
            placeholder="Paste LinkedIn profile URL (e.g., https://linkedin.com/in/username)"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            className="w-full mb-3 px-3 py-2 text-sm rounded-md border border-brand-layer5/45 bg-white/70 text-brand-dark focus:outline-none focus:ring-2 focus:ring-cyan-200/50 dark:bg-slate-950/35 dark:text-slate-100 dark:border-white/20"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setShowLinkedinForm(false); setLinkedinUrl(""); }}
              className="px-3 py-1.5 text-xs rounded-md text-slate-500 hover:bg-white/50 dark:hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={analyzeLinkedinProfile}
              disabled={!linkedinUrl.trim() || analyzingProfile}
              className="px-3 py-1.5 text-xs rounded-md bg-brand-primary text-white hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {analyzingProfile ? (
                <>Analyzing...</>
              ) : (
                <>
                  <ExternalLink className="w-3.5 h-3.5" />
                  Import & Analyze
                </>
              )}
            </button>
          </div>
          <p className="mt-2 text-[10px] text-slate-400 dark:text-brand-star/40">
            AI will analyze the profile to infer the creator&apos;s writing style and generate a style profile.
          </p>
        </div>
      ) : (
        <button
          onClick={() => setShowLinkedinForm(true)}
          className="mt-6 w-full flex items-center justify-center gap-2 p-4 rounded-lg border border-dashed border-brand-layer5/45 text-sm text-slate-400 hover:text-brand-primary hover:border-brand-primary/40 hover:bg-brand-primary/5 transition-colors dark:border-brand-layer3/25 dark:hover:border-brand-primary/40 relative z-10"
        >
          <ExternalLink className="w-4 h-4" />
          Import style from LinkedIn profile
        </button>
      )}

      <div className="mt-8 flex items-center justify-between relative z-10">
        <Button
          variant="ghost"
          size="lg"
          onClick={() => dispatch({ type: "GO_BACK", payload: 5 })}
          disabled={state.isLoading}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <Button
          size="lg"
          className="text-lg"
          onClick={handleGenerate}
          disabled={state.selectedStyles.length === 0}
          loading={state.isLoading}
        >
          <span className="font-semibold mr-2">AI</span>
          Generate Content
        </Button>
      </div>

      {styleToDelete && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 py-6">
          <div className="w-full max-w-md rounded-lg border border-red-200 bg-white p-5 text-slate-900 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-950">Delete creator style?</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  This will permanently delete {styleToDelete.name} from your saved creator styles. You will not be able to fetch it again unless you import and save it again.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setStyleToDelete(null)}
                disabled={deletingStyleId === styleToDelete.id}
                className="px-3 py-1.5 text-sm rounded-md text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={deleteStylePermanently}
                disabled={deletingStyleId === styleToDelete.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                {deletingStyleId === styleToDelete.id ? "Deleting..." : "Confirm delete"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
