'use client';

import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Member, Donation } from '@/lib/types';

/**
 * Owns the members list and its create/update/delete operations, plus recording
 * a donation for a member. Handlers show their own toast feedback and return a
 * success boolean so the page can decide whether to close a drawer.
 */
export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch('/api/members');
      if (res.ok) setMembers(await res.json());
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const saveMember = async (member: Member, isEditing: boolean): Promise<boolean> => {
    try {
      const res = await fetch('/api/members', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(member),
      });
      if (res.ok) {
        await fetchMembers();
        toast({ title: 'Success', description: `Member ${isEditing ? 'updated' : 'added'} successfully.` });
        return true;
      }
      const data = await res.json().catch(() => ({}));
      toast({ variant: 'destructive', title: 'Could not save member', description: data.error || 'Please check the form and try again.' });
      return false;
    } catch (error) {
      console.error('Error saving member:', error);
      toast({ variant: 'destructive', title: 'Error saving member', description: 'A network or server error occurred.' });
      return false;
    }
  };

  const deleteMember = async (id: string): Promise<void> => {
    try {
      const res = await fetch(`/api/members?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchMembers();
      } else {
        toast({ variant: 'destructive', title: 'Could not delete member', description: 'Please try again.' });
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      toast({ variant: 'destructive', title: 'Error deleting member', description: 'A network or server error occurred.' });
    }
  };

  const saveDonation = async (donation: Donation): Promise<boolean> => {
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donation),
      });
      if (res.ok) {
        toast({ title: 'Success', description: 'Donation recorded successfully.' });
        return true;
      }
      const data = await res.json().catch(() => ({}));
      toast({ variant: 'destructive', title: 'Could not record donation', description: data.error || 'Please check the form and try again.' });
      return false;
    } catch (error) {
      console.error('Error recording donation:', error);
      toast({ variant: 'destructive', title: 'Error recording donation', description: 'A network or server error occurred.' });
      return false;
    }
  };

  return { members, loading, saveMember, deleteMember, saveDonation };
}
