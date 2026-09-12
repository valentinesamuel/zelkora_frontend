import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { AsyncComboboxField } from '@/components/form/AsyncComboboxField';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  createSearchStaffOptions,
  searchPatientOptions,
  usePatientOptionLabel,
  useStaffOptionLabel,
} from '@/features/appointments/api/appointmentPickers';
import {
  APPOINTMENT_STATUS_OPTIONS,
  APPOINTMENT_TYPE_OPTIONS,
} from '@/features/appointments/appointmentOptions';
import {
  hasActiveQuery,
  type AppointmentListQuery,
  type AppointmentStatusFilter,
  type AppointmentTypeFilter,
} from '@/features/appointments/filters/appointmentListParams';
import { useAuthStore } from '@/features/auth/authStore';
import { isAdmin } from '@/features/auth/isAdmin';
import { useDashboardFiltersStore } from '@/features/dashboard/filters/dashboardFiltersStore';

interface AppointmentFiltersProps {
  readonly query: AppointmentListQuery;
  readonly onStatusChange: (value: AppointmentStatusFilter) => void;
  readonly onTypeChange: (value: AppointmentTypeFilter) => void;
  readonly onPatientChange: (value: string | null) => void;
  readonly onStaffChange: (value: string | null) => void;
  readonly onStartRangeChange: (from: string | null, to: string | null) => void;
  readonly onClear: () => void;
}

interface PickerValues {
  patientId: string;
  staffId: string;
}

function toNullableId(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  if (trimmed === '') return null;
  return trimmed;
}

function toNullableDate(value: string): string | null {
  if (value === '') return null;
  return value;
}

// The patient/staff filters reuse the RHF-bound `AsyncComboboxField` rather
// than growing a second, non-RHF combobox with its own Popover/ARIA/keyboard
// wiring. The tiny local form is a controller for two fields only; the URL
// stays the single source of truth — the effects below push every pick
// straight back out to it, and the list page remounts this component whenever
// either id changes in the URL (see its `key`), so the form defaults can never
// drift from the params.
export function AppointmentFilters({
  query,
  onStatusChange,
  onTypeChange,
  onPatientChange,
  onStaffChange,
  onStartRangeChange,
  onClear,
}: AppointmentFiltersProps) {
  const patientLabel = usePatientOptionLabel(query.patientId ?? '');
  const staffLabel = useStaffOptionLabel(query.staffId ?? '');
  const user = useAuthStore((s) => s.user);
  const filterBranchId = useDashboardFiltersStore((s) => s.branchId);
  const searchStaffOptions = createSearchStaffOptions({
    isAdminCaller: isAdmin(user),
    branchId: filterBranchId,
  });

  const form = useForm<PickerValues>({
    defaultValues: {
      patientId: query.patientId ?? '',
      staffId: query.staffId ?? '',
    },
  });

  const pickedPatientId = toNullableId(
    useWatch({ control: form.control, name: 'patientId' }),
  );
  const pickedStaffId = toNullableId(
    useWatch({ control: form.control, name: 'staffId' }),
  );

  useEffect(() => {
    if (pickedPatientId !== (query.patientId ?? null)) {
      onPatientChange(pickedPatientId);
    }
  }, [pickedPatientId, query.patientId, onPatientChange]);

  useEffect(() => {
    if (pickedStaffId !== (query.staffId ?? null)) {
      onStaffChange(pickedStaffId);
    }
  }, [pickedStaffId, query.staffId, onStaffChange]);

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex min-w-0 flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="appointment-status-filter">Status</Label>
          <Select
            value={query.status}
            onValueChange={(value) =>
              onStatusChange(value as AppointmentStatusFilter)
            }
          >
            <SelectTrigger
              id="appointment-status-filter"
              size="sm"
              aria-label="Filter appointments by status"
              className="w-44"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {APPOINTMENT_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="appointment-type-filter">Type</Label>
          <Select
            value={query.type}
            onValueChange={(value) =>
              onTypeChange(value as AppointmentTypeFilter)
            }
          >
            <SelectTrigger
              id="appointment-type-filter"
              size="sm"
              aria-label="Filter appointments by type"
              className="w-44"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {APPOINTMENT_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="appointment-start-from">From</Label>
          <Input
            id="appointment-start-from"
            type="date"
            className="w-40"
            value={query.startFrom ?? ''}
            onChange={(event) =>
              onStartRangeChange(
                toNullableDate(event.target.value),
                query.startTo,
              )
            }
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="appointment-start-to">To</Label>
          <Input
            id="appointment-start-to"
            type="date"
            className="w-40"
            value={query.startTo ?? ''}
            onChange={(event) =>
              onStartRangeChange(
                query.startFrom,
                toNullableDate(event.target.value),
              )
            }
          />
        </div>

        {hasActiveQuery(query) && (
          <Button type="button" variant="outline" onClick={onClear}>
            Clear filters
          </Button>
        )}
      </div>

      <Form {...form}>
        <div className="grid gap-3 sm:grid-cols-2 lg:max-w-2xl">
          <AsyncComboboxField
            key={`patient-filter-${patientLabel ?? ''}`}
            control={form.control}
            name="patientId"
            label="Patient"
            searchFn={searchPatientOptions}
            placeholder="All patients"
            initialLabel={patientLabel}
          />
          <AsyncComboboxField
            key={`staff-filter-${staffLabel ?? ''}`}
            control={form.control}
            name="staffId"
            label="Staff member"
            searchFn={searchStaffOptions}
            placeholder="All staff"
            initialLabel={staffLabel}
          />
        </div>
      </Form>
    </div>
  );
}
