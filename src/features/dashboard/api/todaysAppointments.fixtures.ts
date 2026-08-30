import type { TodaysAppointmentsResponse } from '@/features/dashboard/types/todaysAppointments.types';

// Static, deterministic dummy payload. Every AppointmentStatus value appears at
// least once so each statusLabel is exercised.
export const todaysAppointmentsFixture: TodaysAppointmentsResponse = {
  appointments: [
    {
      id: 'appt-3001',
      patientId: 'pat-1001',
      patientName: 'Chinonso Okafor',
      clinician: 'Dr. Adaobi Nwosu',
      scheduledAt: '2026-08-29T08:00:00.000Z',
      status: 'completed',
      statusLabel: 'Completed',
    },
    {
      id: 'appt-3002',
      patientId: 'pat-1002',
      patientName: 'Aisha Bello',
      clinician: 'Dr. Tunde Bakare',
      scheduledAt: '2026-08-29T08:30:00.000Z',
      status: 'in-progress',
      statusLabel: 'In progress',
    },
    {
      id: 'appt-3003',
      patientId: 'pat-1004',
      patientName: 'Ngozi Eze',
      clinician: 'Dr. Adaobi Nwosu',
      scheduledAt: '2026-08-29T09:00:00.000Z',
      status: 'checked-in',
      statusLabel: 'Checked in',
    },
    {
      id: 'appt-3004',
      patientId: 'pat-1005',
      patientName: 'Ibrahim Musa',
      clinician: 'Dr. Chidi Okoro',
      scheduledAt: '2026-08-29T09:30:00.000Z',
      status: 'scheduled',
      statusLabel: 'Scheduled',
    },
    {
      id: 'appt-3005',
      patientId: 'pat-1006',
      patientName: 'Folake Ogunleye',
      clinician: 'Dr. Tunde Bakare',
      scheduledAt: '2026-08-29T10:00:00.000Z',
      status: 'cancelled',
      statusLabel: 'Cancelled',
    },
    {
      id: 'appt-3006',
      patientId: 'pat-1008',
      patientName: 'Halima Abubakar',
      clinician: 'Dr. Chidi Okoro',
      scheduledAt: '2026-08-29T10:30:00.000Z',
      status: 'scheduled',
      statusLabel: 'Scheduled',
    },
  ],
};
