'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { Donation } from '@/lib/types';

const config = { amount: { label: 'Amount', color: 'hsl(var(--chart-1))' } };

/** Bar chart of the current month's giving grouped by network. */
export function GivingChart({ donations }: { donations: Donation[] }) {
  const now = new Date();
  // The network name is stored in the donation's `category` field (see the giving drawer).
  const byNetwork = donations
    .filter((d) => {
      const date = new Date(d.date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    })
    .reduce((acc, d) => {
      acc[d.category] = (acc[d.category] || 0) + d.amount;
      return acc;
    }, {} as Record<string, number>);

  const data = Object.entries(byNetwork).map(([network, amount]) => ({ network, amount }));

  return (
    <Card className="surface-card">
      <CardHeader>
        <CardTitle className="text-base">Monthly Giving by Network</CardTitle>
        <CardDescription>Giving breakdown for the current month</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config}>
          <BarChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="network" tickLine={false} tickMargin={10} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `₱${value.toLocaleString()}`} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
            <Bar dataKey="amount" fill="var(--color-amount)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
