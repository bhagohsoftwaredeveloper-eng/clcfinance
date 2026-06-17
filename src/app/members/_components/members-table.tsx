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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash, Edit, HandCoins } from 'lucide-react';
import type { Member } from '@/lib/types';

/** First letters of the first two name parts, e.g. "John Doe" -> "JD". */
const getInitials = (name: string) =>
  (name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || '?';

const PAGE_SIZE = 10;

interface MembersTableProps {
  /** Already-filtered list; the table paginates it internally. */
  members: Member[];
  searchQuery: string;
  isClient: boolean;
  onEdit: (member: Member) => void;
  onDelete: (id: string) => void;
  onAddDonation: (member: Member) => void;
}

export function MembersTable({ members, searchQuery, isClient, onEdit, onDelete, onAddDonation }: MembersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(members.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const pageMembers = members.slice(startIndex, endIndex);

  // Keep the current page valid if the list shrinks (e.g. after a search/delete).
  if (currentPage > 1 && startIndex >= members.length) {
    setCurrentPage(1);
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Network</TableHead>
            <TableHead>Join Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageMembers.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center text-sm text-muted-foreground">
                {searchQuery ? `No members match "${searchQuery}".` : 'No members yet. Click “New Member” to add one.'}
              </TableCell>
            </TableRow>
          )}
          {pageMembers.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="font-medium">{member.name}</div>
                </div>
              </TableCell>
              <TableCell>
                <div>{member.email}</div>
                <div className="text-sm text-muted-foreground">{member.phone}</div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{member.network}</Badge>
              </TableCell>
              <TableCell>
                {isClient
                  ? new Date(member.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' })
                  : ''}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(member)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAddDonation(member)}>
                      <HandCoins className="mr-2 h-4 w-4" />
                      Add Donation
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => onDelete(member.id)}>
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-6 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, members.length)} of {members.length} members
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
