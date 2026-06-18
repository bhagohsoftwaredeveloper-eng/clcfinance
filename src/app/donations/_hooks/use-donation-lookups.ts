'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { QuickSelectOption } from '@/components/ui/quick-select';

type NamedLookup = { id: string; name: string };
type TimeLookup = { id: string; time: string };

/**
 * Lookup lists + inline quick-add for the giving drawer. Note the category
 * adder returns the category *name* as the option value (the donation record
 * stores the category name), unlike the members module which keys on id.
 */
export function useDonationLookups() {
  const [categories, setCategories] = useState<NamedLookup[]>([]);
  const [givingTypes, setGivingTypes] = useState<NamedLookup[]>([]);
  const [serviceTimes, setServiceTimes] = useState<TimeLookup[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const get = async (url: string, set: (data: any) => void) => {
      try {
        const res = await fetch(url);
        if (res.ok) set(await res.json());
      } catch (error) {
        console.error(`Failed to fetch ${url}:`, error);
      }
    };
    get('/api/donation-categories', setCategories);
    get('/api/giving-types', setGivingTypes);
    get('/api/service-times', setServiceTimes);
  }, []);

  const addLookup = async (
    url: string,
    payload: Record<string, string>,
    responseKey: string,
    toOption: (created: any) => QuickSelectOption,
    updateState: (created: any) => void
  ): Promise<QuickSelectOption | null> => {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast({ variant: 'destructive', title: 'Could not add', description: data.error || 'Please try again.' });
        return null;
      }
      const created = (await res.json())[responseKey];
      updateState(created);
      return toOption(created);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'A network error occurred.' });
      return null;
    }
  };

  const addCategory = (name: string) =>
    addLookup('/api/donation-categories', { name }, 'category',
      (c) => ({ value: c.name, label: c.name }),
      (c) => setCategories((prev) => [...prev, c].sort((a, b) => a.name.localeCompare(b.name))));

  const addGivingType = (name: string) =>
    addLookup('/api/giving-types', { name }, 'givingType',
      (g) => ({ value: g.id, label: g.name }),
      (g) => setGivingTypes((prev) => [...prev, g].sort((a, b) => a.name.localeCompare(b.name))));

  const addServiceTime = (name: string) =>
    addLookup('/api/service-times', { time: name }, 'serviceTime',
      (s) => ({ value: s.time, label: s.time }),
      (s) => setServiceTimes((prev) => [...prev, s].sort((a, b) => a.time.localeCompare(b.time))));

  return { categories, givingTypes, serviceTimes, addCategory, addGivingType, addServiceTime };
}
