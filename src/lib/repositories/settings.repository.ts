import { query } from '../db/connection';

const DEFAULT_SETTINGS = {
  appName: 'CLC Finances',
  logoUrl: '/CLC logo2.png',
  theme: 'dark' as 'light' | 'dark',
  backupTime: '02:00',
  backupEnabled: true,
};

export const getSettings = async () => {
  const setting = await query.get<any>('SELECT * FROM settings WHERE id = ?', ['global']);
  if (!setting) return { ...DEFAULT_SETTINGS };
  return {
    appName: setting.app_name,
    logoUrl: setting.logo_url,
    theme: setting.theme,
    backupTime: setting.backup_time,
    // Postgres returns a real boolean; tolerate 1/0 just in case.
    backupEnabled: setting.backup_enabled === true || setting.backup_enabled === 1,
  };
};

export const updateSettings = async (settings: {
  appName: string;
  logoUrl: string;
  theme: 'light' | 'dark';
  backupTime?: string;
  backupEnabled?: boolean;
}) => {
  const backupTime = settings.backupTime || '02:00';
  const backupEnabled = settings.backupEnabled !== undefined ? settings.backupEnabled : true;

  await query.run(
    `INSERT INTO settings (id, app_name, logo_url, theme, backup_time, backup_enabled, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT (id) DO UPDATE SET
       app_name = EXCLUDED.app_name,
       logo_url = EXCLUDED.logo_url,
       theme = EXCLUDED.theme,
       backup_time = EXCLUDED.backup_time,
       backup_enabled = EXCLUDED.backup_enabled,
       updated_at = CURRENT_TIMESTAMP`,
    ['global', settings.appName, settings.logoUrl, settings.theme, backupTime, backupEnabled]
  );
};
