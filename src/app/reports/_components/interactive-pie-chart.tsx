'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Label as PieLabel, Sector } from 'recharts';
import type { PieSectorDataItem } from 'recharts/types/polar/Pie';
import { getDynamicChartConfig } from '../_lib/report-helpers';

const serviceColors = ['hsl(142 76% 40%)', 'hsl(52 100% 50%)', 'hsl(142 60% 45%)', 'hsl(48 95% 55%)', 'hsl(142 70% 35%)'];
const colorFor = (index: number) => serviceColors[index % serviceColors.length];

/** Interactive donut chart of giving by service time, with a service selector. */
export function InteractivePieChart({ donationsByServiceTime }: { donationsByServiceTime: any[] }) {
  const [activeService, setActiveService] = useState(donationsByServiceTime[0]?.name || '');

  const activeIndex = useMemo(
    () => donationsByServiceTime.findIndex((item: any) => item.name === activeService),
    [activeService, donationsByServiceTime]
  );
  const serviceNames = useMemo(() => donationsByServiceTime.map((item: any) => item.name), [donationsByServiceTime]);

  if (donationsByServiceTime.length === 0) return null;

  const chartData = donationsByServiceTime.map((item: any, index: number) => ({ ...item, fill: colorFor(index) }));
  const config = getDynamicChartConfig(donationsByServiceTime);

  return (
    <Card data-chart="service-pie" className="flex flex-col">
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle>Giving by Service</CardTitle>
          <CardDescription>Interactive breakdown of giving by service time.</CardDescription>
        </div>
        <Select value={activeService} onValueChange={setActiveService}>
          <SelectTrigger className="ml-auto h-7 w-[180px] rounded-lg pl-2.5" aria-label="Select a service">
            <SelectValue placeholder="Select service" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {serviceNames.map((serviceName: string, index: number) => (
              <SelectItem key={serviceName} value={serviceName} className="rounded-lg [&_span]:flex">
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex h-3 w-3 shrink-0 rounded-xs" style={{ backgroundColor: colorFor(index) }} />
                  {serviceName}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer id="service-pie" config={config} className="mx-auto aspect-square w-full max-w-[300px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector {...props} outerRadius={outerRadius + 25} innerRadius={outerRadius + 12} />
                </g>
              )}
            >
              <PieLabel
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                          ₱{donationsByServiceTime[activeIndex]?.amount?.toLocaleString() || '0'}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                          Giving
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
