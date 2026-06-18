'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Palette, FileImage, Upload } from 'lucide-react';

interface GeneralSettingsProps {
  appName: string;
  onAppNameChange: (value: string) => void;
  logoUrl: string;
  onLogoUrlChange: (value: string) => void;
  uploading: boolean;
  onUploadLogo: (file: File) => void;
  theme: 'light' | 'dark';
  onToggleTheme: (dark: boolean) => void;
}

export function GeneralSettings({
  appName,
  onAppNameChange,
  logoUrl,
  onLogoUrlChange,
  uploading,
  onUploadLogo,
  theme,
  onToggleTheme,
}: GeneralSettingsProps) {
  return (
    <>
      <Card className="surface-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Application Settings
          </CardTitle>
          <CardDescription>Configure the basic settings for your application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="app-name">Application Name</Label>
            <Input id="app-name" value={appName} onChange={(e) => onAppNameChange(e.target.value)} placeholder="Enter application name" />
          </div>
        </CardContent>
      </Card>

      <Card className="surface-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            Branding
          </CardTitle>
          <CardDescription>Customize the logo and visual identity.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="logo-url">Logo URL</Label>
            <Input id="logo-url" value={logoUrl} onChange={(e) => onLogoUrlChange(e.target.value)} placeholder="Enter logo image URL" />
            <p className="text-sm text-muted-foreground">
              Enter a URL to an image file (PNG, JPG, etc.) or upload a file below.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo-upload">Upload Logo</Label>
            <div className="flex items-center gap-2">
              <Input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUploadLogo(file);
                }}
                disabled={uploading}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm" disabled={uploading} className="shrink-0">
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">Upload a new logo image (PNG, JPG, GIF, WebP). Max size: 5MB.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="surface-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>Customize the visual appearance of the application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Dark Mode</Label>
              <p className="text-sm text-muted-foreground">Toggle between light and dark themes.</p>
            </div>
            <Switch checked={theme === 'dark'} onCheckedChange={onToggleTheme} />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
