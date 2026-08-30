import { createDashboardQuery } from '@/features/dashboard/api/createDashboardQuery';
import { todaysAppointmentsFixture } from '@/features/dashboard/api/todaysAppointments.fixtures';

export const useTodaysAppointments = createDashboardQuery('todaysAppointments', todaysAppointmentsFixture);
