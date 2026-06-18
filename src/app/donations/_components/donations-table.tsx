'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash, Edit } from 'lucide-react';
import type { Donation } from '@/lib/types';

const categoryVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  Tithe: 'default',
  Offering: 'secondary',
  'Building Fund': 'outline',
  Missions: 'destructive',
};

const PAGE_SIZE = 10;

interface DonationsTableProps {
  /** Already-filtered list; the table paginates it internally. */
  donations: Donation[];
  givingTypes: Array<{ id: string; name: string }>;
  isClient: boolean;
  isAdmin: boolean;
  onEdit: (donation: Donation) => void;
  onDelete: (id: string) => void;
}

export function DonationsTable({ donations, givingTypes, isClient, isAdmin, onEdit, onDelete }: DonationsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(donations.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const pageDonations = donations.slice(startIndex, endIndex);
  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);

  if (currentPage > 1 && startIndex >= donations.length) {
    setCurrentPage(1);
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Donor</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Giving Type</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Service Time</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageDonations.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="h-32 text-center text-sm text-muted-foreground">
                No giving records yet.
              </TableCell>
            </TableRow>
          )}
          {pageDonations.map((donation) => (
            <TableRow key={donation.id}>
              <TableCell className="font-medium">{donation.donorName}</TableCell>
              <TableCell>₱{donation.amount.toFixed(2)}</TableCell>
              <TableCell>
                <Badge variant={categoryVariant[donation.category] || 'default'}>{donation.category}</Badge>
              </TableCell>
              <TableCell>{givingTypes.find((gt) => gt.id === donation.givingTypeId)?.name || '-'}</TableCell>
              <TableCell>{donation.reference || '-'}</TableCell>
              <TableCell>{donation.serviceTime}</TableCell>
              <TableCell>
                {isClient
                  ? new Date(donation.date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' })
                  : ''}
              </TableCell>
              <TableCell className="text-right">
                {isAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(donation)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => onDelete(donation.id)}>
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-4 rounded-lg border bg-muted/20 p-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">Total Amount:</span>
          <span className="text-2xl font-bold text-primary">₱{totalAmount.toLocaleString()}</span>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t px-6 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, donations.length)} of {donations.length} donations
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className="h-8 w-8 p-0"
                >
                  {pageNum}
                </Button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
