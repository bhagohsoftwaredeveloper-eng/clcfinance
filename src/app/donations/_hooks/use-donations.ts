'use client';

import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Donation, Member } from '@/lib/types';

/**
 * Owns the giving records and the donor list, plus create/update/delete for a
 * donation. Save handlers return a success boolean so the page can close the
 * drawer; toast feedback is handled here.
 */
export function useDonations() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDonations = useCallback(async () => {
    try {
      const res = await fetch('/api/donations');
      if (res.ok) setDonations(await res.json());
    } catch (error) {
      console.error('Failed to fetch donations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDonations();
    fetch('/api/members')
      .then((res) => (res.ok ? res.json() : []))
      .then(setMembers)
      .catch((error) => console.error('Failed to fetch members:', error));
  }, [fetchDonations]);

  const saveDonation = async (donation: Donation, isEditing: boolean): Promise<boolean> => {
    try {
      const url = isEditing ? `/api/donations?id=${donation.id}` : '/api/donations';
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donation),
      });
      if (res.ok) {
        await fetchDonations();
        toast({ title: 'Success', description: `Donation ${isEditing ? 'updated' : 'recorded'} successfully.` });
        return true;
      }
      const data = await res.json().catch(() => ({}));
      toast({ variant: 'destructive', title: `Could not ${isEditing ? 'update' : 'record'} donation`, description: data.error || 'Please check the form and try again.' });
      return false;
    } catch (error) {
      console.error('Error saving donation:', error);
      toast({ variant: 'destructive', title: 'Error saving donation', description: 'A network or server error occurred.' });
      return false;
    }
  };

  const deleteDonation = async (id: string): Promise<void> => {
    try {
      const res = await fetch(`/api/donations?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchDonations();
      } else {
        toast({ variant: 'destructive', title: 'Could not delete donation', description: 'Please try again.' });
      }
    } catch (error) {
      console.error('Error deleting donation:', error);
      toast({ variant: 'destructive', title: 'Error deleting donation', description: 'A network or server error occurred.' });
    }
  };

  return { donations, members, loading, saveDonation, deleteDonation };
}
