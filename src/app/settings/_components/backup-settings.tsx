'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Database, Clock, Download } from 'lucide-react';

interface BackupSettingsProps {
  backupInfo: any;
  backupLoading: boolean;
  triggering: boolean;
  onRunBackup: () => void;
  backupTime: string;
  onBackupTimeChange: (value: string) => void;
  backupEnabled: boolean;
  onBackupEnabledChange: (value: boolean) => void;
}

export function BackupSettings({
  backupInfo,
  backupLoading,
  triggering,
  onRunBackup,
  backupTime,
  onBackupTimeChange,
  backupEnabled,
  onBackupEnabledChange,
}: BackupSettingsProps) {
  return (
    <Card className="surface-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          MySQL Backup Scheduler
        </CardTitle>
        <CardDescription>Configure automatic database backups and manage backup files.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Backup Status
          </Label>
          {backupLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary" />
              <p className="text-sm text-muted-foreground">Loading backup information...</p>
            </div>
          ) : backupInfo ? (
            <div className="space-y-1 text-sm">
              <p><strong>Total backups:</strong> {backupInfo.totalBackups}</p>
              {backupInfo.lastBackup && (
                <p><strong>Last backup:</strong> {new Date(backupInfo.lastBackup.createdAt).toLocaleString()}</p>
              )}
              <p><strong>Backup directory:</strong> {backupInfo.backupDirectory}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Unable to load backup information</p>
          )}
        </div>

        <div className="space-y-3">
          <Label>Scheduler Settings</Label>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="backup-enabled">Enable Automatic Backups</Label>
              <p className="text-sm text-muted-foreground">Toggle automatic daily backups on or off</p>
            </div>
            <Switch id="backup-enabled" checked={backupEnabled} onCheckedChange={onBackupEnabledChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="backup-time">Backup Time</Label>
            <Input
              id="backup-time"
              type="time"
              value={backupTime}
              onChange={(e) => onBackupTimeChange(e.target.value)}
              disabled={!backupEnabled}
              placeholder="02:00"
            />
            <p className="text-sm text-muted-foreground">Time to run automatic daily backups (HH:MM format)</p>
          </div>
          <div className="rounded-md bg-muted p-3">
            <p className="text-sm"><strong>Automatic backups:</strong> {backupEnabled ? `Daily at ${backupTime || '02:00'}` : 'Disabled'}</p>
            <p className="text-sm"><strong>Retention:</strong> Keeps 7 most recent backups</p>
            <p className="text-sm"><strong>Databases:</strong> SQLite and MySQL</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>MySQL Manual Backup</Label>
          <div className="flex items-center gap-3">
            <Button onClick={onRunBackup} disabled={triggering} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4" />
              {triggering ? 'Creating Backup...' : 'Run Backup Now'}
            </Button>
            {triggering && (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600" />
                <p className="text-sm text-blue-600">Backing up MySQL data...</p>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Immediately backup all MySQL data including tables, donations, expenses, members, and settings
          </p>
        </div>

        {backupInfo?.backupFiles && backupInfo.backupFiles.length > 0 && (
          <div className="space-y-2">
            <Label>Available Backup Files</Label>
            <div className="space-y-2 rounded-md bg-muted p-3">
              {backupInfo.backupFiles.map((file: any) => (
                <div key={file.name} className="flex items-center justify-between rounded border bg-background p-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {file.type} • {(file.size / 1024).toFixed(1)} KB • {new Date(file.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = `/api/backup/download/${file.name}`;
                      link.download = file.name;
                      link.click();
                    }}
                    className="ml-2"
                  >
                    <Download className="mr-1 h-3 w-3" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">Download backup files for offline storage or restoration purposes</p>
          </div>
        )}

        {backupInfo?.recentLogs && (
          <div className="space-y-2">
            <Label>Recent Backup Logs</Label>
            <div className="max-h-32 overflow-y-auto rounded-md bg-muted p-3">
              <pre className="whitespace-pre-wrap font-mono text-xs">{backupInfo.recentLogs}</pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
