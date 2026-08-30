// Contract for today's appointments list. Backend swap target:
// GET /dashboard/appointments/today (see api/todaysAppointments.api.ts).

export type AppointmentStatus =
  | 'scheduled'
  | 'checked-in'
  | 'in-progress'
  | 'completed'
  | 'cancelled';

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
