'use client';

import * as React from 'react';
import { Plus, Pencil, Trash, Check, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface LookupManagerProps {
  /** Lookup API base, e.g. "/api/networks". Must support GET/POST/PUT/DELETE. */
  apiUrl: string;
  /** The label column for this lookup ("name" for most, "time" for service times). */
  field: 'name' | 'time';
  /** Singular noun used in placeholders/messages, e.g. "network". */
  itemNoun: string;
}

/**
 * Generic CRUD list for a lookup table (networks, categories, giving types,
 * service times). Used in the Configuration page tabs — one instance per list.
 */
export function LookupManager({ apiUrl, field, itemNoun }: LookupManagerProps) {
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [newValue, setNewValue] = React.useState('');
  const [adding, setAdding] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState('');
  const { toast } = useToast();

  const load = React.useCallback(async () => {
    try {
      const res = await fetch(apiUrl);
      if (res.ok) setItems(await res.json());
    } catch {
      // ignore — list stays as-is
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  React.useEffect(() => {
    load();
  }, [load]);

  const fail = async (res: Response, title: string) => {
    const data = await res.json().catch(() => ({}));
    toast({ variant: 'destructive', title, description: data.error || 'Please try again.' });
  };

  const add = async () => {
    const value = newValue.trim();
    if (!value || adding) return;
    setAdding(true);
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      if (res.ok) {
        setNewValue('');
        await load();
      } else {
        await fail(res, 'Could not add');
      }
    } finally {
      setAdding(false);
    }
  };

  const save = async (id: string) => {
    const value = editValue.trim();
    if (!value) return;
    const res = await fetch(apiUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, [field]: value }),
    });
    if (res.ok) {
      setEditingId(null);
      await load();
    } else {
      await fail(res, 'Could not update');
    }
  };

  const remove = async (id: string, label: string) => {
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) return;
    const res = await fetch(`${apiUrl}?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      await load();
    } else {
      await fail(res, 'Could not delete');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={`Add ${itemNoun}...`}
          disabled={adding}
        />
        <Button onClick={add} disabled={adding || !newValue.trim()} className="shrink-0">
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 sm:mr-1" />}
          <span className="hidden sm:inline">Add</span>
        </Button>
      </div>

      <div className="divide-y rounded-lg border">
        {loading ? (
          <div className="space-y-2 p-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
          </div>
        ) : items.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">No {itemNoun}s yet. Add one above.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-2 px-3 py-2.5">
              {editingId === item.id ? (
                <>
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        save(item.id);
                      } else if (e.key === 'Escape') {
                        setEditingId(null);
                      }
                    }}
                    autoFocus
                    className="h-8"
                  />
                  <div className="flex shrink-0 gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => save(item.id)}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingId(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <span className="truncate text-sm font-medium">{item[field]}</span>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditingId(item.id);
                        setEditValue(item[field]);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => remove(item.id, item[field])}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
