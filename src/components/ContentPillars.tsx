"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, ArrowLeft, ChevronDown, ChevronUp, Lightbulb, Check, RefreshCw, X, Sparkles, Save, Database, Trash2, AlertTriangle } from "lucide-react";
import { useWizard } from "@/context/WizardContext";
import { ContentPillar } from "@/types";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const isCustomPillar = (pillar: ContentPillar) =>
  pillar.custom === true || pillar.id.startsWith("custom-pillar");

export default function ContentPillars() {
  const { state, dispatch } = useWizard();
  const selectedPillarId = state.selectedPillarId || state.pillars[0]?.id || null;
  const [expandedPillar, setExpandedPillar] = useState<string | null>(
    state.pillars[0]?.id || null
  );
  const [regenerating, setRegenerating] = useState(false);
  const fetchedCustomKeyRef = useRef<string | null>(null);
  const [showCustomPillarForm, setShowCustomPillarForm] = useState(false);
  const [customPillarName, setCustomPillarName] = useState("");
  const [generatingPillar, setGeneratingPillar] = useState(false);
  const [savingPillarId, setSavingPillarId] = useState<string | null>(null);
  const [fetchingCustomPillars, setFetchingCustomPillars] = useState(false);
  const [pillarToDelete, setPillarToDelete] = useState<ContentPillar | null>(null);
  const [deletingPillarId, setDeletingPillarId] = useState<string | null>(null);
  const standardPillars = state.pillars.filter((pillar) => !isCustomPillar(pillar));
  const customPillars = state.pillars.filter(isCustomPillar);
  const selectedIcpId =
    state.selectedICP?.dbId ||
    (state.selectedICP?.id && !state.selectedICP.id.startsWith("icp-")
      ? state.selectedICP.id
      : null);
  const customFetchKey = state.businessId
    ? `business:${state.businessId}`
    : selectedIcpId
      ? `icp:${selectedIcpId}`
      : null;

  const fetchCustomPillarsForCurrentUser = async () => {
    try {
      setFetchingCustomPillars(true);
      const { data: { user } } = await (await import("@/lib/supabase")).supabase.auth.getUser();
      if (!user) return;

      const res = await fetch(`/api/custom-pillars?userId=${encodeURIComponent(user.id)}`);
      if (!res.ok) throw new Error("Failed to fetch custom pillars");
      const data: { pillars?: ContentPillar[] } = await res.json();

      const fetchedPillars = data.pillars || [];
      if (fetchedPillars.length === 0) return;

      const existingIds = new Set(state.pillars.map((pillar) => pillar.id));
      const existingCustomNames = new Set(
        state.pillars
          .filter(isCustomPillar)
          .map((pillar) => pillar.name.trim().toLowerCase())
      );

      const fetchedById = new Map(fetchedPillars.map((pillar) => [pillar.id, pillar]));
      const newCustomPillars = fetchedPillars.filter(
        (pillar) =>
          !existingIds.has(pillar.id) &&
          !existingCustomNames.has(pillar.name.trim().toLowerCase())
      );

      let markedExisting = false;
      const markedExistingPillars = state.pillars.map((pillar) => {
        if (fetchedById.has(pillar.id) && !pillar.custom) {
          markedExisting = true;
          return { ...pillar, custom: true, saved: true };
        }

        return pillar;
      });

      if (newCustomPillars.length > 0 || markedExisting) {
        dispatch({
          type: "SET_PILLARS",
          payload: [...markedExistingPillars, ...newCustomPillars],
        });
      }
    } catch (error) {
      console.error("Custom pillars fetch error:", error);
    } finally {
      setFetchingCustomPillars(false);
    }
  };



  useEffect(() => {
    if (!customFetchKey || fetchedCustomKeyRef.current === customFetchKey) return;

    const controller = new AbortController();

    fetchedCustomKeyRef.current = customFetchKey;

    const doFetch = async () => {
      const { data: { user } } = await (await import("@/lib/supabase")).supabase.auth.getUser();
      if (!user) return;

      try {
        const res = await fetch(`/api/custom-pillars?userId=${encodeURIComponent(user.id)}`, { signal: controller.signal });
        if (!res.ok) throw new Error("Failed to fetch custom pillars");
        const data: { pillars?: ContentPillar[] } = await res.json();
        const fetchedPillars = data.pillars || [];
        if (fetchedPillars.length === 0) return;

        const existingIds = new Set(state.pillars.map((pillar) => pillar.id));
        const existingCustomNames = new Set(
          state.pillars
            .filter(isCustomPillar)
            .map((pillar) => pillar.name.trim().toLowerCase())
        );
        const fetchedById = new Map(fetchedPillars.map((pillar) => [pillar.id, pillar]));
        const newCustomPillars = fetchedPillars.filter(
          (pillar) =>
            !existingIds.has(pillar.id) &&
            !existingCustomNames.has(pillar.name.trim().toLowerCase())
        );

        let markedExisting = false;
        const markedExistingPillars = state.pillars.map((pillar) => {
          if (fetchedById.has(pillar.id) && !pillar.custom) {
            markedExisting = true;
            return { ...pillar, custom: true, saved: true };
          }
          return pillar;
        });

        if (newCustomPillars.length > 0 || markedExisting) {
          dispatch({
            type: "SET_PILLARS",
            payload: [...markedExistingPillars, ...newCustomPillars],
          });
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Custom pillars fetch error:", error);
        }
      }
    };

    doFetch();

    return () => controller.abort();
  }, [customFetchKey, dispatch, state.pillars]);

  if (state.isLoading) {
    return <LoadingSpinner message="Crafting your content strategy..." />;
  }

  const togglePillar = (id: string) => {
    dispatch({ type: "SELECT_PILLAR", payload: id });
    setExpandedPillar(expandedPillar === id ? null : id);
  };

  const handleRegenerate = async () => {
    if (!state.selectedICP || !state.businessData) return;

    setRegenerating(true);
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const res = await fetch("/api/generate-pillars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessData: state.businessData,
          selectedICP: state.selectedICP,
        }),
      });

      if (!res.ok) throw new Error("Failed to regenerate pillars");

      const data = await res.json();
      const returnedPillars = (data.pillars || []) as ContentPillar[];
      const returnedIds = new Set(returnedPillars.map((pillar) => pillar.id));
      const unsavedCustomPillars = customPillars.filter(
        (pillar) => !pillar.saved && !returnedIds.has(pillar.id)
      );
      const updatedPillars = [...returnedPillars, ...unsavedCustomPillars];
      dispatch({ type: "SET_PILLARS", payload: updatedPillars });
      dispatch({ type: "SELECT_PILLAR", payload: returnedPillars[0]?.id || null });
      setExpandedPillar(returnedPillars[0]?.id || null);
    } catch {
      alert("Something went wrong regenerating pillars. Please try again.");
    } finally {
      setRegenerating(false);
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Custom pillar generation
  const startAddPillar = () => {
    setShowCustomPillarForm(true);
    setCustomPillarName("");
  };

  const cancelAddPillar = () => {
    setShowCustomPillarForm(false);
    setCustomPillarName("");
  };

  const submitCustomPillar = async () => {
    if (!customPillarName.trim() || !state.businessData) return;

    setGeneratingPillar(true);
    try {
      const res = await fetch("/api/generate-pillar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pillarName: customPillarName.trim(),
          businessId: state.businessId,
          businessData: state.businessData,
          selectedICP: state.selectedICP,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate pillar");

      const data = await res.json();
      const newPillar = data.pillar as ContentPillar;

      const updatedPillars = [...state.pillars, newPillar];
      dispatch({ type: "SET_PILLARS", payload: updatedPillars });
      dispatch({ type: "SELECT_PILLAR", payload: newPillar.id });
      setExpandedPillar(newPillar.id);
      cancelAddPillar();
    } catch {
      alert("Failed to generate pillar. Please try again.");
    } finally {
      setGeneratingPillar(false);
    }
  };

  const saveCustomPillarForFuture = async (pillar: ContentPillar) => {
    if (!state.businessData || !state.selectedICP || pillar.saved) return;

    setSavingPillarId(pillar.id);
    try {
      const { data: { user } } = await (await import("@/lib/supabase")).supabase.auth.getUser();
      if (!user) {
        alert("You must be logged in to save pillars.");
        return;
      }

      const res = await fetch("/api/custom-pillars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pillar,
          businessId: state.businessId,
          businessData: state.businessData,
          selectedICP: state.selectedICP,
          userId: user.id,
        }),
      });

      if (!res.ok) throw new Error("Failed to save custom pillar");

      const data = await res.json();
      const savedPillar = data.pillar as ContentPillar;
      const updatedPillars = state.pillars.map((existingPillar) =>
        existingPillar.id === pillar.id ? savedPillar : existingPillar
      );

      dispatch({ type: "SET_PILLARS", payload: updatedPillars });
      dispatch({ type: "SELECT_PILLAR", payload: savedPillar.id });
      setExpandedPillar(savedPillar.id);
    } catch {
      alert("Failed to save this pillar for future use. Please try again.");
    } finally {
      setSavingPillarId(null);
    }
  };




  const deleteCustomPillarPermanently = async () => {
    if (!pillarToDelete) return;

    setDeletingPillarId(pillarToDelete.id);
    try {
      const { data: { user } } = await (await import("@/lib/supabase")).supabase.auth.getUser();
      if (!user) return;

      const res = await fetch("/api/custom-pillars", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pillarId: pillarToDelete.id, userId: user.id }),
      });

      if (!res.ok) throw new Error("Failed to update custom pillar");

      const updatedPillars = state.pillars.filter((pillar) => pillar.id !== pillarToDelete.id);
      dispatch({ type: "SET_PILLARS", payload: updatedPillars });

      if (selectedPillarId === pillarToDelete.id) {
        const nextPillarId = updatedPillars[0]?.id || null;
        dispatch({ type: "SELECT_PILLAR", payload: nextPillarId });
        setExpandedPillar(nextPillarId);
      }

      setPillarToDelete(null);
    } catch (error) {
      console.error("Delete custom pillar error:", error);
      alert("Failed to delete this custom pillar. Please try again.");
    } finally {
      setDeletingPillarId(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold tracking-tight text-primary">Your Content Pillars</h2>
        <p className="mt-2 text-secondary">
          These pillars form the foundation of your LinkedIn content strategy.
        </p>
      </div>

      <div className="space-y-4">
        {/* AI-generated pillars */}
        {standardPillars.map((pillar, index) => (
          <div
            key={pillar.id}
            className="rounded-lg border border-brand-layer5/45 bg-white/35 overflow-hidden transition-all duration-200 hover:border-brand-layer3/60 dark:border-brand-layer3/25 dark:bg-brand-dark/45"
          >
            <button
              onClick={() => togglePillar(pillar.id)}
              className="w-full px-6 py-4 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-200/20 flex items-center justify-center text-primary font-bold text-sm border border-primary/35">
                  {index + 1}
                </div>
                <div className="flex items-start gap-3">
                  <div>
                    <h3 className="font-semibold text-primary">{pillar.name}</h3>
                    <p className="text-sm text-secondary">{pillar.description}</p>
                  </div>
                  {selectedPillarId === pillar.id && (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
              {expandedPillar === pillar.id ? (
                <ChevronUp className="w-5 h-5 text-slate-300" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-300" />
              )}
            </button>

            {expandedPillar === pillar.id && (
              <div className="px-6 pb-5 border-t border-white/15 pt-4 space-y-3">
                {pillar.topics.map((topic) => (
                  <div
                    key={topic.id}
                    className="flex items-start gap-3 p-3 bg-white/35 rounded-lg border border-brand-layer5/30 dark:bg-white/5 dark:border-brand-layer3/20"
                  >
                    <Lightbulb className="w-5 h-5 text-[#ffaa00] mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-medium text-primary text-sm">{topic.title}</h4>
                      <p className="text-sm text-secondary mt-0.5">{topic.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

        {/* Custom pillars by user */}
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-brand-primary uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Custom Pillars by You
            </h3>
            <button
              onClick={fetchCustomPillarsForCurrentUser}

              disabled={fetchingCustomPillars}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-brand-layer5/45 text-slate-500 hover:text-brand-primary hover:border-brand-primary/40 hover:bg-brand-primary/5 disabled:opacity-50 disabled:cursor-not-allowed dark:border-brand-layer3/25"
            >
              <Database className="w-3.5 h-3.5" />
              {fetchingCustomPillars ? "Fetching..." : "Fetch custom pillars"}
            </button>
          </div>
          {customPillars.length > 0 && (
            <div className="space-y-4">
              {customPillars.map((pillar) => (
                <div
                  key={pillar.id}
                  className="rounded-lg border border-dashed border-purple-400/40 bg-purple-50/30 overflow-hidden transition-all duration-200 hover:border-purple-400/60 dark:border-purple-500/30 dark:bg-purple-900/10"
                >
                  <button
                    onClick={() => togglePillar(pillar.id)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-200/30 flex items-center justify-center text-purple-600 font-bold text-sm border border-purple-400/40 dark:text-purple-300">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="flex items-start gap-3">
                        <div>
                          <h3 className="font-semibold text-primary">{pillar.name}</h3>
                          <p className="text-sm text-secondary">{pillar.description}</p>
                        </div>
                        {selectedPillarId === pillar.id && (
                          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                    {expandedPillar === pillar.id ? (
                      <ChevronUp className="w-5 h-5 text-slate-300" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-300" />
                    )}
                  </button>

                  {expandedPillar === pillar.id && (
                    <div className="px-6 pb-5 border-t border-white/15 pt-4 space-y-3">
                      <div className="flex justify-end">
                        {pillar.saved ? (
                          <button
                            onClick={() => setPillarToDelete(pillar)}
                            disabled={deletingPillarId === pillar.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-red-500/10 text-red-600 border border-red-500/25 hover:bg-red-500/15 disabled:opacity-50 disabled:cursor-not-allowed dark:text-red-300"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete permanently
                          </button>
                        ) : (
                          <button
                            onClick={() => saveCustomPillarForFuture(pillar)}
                            disabled={savingPillarId === pillar.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-brand-primary text-white hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Save className="w-3.5 h-3.5" />
                            {savingPillarId === pillar.id ? "Saving..." : "Save for future use"}
                          </button>
                        )}
                      </div>
                      {pillar.topics.map((topic) => (
                        <div
                          key={topic.id}
                          className="flex items-start gap-3 p-3 bg-white/35 rounded-lg border border-brand-layer5/30 dark:bg-white/5 dark:border-brand-layer3/20"
                        >
                          <Lightbulb className="w-5 h-5 text-[#ffaa00] mt-0.5 shrink-0" />
                          <div>
                            <h4 className="font-medium text-primary text-sm">{topic.title}</h4>
                            <p className="text-sm text-secondary mt-0.5">{topic.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Custom Pillar Creator */}
      {showCustomPillarForm ? (
        <div className="mt-6 p-4 bg-brand-primary/5 rounded-lg border border-dashed border-brand-primary/30 dark:bg-white/5 dark:border-brand-primary/40">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-brand-primary uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Create Custom Pillar
            </span>
            <button
              onClick={cancelAddPillar}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-brand-star/80"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            placeholder="Enter your pillar name (e.g., Customer Success Stories)"
            value={customPillarName}
            onChange={(e) => setCustomPillarName(e.target.value)}
            className="w-full mb-3 px-3 py-2 text-sm rounded-md border border-brand-layer5/45 bg-white/70 text-brand-dark focus:outline-none focus:ring-2 focus:ring-cyan-200/50 dark:bg-slate-950/35 dark:text-slate-100 dark:border-white/20"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={cancelAddPillar}
              className="px-3 py-1.5 text-xs rounded-md text-slate-500 hover:bg-white/50 dark:hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={submitCustomPillar}
              disabled={!customPillarName.trim() || generatingPillar}
              className="px-3 py-1.5 text-xs rounded-md bg-brand-primary text-white hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {generatingPillar ? (
                <>Generating...</>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate with AI
                </>
              )}
            </button>
          </div>
          <p className="mt-2 text-[10px] text-slate-400 dark:text-brand-star/40">
            AI will generate a description and 2 sub-topics for your pillar based on your business context.
          </p>
        </div>
      ) : (
        <button
          onClick={startAddPillar}
          className="mt-6 w-full flex items-center justify-center gap-2 p-4 rounded-lg border border-dashed border-brand-layer5/45 text-sm text-slate-400 hover:text-brand-primary hover:border-brand-primary/40 hover:bg-brand-primary/5 transition-colors dark:border-brand-layer3/25 dark:hover:border-brand-primary/40"
        >
          <Sparkles className="w-4 h-4" />
          Create custom pillar
        </button>
      )}

      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="ghost"
          size="lg"
          onClick={() => dispatch({ type: "GO_BACK", payload: 3 })}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-3">
          {state.businessData && state.selectedICP && (
            <Button
              variant="outline"
              size="lg"
              onClick={handleRegenerate}
              loading={regenerating}
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Regenerate
            </Button>
          )}
          <Button size="lg" onClick={() => dispatch({ type: "SET_STEP", payload: 5 })}>
            Continue
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>

      {pillarToDelete && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 py-6">
          <div className="w-full max-w-md rounded-lg border border-red-200 bg-white p-5 text-slate-900 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-950">Delete custom pillar?</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  This will remove {pillarToDelete.name} from your saved custom pillars by updating its database custom flag to false. It will no longer appear when you fetch custom pillars.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setPillarToDelete(null)}
                disabled={deletingPillarId === pillarToDelete.id}
                className="px-3 py-1.5 text-sm rounded-md text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={deleteCustomPillarPermanently}
                disabled={deletingPillarId === pillarToDelete.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                {deletingPillarId === pillarToDelete.id ? "Deleting..." : "Confirm delete"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
