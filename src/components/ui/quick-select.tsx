'use client';

import * as React from 'react';
import { Plus, Check, X, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface QuickSelectOption {
  value: string;
  label: string;
}

interface QuickSelectProps {
  id?: string;
  value?: string;
  onValueChange: (value: string) => void;
  options: QuickSelectOption[];
  placeholder?: string;
  /** Label shown on the "+ Add new" row and used in the inline input placeholder. */
  addLabel?: string;
  /**
   * Creates the item (e.g. POST to the API) and returns the new option, or null
   * on failure. The component then selects the newly created option.
   */
  onAdd: (name: string) => Promise<QuickSelectOption | null>;
}

const ADD_SENTINEL = '__quick_add__';

/**
 * A Select with an inline "+ Add new" affordance. Choosing "Add new" swaps the
 * trigger for a small input in place — no nested dialog — so users can create a
 * new option without leaving the form, and it is auto-selected on save.
 */
export function QuickSelect({
  id,
  value,
  onValueChange,
  options,
  placeholder,
  addLabel = 'Add new',
  onAdd,
}: QuickSelectProps) {
  const [adding, setAdding] = React.useState(false);
  const [name, setName] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  const cancel = () => {
    setAdding(false);
    setName('');
  };

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      const created = await onAdd(trimmed);
      if (created) {
        onValueChange(created.value);
        cancel();
      }
    } finally {
      setSaving(false);
    }
  };

  if (adding) {
    return (
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              submit();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              cancel();
            }
          }}
          placeholder={`${addLabel}...`}
          disabled={saving}
        />
        <Button type="button" size="icon" className="shrink-0" onClick={submit} disabled={saving || !name.trim()}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        </Button>
        <Button type="button" size="icon" variant="ghost" className="shrink-0" onClick={cancel} disabled={saving}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Select
      value={value}
      onValueChange={(v) => (v === ADD_SENTINEL ? setAdding(true) : onValueChange(v))}
    >
      <SelectTrigger id={id}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
        {options.length > 0 && <div className="my-1 h-px bg-border" />}
        <SelectItem value={ADD_SENTINEL} className="text-primary focus:text-primary">
          <span className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {addLabel}
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
