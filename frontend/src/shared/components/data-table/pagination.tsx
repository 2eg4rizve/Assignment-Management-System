"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

type PaginationProps = {
  onPageChange: (page: number) => void;
  pageNumber: number;
  totalPages: number;
};

export function Pagination({
  onPageChange,
  pageNumber,
  totalPages,
}: PaginationProps) {
  const normalizedTotal = Math.max(totalPages, 1);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <p aria-live="polite" className="text-muted-foreground">
        Page <span className="text-foreground font-medium">{pageNumber}</span>{" "}
        of{" "}
        <span className="text-foreground font-medium">{normalizedTotal}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          disabled={pageNumber <= 1}
          onClick={() => onPageChange(pageNumber - 1)}
          variant="outline"
        >
          <ChevronLeft aria-hidden="true" />
          Previous
        </Button>
        <Button
          disabled={pageNumber >= normalizedTotal}
          onClick={() => onPageChange(pageNumber + 1)}
          variant="outline"
        >
          Next
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}
