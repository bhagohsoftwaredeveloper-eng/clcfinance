'use client';

import { Church } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSettings } from '@/context/settings-context';

export function Logo() {
  const { settings } = useSettings();

  return (
    <Link href="/dashboard" className="flex items-center gap-2.5 group">
      {settings.logoUrl ? (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary overflow-hidden ring-1 ring-primary/15 transition-transform group-hover:scale-105">
          <Image
            src={settings.logoUrl}
            alt="Logo"
            width={36}
            height={36}
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15 transition-transform group-hover:scale-105">
          <Church className="h-5 w-5" />
        </div>
      )}
      <div className="flex flex-col leading-tight">
        <h1 className="text-base font-bold tracking-tight text-foreground">
          {settings.appName}
        </h1>
        <span className="text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">
          Finance Suite
        </span>
      </div>
    </Link>
  );
}
