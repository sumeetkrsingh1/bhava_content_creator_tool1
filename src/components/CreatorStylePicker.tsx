"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useWizard } from "@/context/WizardContext";
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
      const res = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessData: state.businessData,
          selectedICP: state.selectedICP,
          pillars: state.pillars,
          customizationAnswers: state.customizationAnswers,
          selectedStyles: state.selectedStyles,
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold tracking-tight text-white">
          Select Your Favorite Creator Style
        </h2>
        <p className="text-slate-200/80 mt-2">
          Pick one or more LinkedIn creators whose writing style you admire.
          We&apos;ll blend their approach into your content.
        </p>
      </div>

      {loadingStyles ? (
        <p className="text-slate-200/80">Loading creator styles...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {creatorStyles.map((style) => (
          <Card
            key={style.id}
            selected={isSelected(style.id)}
            onClick={() => handleToggle(style)}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-200/20 border border-cyan-100/35 flex items-center justify-center text-cyan-100 font-bold text-sm">
                    {style.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{style.name}</h3>
                    <p className="text-xs text-slate-300/80">{style.handle}</p>
                  </div>
                </div>
                {isSelected(style.id) && (
                  <div className="w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center">
                    <Check className="w-4 h-4 text-slate-950" />
                  </div>
                )}
              </div>

              <p className="text-sm text-slate-200/85">{style.description}</p>

              <div className="flex flex-wrap gap-1.5">
                {style.styleTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-amber-300/20 border border-amber-200/30 text-amber-100 text-xs rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="bg-white/10 rounded-lg p-3 border border-white/15">
                <p className="text-xs text-slate-300 mb-1 font-medium">Sample style:</p>
                <p className="text-sm text-slate-100/90 whitespace-pre-line leading-relaxed">
                  {style.sampleSnippet}
                </p>
              </div>
            </div>
          </Card>
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <Button
          size="lg"
          onClick={handleGenerate}
          disabled={state.selectedStyles.length === 0}
          loading={state.isLoading}
        >
          <span className="font-semibold mr-2">✨</span>
          Generate Content
        </Button>
      </div>
    </div>
  );
}
