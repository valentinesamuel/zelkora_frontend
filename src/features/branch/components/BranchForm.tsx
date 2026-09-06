import { useForm, type DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { FormSection } from '@/components/form/FormSection';
import { TextField } from '@/components/form/TextField';
import { TextareaField } from '@/components/form/TextareaField';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import {
  useCreateBranch,
  useUpdateBranch,
} from '@/features/branch/api/branchMutations.api';
import {
  buildCreateBranchBody,
  buildUpdateBranchBody,
  emptyBranchFormValues,
  toBranchFormValues,
} from '@/features/branch/branchForm';
import {
  branchFormSchema,
  type BranchFormValues,
} from '@/features/branch/schemas/branchForm.schema';
import type { Branch } from '@/features/branch/types/branch.types';
import { setRootSubmitError } from '@/lib/formErrors';

type BranchFormProps =
  { mode: 'create' } | { mode: 'edit'; branchId: string; initialData: Branch };

function submitLabel(isSubmitting: boolean, isEdit: boolean): string {
  if (isSubmitting) return 'Saving…';
  if (isEdit) return 'Save changes';
  return 'Create branch';
}

function statusDescription(isEdit: boolean): string | undefined {
  if (isEdit) return undefined;
  return 'Inactive branches are hidden from the branch switcher.';
}

export function BranchForm(props: Readonly<BranchFormProps>) {
  const navigate = useNavigate();
  const isEdit = props.mode === 'edit';

  const createBranch = useCreateBranch();
  let updateId = '';
  if (isEdit) {
    updateId = props.branchId;
  }
  const updateBranch = useUpdateBranch(updateId);

  let defaultValues: DefaultValues<BranchFormValues> = emptyBranchFormValues();
  if (props.mode === 'edit') {
    defaultValues = toBranchFormValues(props.initialData);
  }

  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchFormSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues,
  });

  async function onSubmit(values: BranchFormValues) {
    try {
      if (props.mode === 'create') {
        await createBranch.mutateAsync(buildCreateBranchBody(values));
      } else {
        const body = buildUpdateBranchBody(values, form.formState.dirtyFields);
        if (Object.keys(body).length === 0) {
          navigate('/branches');
          return;
        }
        await updateBranch.mutateAsync(body);
      }
      let successMessage = 'Branch updated.';
      if (props.mode === 'create') {
        successMessage = 'Branch created.';
      }
      toast.success(successMessage);
      navigate('/branches');
    } catch (err) {
      setRootSubmitError(form, err);
    }
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
          description="The branch name and its system code."
        >
          {!isEdit && (
            <TextField
              control={form.control}
              name="name"
              label="Branch name"
              required
            />
          )}
          {props.mode === 'edit' && (
            <div className="grid gap-2">
              <p className="text-sm font-medium">Branch code</p>
              <p className="font-mono text-sm tabular-nums text-muted-foreground">
                {props.initialData.code}
              </p>
            </div>
          )}
        </FormSection>

        <FormSection
          title="Contact"
          description="How staff and patients reach this branch."
        >
          <TextField
            control={form.control}
            name="phoneNumber"
            label="Phone number"
            type="tel"
            autoComplete="tel"
          />
          <TextField
            control={form.control}
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
          />
          <TextareaField
            control={form.control}
            name="address"
            label="Address"
            className="sm:col-span-2"
          />
        </FormSection>

        {/* Rendered in BOTH modes — a deliberate divergence from `PatientForm`,
            which shows its status section only in edit mode. `isActive` must be
            an explicit choice on create because the Go field is `bool` and an
            omitted key silently creates an inactive branch (INV-B4). */}
        <FormSection title="Status" description={statusDescription(isEdit)}>
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2 sm:col-span-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(v) => field.onChange(v === true)}
                  />
                </FormControl>
                <FormLabel>Active branch</FormLabel>
              </FormItem>
            )}
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
            <Link to="/branches">Cancel</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}
