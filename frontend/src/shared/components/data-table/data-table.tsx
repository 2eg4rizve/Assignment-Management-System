import type { ReactNode } from "react";

import { EmptyState } from "@/shared/components/feedback/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { cn } from "@/shared/lib/cn";

export type DataTableColumn<T> = {
  cell: (item: T) => ReactNode;
  className?: string;
  header: string;
  id: string;
};

type DataTableProps<T> = {
  columns: readonly DataTableColumn<T>[];
  emptyDescription?: string;
  emptyTitle?: string;
  getRowKey: (item: T) => string;
  items: readonly T[];
};

export function DataTable<T>({
  columns,
  emptyDescription = "Create a record or adjust the current filters.",
  emptyTitle = "No records found",
  getRowKey,
  items,
}: DataTableProps<T>) {
  if (items.length === 0) {
    return <EmptyState description={emptyDescription} title={emptyTitle} />;
  }

  return (
    <div className="bg-card overflow-hidden rounded-xl border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead className={column.className} key={column.id}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={getRowKey(item)}>
                {columns.map((column) => (
                  <TableCell
                    className={cn("align-middle", column.className)}
                    key={column.id}
                  >
                    {column.cell(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
