'use client';

import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

/** Owns backup status info and the manual-backup trigger. */
export function useBackup() {
  const [backupInfo, setBackupInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const { toast } = useToast();

  const loadBackupInfo = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/backup');
      if (res.ok) {
        const data = await res.json();
        setBackupInfo(data.data);
      }
    } catch (error) {
      console.error('Error loading backup info:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBackupInfo();
  }, [loadBackupInfo]);

  const runManualBackup = async () => {
    setTriggering(true);
    try {
      const res = await fetch('/api/backup', { method: 'POST' });
      if (res.ok) {
        toast({ title: 'Backup complete', description: 'The database backup finished successfully.' });
        await loadBackupInfo();
      } else {
        const error = await res.json().catch(() => ({}));
        toast({ variant: 'destructive', title: 'Backup failed', description: error.message || 'Please try again.' });
      }
    } catch (error) {
      console.error('Manual backup error:', error);
      toast({ variant: 'destructive', title: 'Backup failed', description: 'A network or server error occurred.' });
    } finally {
      setTriggering(false);
    }
  };

  return { backupInfo, loading, triggering, runManualBackup };
}
