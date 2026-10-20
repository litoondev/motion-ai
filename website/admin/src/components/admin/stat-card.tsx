import { Card } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bgColor?: string;
  subtext?: string;
  trend?: { value: string; positive: boolean };
}

export function StatCard({ label, value, icon: Icon, color, bgColor, subtext, trend }: StatCardProps) {
  const bg = bgColor ?? `color-mix(in srgb, ${color} 10%, transparent)`;

  return (
    <Card className="p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div
          className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center"
          style={{ backgroundColor: bg }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        {trend && (
          <span
            className="inline-flex items-center gap-0.5 text-xs font-semibold font-body"
            style={{ color: trend.positive ? "var(--color-success)" : "var(--color-error)" }}
          >
            {trend.positive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {trend.value}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold font-heading text-[var(--color-text-primary)] leading-tight">
          {value}
        </p>
        <p className="text-sm text-[var(--color-text-muted)] font-body mt-0.5">{label}</p>
      </div>
      {subtext && (
        <p className="text-xs text-[var(--color-text-muted)] font-body">{subtext}</p>
      )}
    </Card>
  );
}
