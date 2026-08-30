import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  patientFormSchema,
  type PatientFormValues,
} from '@/features/patients/schemas/patientForm.schema';
import type { PatientWire } from '@/features/patients/types/patient.types';
import { ApiError } from '@/lib/apiClient';

type PatientFormProps =
  | { mode: 'create' }
  | { mode: 'edit'; patientId: string; initialData: PatientWire };

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const PAYMENT_TYPE_OPTIONS = [
  { value: 'hmo', label: 'HMO' },
  { value: 'cash', label: 'Cash' },
  { value: 'corporate', label: 'Corporate' },
];

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

        <Card>
          <CardContent className="flex flex-col gap-6">
            <PatientFormSection title="Identity">
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

            <PatientFormSection title="Contact">
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

            <PatientFormSection title="Demographics">
              <PatientTextField
                control={form.control}
                name="bloodGroup"
                label="Blood group"
              />
              <PatientTextField
                control={form.control}
                name="maritalStatus"
                label="Marital status"
              />
              <PatientTextField
                control={form.control}
                name="nationality"
                label="Nationality"
              />
              <PatientTextField
                control={form.control}
                name="occupation"
                label="Occupation"
              />
            </PatientFormSection>

            <PatientFormSection title="Payment">
              <PatientSelectField
                control={form.control}
                name="paymentType"
                label="Payment type"
                options={PAYMENT_TYPE_OPTIONS}
                placeholder="Select a payment type"
                required
              />
            </PatientFormSection>

            <PatientFormSection title="Next of kin">
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
              <PatientFormSection title="Status">
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
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
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
