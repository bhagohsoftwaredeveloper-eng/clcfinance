'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Landmark } from 'lucide-react';
import type { Donation } from '@/lib/types';

const categoryVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  Tithe: 'default',
  Offering: 'secondary',
  'Building Fund': 'outline',
  Missions: 'destructive',
};

/** Table of the five most recent donations. */
export function RecentTransactions({ donations }: { donations: Donation[] }) {
  const recent = [...donations]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <Card className="surface-card">
      <CardHeader>
        <CardTitle className="text-base">Recent Transactions</CardTitle>
        <CardDescription>An overview of the latest donations.</CardDescription>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Landmark className="size-5" />
            </div>
            <p className="text-sm font-medium">No donations yet</p>
            <p className="text-xs text-muted-foreground">Recorded giving will appear here.</p>
          </div>
        ) : (
          <Table className="responsive-cards">
            <TableHeader>
              <TableRow>
                <TableHead>Donor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((donation) => (
                <TableRow key={donation.id}>
                  <TableCell data-label="Donor" className="font-medium">{donation.donorName}</TableCell>
                  <TableCell data-label="Amount">₱{donation.amount.toFixed(2)}</TableCell>
                  <TableCell data-label="Category">
                    <Badge variant={categoryVariant[donation.category] || 'default'}>{donation.category}</Badge>
                  </TableCell>
                  <TableCell data-label="Date">
                    {new Date(donation.date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
