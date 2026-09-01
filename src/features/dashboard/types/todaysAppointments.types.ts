// Today's appointments list payload. Backend: GET /dashboard/appointments/today.

export type AppointmentStatus =
  'scheduled' | 'checked-in' | 'in-progress' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  clinician: string;
  scheduledAt: string;
  status: AppointmentStatus;
  statusLabel: string;
}

export interface TodaysAppointmentsResponse {
  appointments: Appointment[];
}
