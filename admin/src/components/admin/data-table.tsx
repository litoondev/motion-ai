"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown } from "lucide-react";
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
  emptyMessage = "No data found.",
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

  return (
    <Card>
      <CardContent className="pt-6 overflow-x-auto">
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 rounded-[var(--radius-md)] animate-shimmer" />
            ))}
          </div>
        ) : (
          <>
            <table className="w-full text-sm font-body min-w-[700px]">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={cn(
                        "text-left pb-2 pr-4 font-semibold",
                        col.sortable && "cursor-pointer select-none",
                        col.className
                      )}
                      onClick={() => col.sortable && handleSort(col.key)}
                      onMouseEnter={() => col.sortable && setHoveredSort(col.key)}
                      onMouseLeave={() => setHoveredSort(null)}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        {col.sortable && (
                          <ArrowUpDown
                            className={cn(
                              "h-3 w-3 transition-opacity",
                              sortKey === col.key || hoveredSort === col.key
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="py-12 text-center text-[var(--color-text-muted)]"
                    >
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  data.map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-elevated)] transition-colors"
                    >
                      {columns.map((col) => (
                        <td key={col.key} className={cn("py-3 pr-4", col.className)}>
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
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-text-muted)] font-body">
                  Page {currentPage} of {totalPages}
                  {total !== undefined && ` (${total} total)`}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(1)}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(totalPages)}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
