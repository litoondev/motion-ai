"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

/** navigator.clipboard only exists on https / localhost; fall back for plain-http share servers. */
async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

export function CopyLicenseButton({ licenseKey }: { licenseKey: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (await copyText(licenseKey)) {
      setCopied(true);
      toast.success("License key copied!");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Could not copy. Select the key and copy it manually.");
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleCopy} title="Copy license key"
      aria-label="Copy license key" className="shrink-0">
      {copied ? <Check className="h-4 w-4 text-[var(--color-success)]" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
}
