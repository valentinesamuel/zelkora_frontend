import { useForm, type DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { FormSection } from '@/components/form/FormSection';
import { TextField } from '@/components/form/TextField';
import { TextareaField } from '@/components/form/TextareaField';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Spinner } from '@/components/ui/spinner';
import { usePermissions } from '@/features/roles/hooks/usePermissions';
import {
  useCreateRole,
  useUpdateRole,
} from '@/features/roles/roleMutations.api';
import {
  emptyRoleFormValues,
  roleToFormValues,
  toCreateInput,
  toUpdateInput,
} from '@/features/roles/roleForm';
import {
  roleFormSchema,
  type RoleFormValues,
} from '@/features/roles/roleForm.schema';
import type { Role } from '@/features/roles/roles.types';
import { PermissionCheckboxGroup } from '@/features/roles/components/PermissionCheckboxGroup';
import { setRootSubmitError } from '@/lib/formErrors';

type RoleFormProps =
  | { mode: 'create' }
  | { mode: 'edit'; roleId: string; initialData: Role };

function submitLabel(isSubmitting: boolean, isEdit: boolean): string {
  if (isSubmitting) return 'Saving…';
  if (isEdit) return 'Save changes';
  return 'Create role';
}

export function RoleForm(props: Readonly<RoleFormProps>) {
  const navigate = useNavigate();
  const isEdit = props.mode === 'edit';

  const createRole = useCreateRole();
  let updateId = '';
  if (isEdit) {
    updateId = props.roleId;
  }
  const updateRole = useUpdateRole(updateId);

  const permissionsQuery = usePermissions();

  let defaultValues: DefaultValues<RoleFormValues> = emptyRoleFormValues();
  if (props.mode === 'edit') {
    defaultValues = roleToFormValues(props.initialData);
  }

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues,
  });

  const isAdminRole = isEdit && props.initialData.name === 'admin';

  async function onSubmit(values: RoleFormValues) {
    try {
      if (props.mode === 'create') {
        await createRole.mutateAsync(toCreateInput(values));
      } else {
        await updateRole.mutateAsync(toUpdateInput(values));
      }
      let successMessage = 'Role updated.';
      if (props.mode === 'create') {
        successMessage = 'Role created.';
      }
      toast.success(successMessage);
      navigate('/settings/roles');
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

        {isAdminRole && (
          <Alert variant="destructive" role="alert">
            The admin role cannot be modified.
          </Alert>
        )}

        <FormSection
          title="Identity"
          description="The role name and what it's for."
        >
          <TextField
            control={form.control}
            name="name"
            label="Role name"
            required
          />
          <TextareaField
            control={form.control}
            name="description"
            label="Description"
            className="sm:col-span-2"
          />
        </FormSection>

        <FormSection
          title="Permissions"
          description="What this role is allowed to do."
        >
          <div className="sm:col-span-2">
            {permissionsQuery.isPending && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Spinner />
                Loading permissions…
              </div>
            )}
            {permissionsQuery.isError && (
              <Alert variant="destructive" role="alert">
                Could not load permissions. Please try again.
              </Alert>
            )}
            {permissionsQuery.data && (
              <PermissionCheckboxGroup
                permissions={permissionsQuery.data}
                value={form.watch('permissionIds')}
                onChange={(next) =>
                  form.setValue('permissionIds', next, { shouldDirty: true })
                }
                disabled={isAdminRole}
              />
            )}
          </div>
        </FormSection>

        <div className="sticky bottom-0 z-10 -mx-6 flex items-center gap-3 border-t bg-background/80 px-6 py-4 backdrop-blur">
          <Button
            type="submit"
            disabled={
              form.formState.isSubmitting ||
              isAdminRole ||
              (isEdit && !form.formState.isDirty)
            }
          >
            {submitLabel(form.formState.isSubmitting, isEdit)}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link to="/settings/roles">Cancel</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}
