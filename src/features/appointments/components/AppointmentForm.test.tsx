// Component-level tests for the shared create/edit appointment form.
//
// The repository is mocked (not `fetch`, not the mutation hooks): that keeps
// the real `useCreateAppointment`/`useUpdateAppointment` wiring — including
// `mutateAsync`, the success toast and the post-save navigate — under test,
// while pinning the EXACT body that reaches the HTTP layer against
// `CreateAppointmentBody` / `UpdateAppointmentBody`.
//
// The patient/staff option sources are mocked because they reach into the
// patients/staff features' own repositories, which is not what this suite is
// about; `AsyncComboboxField` itself is covered by its Phase 12 test.

import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppointmentForm } from '@/features/appointments/components/AppointmentForm';
import { appointmentsRepository } from '@/features/appointments/api/appointmentsRepository';
import type { Appointment } from '@/features/appointments/types/appointment.types';
import { useAuthStore } from '@/features/auth/authStore';
import { useDashboardFiltersStore } from '@/features/dashboard/filters/dashboardFiltersStore';
import type { User } from '@/features/auth/types';

vi.mock('@/features/appointments/api/appointmentsRepository', () => ({
  appointmentsRepository: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock('@/features/appointments/api/appointmentPickers', () => ({
  searchPatientOptions: vi.fn(async () => [
    { value: '11111111-1111-4111-8111-111111111111', label: 'Ada Lovelace' },
    { value: '33333333-3333-4333-8333-333333333333', label: 'Grace Hopper' },
  ]),
  createSearchStaffOptions: vi.fn(() =>
    vi.fn(async () => [
      { value: '22222222-2222-4222-8222-222222222222', label: 'Dr House' },
      { value: '44444444-4444-4444-8444-444444444444', label: 'Dr Wilson' },
    ]),
  ),
  usePatientOptionLabel: () => undefined,
  useStaffOptionLabel: () => undefined,
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// Radix Popover/Select rely on a few DOM APIs jsdom doesn't implement.
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {};
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

const PATIENT_ID = '11111111-1111-4111-8111-111111111111';
const STAFF_ID = '22222222-2222-4222-8222-222222222222';
const BRANCH_ID = 'a0359696-51e0-48c0-ba37-4adefe284711';
const APPOINTMENT_ID = '99999999-9999-4999-8999-999999999999';

const createMock = vi.mocked(appointmentsRepository.create);
const updateMock = vi.mocked(appointmentsRepository.update);

function user(overrides: Partial<User> = {}): User {
  return {
    id: 'u1',
    email: 'nurse@example.com',
    fullName: 'Nurse Joy',
    roleId: 'r1',
    roleName: 'nurse',
    branchId: BRANCH_ID,
    permissions: [],
    ...overrides,
  };
}

function existingAppointment(
  overrides: Partial<Appointment> = {},
): Appointment {
  return {
    id: APPOINTMENT_ID,
    patientId: PATIENT_ID,
    staffId: STAFF_ID,
    branchId: BRANCH_ID,
    status: 'SCHEDULED',
    type: 'CONSULTATION',
    reason: 'Routine check-up',
    startAt: '2026-10-02T09:00:00.000Z',
    endAt: '2026-10-02T09:30:00.000Z',
    notes: null,
    createdAt: '2026-09-12T06:53:10.000Z',
    updatedAt: '2026-09-12T06:53:10.000Z',
    ...overrides,
  };
}

function renderForm(ui: React.ReactNode, initialPath: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/appointments/new" element={ui} />
          <Route path="/appointments/:id/edit" element={ui} />
          <Route
            path="/appointments/:id"
            element={<div>appointment detail page</div>}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

/** Opens an `AsyncComboboxField` by its visible placeholder and picks a label. */
async function pickFromCombobox(
  ue: ReturnType<typeof userEvent.setup>,
  placeholder: string,
  optionLabel: string,
) {
  const triggers = screen.getAllByRole('combobox');
  const trigger = triggers.find((t) => t.textContent?.includes(placeholder));
  if (!trigger) throw new Error(`No combobox with placeholder ${placeholder}`);
  await ue.click(trigger);
  const option = await screen.findByText(optionLabel);
  await ue.click(option);
}

/** Opens a Radix `SelectField` by its accessible trigger text and picks a label. */
async function pickFromSelect(
  ue: ReturnType<typeof userEvent.setup>,
  triggerText: string,
  optionLabel: string,
) {
  const triggers = screen.getAllByRole('combobox');
  const trigger = triggers.find((t) => t.textContent?.includes(triggerText));
  if (!trigger) throw new Error(`No select trigger with text ${triggerText}`);
  await ue.click(trigger);
  const option = await screen.findByRole('option', { name: optionLabel });
  await ue.click(option);
}

beforeEach(() => {
  createMock.mockReset();
  updateMock.mockReset();
  useAuthStore.setState({ user: user(), status: 'authed' });
  useDashboardFiltersStore.setState({ branchId: BRANCH_ID });
});

afterEach(() => {
  cleanup();
});

describe('AppointmentForm — validation', () => {
  it('renders a message for every required field on an empty submit', async () => {
    const ue = userEvent.setup();
    renderForm(<AppointmentForm mode="create" />, '/appointments/new');

    await ue.click(
      screen.getByRole('button', { name: 'Schedule appointment' }),
    );

    expect(await screen.findByText('Patient is required.')).toBeInTheDocument();
    expect(screen.getByText('Staff member is required.')).toBeInTheDocument();
    expect(screen.getByText('Select an appointment type.')).toBeInTheDocument();
    expect(screen.getByText('Start time is required.')).toBeInTheDocument();
    expect(screen.getByText('End time is required.')).toBeInTheDocument();
  });

  it('sends no request when validation fails', async () => {
    const ue = userEvent.setup();
    renderForm(<AppointmentForm mode="create" />, '/appointments/new');

    await ue.click(
      screen.getByRole('button', { name: 'Schedule appointment' }),
    );
    await screen.findByText('Patient is required.');

    expect(createMock).not.toHaveBeenCalled();
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("surfaces the schema's end>start refine on the end field", async () => {
    const ue = userEvent.setup();
    renderForm(
      <AppointmentForm
        mode="edit"
        appointmentId={APPOINTMENT_ID}
        initialData={existingAppointment()}
      />,
      `/appointments/${APPOINTMENT_ID}/edit`,
    );

    const endTime = screen.getByLabelText(/date & time end time/i);
    await ue.clear(endTime);
    await ue.type(endTime, '08:00');

    await ue.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(
      await screen.findByText('End time must be after the start time'),
    ).toBeInTheDocument();
    expect(updateMock).not.toHaveBeenCalled();
  });
});

describe('AppointmentForm — create submit', () => {
  it('POSTs a CreateAppointmentBody with exactly the filled fields', async () => {
    const ue = userEvent.setup();
    createMock.mockResolvedValue(existingAppointment());

    renderForm(<AppointmentForm mode="create" />, '/appointments/new');

    await pickFromCombobox(ue, 'Select a patient', 'Ada Lovelace');
    await pickFromCombobox(ue, 'Select a staff member', 'Dr House');
    await pickFromSelect(ue, 'Select a type', 'Consultation');

    await ue.type(screen.getByLabelText(/date & time start time/i), '09:00');
    await ue.type(screen.getByLabelText(/date & time end time/i), '10:00');

    await ue.click(
      screen.getByRole('button', { name: 'Schedule appointment' }),
    );

    await waitFor(() => {
      expect(createMock).toHaveBeenCalledTimes(1);
    });

    const body = createMock.mock.calls[0]?.[0];
    if (!body) throw new Error('create was not called with a body');

    // Non-admin caller: `branchId` is OMITTED entirely, never sent as
    // `undefined`. `reason`/`notes` are empty, so they are omitted too.
    expect(Object.keys(body).sort()).toEqual([
      'endAt',
      'patientId',
      'staffId',
      'startAt',
      'type',
    ]);
    expect(body.patientId).toBe(PATIENT_ID);
    expect(body.staffId).toBe(STAFF_ID);
    expect(body.type).toBe('CONSULTATION');
    expect(new Date(body.startAt).getHours()).toBe(9);
    expect(new Date(body.endAt).getHours()).toBe(10);
    expect(new Date(body.endAt).getTime()).toBeGreaterThan(
      new Date(body.startAt).getTime(),
    );

    expect(
      await screen.findByText('appointment detail page'),
    ).toBeInTheDocument();
  });

  it('includes the switcher branchId for an admin caller', async () => {
    const ue = userEvent.setup();
    useAuthStore.setState({ user: user({ roleName: 'admin' }) });
    createMock.mockResolvedValue(existingAppointment());

    renderForm(<AppointmentForm mode="create" />, '/appointments/new');

    await pickFromCombobox(ue, 'Select a patient', 'Ada Lovelace');
    await pickFromCombobox(ue, 'Select a staff member', 'Dr House');
    await pickFromSelect(ue, 'Select a type', 'Consultation');
    await ue.type(screen.getByLabelText(/date & time start time/i), '09:00');
    await ue.type(screen.getByLabelText(/date & time end time/i), '10:00');

    await ue.click(
      screen.getByRole('button', { name: 'Schedule appointment' }),
    );

    await waitFor(() => {
      expect(createMock).toHaveBeenCalledTimes(1);
    });
    expect(createMock.mock.calls[0]?.[0].branchId).toBe(BRANCH_ID);
  });

  it('blocks submit for an admin with no branch selected, sending nothing', async () => {
    const ue = userEvent.setup();
    useAuthStore.setState({ user: user({ roleName: 'admin' }) });
    useDashboardFiltersStore.setState({ branchId: null });

    renderForm(<AppointmentForm mode="create" />, '/appointments/new');

    await pickFromCombobox(ue, 'Select a patient', 'Ada Lovelace');
    await pickFromCombobox(ue, 'Select a staff member', 'Dr House');
    await pickFromSelect(ue, 'Select a type', 'Consultation');
    await ue.type(screen.getByLabelText(/date & time start time/i), '09:00');
    await ue.type(screen.getByLabelText(/date & time end time/i), '10:00');

    await ue.click(
      screen.getByRole('button', { name: 'Schedule appointment' }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /no branch is selected/i,
    );
    expect(createMock).not.toHaveBeenCalled();
  });
});

describe('AppointmentForm — edit submit', () => {
  it('PATCHes an UpdateAppointmentBody carrying the merged record', async () => {
    const ue = userEvent.setup();
    const initial = existingAppointment();
    updateMock.mockResolvedValue({ ...initial, status: 'CONFIRMED' });

    renderForm(
      <AppointmentForm
        mode="edit"
        appointmentId={APPOINTMENT_ID}
        initialData={initial}
      />,
      `/appointments/${APPOINTMENT_ID}/edit`,
    );

    await pickFromSelect(ue, 'Scheduled', 'Confirmed');
    await ue.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(updateMock).toHaveBeenCalledTimes(1);
    });

    const [id, body] = updateMock.mock.calls[0] ?? [];
    expect(id).toBe(APPOINTMENT_ID);
    // `UpdateAppointmentBody` deliberately has NO `branchId` — an appointment
    // never changes branch via PATCH.
    expect(body).toEqual({
      patientId: PATIENT_ID,
      staffId: STAFF_ID,
      type: 'CONSULTATION',
      status: 'CONFIRMED',
      startAt: initial.startAt,
      endAt: initial.endAt,
      reason: 'Routine check-up',
      notes: '',
    });
    expect(body).not.toHaveProperty('branchId');
  });

  it('keeps Save disabled until something actually changes', () => {
    renderForm(
      <AppointmentForm
        mode="edit"
        appointmentId={APPOINTMENT_ID}
        initialData={existingAppointment()}
      />,
      `/appointments/${APPOINTMENT_ID}/edit`,
    );

    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  });

  it('shows the API error message at the form root and stays put', async () => {
    const ue = userEvent.setup();
    updateMock.mockRejectedValue(new Error('boom'));

    renderForm(
      <AppointmentForm
        mode="edit"
        appointmentId={APPOINTMENT_ID}
        initialData={existingAppointment()}
      />,
      `/appointments/${APPOINTMENT_ID}/edit`,
    );

    await pickFromSelect(ue, 'Scheduled', 'Confirmed');
    await ue.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Something went wrong. Please try again.',
    );
    expect(screen.queryByText('appointment detail page')).toBeNull();
  });
});
