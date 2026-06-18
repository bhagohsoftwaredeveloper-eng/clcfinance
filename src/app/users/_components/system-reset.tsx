'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface SystemResetProps {
  /** Performs the reset and returns whether it succeeded. */
  onReset: () => Promise<boolean>;
  /** Called after a successful reset (e.g. redirect). */
  onResetComplete: () => void;
}

/** Admin-only danger zone: wipes member/event/donation/expense data. */
export function SystemReset({ onReset, onResetComplete }: SystemResetProps) {
  const [open, setOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    setResetting(true);
    try {
      const ok = await onReset();
      if (ok) {
        setOpen(false);
        onResetComplete();
      }
    } finally {
      setResetting(false);
    }
  };

  return (
    <>
      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <CardTitle className="text-destructive">System Administration</CardTitle>
              <CardDescription>Dangerous operations that affect the entire system.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <h4 className="mb-2 font-semibold text-destructive">System Reset</h4>
            <p className="mb-4 text-sm text-muted-foreground">
              This will permanently delete all member records, events, donations, and expenses from the system.
              User accounts and system settings will be preserved. This action cannot be undone.
            </p>
            <div className="flex items-center gap-2">
              <Button variant="destructive" onClick={() => setOpen(true)} disabled={resetting}>
                <RotateCcw className="mr-2 h-4 w-4" />
                {resetting ? 'Resetting...' : 'Reset System Data'}
              </Button>
              <span className="text-xs text-muted-foreground">Only administrators can perform this action</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={open} onOpenChange={(o) => !resetting && setOpen(o)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirm System Reset
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all data from the system. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3">
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
              <h4 className="mb-2 text-sm font-semibold text-destructive">Data that will be deleted:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• All member records</li>
                <li>• All events</li>
                <li>• All donations</li>
                <li>• All expenses</li>
              </ul>
              <p className="mt-2 text-sm text-muted-foreground">User accounts and system settings will be preserved.</p>
            </div>
            <p className="text-xs text-muted-foreground">
              <strong>Tip:</strong> Make sure you have a recent backup before proceeding — this is irreversible.
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={resetting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleReset();
              }}
              disabled={resetting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {resetting ? 'Resetting...' : 'Yes, Reset System'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
