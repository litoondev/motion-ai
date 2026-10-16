import { Card } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  subtext?: string;
}

export function StatCard({ label, value, icon: Icon, color, subtext }: StatCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-2">
        <Icon className="h-4 w-4" style={{ color }} />
        <p className="text-xs text-[var(--color-text-muted)] font-body">{label}</p>
      </div>
      <p className="text-h4 font-heading" style={{ color }}>{value}</p>
      {subtext && (
        <p className="text-xs text-[var(--color-text-muted)] font-body mt-1">{subtext}</p>
      )}
    </Card>
  );
}
