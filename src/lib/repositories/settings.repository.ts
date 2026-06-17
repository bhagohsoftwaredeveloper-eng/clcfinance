import { query, isElectron } from '../db/connection';

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
    backupEnabled: setting.backup_enabled === 1,
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
  const backupEnabled = settings.backupEnabled !== undefined ? (settings.backupEnabled ? 1 : 0) : 1;
  const params = ['global', settings.appName, settings.logoUrl, settings.theme, backupTime, backupEnabled];

  // SQLite and MySQL express "upsert" differently.
  const sql = isElectron
    ? 'INSERT OR REPLACE INTO settings (id, app_name, logo_url, theme, backup_time, backup_enabled, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)'
    : 'INSERT INTO settings (id, app_name, logo_url, theme, backup_time, backup_enabled, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP) ON DUPLICATE KEY UPDATE app_name = VALUES(app_name), logo_url = VALUES(logo_url), theme = VALUES(theme), backup_time = VALUES(backup_time), backup_enabled = VALUES(backup_enabled), updated_at = CURRENT_TIMESTAMP';

  await query.run(sql, params);
};
