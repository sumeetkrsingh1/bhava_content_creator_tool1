"use client";

import { useState } from "react";
import { ArrowRight, ChevronDown, ChevronUp, Lightbulb, Check } from "lucide-react";
import { useWizard } from "@/context/WizardContext";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function ContentPillars() {
  const { state, dispatch } = useWizard();
  const [expandedPillar, setExpandedPillar] = useState<string | null>(
    state.pillars[0]?.id || null
  );
  const [selectedPillar, setSelectedPillar] = useState<string | null>(
    state.pillars[0]?.id || null
  );

  if (state.isLoading) {
    return <LoadingSpinner message="Crafting your content strategy..." />;
  }

  const togglePillar = (id: string) => {
    setSelectedPillar(id);
    setExpandedPillar(expandedPillar === id ? null : id);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold tracking-tight text-primary">Your Content Pillars</h2>
        <p className="mt-2 text-secondary">
          These pillars form the foundation of your LinkedIn content strategy. Each includes
          topic ideas to get you started.
        </p>
      </div>

      <div className="space-y-4">
        {state.pillars.map((pillar, index) => (
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
                  {selectedPillar === pillar.id && (
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

      <div className="mt-8 flex justify-end">
        <Button size="lg" onClick={() => dispatch({ type: "SET_STEP", payload: 5 })}>
          Continue
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
