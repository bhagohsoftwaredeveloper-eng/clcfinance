'use client';

import { useCallback, useEffect, useState } from 'react';

/** Owns backup status info and the manual-backup trigger. */
export function useBackup() {
  const [backupInfo, setBackupInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [triggering, setTriggering] = useState(false);

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
        alert('Backup completed successfully!');
        await loadBackupInfo();
      } else {
        const error = await res.json().catch(() => ({}));
        alert(error.message || 'Backup failed');
      }
    } catch (error) {
      console.error('Manual backup error:', error);
      alert('Backup failed');
    } finally {
      setTriggering(false);
    }
  };

  return { backupInfo, loading, triggering, runManualBackup };
}
