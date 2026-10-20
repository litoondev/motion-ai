"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmVariant?: "primary" | "danger" | "cta";
  cancelLabel?: string;
  loading?: boolean;
  withNote?: boolean;
  notePlaceholder?: string;
  onConfirm: (note?: string) => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  confirmVariant = "danger",
  cancelLabel = "Cancel",
  loading,
  withNote,
  notePlaceholder = "Add a note (optional)...",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) setNote("");
  }, [open]);

  if (!open) return null;

  function handleConfirm() {
    onConfirm(withNote ? note : undefined);
  }

  const isDanger = confirmVariant === "danger";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      <div className="relative bg-[var(--color-bg-surface)] border border-[var(--color-border-soft)] rounded-[var(--radius-lg)] shadow-[var(--shadow-elevated)] w-full max-w-md animate-fade-in-up">
        {/* Header */}
        <div className="flex items-start gap-4 p-6 pb-0">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isDanger ? "bg-[var(--color-error-bg)]" : "bg-[var(--color-primary-50)]"}`}>
            <AlertTriangle className={`h-5 w-5 ${isDanger ? "text-[var(--color-error)]" : "text-[var(--color-primary-600)]"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold font-heading text-[var(--color-text-primary)]">
              {title}
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] font-body mt-1">
              {description}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Note input */}
        {withNote && (
          <div className="px-6 pt-4">
            <Input
              placeholder={notePlaceholder}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end p-6">
          <Button variant="secondary" size="sm" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            size="sm"
            onClick={handleConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
