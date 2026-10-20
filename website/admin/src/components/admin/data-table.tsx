"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  currentPage?: number;
  totalPages?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onSort?: (key: string, direction: "asc" | "desc") => void;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
}

export function DataTable<T>({
  columns,
  data,
  loading,
  emptyMessage = "No results found",
  emptyDescription = "Try adjusting your search or filters.",
  currentPage = 1,
  totalPages = 1,
  total,
  onPageChange,
  onSort,
  sortKey,
  sortDirection,
}: DataTableProps<T>) {
  const [hoveredSort, setHoveredSort] = useState<string | null>(null);

  function handleSort(key: string) {
    if (!onSort) return;
    const newDirection =
      sortKey === key && sortDirection === "asc" ? "desc" : "asc";
    onSort(key, newDirection);
  }

  const from = total ? (currentPage - 1) * (data.length || 10) + 1 : 0;
  const to = total ? Math.min(from + data.length - 1, total) : 0;

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-6 flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 rounded-[var(--radius-md)] animate-shimmer" />
            ))}
          </div>
        ) : (
          <>
            <table className="w-full text-sm font-body min-w-[700px]">
              <thead>
                <tr className="bg-[var(--color-bg-base)]">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={cn(
                        "text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] border-b border-[var(--color-border-soft)]",
                        col.sortable && "cursor-pointer select-none group",
                        col.className
                      )}
                      onClick={() => col.sortable && handleSort(col.key)}
                      onMouseEnter={() => col.sortable && setHoveredSort(col.key)}
                      onMouseLeave={() => setHoveredSort(null)}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        {col.sortable && sortKey === col.key && (
                          sortDirection === "asc" ? (
                            <ArrowUp className="h-3 w-3 text-[var(--color-primary-600)]" />
                          ) : (
                            <ArrowDown className="h-3 w-3 text-[var(--color-primary-600)]" />
                          )
                        )}
                        {col.sortable && sortKey !== col.key && hoveredSort === col.key && (
                          <ArrowUp className="h-3 w-3 opacity-40" />
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-soft)]">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-sm font-semibold text-[var(--color-text-primary)] font-body">
                          {emptyMessage}
                        </p>
                        <p className="text-sm text-[var(--color-text-muted)] font-body">
                          {emptyDescription}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((item, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-[var(--color-bg-base)]/50 transition-colors"
                    >
                      {columns.map((col) => (
                        <td key={col.key} className={cn("px-6 py-4", col.className)}>
                          {col.render(item)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && onPageChange && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--color-border-soft)] bg-[var(--color-bg-surface)]">
                <p className="text-sm text-[var(--color-text-muted)] font-body">
                  {total !== undefined
                    ? `Showing ${from}–${to} of ${total}`
                    : `Page ${currentPage} of ${totalPages}`}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    leftIcon={<ChevronLeft className="h-4 w-4" />}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    rightIcon={<ChevronRight className="h-4 w-4" />}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
