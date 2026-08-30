import { useState } from 'react';
import {
  CalendarPlus,
  Eye,
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
import { patientFullName } from '@/features/patients/patientView';
import type { Patient } from '@/features/patients/types/patient.types';
import { Can } from '@/features/auth/Can';
import { RoleEnum } from '@/features/auth/types';

/**
 * One row action. `enabled` is a static flag today; it is the seam where a
 * permission check (`can(user, 'patient:edit')`) will live once roles are
 * data-driven. Delete is handled separately below — it needs a confirm dialog
 * and is destructive, so it is not part of this link list.
 */
interface PatientAction {
  readonly id: string;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly to?: (patient: Patient) => string;
  readonly enabled: boolean;
}

const ACTIONS: readonly PatientAction[] = [
  {
    id: 'view',
    label: 'View patient',
    icon: Eye,
    to: (p) => `/patients/${p.id}`,
    enabled: true,
  },
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
  readonly patient: Patient;
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
          <Can role={[RoleEnum.ADMIN, RoleEnum.NURSE, RoleEnum.RECEPTIONIST]}>
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
