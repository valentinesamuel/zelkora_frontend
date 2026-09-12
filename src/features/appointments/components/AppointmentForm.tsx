import { useForm, type DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { AsyncComboboxField } from '@/components/form/AsyncComboboxField';
import { DateTimeRangeField } from '@/components/form/DateTimeRangeField';
import { FormSection } from '@/components/form/FormSection';
import { SelectField } from '@/components/form/SelectField';
import { TextareaField } from '@/components/form/TextareaField';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import {
  createSearchStaffOptions,
  searchPatientOptions,
  usePatientOptionLabel,
  useStaffOptionLabel,
} from '@/features/appointments/api/appointmentPickers';
import {
  useCreateAppointment,
  useUpdateAppointment,
} from '@/features/appointments/api/appointmentMutations.api';
import { APPOINTMENT_TYPE_OPTIONS } from '@/features/appointments/appointmentOptions';
import { allowedStatusOptions } from '@/features/appointments/appointmentStatusTransitions';
import {
  appointmentFormSchema,
  type AppointmentFormValues,
} from '@/features/appointments/schemas/appointmentForm.schema';
import type {
  Appointment,
  AppointmentStatus,
  CreateAppointmentBody,
  UpdateAppointmentBody,
} from '@/features/appointments/types/appointment.types';
import { useAuthStore } from '@/features/auth/authStore';
import { isAdmin } from '@/features/auth/isAdmin';
import { useDashboardFiltersStore } from '@/features/dashboard/filters/dashboardFiltersStore';
import { setRootSubmitError } from '@/lib/formErrors';

type AppointmentFormProps =
  | { mode: 'create'; initialPatientId?: string }
  | { mode: 'edit'; appointmentId: string; initialData: Appointment };

function emptyAppointmentFormValues(
  initialPatientId?: string,
): DefaultValues<AppointmentFormValues> {
  return {
    patientId: initialPatientId ?? '',
    staffId: '',
    type: undefined,
    startAt: '',
    endAt: '',
    reason: '',
    notes: '',
  };
}

function toAppointmentFormValues(
  wire: Appointment,
): DefaultValues<AppointmentFormValues> {
  return {
    patientId: wire.patientId,
    staffId: wire.staffId,
    type: wire.type,
    status: wire.status,
    startAt: wire.startAt,
    endAt: wire.endAt,
    reason: wire.reason ?? '',
    notes: wire.notes ?? '',
  };
}

function buildCreateBody(
  values: AppointmentFormValues,
  branchId?: string,
): CreateAppointmentBody {
  const body: CreateAppointmentBody = {
    patientId: values.patientId,
    staffId: values.staffId,
    type: values.type,
    startAt: values.startAt,
    endAt: values.endAt,
  };

  const reason = values.reason?.trim() ?? '';
  if (reason !== '') body.reason = reason;

  const notes = values.notes?.trim() ?? '';
  if (notes !== '') body.notes = notes;

  // Role-conditional, same rule as `buildCreatePatientBody`: the key is
  // omitted entirely for non-admins, whose JWT branch is authoritative.
  if (branchId !== undefined && branchId.trim() !== '') {
    body.branchId = branchId.trim();
  }

  return body;
}

// ONE PATCH carries every change, including a reschedule: `startAt`/`endAt`
// are ordinary fields on `UpdateAppointmentBody`. Moving an appointment is
// never a cancel + recreate (two calls) — that would break the row's identity,
// its audit trail and every cached reference to it.
function buildUpdateBody(values: AppointmentFormValues): UpdateAppointmentBody {
  return {
    patientId: values.patientId,
    staffId: values.staffId,
    type: values.type,
    status: values.status,
    startAt: values.startAt,
    endAt: values.endAt,
    reason: values.reason?.trim() ?? '',
    notes: values.notes?.trim() ?? '',
  };
}

function submitLabel(isSubmitting: boolean, isEdit: boolean): string {
  if (isSubmitting) return 'Saving…';
  if (isEdit) return 'Save changes';
  return 'Schedule appointment';
}

export function AppointmentForm(props: Readonly<AppointmentFormProps>) {
  const navigate = useNavigate();
  const isEdit = props.mode === 'edit';

  // Read unconditionally at component top level. The create-submit path needs
  // the caller's role and the globally selected branch; the edit path ignores
  // both (`UpdateAppointmentBody` has no `branchId` at all).
  const user = useAuthStore((s) => s.user);
  const filterBranchId = useDashboardFiltersStore((s) => s.branchId);

  const createAppointment = useCreateAppointment();
  let updateId = '';
  if (props.mode === 'edit') {
    updateId = props.appointmentId;
  }
  const updateAppointment = useUpdateAppointment(updateId);

  let defaultValues: DefaultValues<AppointmentFormValues>;
  let currentStatus: AppointmentStatus = 'SCHEDULED';
  if (props.mode === 'edit') {
    defaultValues = toAppointmentFormValues(props.initialData);
    currentStatus = props.initialData.status;
  } else {
    defaultValues = emptyAppointmentFormValues(props.initialPatientId);
  }

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues,
  });

  // Seeded labels for the two comboboxes. Both resolve asynchronously, and
  // `AsyncComboboxField` reads `initialLabel` only on mount — the `key`s below
  // remount the field once the label arrives. The chosen value lives in RHF,
  // so a remount never loses it.
  const patientId = String(defaultValues.patientId ?? '');
  const staffId = String(defaultValues.staffId ?? '');
  const patientLabel = usePatientOptionLabel(patientId);
  const staffLabel = useStaffOptionLabel(staffId);

  // The staff picker's search is branch-scoped: admins may target any active
  // branch (the dashboard's currently-selected one), non-admins are always
  // forced onto their own JWT branch server-side regardless of what this
  // sends. No memoization needed — `AsyncComboboxField`'s query key is
  // `[label, debouncedTerm]`, not the function identity, so a fresh closure
  // per render is harmless.
  const searchStaffOptions = createSearchStaffOptions({
    isAdminCaller: isAdmin(user),
    branchId: filterBranchId,
  });

  async function onSubmit(values: AppointmentFormValues) {
    try {
      if (props.mode === 'create') {
        let branchId: string | undefined;
        if (isAdmin(user)) {
          const trimmed = filterBranchId?.trim() ?? '';
          if (trimmed === '') {
            // Admin with no concrete branch: block submit, send no request.
            // The backend enforces the same rule independently.
            form.setError('root', {
              message:
                'No branch is selected. Choose a branch in the branch switcher before scheduling an appointment.',
            });
            return;
          }
          branchId = trimmed;
        }
        const created = await createAppointment.mutateAsync(
          buildCreateBody(values, branchId),
        );
        toast.success('Appointment scheduled.');
        navigate(`/appointments/${created.id}`);
        return;
      }

      await updateAppointment.mutateAsync(buildUpdateBody(values));
      toast.success('Appointment updated.');
      navigate(`/appointments/${props.appointmentId}`);
    } catch (err) {
      setRootSubmitError(form, err);
    }
  }

  let cancelPath = '/appointments';
  if (props.mode === 'edit') {
    cancelPath = `/appointments/${props.appointmentId}`;
  }

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-6"
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
      >
        {form.formState.errors.root?.message && (
          <Alert variant="destructive" role="alert">
            {form.formState.errors.root.message}
          </Alert>
        )}

        <FormSection
          title="Who"
          description="The patient being seen and the staff member seeing them."
        >
          <AsyncComboboxField
            key={`patient-${patientLabel ?? ''}`}
            control={form.control}
            name="patientId"
            label="Patient"
            searchFn={searchPatientOptions}
            placeholder="Select a patient"
            initialLabel={patientLabel}
            required
          />
          <AsyncComboboxField
            key={`staff-${staffLabel ?? ''}`}
            control={form.control}
            name="staffId"
            label="Staff member"
            searchFn={searchStaffOptions}
            placeholder="Select a staff member"
            initialLabel={staffLabel}
            required
          />
        </FormSection>

        <FormSection
          title="When"
          description="The slot this appointment occupies."
        >
          <DateTimeRangeField
            control={form.control}
            startName="startAt"
            endName="endAt"
            label="Date & time"
            className="sm:col-span-2"
            required
          />
        </FormSection>

        <FormSection
          title="Details"
          description="What the visit is for, and anything the team should know."
        >
          <SelectField
            control={form.control}
            name="type"
            label="Type"
            options={APPOINTMENT_TYPE_OPTIONS}
            placeholder="Select a type"
            required
          />
          {/* Status is edit-only: the backend defaults a new appointment to
              SCHEDULED, so offering it on create would be a field with one
              legal value. */}
          {isEdit && (
            <SelectField
              control={form.control}
              name="status"
              label="Status"
              options={allowedStatusOptions(currentStatus)}
              placeholder="Select a status"
            />
          )}
          <TextareaField
            control={form.control}
            name="reason"
            label="Reason"
            className="sm:col-span-2"
          />
          <TextareaField
            control={form.control}
            name="notes"
            label="Notes"
            className="sm:col-span-2"
          />
        </FormSection>

        <div className="sticky bottom-0 z-10 -mx-6 flex items-center gap-3 border-t bg-background/80 px-6 py-4 backdrop-blur">
          <Button
            type="submit"
            disabled={
              form.formState.isSubmitting || (isEdit && !form.formState.isDirty)
            }
          >
            {submitLabel(form.formState.isSubmitting, isEdit)}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link to={cancelPath}>Cancel</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}
