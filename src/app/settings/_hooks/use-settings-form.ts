'use client';

import { useEffect, useState } from 'react';
import { useSettings } from '@/context/settings-context';

/**
 * Owns the editable application settings (name, logo, theme, backup schedule),
 * loading them on mount and persisting them together via /api/settings.
 */
export function useSettingsForm() {
  const { settings, updateSettings } = useSettings();
  const [appName, setAppName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [backupTime, setBackupTime] = useState('02:00');
  const [backupEnabled, setBackupEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const db = await res.json();
          setAppName(db.appName);
          setLogoUrl(db.logoUrl);
          setBackupTime(db.backupTime || '02:00');
          setBackupEnabled(db.backupEnabled !== undefined ? db.backupEnabled : true);
          updateSettings({ appName: db.appName, logoUrl: db.logoUrl, theme: db.theme });
        } else {
          setAppName(settings.appName);
          setLogoUrl(settings.logoUrl);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        setAppName(settings.appName);
        setLogoUrl(settings.logoUrl);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appName, logoUrl, theme: settings.theme, backupTime, backupEnabled }),
      });
      if (res.ok) {
        updateSettings({ appName, logoUrl, theme: settings.theme });
        alert('Settings saved successfully!');
      } else {
        const error = await res.json().catch(() => ({}));
        alert(error.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleTheme = (dark: boolean) => updateSettings({ theme: dark ? 'dark' : 'light' });

  const uploadLogo = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const result = await res.json();
      if (res.ok) {
        setLogoUrl(result.url);
        updateSettings({ logoUrl: result.url });
      } else {
        alert(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return {
    appName, setAppName,
    logoUrl, setLogoUrl,
    backupTime, setBackupTime,
    backupEnabled, setBackupEnabled,
    theme: settings.theme,
    loading, saving, uploading,
    save, toggleTheme, uploadLogo,
  };
}
