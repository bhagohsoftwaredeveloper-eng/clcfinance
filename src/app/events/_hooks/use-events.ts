'use client';

import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Event } from '@/lib/types';

/**
 * Owns the events list and scheduling. `saveEvent` returns a success boolean so
 * the page can close the drawer; toast feedback is handled here.
 */
export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch('/api/events');
      if (res.ok) setEvents(await res.json());
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const saveEvent = async (event: Event): Promise<boolean> => {
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      if (res.ok) {
        await fetchEvents();
        toast({ title: 'Event Scheduled', description: `${event.title} has been added to the calendar.` });
        return true;
      }
      const data = await res.json().catch(() => ({}));
      toast({ variant: 'destructive', title: 'Could not schedule event', description: data.error || 'Please try again.' });
      return false;
    } catch (error) {
      console.error('Error scheduling event:', error);
      toast({ variant: 'destructive', title: 'Error scheduling event', description: 'A network or server error occurred.' });
      return false;
    }
  };

  /** Events from the start of today onward, sorted ascending. */
  const upcomingEvents = (() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return events
      .filter((event) => new Date(event.date) >= startOfToday)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  })();

  return { events, upcomingEvents, loading, saveEvent };
}
