import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Activity,
  FileText,
  Pencil,
  Receipt,
  Stethoscope,
  Trash2,
  Upload,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PatientAppointmentsSection } from '@/features/appointments/components/PatientAppointmentsSection';
import { usePatient } from '@/features/patients/api/patients.api';
import { PatientDetailField } from '@/features/patients/components/PatientDetailField';
import { PatientDetailPlaceholder } from '@/features/patients/components/PatientDetailPlaceholder';
import { PatientDetailSection } from '@/features/patients/components/PatientDetailSection';
import { PatientDetailSkeleton } from '@/features/patients/components/PatientDetailSkeleton';
import { PatientDeleteDialog } from '@/features/patients/components/PatientDeleteDialog';
import { PatientLoadError } from '@/features/patients/components/PatientLoadError';
import { PatientStatusBadge } from '@/features/patients/components/PatientStatusBadge';
import {
  formatAge,
  formatOptionalText,
  formatPatientPhone,
  formatRegisteredDate,
  formatSex,
} from '@/features/patients/format';
import {
  patientAge,
  patientDisplayStatus,
  patientFullName,
  patientInitialsOf,
} from '@/features/patients/patientView';
import { PAYMENT_TYPE_OPTIONS } from '@/features/patients/patientOptions';
import type { Patient } from '@/features/patients/types/patient.types';
import { ApiError } from '@/lib/apiClient';

/**
 * Empty expansion slots on the detail page. Each is a labelled card a later
 * feature fills in — add a row here to add a section. Ordering here is the
 * on-page order.
 */
const PATIENT_DETAIL_PLACEHOLDERS: ReadonlyArray<{
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    id: 'clinical',
    title: 'Clinical / medical record',
    description: 'Encounters, diagnoses, vitals and notes.',
    icon: Stethoscope,
  },
  {
    id: 'billing',
    title: 'Billing & invoices',
    description: 'Charges, payments and HMO claims.',
    icon: Receipt,
  },
  {
    id: 'documents',
    title: 'Documents',
    description: 'Scanned forms, referrals and uploads.',
    icon: Upload,
  },
  {
    id: 'activity',
    title: 'Activity log',
    description: 'Record of changes to this patient.',
    icon: Activity,
  },
];

