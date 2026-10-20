"use client";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { userService } from "@/services/user";
import { errorMessage } from "@/lib/api";

export function ActivateTrialButton({ days, onActivated }: { days: number; onActivated: () => void }) {
  const [loading, setLoading] = useState(false);

  async function handleActivate() {
    setLoading(true);
    try {
      await userService.activateTrial();
      toast.success("Free trial activated!");
      onActivated();
    } catch (err) {
      toast.error(errorMessage(err, "Could not activate the trial."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="cta" size="sm" loading={loading} onClick={handleActivate} leftIcon={<Sparkles className="h-4 w-4" />}>
      Start {days}-day free trial
    </Button>
  );
}
