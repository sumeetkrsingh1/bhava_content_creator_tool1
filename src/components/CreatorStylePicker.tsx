"use client";

import { Sparkles, Check } from "lucide-react";
import { useWizard } from "@/context/WizardContext";
import { CreatorStyle } from "@/types";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const CREATOR_STYLES: CreatorStyle[] = [
  {
    id: "justin-welsh",
    name: "Justin Welsh",
    handle: "@justinwelsh",
    avatar: "JW",
    description: "Storytelling with personal anecdotes, relatable hooks, and clear takeaways",
    styleTags: ["Storytelling", "Vulnerable", "Lessons Learned"],
    sampleSnippet:
      "I quit my $5M/yr job 4 years ago.\n\nEveryone thought I was crazy.\n\nBut I had a plan most people don't talk about...\n\nHere's what I learned building a one-person business:",
  },
  {
    id: "jasmin-alic",
    name: "Jasmin Alic",
    handle: "@jasminalic",
    avatar: "JA",
    description: "Hook-heavy, short punchy lines, visual formatting that stops the scroll",
    styleTags: ["Hooks", "Formatting", "Scroll-Stopping"],
    sampleSnippet:
      "Stop writing boring LinkedIn posts.\n\nSeriously.\n\nYour audience deserves better.\n\nHere's the 3-line hook formula that gets 10x engagement:",
  },
  {
    id: "sahil-bloom",
    name: "Sahil Bloom",
    handle: "@sahilbloom",
    avatar: "SB",
    description: "Frameworks, mental models, and educational threads with clear structure",
    styleTags: ["Frameworks", "Listicles", "Mental Models"],
    sampleSnippet:
      "The Feynman Technique changed how I learn.\n\nIt's a 4-step framework used by the greatest minds:\n\n1. Pick a concept\n2. Teach it to a child\n3. Identify gaps\n4. Simplify & refine\n\nHere's how to apply it today:",
  },
  {
    id: "lara-acosta",
    name: "Lara Acosta",
    handle: "@laraacostar",
    avatar: "LA",
    description: "Personal branding, authenticity, and building community through vulnerability",
    styleTags: ["Personal Brand", "Authentic", "Community"],
    sampleSnippet:
      "I used to hide behind my job title.\n\nThen I realized:\nPeople don't connect with titles.\nThey connect with stories.\n\nThe day I started sharing MY story, everything changed.",
  },
  {
    id: "alex-hormozi",
    name: "Alex Hormozi",
    handle: "@hormozi",
    avatar: "AH",
    description: "Direct, value-packed, no-fluff advice with contrarian business takes",
    styleTags: ["Direct", "Value Bombs", "Contrarian"],
    sampleSnippet:
      "Unpopular opinion:\n\nYou don't need more leads.\n\nYou need to stop losing the ones you have.\n\nThe math is simple. Fix your backend before scaling your frontend.",
  },
  {
    id: "gary-vee",
    name: "Gary Vaynerchuk",
    handle: "@garyvee",
    avatar: "GV",
    description: "Motivational, raw, hustle-focused with strong opinions and energy",
    styleTags: ["Motivational", "Raw", "Hustle"],
    sampleSnippet:
      "Everyone wants to be an entrepreneur.\n\nNobody wants to do the work.\n\nThe game hasn't changed. Patience and execution STILL win. Stop looking for shortcuts.",
  },
  {
    id: "dickie-bush",
    name: "Dickie Bush",
    handle: "@dickiebush",
    avatar: "DB",
    description: "Atomic essays, concise and actionable content with clear frameworks",
    styleTags: ["Atomic", "Concise", "Actionable"],
    sampleSnippet:
      "Write online for 30 days.\n\nHere's what will happen:\n\n- Day 1-7: You'll feel awkward\n- Day 8-14: You'll find your voice\n- Day 15-21: People will notice\n- Day 22-30: Opportunities will come\n\nStart today.",
  },
  {
    id: "codie-sanchez",
    name: "Codie Sanchez",
    handle: "@codiesanchez",
    avatar: "CS",
    description: "Contrarian business breakdowns, unconventional wealth-building strategies",
    styleTags: ["Contrarian", "Business", "Unconventional"],
    sampleSnippet:
      "The richest people I know don't have the sexiest businesses.\n\nThey own laundromats, car washes, and vending routes.\n\nBoring businesses. Exciting bank accounts.\n\nHere's why boring wins:",
  },
];

export default function CreatorStylePicker() {
  const { state, dispatch } = useWizard();

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
        <h2 className="text-2xl font-bold text-slate-800">
          Select Your Favorite Creator Style
        </h2>
        <p className="text-slate-500 mt-1">
          Pick one or more LinkedIn creators whose writing style you admire.
          We&apos;ll blend their approach into your content.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CREATOR_STYLES.map((style) => (
          <Card
            key={style.id}
            selected={isSelected(style.id)}
            onClick={() => handleToggle(style)}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-sm">
                    {style.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{style.name}</h3>
                    <p className="text-xs text-slate-400">{style.handle}</p>
                  </div>
                </div>
                {isSelected(style.id) && (
                  <div className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              <p className="text-sm text-slate-600">{style.description}</p>

              <div className="flex flex-wrap gap-1.5">
                {style.styleTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-brand-accent/10 text-brand-accent text-xs rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-500 mb-1 font-medium">Sample style:</p>
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                  {style.sampleSnippet}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          size="lg"
          onClick={handleGenerate}
          disabled={state.selectedStyles.length === 0}
          loading={state.isLoading}
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Generate Content
        </Button>
      </div>
    </div>
  );
}
