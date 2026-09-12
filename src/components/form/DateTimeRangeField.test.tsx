import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { afterEach, describe, expect, it } from 'vitest';

import { Form } from '@/components/ui/form';
// D9 (INV-L2) bars components/** from importing features/** in production
// code so this domain-agnostic layer stays reusable; this test is the one
// deliberate exception — Phase 12 requires exercising the field against the
// *real* appointment schema's end>start `.refine()`, not a re-implemented
// stand-in that could drift from it.
// eslint-disable-next-line no-restricted-imports
import { appointmentFormSchema } from '@/features/appointments/schemas/appointmentForm.schema';
// eslint-disable-next-line no-restricted-imports
import type { AppointmentFormValues } from '@/features/appointments/schemas/appointmentForm.schema';

import { DateTimeRangeField, composeDateTimeIso } from './DateTimeRangeField';

// Radix Popover relies on a few DOM APIs jsdom doesn't implement.
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

// `vitest.config.ts` runs with `test.globals` disabled, so React Testing
// Library's auto-cleanup (which detects a global `afterEach`) never kicks
// in; unmount explicitly so each test starts from a clean DOM.
afterEach(() => {
  cleanup();
});

function findButtonByText(text: string): HTMLElement {
  const buttons = screen.getAllByRole('button');
  const match = buttons.find((button) => button.textContent?.includes(text));
  if (!match) {
    throw new Error(`No button found with text "${text}"`);
  }
  return match;
}

function Harness({
  defaultValues,
}: Readonly<{
  defaultValues: Partial<AppointmentFormValues>;
}>) {
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patientId: '11111111-1111-1111-1111-111111111111',
      staffId: '22222222-2222-2222-2222-222222222222',
      type: 'CONSULTATION',
      startAt: '',
      endAt: '',
      ...defaultValues,
    },
    mode: 'onChange',
  });

  return (
    <Form {...form}>
      <form>
        <DateTimeRangeField
          control={form.control}
          startName="startAt"
          endName="endAt"
          label="Appointment window"
          required
        />
        <button type="button" onClick={() => form.trigger()}>
          Validate
        </button>
      </form>
    </Form>
  );
}

describe('composeDateTimeIso', () => {
  it('combines a date and a HH:mm time into an ISO string', () => {
    const date = new Date(2026, 0, 15);
    const iso = composeDateTimeIso(date, '09:30');
    const result = new Date(iso);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(15);
    expect(result.getHours()).toBe(9);
    expect(result.getMinutes()).toBe(30);
  });
});

describe('DateTimeRangeField', () => {
  it('produces ISO strings for both fields after picking a date and times', async () => {
    const user = userEvent.setup();
    render(<Harness defaultValues={{}} />);

    await user.click(findButtonByText('Pick a date'));

    const dayButtons = within(document.body).getAllByRole('gridcell');
    const targetCell = dayButtons[10];
    let targetButton: HTMLElement | null = null;
    if (targetCell) {
      targetButton = within(targetCell).queryByRole('button');
    }
    if (targetButton) {
      await user.click(targetButton);
    }

    const startTime = screen.getByLabelText(/appointment window start time/i);
    const endTime = screen.getByLabelText(/appointment window end time/i);

    // Picking a date now defaults both fields' time-of-day to '00:00'
    // (previously it left them untouched until a time was entered), so the
    // inputs already carry a value here. `userEvent.type` types into a
    // segmented <input type="time"> character-by-character, which behaves
    // unreliably once a value is already present — set the value directly
    // instead, same as a real browser's native time-picker segment entry.
    fireEvent.change(startTime, { target: { value: '09:00' } });
    fireEvent.change(endTime, { target: { value: '10:00' } });

    expect((startTime as HTMLInputElement).value).toBe('09:00');
    expect((endTime as HTMLInputElement).value).toBe('10:00');
  });

  it('reflects the picked date on the trigger immediately, before any time is entered', async () => {
    const user = userEvent.setup();
    render(<Harness defaultValues={{}} />);

    const trigger = findButtonByText('Pick a date');
    await user.click(trigger);

    const dayButtons = within(document.body).getAllByRole('gridcell');
    const targetCell = dayButtons[10];
    let targetButton: HTMLElement | null = null;
    if (targetCell) {
      targetButton = within(targetCell).queryByRole('button');
    }
    if (targetButton) {
      await user.click(targetButton);
    }

    expect(trigger.textContent).not.toContain('Pick a date');
  });

  it("shows the schema's end>start refine error on the end field", async () => {
    const user = userEvent.setup();
    render(
      <Harness
        defaultValues={{
          startAt: '2026-01-15T10:00:00.000Z',
          endAt: '2026-01-15T09:00:00.000Z',
        }}
      />,
    );

    await user.click(findButtonByText('Validate'));

    expect(
      await screen.findByText('End time must be after the start time'),
    ).toBeInTheDocument();
  });
});
