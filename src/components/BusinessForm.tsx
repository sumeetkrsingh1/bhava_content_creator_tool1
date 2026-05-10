"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useWizard } from "@/context/WizardContext";
import { BusinessData } from "@/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";

export default function BusinessForm() {
  const { dispatch } = useWizard();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<BusinessData>({
    businessName: "",
    industryNiche: "",
    targetMarket: "",
    productService: "",
    businessGoals: "",
    uniqueSellingPoints: "",
  });

  const update = (field: keyof BusinessData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isValid =
    form.businessName.trim() &&
    form.industryNiche.trim() &&
    form.targetMarket.trim().length >= 10 &&
    form.productService.trim().length >= 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    dispatch({ type: "SET_BUSINESS_DATA", payload: form });
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const res = await fetch("/api/generate-icps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to generate ICPs");

      const data = await res.json();
      dispatch({ type: "SET_ICPS", payload: data.icps });
      dispatch({ type: "SET_STEP", payload: 3 });
    } catch {
      alert("Something went wrong generating ICPs. Please try again.");
    } finally {
      setLoading(false);
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold tracking-tight text-white">Tell us about your business</h2>
        <p className="mt-2 text-slate-200/80">
          We&apos;ll use this to create your ideal customer profiles and content strategy.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="Business Name"
            placeholder="e.g., Acme Solutions"
            value={form.businessName}
            onChange={(e) => update("businessName", e.target.value)}
            required
          />
          <Input
            label="Industry / Niche"
            placeholder="e.g., B2B SaaS, Health Tech"
            value={form.industryNiche}
            onChange={(e) => update("industryNiche", e.target.value)}
            required
          />
        </div>

        <Textarea
          label="Target Market"
          placeholder="Describe your ideal customers - who are they, where are they, what do they do?"
          value={form.targetMarket}
          onChange={(e) => update("targetMarket", e.target.value)}
          required
        />

        <Textarea
          label="Product / Service"
          placeholder="What do you offer? Describe your core product or service."
          value={form.productService}
          onChange={(e) => update("productService", e.target.value)}
          required
        />

        <Textarea
          label="Business Goals"
          placeholder="What are you trying to achieve? e.g., Increase brand awareness, generate leads..."
          value={form.businessGoals}
          onChange={(e) => update("businessGoals", e.target.value)}
        />

        <Textarea
          label="Unique Selling Points"
          placeholder="What makes you different from competitors?"
          value={form.uniqueSellingPoints}
          onChange={(e) => update("uniqueSellingPoints", e.target.value)}
        />

        <div className="pt-4">
          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={loading}
            disabled={!isValid}
          >
            Generate ICPs
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </form>
    </div>
  );
}
