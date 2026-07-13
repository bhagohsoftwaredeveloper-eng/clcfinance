'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';
import type { Member } from '@/lib/types';

// Cycle through the theme's chart palette so each network gets a distinct colour.
const PALETTE = [1, 2, 3, 4, 5].map((n) => `hsl(var(--chart-${n}))`);
const colorFor = (index: number) => PALETTE[index % PALETTE.length];

/** Pie chart of members grouped by network, with a scrollable legend beside it. */
export function NetworkChart({ members }: { members: Member[] }) {
  const byNetwork = members.reduce((acc, member) => {
    const network = member.network || 'N/A';
    acc[network] = (acc[network] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Largest networks first so the legend reads by significance.
  const data = Object.entries(byNetwork)
    .sort((a, b) => b[1] - a[1])
    .map(([network, count], i) => ({ network, count, fill: colorFor(i) }));

  const config = Object.fromEntries(
    data.map((d) => [d.network, { label: d.network, color: d.fill }])
  );

  return (
    <Card className="surface-card">
      <CardHeader>
        <CardTitle className="text-base">Members by Network</CardTitle>
        <CardDescription>Distribution of members across different networks</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <ChartContainer config={config} className="aspect-square h-[220px] w-[220px] shrink-0">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={data} dataKey="count" nameKey="network" innerRadius={55} strokeWidth={4}>
              {data.map((entry) => (
                <Cell key={entry.network} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <ul className="grid max-h-[220px] w-full grid-cols-2 gap-x-4 gap-y-1.5 overflow-y-auto pr-1 text-sm sm:grid-cols-1 lg:grid-cols-2">
          {data.map((entry) => (
            <li key={entry.network} className="flex items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-[3px]" style={{ backgroundColor: entry.fill }} />
              <span className="truncate text-muted-foreground" title={entry.network}>{entry.network}</span>
              <span className="ml-auto font-medium tabular-nums">{entry.count}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
