"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

export function CopyLicenseButton({ licenseKey }: { licenseKey: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(licenseKey);
    setCopied(true);
    toast.success("License key copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      title="Copy license key"
      className="shrink-0"
    >
      {copied
        ? <Check className="h-4 w-4 text-[var(--color-success)]" />
        : <Copy className="h-4 w-4" />}
    </Button>
  );
}
