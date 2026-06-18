'use client';

import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { useSettingsForm } from './_hooks/use-settings-form';
import { useBackup } from './_hooks/use-backup';
import { GeneralSettings } from './_components/general-settings';
import { BackupSettings } from './_components/backup-settings';

export default function SettingsPage() {
  const form = useSettingsForm();
  const backup = useBackup();

  const header = (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <p className="text-muted-foreground">Customize your application appearance and branding.</p>
    </div>
  );

  if (form.loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          {header}
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
              <p className="text-sm text-muted-foreground">Loading settings...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {header}
        <div className="grid gap-6">
          <GeneralSettings
            appName={form.appName}
            onAppNameChange={form.setAppName}
            logoUrl={form.logoUrl}
            onLogoUrlChange={form.setLogoUrl}
            uploading={form.uploading}
            onUploadLogo={form.uploadLogo}
            theme={form.theme}
            onToggleTheme={form.toggleTheme}
          />

          <BackupSettings
            backupInfo={backup.backupInfo}
            backupLoading={backup.loading}
            triggering={backup.triggering}
            onRunBackup={backup.runManualBackup}
            backupTime={form.backupTime}
            onBackupTimeChange={form.setBackupTime}
            backupEnabled={form.backupEnabled}
            onBackupEnabledChange={form.setBackupEnabled}
          />

          <div className="flex justify-end">
            <Button onClick={form.save} disabled={form.saving}>
              {form.saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
