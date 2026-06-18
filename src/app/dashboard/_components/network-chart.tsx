'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';
import type { Member } from '@/lib/types';

const networkColors: Record<string, string> = {
  Main: 'hsl(var(--chart-1))',
  Youth: 'hsl(var(--chart-2))',
  Couples: 'hsl(var(--chart-3))',
  Singles: 'hsl(var(--chart-4))',
  Kids: 'hsl(var(--chart-5))',
};

const colorFor = (network: string) => networkColors[network] || 'hsl(var(--chart-1))';

/** Pie chart of members grouped by network. */
export function NetworkChart({ members }: { members: Member[] }) {
  const byNetwork = members.reduce((acc, member) => {
    const network = member.network || 'Main';
    acc[network] = (acc[network] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(byNetwork).map(([network, count]) => ({ network, count, fill: colorFor(network) }));
  const config = Object.fromEntries(
    Object.keys(byNetwork).map((network) => [network, { label: network, color: colorFor(network) }])
  );

  return (
    <Card className="surface-card">
      <CardHeader>
        <CardTitle className="text-base">Members by Network</CardTitle>
        <CardDescription>Distribution of members across different networks</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={data} dataKey="count" nameKey="network" innerRadius={60} strokeWidth={5}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="network" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
