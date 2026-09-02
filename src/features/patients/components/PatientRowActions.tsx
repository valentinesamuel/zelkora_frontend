import { useState } from 'react';
import {
  CalendarPlus,
  FileText,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PatientDeleteDialog } from '@/features/patients/components/PatientDeleteDialog';
import type { PatientListRow } from '@/features/patients/components/patientColumns';
import { patientFullName } from '@/features/patients/patientView';
import { Can } from '@/features/auth/Can';
import { PERMISSIONS } from '@/features/auth/permissions';


interface PatientAction {
  readonly id: string;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly to?: (patient: PatientListRow) => string;
  readonly enabled: boolean;
}

const ACTIONS: readonly PatientAction[] = [
  {
    id: 'record',
    label: 'View medical record',
    icon: FileText,
    to: (p) => `/patients/${p.id}`,
    enabled: true,
  },
  {
    id: 'edit',
    label: 'Edit patient',
    icon: Pencil,
    to: (p) => `/patients/${p.id}/edit`,
    enabled: true,
  },
  {
    id: 'schedule',
    label: 'Schedule appointment',
    icon: CalendarPlus,
    enabled: false,
  },
];

interface PatientRowActionsProps {
  readonly patient: PatientListRow;
}

export function PatientRowActions({ patient }: PatientRowActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const fullName = patientFullName(patient);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Actions for ${fullName || patient.zrn}`}
            className="flex size-8 items-center justify-center rounded-sm text-muted-foreground transition-colors motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[state=open]:bg-muted data-[state=open]:text-foreground"
          >
            <MoreHorizontal className="size-4" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-52">
          <DropdownMenuLabel className="truncate">
            {fullName || patient.zrn}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {ACTIONS.map((action) => {
            const Icon = action.icon;
            if (action.enabled && action.to) {
              return (
                <DropdownMenuItem key={action.id} asChild>
                  <Link to={action.to(patient)}>
                    <Icon aria-hidden="true" />
                    {action.label}
                  </Link>
                </DropdownMenuItem>
              );
            }
            return (
              <DropdownMenuItem key={action.id} disabled>
                <Icon aria-hidden="true" />
                {action.label}
                <span className="ml-auto text-xs text-muted-foreground">
                  Soon
                </span>
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator />
          <Can permission={[PERMISSIONS.PATIENT.DELETE]}>
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => {
                // Defer so the menu finishes closing (and releases its focus
                // trap) before the dialog opens in the next tick.
                setTimeout(() => setDeleteOpen(true), 0);
              }}
            >
              <Trash2 aria-hidden="true" />
              Delete patient
            </DropdownMenuItem>
          </Can>
        </DropdownMenuContent>
      </DropdownMenu>

      <PatientDeleteDialog
        patient={{ id: patient.id, fullName, zrn: patient.zrn }}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
