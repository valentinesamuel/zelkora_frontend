import { useForm, type DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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
import { FormSection } from '@/components/form/FormSection';
import { SelectField } from '@/components/form/SelectField';
import { TextField } from '@/components/form/TextField';
import { TextareaField } from '@/components/form/TextareaField';
import {
  useCreatePatient,
  useUpdatePatient,
} from '@/features/patients/api/patientMutations.api';
import { PatientComboboxField } from '@/features/patients/components/PatientComboboxField';
import {
  buildCreatePatientBody,
  buildUpdatePatientBody,
  emptyPatientFormValues,
  toPatientFormValues,
} from '@/features/patients/patientForm';
import {
  BLOOD_GROUP_OPTIONS,
  GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  NATIONALITY_OPTIONS,
  PAYMENT_TYPE_OPTIONS,
} from '@/features/patients/patientOptions';
import {
  patientFormSchema,
  type PatientFormValues,
} from '@/features/patients/schemas/patientForm.schema';
import type { Patient } from '@/features/patients/types/patient.types';
import { setRootSubmitError } from '@/lib/formErrors';

type PatientFormProps =
  | { mode: 'create' }
  | { mode: 'edit'; patientId: string; initialData: Patient };

function submitLabel(isSubmitting: boolean, isEdit: boolean): string {
  if (isSubmitting) return 'Saving…';
  if (isEdit) return 'Save changes';
  return 'Register patient';
}

export function PatientForm(props: Readonly<PatientFormProps>) {
  const navigate = useNavigate();
  const isEdit = props.mode === 'edit';

  const createPatient = useCreatePatient();
  let updateId = '';
  if (isEdit) {
    updateId = props.patientId;
  }
  const updatePatient = useUpdatePatient(updateId);

  let defaultValues: DefaultValues<PatientFormValues> =
    emptyPatientFormValues();
  if (isEdit) {
    defaultValues = toPatientFormValues(props.initialData);
  }

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues,
  });

  async function onSubmit(values: PatientFormValues) {
    try {
      if (props.mode === 'create') {
        await createPatient.mutateAsync(buildCreatePatientBody(values));
      } else {
        const body = buildUpdatePatientBody(values, form.formState.dirtyFields);
        if (Object.keys(body).length === 0) {
          navigate('/patients');
          return;
        }
        await updatePatient.mutateAsync(body);
      }
      let successMessage = 'Patient updated.';
      if (props.mode === 'create') {
        successMessage = 'Patient registered.';
      }
      toast.success(successMessage);
      navigate('/patients');
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
          description="Legal name, date of birth and gender."
        >
          <TextField
            control={form.control}
            name="firstName"
            label="First name"
            autoComplete="given-name"
            required
          />
          <TextField
            control={form.control}
            name="lastName"
            label="Last name"
            autoComplete="family-name"
            required
          />
          <TextField
            control={form.control}
            name="middleName"
            label="Middle name"
            autoComplete="additional-name"
          />
          <TextField
            control={form.control}
            name="dateOfBirth"
            label="Date of birth"
            type="date"
            required
          />
          <SelectField
            control={form.control}
            name="gender"
            label="Gender"
            options={GENDER_OPTIONS}
            placeholder="Select a gender"
            required
          />
        </FormSection>

        <FormSection
          title="Contact"
          description="How the clinic reaches this patient."
        >
          <TextField
            control={form.control}
            name="phoneNumber"
            label="Phone number"
            type="tel"
            autoComplete="tel"
            required
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
            label="Residential address"
            className="sm:col-span-2"
          />
        </FormSection>

        <FormSection
          title="Demographics"
          description="Optional background details."
        >
          <SelectField
            control={form.control}
            name="bloodGroup"
            label="Blood group"
            options={BLOOD_GROUP_OPTIONS}
            placeholder="Select a blood group"
          />
          <SelectField
            control={form.control}
            name="maritalStatus"
            label="Marital status"
            options={MARITAL_STATUS_OPTIONS}
            placeholder="Select a marital status"
          />
          <PatientComboboxField
            control={form.control}
            name="nationality"
            label="Nationality"
            options={NATIONALITY_OPTIONS}
            placeholder="Select nationality"
          />
          <TextField
            control={form.control}
            name="occupation"
            label="Occupation"
          />
        </FormSection>

        <FormSection
          title="Payment"
          description="Determines how visits are billed."
        >
          <SelectField
            control={form.control}
            name="paymentType"
            label="Payment type"
            options={PAYMENT_TYPE_OPTIONS}
            placeholder="Select a payment type"
            required
          />
        </FormSection>

        <FormSection
          title="Next of kin"
          description="Emergency contact for this patient."
        >
          <TextField
            control={form.control}
            name="nextOfKin.name"
            label="Full name"
            required
          />
          <TextField
            control={form.control}
            name="nextOfKin.phone"
            label="Phone number"
            type="tel"
            required
          />
          <TextField
            control={form.control}
            name="nextOfKin.relationship"
            label="Relationship"
            required
          />
          <TextareaField
            control={form.control}
            name="nextOfKin.address"
            label="Address"
            className="sm:col-span-2"
            required
          />
        </FormSection>

        {isEdit && (
          <FormSection
            title="Status"
            // description="Inactive patients stay on record but are filtered out by default."
          >
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
                  <FormLabel>Active patient</FormLabel>
                </FormItem>
              )}
            />
          </FormSection>
        )}

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
            <Link to="/patients">Cancel</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}
