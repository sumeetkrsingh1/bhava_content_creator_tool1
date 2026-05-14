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
    <div className="w-full pt-6 pb-10">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {steps.map((step, i) => {
          const isCompleted = state.currentStep > step.num;
          const isCurrent = state.currentStep === step.num;

          return (
            <div key={step.num} className="flex items-center flex-1 last:flex-none relative">
              <div className="relative flex justify-center z-20">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ease-out border-2 ${
                    isCompleted
                      ? "bg-white border-emerald-500 text-emerald-600 shadow-lg shadow-emerald-500/20 dark:bg-brand-deep dark:border-emerald-400 dark:text-emerald-300"
                      : isCurrent
                      ? "bg-white border-brand-primary text-brand-primary shadow-[0_0_20px_rgba(42,111,227,0.35)] scale-110 ring-4 ring-brand-primary/10 dark:!bg-black dark:!border-brand-primary dark:!text-white dark:ring-brand-primary/20"
                      : "bg-white/80 border-slate-200 text-slate-400 backdrop-blur-md dark:bg-brand-star/80 dark:border-brand-star/80 dark:text-brand-dark"
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5 stroke-[3]" /> : step.num - 1}
                </div>
                <span
                  className={`absolute top-14 left-1/2 -translate-x-1/2 w-max text-center text-xs font-semibold transition-all duration-300 hidden md:block ${
                    isCurrent 
                      ? "text-brand-primary drop-shadow-sm scale-105" 
                      : isCompleted 
                      ? "text-emerald-600 dark:text-emerald-300" 
                      : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting Line */}
              {i < steps.length - 1 && (
                <div className="flex-1 h-1.5 mx-2 md:mx-4 rounded-full bg-slate-200/60 overflow-hidden relative z-10">
                  <div 
                    className={`h-full transition-all duration-700 ease-in-out ${
                      isCompleted ? "w-full bg-gradient-to-r from-emerald-400 to-emerald-600" : "w-0"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
