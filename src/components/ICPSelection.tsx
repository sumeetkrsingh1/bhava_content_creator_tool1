"use client";

import { ArrowRight, Target, TrendingUp, Globe, Check } from "lucide-react";
import { useWizard } from "@/context/WizardContext";
import { ICP } from "@/types";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function ICPSelection() {
  const { state, dispatch } = useWizard();

  if (state.isLoading) {
    return <LoadingSpinner message="Generating your ideal customer profiles..." />;
  }

  const handleSelect = (icp: ICP) => {
    dispatch({ type: "SELECT_ICP", payload: icp });
  };

  const handleContinue = async () => {
    if (!state.selectedICP || !state.businessData) return;

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

      if (!res.ok) throw new Error("Failed to generate pillars");

      const data = await res.json();
      dispatch({ type: "SET_PILLARS", payload: data.pillars });
      dispatch({ type: "SET_STEP", payload: 4 });
    } catch {
      alert("Something went wrong generating content pillars. Please try again.");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold tracking-tight text-white">Choose Your Ideal Customer Profile</h2>
        <p className="mt-2 text-slate-200/80">
          Select the ICP that best represents your target audience on LinkedIn.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {state.icps.map((icp) => (
          <Card
            key={icp.id}
            selected={state.selectedICP?.id === icp.id}
            onClick={() => handleSelect(icp)}
          >
            <div className="space-y-4">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{icp.name}</h3>
                    <p className="text-sm text-cyan-200 font-medium">{icp.title}</p>
                    <p className="text-sm text-slate-200/80 mt-1">
                      {typeof icp.demographics === "string"
                        ? icp.demographics
                        : Object.values(icp.demographics).join(", ")}
                    </p>
                  </div>
                  {state.selectedICP?.id === icp.id && (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Target className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-semibold text-slate-100">Pain Points</span>
                </div>
                <ul className="space-y-1">
                  {icp.painPoints.map((p, i) => (
                    <li key={i} className="text-sm text-slate-200/85 flex items-start gap-1.5">
                      <span className="text-red-400 mt-0.5">-</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-semibold text-slate-100">Goals</span>
                </div>
                <ul className="space-y-1">
                  {icp.goals.map((g, i) => (
                    <li key={i} className="text-sm text-slate-200/85 flex items-start gap-1.5">
                      <span className="text-emerald-400 mt-0.5">-</span>
                      {g}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-semibold text-slate-100">Where They Are</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {icp.onlinePlatforms.map((p, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-blue-300/20 text-blue-100 text-xs rounded-full border border-blue-200/25"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          size="lg"
          onClick={handleContinue}
          disabled={!state.selectedICP}
          loading={state.isLoading}
        >
          Continue
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
