"use client";

import { useState } from "react";
import { ArrowRight, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { useWizard } from "@/context/WizardContext";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function ContentPillars() {
  const { state, dispatch } = useWizard();
  const [expandedPillar, setExpandedPillar] = useState<string | null>(
    state.pillars[0]?.id || null
  );

  if (state.isLoading) {
    return <LoadingSpinner message="Crafting your content strategy..." />;
  }

  const togglePillar = (id: string) => {
    setExpandedPillar(expandedPillar === id ? null : id);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Your Content Pillars</h2>
        <p className="text-slate-500 mt-1">
          These pillars form the foundation of your LinkedIn content strategy. Each includes
          topic ideas to get you started.
        </p>
      </div>

      <div className="space-y-4">
        {state.pillars.map((pillar, index) => (
          <div
            key={pillar.id}
            className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden transition-all duration-200 hover:border-slate-300"
          >
            <button
              onClick={() => togglePillar(pillar.id)}
              className="w-full px-6 py-4 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-sm">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{pillar.name}</h3>
                  <p className="text-sm text-slate-500">{pillar.description}</p>
                </div>
              </div>
              {expandedPillar === pillar.id ? (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              )}
            </button>

            {expandedPillar === pillar.id && (
              <div className="px-6 pb-5 border-t border-slate-100 pt-4 space-y-3">
                {pillar.topics.map((topic) => (
                  <div
                    key={topic.id}
                    className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                  >
                    <Lightbulb className="w-5 h-5 text-brand-accent mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-medium text-slate-800 text-sm">{topic.title}</h4>
                      <p className="text-sm text-slate-500 mt-0.5">{topic.description}</p>
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
