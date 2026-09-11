/**
 * Authenticated-app header bar.
 *
 * Chrome only: a time-of-day greeting on the left, a centered patient-search
 * trigger, and a branch switcher + notifications bell on the right. User
 * identity and sign-out live in the sidebar footer, not here.
 */
import { Bell, Search } from 'lucide-react';

import { useAuthStore } from '../../features/auth/authStore';
import { BranchSwitcher } from '../../features/branch/components/BranchSwitcher';

function greetingFor(hours: number): string {
  if (hours < 12) return 'Good morning';
  if (hours < 18) return 'Good afternoon';
  return 'Good evening';
}

/** Last whitespace-separated token of a name, title-cased. Single-token safe. */
function lastNameOf(fullName: string): string {
  const tokens = fullName.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return '';
  const token = tokens[tokens.length - 1]!;
  return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
}

export function AppHeader() {
  const user = useAuthStore((s) => s.user);

  const greeting = greetingFor(new Date().getHours());

  let lastName = '';
  if (user !== null) {
    lastName = lastNameOf(user.fullName);
  }

  let heading = greeting;
  if (lastName !== '') {
    heading = `${greeting}, Dr. ${lastName}`;
  }

  return (
    <header className="grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b bg-card px-4">
      {/* Chrome, not the document title — the routed page owns the page <h1>. */}
      <p className="min-w-0 truncate text-sm font-medium text-foreground">
        {heading}
      </p>

      <button
        type="button"
        aria-label="Search patients"
        className="flex h-8 w-60 items-center gap-2 rounded-sm border px-2 text-left text-sm text-muted-foreground transition-colors motion-reduce:transition-none hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
      >
        <Search className="size-4 shrink-0" aria-hidden="true" />
        <span className="truncate">Search patients…</span>
      </button>

      <div className="flex items-center gap-2 justify-self-end">
        <BranchSwitcher />
        <button
          type="button"
          aria-label="Notifications"
          className="flex size-8 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
        >
          <Bell className="size-4" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
