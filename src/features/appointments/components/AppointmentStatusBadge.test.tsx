// Table-driven over APPOINTMENT_STATUS_VALUES so the suite grows automatically
// with the enum: if a ninth status is ever added and `CONFIG` in
// AppointmentStatusBadge.tsx is not extended, the destructure
// (`CONFIG[status]`) throws and the new case fails here rather than rendering
// a blank badge in production. There is deliberately no `default:` branch to
// fall through to — that absence is what these tests pin.

import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { badgeVariants } from '@/components/ui/badge';
import { APPOINTMENT_STATUS_OPTIONS } from '@/features/appointments/appointmentOptions';
import { AppointmentStatusBadge } from '@/features/appointments/components/AppointmentStatusBadge';
import {
  APPOINTMENT_STATUS_VALUES,
  type AppointmentStatus,
} from '@/features/appointments/types/appointment.types';

// `vitest.config.ts` runs with `test.globals` disabled, so React Testing
// Library's auto-cleanup never kicks in; unmount explicitly.
afterEach(() => {
  cleanup();
});

type BadgeVariant = 'neutral' | 'outline' | 'success' | 'warning' | 'danger';

// The expected mapping, pinned as exact strings on both sides. Written out in
// full rather than derived from the component so that a change to the
// component's CONFIG has to be mirrored here consciously.
const EXPECTED: Record<
  AppointmentStatus,
  { readonly label: string; readonly variant: BadgeVariant }
> = {
  SCHEDULED: { label: 'Scheduled', variant: 'neutral' },
  CONFIRMED: { label: 'Confirmed', variant: 'neutral' },
  CHECKED_IN: { label: 'Checked in', variant: 'outline' },
  IN_PROGRESS: { label: 'In progress', variant: 'outline' },
  COMPLETED: { label: 'Completed', variant: 'success' },
  CANCELLED: { label: 'Cancelled', variant: 'danger' },
  NO_SHOW: { label: 'No show', variant: 'danger' },
  RESCHEDULED: { label: 'Rescheduled', variant: 'warning' },
};

function renderBadge(status: AppointmentStatus): HTMLElement {
  const { container } = render(<AppointmentStatusBadge status={status} />);
  const badge = container.querySelector('[data-slot="badge"]');
  if (!(badge instanceof HTMLElement)) {
    throw new Error(`No badge rendered for status "${status}"`);
  }
  return badge;
}

describe('AppointmentStatusBadge', () => {
  it('has an expectation for every status in the enum', () => {
    expect(Object.keys(EXPECTED).sort()).toEqual(
      [...APPOINTMENT_STATUS_VALUES].sort(),
    );
  });

  it.each(APPOINTMENT_STATUS_VALUES)(
    'renders %s with its exact label and no fallthrough',
    (status) => {
      const badge = renderBadge(status);
      expect(badge).toHaveTextContent(EXPECTED[status].label);
      // Every configured status carries an icon; a missing CONFIG entry could
      // not produce one.
      expect(badge.querySelector('svg')).not.toBeNull();
      expect(badge.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    },
  );

  it.each(APPOINTMENT_STATUS_VALUES)(
    'maps %s to its expected badge variant',
    (status) => {
      const badge = renderBadge(status);
      expect(badge.className).toBe(
        badgeVariants({ variant: EXPECTED[status].variant }),
      );
    },
  );

  it('distinguishes the danger statuses from the success one', () => {
    const completed = renderBadge('COMPLETED').className;
    cleanup();
    const cancelled = renderBadge('CANCELLED').className;
    expect(completed).not.toBe(cancelled);
  });

  it('uses the same human labels as APPOINTMENT_STATUS_OPTIONS', () => {
    for (const option of APPOINTMENT_STATUS_OPTIONS) {
      expect(EXPECTED[option.value as AppointmentStatus].label).toBe(
        option.label,
      );
    }
  });

  it('renders a label for every status without throwing (exhaustiveness)', () => {
    for (const status of APPOINTMENT_STATUS_VALUES) {
      expect(() => renderBadge(status)).not.toThrow();
      cleanup();
    }
    expect(screen.queryByText('undefined')).toBeNull();
  });
});
