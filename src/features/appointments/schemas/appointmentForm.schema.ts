import { z } from 'zod';

import {
  APPOINTMENT_STATUS_VALUES,
  APPOINTMENT_TYPE_VALUES,
} from '@/features/appointments/types/appointment.types';

const requiredUuid = (label: string) =>
  z.string().uuid(`${label} is required.`);

const requiredDateTime = (label: string) =>
  z.string().trim().min(1, `${label} is required.`);

const optionalText = z.string().trim();

export const appointmentFormSchema = z
  .object({
    patientId: requiredUuid('Patient'),
    staffId: requiredUuid('Staff member'),
    type: z.enum(APPOINTMENT_TYPE_VALUES, {
      message: 'Select an appointment type.',
    }),
    // Optional on create — the backend defaults new appointments to SCHEDULED.
    status: z
      .enum(APPOINTMENT_STATUS_VALUES, { message: 'Select a status.' })
      .optional(),
    startAt: requiredDateTime('Start time'), // RFC3339
    endAt: requiredDateTime('End time'), // RFC3339
    reason: optionalText.optional(),
    notes: optionalText.optional(),
  })
  .refine((v) => new Date(v.endAt) > new Date(v.startAt), {
    message: 'End time must be after the start time',
    path: ['endAt'],
  });

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;
