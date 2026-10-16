"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

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

  if (!open) return null;

  function handleConfirm() {
    onConfirm(withNote ? note : undefined);
    setNote("");
  }

  function handleCancel() {
    setNote("");
    onCancel();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleCancel}
      />

      {/* Dialog */}
      <div className="relative bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-elevated)] w-full max-w-md p-6 animate-fade-in-up">
        <button
          onClick={handleCancel}
          className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <h3 className="text-h6 font-heading text-[var(--color-text-primary)] mb-2">
          {title}
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] font-body mb-5">
          {description}
        </p>

        {withNote && (
          <div className="mb-5">
            <Input
              placeholder={notePlaceholder}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <Button variant="secondary" size="sm" onClick={handleCancel} disabled={loading}>
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
