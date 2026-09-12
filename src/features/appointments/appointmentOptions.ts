import {
  APPOINTMENT_STATUS_VALUES,
  APPOINTMENT_TYPE_VALUES,
  type AppointmentStatus,
  type AppointmentType,
} from '@/features/appointments/types/appointment.types';

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: 'Scheduled',
  CONFIRMED: 'Confirmed',
  CHECKED_IN: 'Checked in',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No show',
  RESCHEDULED: 'Rescheduled',
};

const TYPE_LABELS: Record<AppointmentType, string> = {
  CONSULTATION: 'Consultation',
  FOLLOW_UP: 'Follow-up',
  PROCEDURE: 'Procedure',
  LAB: 'Lab',
  VACCINATION: 'Vaccination',
  EMERGENCY: 'Emergency',
};

export const APPOINTMENT_STATUS_OPTIONS: readonly SelectOption[] =
  APPOINTMENT_STATUS_VALUES.map((value) => ({
    value,
    label: STATUS_LABELS[value],
  }));

export const APPOINTMENT_TYPE_OPTIONS: readonly SelectOption[] =
  APPOINTMENT_TYPE_VALUES.map((value) => ({
    value,
    label: TYPE_LABELS[value],
  }));
