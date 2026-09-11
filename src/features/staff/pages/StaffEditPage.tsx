import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { FormSection } from '@/components/form/FormSection';
import { SelectField } from '@/components/form/SelectField';
import { TextField } from '@/components/form/TextField';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { ApiError } from '@/lib/apiClient';
import { setRootSubmitError } from '@/lib/formErrors';

import {
  useAssignStaffRole,
  useUpdateStaff,
} from '@/features/staff/api/staffMutations.api';
import { assignErrorMessage } from '@/features/staff/assignRoleError';
import { StaffFormSkeleton } from '@/features/staff/components/StaffFormSkeleton';
import { StaffLoadError } from '@/features/staff/components/StaffLoadError';
import { useDepartments } from '@/features/staff/hooks/useDepartments';
import { useRoles } from '@/features/staff/hooks/useRoles';
import { useStaff } from '@/features/staff/hooks/useStaff';
import {
  NO_DEPARTMENT_VALUE,
  updateStaffSchema,
  type UpdateStaffValues,
} from '@/features/staff/schemas/updateStaff.schema';
import { buildUpdateStaffBody, toStaffFormValues } from '@/features/staff/staffForm';
import {
  PROFESSION_VALUES,
  type StaffDetail,
} from '@/features/staff/types/staff.types';

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const PROFESSION_OPTIONS = PROFESSION_VALUES.map((value) => ({
  value,
  label: capitalize(value),
}));

function submitLabel(isSubmitting: boolean): string {
  if (isSubmitting) return 'Saving…';
  return 'Save changes';
}

interface StaffEditFormProps {
  staffId: string;
  initialData: StaffDetail;
}

function StaffEditForm({ staffId, initialData }: Readonly<StaffEditFormProps>) {
  const navigate = useNavigate();
  const updateStaff = useUpdateStaff();
  const assignRole = useAssignStaffRole();
  const departments = useDepartments();
  const roles = useRoles();

  const departmentOptions = [
    { value: NO_DEPARTMENT_VALUE, label: 'No department' },
    ...(departments.data ?? []).map((department) => ({
      value: department.id,
      label: department.name,
    })),
  ];
  const roleOptions = (roles.data ?? []).map((role) => ({
    value: role.id,
    label: role.name,
  }));

  const form = useForm<UpdateStaffValues>({
    resolver: zodResolver(updateStaffSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: toStaffFormValues(initialData),
  });

  // Two independent backend calls behind one submit: the role change (if
  // any) goes through `PUT /auth/users/:id/role` (the same endpoint
  // `StaffRoleDialog` uses), everything else through `PATCH /staff/:id`. Role
  // is submitted FIRST — it can fail on the last-admin guard (409) even when
  // nothing else did, and the user should see that error against a form that
  // hasn't already saved its other fields out from under them.
  async function onSubmit(values: UpdateStaffValues) {
    const staffBody = buildUpdateStaffBody(values, form.formState.dirtyFields);
    const roleChanged = form.formState.dirtyFields.roleId === true;

    if (!roleChanged && Object.keys(staffBody).length === 0) {
      navigate('/staff');
      return;
    }

    if (roleChanged) {
      try {
        await assignRole.mutateAsync({
          userId: initialData.userId,
          roleId: values.roleId,
        });
      } catch (err) {
        form.setError('root', { message: assignErrorMessage(err) });
        return;
      }
    }

    if (Object.keys(staffBody).length > 0) {
      try {
        await updateStaff.mutateAsync({ id: staffId, body: staffBody });
      } catch (err) {
        setRootSubmitError(form, err);
        return;
      }
    }

    toast.success('Staff updated.');
    navigate('/staff');
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
          title="Identity"
          description="This staff member's system-assigned number."
        >
          <div className="grid gap-2">
            <p className="text-sm font-medium">Staff number</p>
            <p className="font-mono text-sm tabular-nums text-muted-foreground">
              {initialData.staffNumber}
            </p>
          </div>
        </FormSection>

        <FormSection
          title="Access"
          description="The role this staff member is assigned to."
        >
          <SelectField
            control={form.control}
            name="roleId"
            label="Role"
            options={roleOptions}
            placeholder="Select a role"
            required
          />
          {roles.isError && (
            <p className="text-sm text-destructive sm:col-span-2" role="alert">
              Could not load roles.
            </p>
          )}
        </FormSection>

        <FormSection
          title="Professional"
          description="Clinical profession, department, and licensing details."
        >
          <SelectField
            control={form.control}
            name="profession"
            label="Profession"
            options={PROFESSION_OPTIONS}
            placeholder="Select a profession"
            required
          />
          <SelectField
            control={form.control}
            name="departmentId"
            label="Department"
            options={departmentOptions}
            placeholder="Select a department"
          />
          <TextField
            control={form.control}
            name="licenseNumber"
            label="License / registration number"
            required
          />
        </FormSection>

        <div className="sticky bottom-0 z-10 -mx-6 flex items-center gap-3 border-t bg-background/80 px-6 py-4 backdrop-blur">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting || !form.formState.isDirty}
          >
            {submitLabel(form.formState.isSubmitting)}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link to="/staff">Cancel</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}

export function StaffEditPage() {
  const { staffId } = useParams();
  const id = staffId ?? '';
  const { data, isPending, isError, error, refetch } = useStaff(id);

  const notFound = error instanceof ApiError && error.statusCode === 404;

  let body: ReactNode;
  if (isPending) {
    body = <StaffFormSkeleton />;
  } else if (isError) {
    body = (
      <StaffLoadError
        notFound={notFound}
        error={error}
        onRetry={() => void refetch()}
      />
    );
  } else {
    body = <StaffEditForm staffId={id} initialData={data} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
      <header>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Edit staff
        </h1>
        <p className="text-sm text-muted-foreground">
          Update role, profession, department, and licensing details.
        </p>
      </header>

      {body}
    </div>
  );
}
