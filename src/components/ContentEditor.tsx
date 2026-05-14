"use client";

import { useState } from "react";
import { Copy, RefreshCw, RotateCcw, Check, FileText } from "lucide-react";
import { useWizard } from "@/context/WizardContext";
import { supabase } from "@/lib/supabase";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function ContentEditor() {
  const { state, dispatch } = useWizard();
  const [activeTab, setActiveTab] = useState(0);
  const [editedContent, setEditedContent] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  if (state.isLoading && state.generatedContent.length === 0) {
    return <LoadingSpinner message="Creating your LinkedIn content..." />;
  }

  // Initialize edited content from generated content
  if (editedContent.length === 0 && state.generatedContent.length > 0) {
    const initial = state.generatedContent.map(
      (c) => `${c.hook}\n\n${c.body}\n\n${c.cta}`
    );
    setEditedContent(initial);
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedContent[activeTab]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = editedContent[activeTab];
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const res = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessData: state.businessData,
          selectedICP: state.selectedICP,
          pillars: state.pillars,
          customizationAnswers: state.customizationAnswers,
          selectedStyles: state.selectedStyles,
          userId: user.id,
        }),
      });

      if (!res.ok) throw new Error("Failed to regenerate");

      const data = await res.json();
      dispatch({ type: "SET_CONTENT", payload: data.content });
      const newContent = data.content.map(
        (c: { hook: string; body: string; cta: string }) =>
          `${c.hook}\n\n${c.body}\n\n${c.cta}`
      );
      setEditedContent(newContent);
      setActiveTab(0);
    } catch {
      alert("Failed to regenerate. Please try again.");
    } finally {
      setRegenerating(false);
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const handleStartOver = () => {
    dispatch({ type: "RESET" });
  };

  const updateContent = (value: string) => {
    setEditedContent((prev) => {
      const updated = [...prev];
      updated[activeTab] = value;
      return updated;
    });
  };

  const charCount = editedContent[activeTab]?.length || 0;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-semibold tracking-tight text-primary">Your LinkedIn Content</h2>
        <p className="text-secondary mt-2">
          Edit, refine, and copy your generated content. Switch between variations below.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {editedContent.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === i
                ? "bg-cyan-200 text-slate-950"
                : "bg-white/10 text-secondary hover:bg-white/20 border border-white/20"
            }`}
          >
            <FileText className="w-4 h-4 inline mr-1.5" />
            Variation {i + 1}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="bg-white/10 rounded-2xl border border-white/20 overflow-hidden">
        {/* Preview */}
        <div className="p-6 border-b border-white/15 bg-white/10">
          <p className="text-xs text-primary mb-2 font-medium uppercase tracking-wider">
            Preview
          </p>
          <div className="whitespace-pre-line text-primary leading-relaxed text-sm">
            {editedContent[activeTab]}
          </div>
        </div>

        {/* Textarea */}
        <div className="p-4">
          <textarea
            value={editedContent[activeTab]}
            onChange={(e) => updateContent(e.target.value)}
            className="w-full min-h-[300px] p-4 rounded-lg border border-white/20 bg-slate-950/35 text-slate-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-200/35 focus:border-cyan-200/60 resize-y"
            placeholder="Edit your content here..."
          />
          <div className="flex items-center justify-between mt-2">
            <span
              className={`text-xs ${
                charCount > 3000 ? "text-red-300" : "text-secondary"
              }`}
            >
              {charCount} / 3,000 characters
            </span>
            {charCount > 3000 && (
              <span className="text-xs text-red-500">
                Exceeds LinkedIn post limit
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button onClick={handleCopy} variant={copied ? "secondary" : "primary"} size="lg">
          {copied ? (
            <>
              <Check className="w-5 h-5 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-5 h-5 mr-2" />
              Copy to Clipboard
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={handleRegenerate}
          loading={regenerating}
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Regenerate
        </Button>

        <Button variant="ghost" size="lg" onClick={handleStartOver}>
          <RotateCcw className="w-5 h-5 mr-2" />
          Start Over
        </Button>
      </div>
    </div>
  );
}
