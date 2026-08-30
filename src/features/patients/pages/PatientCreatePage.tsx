import { PatientForm } from '@/features/patients/components/PatientForm';

export function PatientCreatePage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <header>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Register patient
        </h1>
        <p className="text-sm text-muted-foreground">
          Create a new patient record for this branch.
        </p>
      </header>
      <PatientForm mode="create" />
    </div>
  );
}
