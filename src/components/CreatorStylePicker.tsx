"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useWizard } from "@/context/WizardContext";
import { supabase } from "@/lib/supabase";
import { CreatorStyle } from "@/types";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function CreatorStylePicker() {
  const { state, dispatch } = useWizard();
  const [creatorStyles, setCreatorStyles] = useState<CreatorStyle[]>([]);
  const [loadingStyles, setLoadingStyles] = useState(true);

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

  const isSelected = (id: string) =>
    state.selectedStyles.some((s) => s.id === id);

  return (
    <div className="max-w-4xl mx-auto premium-glass p-8 md:p-12 rounded-lg relative overflow-hidden">
      {/* Decorative blurred blobs for depth */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          {creatorStyles.map((style) => (
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
      )}

      <div className="mt-8 flex justify-end relative z-10">
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
    </div>
  );
}
