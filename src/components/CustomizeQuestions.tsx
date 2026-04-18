"use client";

import { useState } from "react";
import { ArrowRight, SkipForward, Palette } from "lucide-react";
import { useWizard } from "@/context/WizardContext";
import { CustomizationAnswers } from "@/types";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";

const questions = [
  {
    key: "brandPersonality" as const,
    label: "How would you describe your brand personality?",
    placeholder:
      "e.g., Professional yet approachable, bold and innovative, warm and empathetic...",
  },
  {
    key: "audienceEmotion" as const,
    label: "What emotions do you want your audience to feel?",
    placeholder:
      "e.g., Inspired to take action, confident in their decisions, curious to learn more...",
  },
  {
    key: "communicationStyle" as const,
    label: "What's your preferred communication style?",
    placeholder:
      "e.g., Conversational and relatable, data-driven and analytical, storytelling-focused...",
  },
  {
    key: "uniquePerspective" as const,
    label: "What makes your perspective unique?",
    placeholder:
      "e.g., 10 years of hands-on experience, contrarian views on industry trends, insider knowledge...",
  },
];

export default function CustomizeQuestions() {
  const { dispatch } = useWizard();
  const [answers, setAnswers] = useState<CustomizationAnswers>({
    brandPersonality: "",
    audienceEmotion: "",
    communicationStyle: "",
    uniquePerspective: "",
  });

  const updateAnswer = (key: keyof CustomizationAnswers, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleContinue = () => {
    dispatch({ type: "SET_CUSTOMIZATION", payload: answers });
    dispatch({ type: "SET_STEP", payload: 6 });
  };

  const handleSkip = () => {
    dispatch({ type: "SET_CUSTOMIZATION", payload: null });
    dispatch({ type: "SET_STEP", payload: 6 });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Palette className="w-7 h-7 text-brand-accent" />
          <h2 className="text-2xl font-bold text-slate-800">Customizing Your Content</h2>
        </div>
        <p className="text-slate-500">
          Answer these questions to help us craft content that matches your brand voice.
          <span className="text-slate-400 ml-1">(Optional - you can skip this step)</span>
        </p>
      </div>

      <div className="space-y-6">
        {questions.map((q) => (
          <Textarea
            key={q.key}
            label={q.label}
            placeholder={q.placeholder}
            value={answers[q.key]}
            onChange={(e) => updateAnswer(q.key, e.target.value)}
          />
        ))}
      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="ghost" size="lg" onClick={handleSkip}>
          <SkipForward className="w-5 h-5 mr-2" />
          Skip
        </Button>
        <Button size="lg" onClick={handleContinue}>
          Continue
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
