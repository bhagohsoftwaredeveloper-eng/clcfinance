'use client';

import { useEffect, useState } from 'react';
import type { Member, Donation, Event } from '@/lib/types';

/** Loads the data the dashboard summarises: members, donations, and events. */
export function useDashboard() {
  const [members, setMembers] = useState<Member[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [membersRes, donationsRes, eventsRes] = await Promise.all([
          fetch('/api/members'),
          fetch('/api/donations'),
          fetch('/api/events'),
        ]);
        if (membersRes.ok) setMembers(await membersRes.json());
        if (donationsRes.ok) setDonations(await donationsRes.json());
        if (eventsRes.ok) setEvents(await eventsRes.json());
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { members, donations, events, loading };
}
