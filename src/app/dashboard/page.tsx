"use client";

import { WizardProvider, useWizard } from "@/context/WizardContext";
import StepIndicator from "@/components/StepIndicator";
import BusinessForm from "@/components/BusinessForm";
import ICPSelection from "@/components/ICPSelection";
import ContentPillars from "@/components/ContentPillars";
import CustomizeQuestions from "@/components/CustomizeQuestions";
import CreatorStylePicker from "@/components/CreatorStylePicker";
import ContentEditor from "@/components/ContentEditor";

function WizardContent() {
  const { state } = useWizard();

  const stepComponents: Record<number, React.ReactNode> = {
    2: <BusinessForm />,
    3: <ICPSelection />,
    4: <ContentPillars />,
    5: <CustomizeQuestions />,
    6: <CreatorStylePicker />,
    7: <ContentEditor />,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-primary flex items-center justify-center">
              <span className="text-lg font-bold text-white">B</span>
            </div>
            <h1 className="text-xl font-bold text-slate-800">Brand Bhava</h1>
          </div>
          <span className="text-sm text-slate-400">Content Creator Tool</span>
        </div>
      </header>

      {/* Step Indicator */}
      <div className="max-w-5xl mx-auto px-6">
        <StepIndicator />
      </div>

      {/* Step Content */}
      <main className="max-w-5xl mx-auto px-6 pb-16">
        {stepComponents[state.currentStep] || <BusinessForm />}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <WizardProvider>
      <WizardContent />
    </WizardProvider>
  );
}