function paymentTypeLabel(value: string): string {
  return PAYMENT_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function PatientDetailPage() {
  const { patientId } = useParams();
  const id = patientId ?? '';
  const navigate = useNavigate();
  const { data, isPending, isError, error, refetch } = usePatient(id);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const notFound = error instanceof ApiError && error.statusCode === 404;

  let body: ReactNode;
  if (isPending) {
    body = <PatientDetailSkeleton />;
  } else if (isError) {
    body = (
      <PatientLoadError
        notFound={notFound}
        error={error}
        onRetry={() => void refetch()}
      />
    );
  } else {
    body = (
      <PatientDetailContent
        patient={data}
        onEditPath={`/patients/${id}/edit`}
        onDelete={() => setDeleteOpen(true)}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      {body}

      {data && (
        <PatientDeleteDialog
          patient={{
            id: data.id,
            fullName: patientFullName(data),
            zrn: data.zrn,
          }}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onDeleted={() => navigate('/patients')}
        />
      )}
    </div>
  );
}

interface PatientDetailContentProps {
  patient: Patient;
  onEditPath: string;
  onDelete: () => void;
}

function PatientDetailContent({
  patient,
  onEditPath,
  onDelete,
}: Readonly<PatientDetailContentProps>) {
  const fullName = patientFullName(patient);
  const status = patientDisplayStatus(patient);
  const age = patientAge(patient);

  return (
    <>
      {/* Header band */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <span
            aria-hidden="true"
            className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-muted text-lg font-medium text-foreground"
          >
            {patientInitialsOf(patient)}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-semibold tracking-tight">
                {fullName || 'Unnamed patient'}
              </h1>
              <PatientStatusBadge status={status} />
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              {patient.zrn || '—'}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" asChild>
            <Link to={onEditPath}>
              <Pencil aria-hidden="true" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" type="button" onClick={onDelete}>
            <Trash2 aria-hidden="true" />
            Delete
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Main column */}
        <div className="flex min-w-0 flex-col gap-6">
          <PatientDetailSection title="Personal details">
            <dl className="grid gap-4 sm:grid-cols-2">
              <PatientDetailField
                label="First name"
                value={patient.firstName}
              />
              <PatientDetailField label="Last name" value={patient.lastName} />
              <PatientDetailField
                label="Middle name"
                value={formatOptionalText(patient.middleName)}
              />
              <PatientDetailField
                label="Date of birth"
                value={formatRegisteredDate(patient.dateOfBirth)}
              />
              <PatientDetailField label="Age" value={formatAge(age)} />
              <PatientDetailField
                label="Gender"
                value={formatSex(patient.gender)}
              />
              <PatientDetailField
                label="Marital status"
                value={formatOptionalText(patient.maritalStatus)}
              />
            </dl>
          </PatientDetailSection>

          <PatientDetailSection title="Contact">
            <dl className="grid gap-4 sm:grid-cols-2">
              <PatientDetailField
                label="Phone number"
                value={formatPatientPhone(patient.phoneNumber)}
              />
              <PatientDetailField
                label="Email"
                value={formatOptionalText(patient.email)}
              />
              <PatientDetailField
                label="Residential address"
                value={formatOptionalText(patient.address)}
                className="sm:col-span-2"
              />
            </dl>
          </PatientDetailSection>

          <PatientDetailSection title="Next of kin">
            <dl className="grid gap-4 sm:grid-cols-2">
              <PatientDetailField
                label="Full name"
                value={formatOptionalText(patient.nextOfKin.name)}
              />
              <PatientDetailField
                label="Phone number"
                value={formatPatientPhone(patient.nextOfKin.phone || null)}
              />
              <PatientDetailField
                label="Relationship"
                value={formatOptionalText(patient.nextOfKin.relationship)}
              />
              <PatientDetailField
                label="Address"
                value={formatOptionalText(patient.nextOfKin.address)}
                className="sm:col-span-2"
              />
            </dl>
          </PatientDetailSection>

          <PatientDetailSection title="Demographics">
            <dl className="grid gap-4 sm:grid-cols-2">
              <PatientDetailField
                label="Blood group"
                value={formatOptionalText(patient.bloodGroup)}
              />
              <PatientDetailField
                label="Nationality"
                value={formatOptionalText(patient.nationality)}
              />
              <PatientDetailField
                label="Occupation"
                value={formatOptionalText(patient.occupation)}
              />
            </dl>
          </PatientDetailSection>

          <PatientDetailSection title="Payment">
            <dl className="grid gap-4 sm:grid-cols-2">
              <PatientDetailField
                label="Payment type"
                value={paymentTypeLabel(patient.paymentType)}
              />
            </dl>
          </PatientDetailSection>

          <PatientAppointmentsSection patientId={patient.id} />

          {PATIENT_DETAIL_PLACEHOLDERS.map((section) => (
            <PatientDetailPlaceholder
              key={section.id}
              title={section.title}
              description={section.description}
              icon={section.icon}
            />
          ))}
        </div>

        {/* Right rail */}
        <div className="flex flex-col gap-6">
          <Card className="[--card-spacing:--spacing(5)] h-fit lg:sticky lg:top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                Quick facts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="flex flex-col gap-4">
                <PatientDetailField label="ZRN" value={patient.zrn || '—'} />
                <PatientDetailField
                  label="Age / gender"
                  value={`${formatAge(age)} · ${formatSex(patient.gender)}`}
                />
                <PatientDetailField
                  label="Blood group"
                  value={formatOptionalText(patient.bloodGroup)}
                />
                <PatientDetailField
                  label="Payment type"
                  value={paymentTypeLabel(patient.paymentType)}
                />
                <PatientDetailField
                  label="Registered"
                  value={formatRegisteredDate(patient.createdAt)}
                />
                <PatientDetailField
                  label="Last updated"
                  value={formatRegisteredDate(patient.updatedAt)}
                />
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
