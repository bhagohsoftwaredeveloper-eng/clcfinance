'use client';

import { Inbox } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ReportTotalTableProps {
  /** Header for the label column, e.g. "Network" or "Service Time". */
  labelHeader: string;
  rows: { name: string; amount: number }[];
  /** Empty-state copy, e.g. "No giving recorded for this period." */
  emptyMessage: string;
}

/**
 * Two-column amount table with a pinned TOTAL row.
 *
 * The list scrolls inside a fixed max height so a long list can't stretch the
 * card, while the header and TOTAL row stay pinned — the total is the number
 * people look for, so it must stay on screen while scrolling.
 *
 * On print, `.table-scroll` in globals.css lifts the height cap and unsticks
 * the pinned cells so every row lands on the page.
 */
export function ReportTotalTable({ labelHeader, rows, emptyMessage }: ReportTotalTableProps) {
  const total = rows.reduce((sum, item) => sum + item.amount, 0);

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
        <Inbox className="h-8 w-8" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  // The height cap goes on Table's own overflow wrapper (via containerClassName)
  // rather than an outer div: sticky cells resolve against the nearest scrolling
  // ancestor, so wrapping the table from outside would leave them unpinned.
  // Sticky sits on the cells themselves for the same reason — thead/tfoot are
  // not valid positioning containers in a table layout.
  return (
    <Table containerClassName="table-scroll max-h-[320px] overflow-y-auto rounded-md border">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="sticky top-0 z-20 bg-card shadow-[inset_0_-1px_0_hsl(var(--border))]">
            {labelHeader}
          </TableHead>
          <TableHead className="sticky top-0 z-20 bg-card text-right shadow-[inset_0_-1px_0_hsl(var(--border))]">
            Amount
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((item) => (
          <TableRow key={item.name}>
            <TableCell>{item.name}</TableCell>
            <TableCell className="text-right tabular-nums">₱{item.amount.toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <tfoot>
        <TableRow className="font-semibold hover:bg-transparent">
          <TableCell className="sticky bottom-0 z-20 bg-muted font-semibold shadow-[inset_0_1px_0_hsl(var(--border))]">
            TOTAL
          </TableCell>
          <TableCell className="sticky bottom-0 z-20 bg-muted text-right font-semibold tabular-nums shadow-[inset_0_1px_0_hsl(var(--border))]">
            ₱{total.toLocaleString()}
          </TableCell>
        </TableRow>
      </tfoot>
    </Table>
  );
}
