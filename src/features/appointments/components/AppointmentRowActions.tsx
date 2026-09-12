import { useState } from 'react';
import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AppointmentDeleteDialog } from '@/features/appointments/components/AppointmentDeleteDialog';
import {
  appointmentPatientName,
  type AppointmentListRow,
} from '@/features/appointments/components/appointmentColumns';
import { formatAppointmentDateTime } from '@/features/appointments/format';
import { Can } from '@/features/auth/Can';
import { PERMISSIONS } from '@/features/auth/permissions';

interface AppointmentRowActionsProps {
  readonly appointment: AppointmentListRow;
}

// View is ungated (the row is only rendered behind `appointment:read` in the
// first place); Edit and Delete each carry their own `Can`, so a user without
// them gets no dead menu item.
export function AppointmentRowActions({
  appointment,
}: AppointmentRowActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  const label = `${appointmentPatientName(appointment)} · ${formatAppointmentDateTime(appointment.startAt)}`;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Actions for ${label}`}
            className="flex size-8 items-center justify-center rounded-sm text-muted-foreground transition-colors motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[state=open]:bg-muted data-[state=open]:text-foreground"
          >
            <MoreHorizontal className="size-4" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-52">
          <DropdownMenuLabel className="truncate">{label}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to={`/appointments/${appointment.id}`}>
              <Eye aria-hidden="true" />
              View appointment
            </Link>
          </DropdownMenuItem>
          <Can permission={[PERMISSIONS.APPOINTMENT.UPDATE]}>
            <DropdownMenuItem asChild>
              <Link to={`/appointments/${appointment.id}/edit`}>
                <Pencil aria-hidden="true" />
                Edit appointment
              </Link>
            </DropdownMenuItem>
          </Can>
          <Can permission={[PERMISSIONS.APPOINTMENT.DELETE]}>
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setDeleteOpen(true)}
            >
              <Trash2 aria-hidden="true" />
              Delete appointment
            </DropdownMenuItem>
          </Can>
        </DropdownMenuContent>
      </DropdownMenu>

      <AppointmentDeleteDialog
        appointment={{ id: appointment.id, label }}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
