import type { ChartConfig } from '@/components/ui/chart';
import type { Member } from '@/lib/types';

/** Fallback networks used before the API list loads. */
export const memberNetworks: Member['network'][] = ['Main', 'Youth', 'Couples', 'Singles', 'Kids'];

/** Static fallback membership-growth series. */
export const membershipData = [
  { month: 'Jan', new: 4, total: 120 },
  { month: 'Feb', new: 3, total: 123 },
  { month: 'Mar', new: 5, total: 128 },
  { month: 'Apr', new: 2, total: 130 },
  { month: 'May', new: 6, total: 136 },
  { month: 'Jun', new: 4, total: 140 },
];

export const categoryVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  Tithe: 'default',
  Offering: 'secondary',
  'Building Fund': 'outline',
  Missions: 'destructive',
};

/** Build a chart config that assigns a rotating chart color to each data item. */
export const getDynamicChartConfig = (data: any[], keyProperty: string = 'name'): ChartConfig =>
  Object.fromEntries(
    data.map((item, index) => {
      const key = item[keyProperty] || item.category || item.name;
      return [key, { label: key, color: `hsl(var(--chart-${(index % 5) + 1}))` }];
    })
  );
