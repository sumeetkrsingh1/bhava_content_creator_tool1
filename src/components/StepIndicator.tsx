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
                      ? "bg-emerald-500 text-white"
                      : isCurrent
                      ? "bg-brand-primary text-white ring-4 ring-brand-primary/20"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : step.num - 1}
                </div>
                <span
                  className={`mt-1.5 text-xs font-medium hidden sm:block ${
                    isCurrent ? "text-brand-primary" : "text-slate-500"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${
                    state.currentStep > step.num ? "bg-emerald-500" : "bg-slate-200"
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
