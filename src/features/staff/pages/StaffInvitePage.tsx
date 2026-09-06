import { useForm, type DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { FormSection } from '@/components/form/FormSection';
import { SelectField } from '@/components/form/SelectField';
import { TextField } from '@/components/form/TextField';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { setRootSubmitError } from '@/lib/formErrors';

import { useActiveBranches } from '@/features/branch/api/branches.api';
import { useOnboardStaff } from '@/features/staff/api/staffMutations.api';
import { useDepartments } from '@/features/staff/hooks/useDepartments';
import { useRoles } from '@/features/staff/hooks/useRoles';
import {
  onboardStaffSchema,
  type OnboardStaffValues,
} from '@/features/staff/schemas/onboardStaff.schema';
import {
  PROFESSION_VALUES,
  type OnboardStaffBody,
} from '@/features/staff/types/staff.types';

const DEFAULT_VALUES: DefaultValues<OnboardStaffValues> = {
  email: '',
  fullName: '',
  roleId: '',
  branchId: '',
  licenseNumber: '',
};

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function submitLabel(isSubmitting: boolean): string {
  if (isSubmitting) return 'Inviting…';
  return 'Invite staff';
}

const PROFESSION_OPTIONS = PROFESSION_VALUES.map((value) => ({
  value,
  label: capitalize(value),
}));

export function StaffInvitePage() {
  const navigate = useNavigate();
  const onboard = useOnboardStaff();

  const roles = useRoles();
  const branches = useActiveBranches({ enabled: true });
  const departments = useDepartments();

  const roleOptions = (roles.data ?? [])
    .filter((role) => role.name !== 'admin')
    .map((role) => ({ value: role.id, label: role.name }));

  const branchOptions = (branches.data?.data ?? []).map((branch) => ({
    value: branch.id,
    label: branch.name,
  }));

  const departmentOptions = (departments.data ?? []).map((department) => ({
    value: department.id,
    label: department.name,
  }));

  const form = useForm<OnboardStaffValues>({
    resolver: zodResolver(onboardStaffSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: DEFAULT_VALUES,
  });

  async function onSubmit(values: OnboardStaffValues) {
    const body: OnboardStaffBody = {
      email: values.email,
      fullName: values.fullName,
      roleId: values.roleId,
      branchId: values.branchId,
      profession: values.profession,
      licenseNumber: values.licenseNumber,
    };
    if (values.departmentId) {
      body.departmentId = values.departmentId;
    }

    try {
      await onboard.mutateAsync(body);
      toast.success('Staff invited.');
      navigate('/staff');
    } catch (err) {
      setRootSubmitError(form, err);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
      <header>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Invite staff
        </h1>
        <p className="text-sm text-muted-foreground">
          Send an invite and create the staff record in one step.
        </p>
      </header>

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
            description="Who is being invited and how they sign in."
          >
            <TextField
              control={form.control}
              name="email"
              label="Email"
              type="email"
              autoComplete="email"
              required
            />
            <TextField
              control={form.control}
              name="fullName"
              label="Full name"
              required
            />
          </FormSection>

          <FormSection
            title="Access"
            description="The role and branch this staff member is assigned to."
          >
            <SelectField
              control={form.control}
              name="roleId"
              label="Role"
              options={roleOptions}
              placeholder="Select a role"
              required
            />
            <SelectField
              control={form.control}
              name="branchId"
              label="Branch"
              options={branchOptions}
              placeholder="Select a branch"
              required
            />
            <SelectField
              control={form.control}
              name="departmentId"
              label="Department"
              options={departmentOptions}
              placeholder="Select a department"
            />
          </FormSection>

          <FormSection
            title="Professional"
            description="Clinical profession and licensing details."
          >
            <SelectField
              control={form.control}
              name="profession"
              label="Profession"
              options={PROFESSION_OPTIONS}
              placeholder="Select a profession"
              required
            />
            <TextField
              control={form.control}
              name="licenseNumber"
              label="License / registration number"
              required
            />
          </FormSection>

          <div className="sticky bottom-0 z-10 -mx-6 flex items-center gap-3 border-t bg-background/80 px-6 py-4 backdrop-blur">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {submitLabel(form.formState.isSubmitting)}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link to="/staff">Cancel</Link>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
