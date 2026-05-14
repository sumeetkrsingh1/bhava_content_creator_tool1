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
    <div className="max-w-4xl mx-auto premium-glass p-8 md:p-12 rounded-lg relative overflow-hidden">
      {/* Decorative blurred blobs for depth */}
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-brand-primary/18 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-[#00d2ff]/18 rounded-full blur-[80px] pointer-events-none" />
      <div className="mb-10 text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gradient mb-3">Choose Your Ideal Customer Profile</h2>
        <p className="text-secondary text-lg">
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
                    <h3 className="text-lg font-semibold text-primary">{icp.name}</h3>
                    <p className="text-sm text-brand-primary font-medium">{icp.title}</p>
                    <p className="text-sm text-secondary mt-1">
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
                  <span className="text-sm font-semibold text-primary">Pain Points</span>
                </div>
                <ul className="space-y-1">
                  {icp.painPoints.map((p, i) => (
                    <li key={i} className="text-sm text-secondary flex items-start gap-1.5">
                      <span className="text-red-500 mt-0.5">-</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-semibold text-primary">Goals</span>
                </div>
                <ul className="space-y-1">
                  {icp.goals.map((g, i) => (
                    <li key={i} className="text-sm text-secondary flex items-start gap-1.5">
                      <span className="text-emerald-500 mt-0.5">-</span>
                      {g}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-semibold text-primary">Where They Are</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {icp.onlinePlatforms.map((p, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-blue-100/50 text-blue-800 text-xs rounded-full border border-blue-300/50"
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

      <div className="mt-8 flex justify-end relative z-10">
        <Button
          size="lg"
          onClick={handleContinue}
          disabled={!state.selectedICP}
          loading={state.isLoading}
          className="text-lg"
        >
          Continue
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
