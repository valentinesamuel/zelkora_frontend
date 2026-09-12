// Page-level flow tests: real pages, real router, real query/mutation hooks —
// only `appointmentsRepository` is mocked (the same seam
// `AppointmentForm.test.tsx` uses; no msw in this repo and no page-level test
// precedent in `patients/` or `branch/` to mirror, so the repository module is
// mocked directly with `vi.mock`).
//
// Three flows, one per plan requirement:
//   1. create -> success -> lands on the new appointment's detail page
//   2. edit -> status change -> exactly ONE PATCH, no DELETE + POST pair (INV-7)
//   3. list -> filter + page 2 -> URL params update -> remounting from that
//      URL restores the same filter/page state

import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useSearchParams,
} from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { QueryState } from '@/lib/query';

import { appointmentsRepository } from '@/features/appointments/api/appointmentsRepository';
import { AppointmentCreatePage } from '@/features/appointments/pages/AppointmentCreatePage';
import { AppointmentDetailPage } from '@/features/appointments/pages/AppointmentDetailPage';
import { AppointmentEditPage } from '@/features/appointments/pages/AppointmentEditPage';
import { AppointmentListPage } from '@/features/appointments/pages/AppointmentListPage';
import type { Appointment } from '@/features/appointments/types/appointment.types';
import { useAuthStore } from '@/features/auth/authStore';
import { useDashboardFiltersStore } from '@/features/dashboard/filters/dashboardFiltersStore';

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
  ]),
  createSearchStaffOptions: vi.fn(() =>
    vi.fn(async () => [
      { value: '22222222-2222-4222-8222-222222222222', label: 'Dr House' },
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
const NEW_ID = '99999999-9999-4999-8999-999999999999';

const listMock = vi.mocked(appointmentsRepository.list);
const getMock = vi.mocked(appointmentsRepository.get);
const createMock = vi.mocked(appointmentsRepository.create);
const updateMock = vi.mocked(appointmentsRepository.update);
const removeMock = vi.mocked(appointmentsRepository.remove);

function appointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: NEW_ID,
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

// Surfaces the live router location so the URL-state assertions read the same
// search string a user would copy out of the address bar.
function LocationProbe() {
  const location = useLocation();
  const [params] = useSearchParams();
  return (
    <>
      <span data-testid="search">{location.search}</span>
      <span data-testid="param-status">{params.get('status') ?? ''}</span>
      <span data-testid="param-page">{params.get('page') ?? ''}</span>
    </>
  );
}

function renderApp(initialPath: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <LocationProbe />
        <Routes>
          <Route path="/appointments" element={<AppointmentListPage />} />
          <Route path="/appointments/new" element={<AppointmentCreatePage />} />
          <Route
            path="/appointments/:appointmentId"
            element={<AppointmentDetailPage />}
          />
          <Route
            path="/appointments/:appointmentId/edit"
            element={<AppointmentEditPage />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

async function pickFromCombobox(
  ue: ReturnType<typeof userEvent.setup>,
  placeholder: string,
  optionLabel: string,
) {
  const trigger = screen
    .getAllByRole('combobox')
    .find((t) => t.textContent?.includes(placeholder));
  if (!trigger) throw new Error(`No combobox with placeholder ${placeholder}`);
  await ue.click(trigger);
  await ue.click(await screen.findByText(optionLabel));
}

async function pickFromSelect(
  ue: ReturnType<typeof userEvent.setup>,
  triggerText: string,
  optionLabel: string,
) {
  const trigger = screen
    .getAllByRole('combobox')
    .find((t) => t.textContent?.includes(triggerText));
  if (!trigger) throw new Error(`No select trigger with text ${triggerText}`);
  await ue.click(trigger);
  await ue.click(await screen.findByRole('option', { name: optionLabel }));
}

function offsetPage(rows: readonly Appointment[], page: number, total: number) {
  return {
    mode: 'offset' as const,
    data: rows,
    page,
    pageSize: 25,
    total,
  };
}

beforeEach(() => {
  listMock.mockReset();
  getMock.mockReset();
  createMock.mockReset();
  updateMock.mockReset();
  removeMock.mockReset();
  useAuthStore.setState({
    user: {
      id: 'u1',
      email: 'nurse@example.com',
      fullName: 'Nurse Joy',
      roleId: 'r1',
      roleName: 'nurse',
      branchId: BRANCH_ID,
      permissions: ['*:*'],
    },
    status: 'authed',
  });
  useDashboardFiltersStore.setState({ branchId: BRANCH_ID });
});

afterEach(() => {
  cleanup();
});

describe('flow: create -> detail', () => {
  it('navigates to the created appointment’s detail page on success', async () => {
    const ue = userEvent.setup();
    const created = appointment();
    createMock.mockResolvedValue(created);
    getMock.mockResolvedValue(created);

    renderApp('/appointments/new');

    expect(
      screen.getByRole('heading', { name: 'Schedule appointment', level: 1 }),
    ).toBeInTheDocument();

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

    // The detail page for the id the server returned, not the one the client
    // guessed: `GET /appointments/:id` is issued with `created.id`.
    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith(NEW_ID);
    });
    expect(
      await screen.findByRole('heading', { name: /appointment/i, level: 1 }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Routine check-up')).toBeInTheDocument();
  });
});

describe('flow: edit -> status change (INV-7)', () => {
  it('issues exactly one PATCH with the merged record and no DELETE/POST', async () => {
    const ue = userEvent.setup();
    const existing = appointment();
    getMock.mockResolvedValue(existing);
    updateMock.mockResolvedValue({ ...existing, status: 'CONFIRMED' });

    renderApp(`/appointments/${NEW_ID}/edit`);

    expect(
      await screen.findByRole('heading', {
        name: 'Edit appointment',
        level: 1,
      }),
    ).toBeInTheDocument();

    // The page renders its heading while the detail query is still in flight;
    // wait for the form itself before touching any field.
    const save = await screen.findByRole('button', { name: 'Save changes' });

    await pickFromSelect(ue, 'Scheduled', 'Confirmed');
    await ue.click(save);

    await waitFor(() => {
      expect(updateMock).toHaveBeenCalledTimes(1);
    });

    const [id, body] = updateMock.mock.calls[0] ?? [];
    expect(id).toBe(NEW_ID);
    expect(body).toEqual({
      patientId: PATIENT_ID,
      staffId: STAFF_ID,
      type: 'CONSULTATION',
      status: 'CONFIRMED',
      startAt: existing.startAt,
      endAt: existing.endAt,
      reason: 'Routine check-up',
      notes: '',
    });

    // INV-7: a status change (and equally a reschedule) is ONE PATCH. It is
    // never a cancel + recreate, which would destroy the row's identity and
    // its audit trail.
    expect(removeMock).not.toHaveBeenCalled();
    expect(createMock).not.toHaveBeenCalled();
  });
});

describe('flow: list -> filter -> page 2 -> URL round trip', () => {
  it('pushes the filter and page into the URL, and restores them on remount', async () => {
    const ue = userEvent.setup();
    const rows = [appointment({ id: NEW_ID, status: 'CANCELLED' })];
    listMock.mockResolvedValue(offsetPage(rows, 1, 60));

    renderApp('/appointments');

    await screen.findByRole('table');
    expect(screen.getByTestId('search')).toHaveTextContent('');

    // --- apply a filter -------------------------------------------------
    const statusFilter = screen.getByLabelText('Filter appointments by status');
    await ue.click(statusFilter);
    await ue.click(await screen.findByRole('option', { name: 'Cancelled' }));

    await waitFor(() => {
      expect(screen.getByTestId('param-status')).toHaveTextContent('CANCELLED');
    });
    // A filter change resets to page 1, which is the default and therefore
    // omitted from the URL.
    expect(screen.getByTestId('param-page')).toHaveTextContent('');

    // --- go to page 2 ---------------------------------------------------
    listMock.mockResolvedValue(offsetPage(rows, 2, 60));
    await ue.click(screen.getByRole('button', { name: 'Next page' }));

    await waitFor(() => {
      expect(screen.getByTestId('param-page')).toHaveTextContent('2');
    });
    expect(screen.getByTestId('param-status')).toHaveTextContent('CANCELLED');

    const search = screen.getByTestId('search').textContent ?? '';
    expect(search).toContain('status=CANCELLED');
    expect(search).toContain('page=2');

    const lastState = listMock.mock.calls.at(-1)?.[0] as QueryState;
    expect(lastState.pagination).toMatchObject({
      mode: 'offset',
      page: 2,
      pageSize: 25,
    });
    expect(lastState.filters).toContainEqual({
      field: 'status',
      op: 'eq',
      value: 'CANCELLED',
    });

    // --- remount cold from that URL -------------------------------------
    cleanup();
    listMock.mockClear();
    listMock.mockResolvedValue(offsetPage(rows, 2, 60));

    renderApp(`/appointments${search}`);
    await screen.findByRole('table');

    expect(screen.getByTestId('param-status')).toHaveTextContent('CANCELLED');
    expect(screen.getByTestId('param-page')).toHaveTextContent('2');
    expect(
      screen.getByLabelText('Filter appointments by status'),
    ).toHaveTextContent('Cancelled');
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeEnabled();

    const restoredState = listMock.mock.calls.at(-1)?.[0] as QueryState;
    expect(restoredState.pagination).toMatchObject({
      mode: 'offset',
      page: 2,
      pageSize: 25,
    });
    expect(restoredState.filters).toContainEqual({
      field: 'status',
      op: 'eq',
      value: 'CANCELLED',
    });
  });
});
