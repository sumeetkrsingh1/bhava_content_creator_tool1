"use client";

import { Check } from "lucide-react";
import { useWizard } from "@/context/WizardContext";

const steps = [
  { num: 2, label: "Business Info" },
  { num: 3, label: "ICP" },
  { num: 4, label: "Pillars" },
  { num: 5, label: "Customize" },
  { num: 6, label: "Style" },
  { num: 7, label: "Content" },
];

export default function StepIndicator() {
  const { state } = useWizard();

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((step, i) => {
          const isCompleted = state.currentStep > step.num;
          const isCurrent = state.currentStep === step.num;

          return (
            <div key={step.num} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    isCompleted
                      ? "bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow-lg shadow-emerald-400/30"
                      : isCurrent
                      ? "bg-gradient-to-r from-cyan-400 to-blue-400 text-slate-950 ring-4 ring-cyan-400/40 shadow-lg shadow-cyan-400/30"
                      : "bg-gradient-to-r from-slate-700/50 to-slate-800/50 text-slate-300 border border-cyan-500/20"
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : step.num - 1}
                </div>
                <span
                  className={`mt-1.5 text-xs font-medium hidden sm:block ${
                    isCurrent ? "text-cyan-300 font-semibold" : "text-slate-400/80"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${
                    state.currentStep > step.num ? "bg-gradient-to-r from-emerald-400 to-teal-400" : "bg-cyan-500/20"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
