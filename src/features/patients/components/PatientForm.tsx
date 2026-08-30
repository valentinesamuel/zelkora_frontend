import { useForm } from 'react-hook-form';
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
import {
  useCreatePatient,
  useUpdatePatient,
} from '@/features/patients/api/patientMutations.api';
import { PatientComboboxField } from '@/features/patients/components/PatientComboboxField';
import { PatientFormSection } from '@/features/patients/components/PatientFormSection';
import { PatientSelectField } from '@/features/patients/components/PatientSelectField';
import { PatientTextField } from '@/features/patients/components/PatientTextField';
import { PatientTextareaField } from '@/features/patients/components/PatientTextareaField';
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
import type { PatientWire } from '@/features/patients/types/patient.types';
import { ApiError } from '@/lib/apiClient';

type PatientFormProps =
  | { mode: 'create' }
  | { mode: 'edit'; patientId: string; initialData: PatientWire };

export function PatientForm(props: Readonly<PatientFormProps>) {
  const navigate = useNavigate();
  const isEdit = props.mode === 'edit';

  const createPatient = useCreatePatient();
  // Needs an id up front (hooks can't be conditional); only ever invoked from
  // the edit branch, so '' in create mode is inert.
  const updatePatient = useUpdatePatient(isEdit ? props.patientId : '');

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: isEdit
      ? toPatientFormValues(props.initialData)
      : emptyPatientFormValues(),
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
      // DEVIATION: the house convention is inline surfaces, not toasts (see
      // PatientListError.tsx). A success toast on form submit is a deliberate,
      // approved exception; submit *failures* stay inline in the Alert below.
      toast.success(
        props.mode === 'create' ? 'Patient registered.' : 'Patient updated.',
      );
      navigate('/patients');
    } catch (err) {
      form.setError('root', {
        message:
          err instanceof ApiError
            ? err.apiMessage
            : 'Something went wrong. Please try again.',
      });
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

        <PatientFormSection
          title="Identity"
          description="Legal name, date of birth and gender."
        >
          <PatientTextField
            control={form.control}
            name="firstName"
            label="First name"
            autoComplete="given-name"
            required
          />
          <PatientTextField
            control={form.control}
            name="lastName"
            label="Last name"
            autoComplete="family-name"
            required
          />
          <PatientTextField
            control={form.control}
            name="middleName"
            label="Middle name"
            autoComplete="additional-name"
          />
          <PatientTextField
            control={form.control}
            name="dateOfBirth"
            label="Date of birth"
            type="date"
            required
          />
          <PatientSelectField
            control={form.control}
            name="gender"
            label="Gender"
            options={GENDER_OPTIONS}
            placeholder="Select a gender"
            required
          />
        </PatientFormSection>

        <PatientFormSection
          title="Contact"
          description="How the clinic reaches this patient."
        >
          <PatientTextField
            control={form.control}
            name="phoneNumber"
            label="Phone number"
            type="tel"
            autoComplete="tel"
            required
          />
          <PatientTextField
            control={form.control}
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
          />
          <PatientTextareaField
            control={form.control}
            name="address"
            label="Residential address"
            className="sm:col-span-2"
          />
        </PatientFormSection>

        <PatientFormSection
          title="Demographics"
          description="Optional background details."
        >
          <PatientSelectField
            control={form.control}
            name="bloodGroup"
            label="Blood group"
            options={BLOOD_GROUP_OPTIONS}
            placeholder="Select a blood group"
          />
          <PatientSelectField
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
          <PatientTextField
            control={form.control}
            name="occupation"
            label="Occupation"
          />
        </PatientFormSection>

        <PatientFormSection
          title="Payment"
          description="Determines how visits are billed."
        >
          <PatientSelectField
            control={form.control}
            name="paymentType"
            label="Payment type"
            options={PAYMENT_TYPE_OPTIONS}
            placeholder="Select a payment type"
            required
          />
        </PatientFormSection>

        <PatientFormSection
          title="Next of kin"
          description="Emergency contact for this patient."
        >
          <PatientTextField
            control={form.control}
            name="nextOfKin.name"
            label="Full name"
            required
          />
          <PatientTextField
            control={form.control}
            name="nextOfKin.phone"
            label="Phone number"
            type="tel"
            required
          />
          <PatientTextField
            control={form.control}
            name="nextOfKin.relationship"
            label="Relationship"
            required
          />
          <PatientTextareaField
            control={form.control}
            name="nextOfKin.address"
            label="Address"
            className="sm:col-span-2"
            required
          />
        </PatientFormSection>

        {isEdit && (
          <PatientFormSection
            title="Status"
            description="Inactive patients stay on record but are filtered out by default."
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
          </PatientFormSection>
        )}

        <div className="sticky bottom-0 z-10 -mx-6 flex items-center gap-3 border-t bg-background/80 px-6 py-4 backdrop-blur">
          <Button
            type="submit"
            disabled={
              form.formState.isSubmitting || (isEdit && !form.formState.isDirty)
            }
          >
            {form.formState.isSubmitting
              ? 'Saving…'
              : isEdit
                ? 'Save changes'
                : 'Register patient'}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link to="/patients">Cancel</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}
