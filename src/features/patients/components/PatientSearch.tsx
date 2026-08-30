import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const DEBOUNCE_MS = 300;

interface PatientSearchProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
}

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    el.isContentEditable
  );
}

/**
 * The primary way staff find a patient. One field, many identifiers (name, ZRN,
 * phone, email). Debounced so every keystroke does not hit the query; `/`
 * focuses it from anywhere on the page, `Esc` clears and blurs.
 */
export function PatientSearch({ value, onChange }: PatientSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(value);

  // Re-sync when the committed value changes elsewhere (e.g. "Clear filters",
  // back/forward navigation) — the "adjust state while rendering" pattern, not
  // an effect. https://react.dev/learn/you-might-not-need-an-effect
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setDraft(value);
  }

  // Debounce draft -> committed. Calls the parent callback (an external system),
  // never setState, so it is a legitimate effect.
  useEffect(() => {
    if (draft === value) return undefined;
    const id = window.setTimeout(() => onChange(draft), DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [draft, value, onChange]);

  // Global "/" to focus.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === '/' && !isTypingTarget(event.target)) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape' && draft !== '') {
      event.preventDefault();
      setDraft('');
      onChange('');
    }
  }

  function clear() {
    setDraft('');
    onChange('');
    inputRef.current?.focus();
  }

  return (
    <div role="search" className="relative w-full sm:max-w-sm">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        aria-label="Search patients by name, patient ID, phone number, or email"
        placeholder="Search by name, patient ID, phone number..."
        className={cn('pl-8', draft !== '' && 'pr-8')}
      />
      {draft !== '' && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={clear}
          className="absolute top-1/2 right-1.5 flex size-6 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition-colors motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
