import { useState } from 'react';
import { ListFilter } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PatientListFilterPatch } from '@/features/patients/filters/usePatientListParams';
import type {
  PatientListQuery,
  PatientSexFilter,
  PatientStatusFilter,
} from '@/features/patients/types/patientListQuery.types';

interface PatientFiltersProps {
  readonly query: PatientListQuery;
  readonly activeCount: number;
  readonly onApply: (patch: PatientListFilterPatch) => void;
  readonly onClear: () => void;
}

interface FilterDraft {
  status: PatientStatusFilter;
  sex: PatientSexFilter;
  ageMin: string;
  ageMax: string;
  registeredFrom: string;
  registeredTo: string;
}

function toDraft(query: PatientListQuery): FilterDraft {
  return {
    status: query.status,
    sex: query.sex,
    ageMin: query.ageMin === null ? '' : String(query.ageMin),
    ageMax: query.ageMax === null ? '' : String(query.ageMax),
    registeredFrom: query.registeredFrom ?? '',
    registeredTo: query.registeredTo ?? '',
  };
}

function parseAge(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  const n = Number(trimmed);
  if (!Number.isInteger(n) || n < 0 || n > 150) return null;
  return n;
}

/**
 * Advanced filters behind a single "Filters" affordance so the toolbar stays
 * calm. The popover is a draft form — Status / Sex / Age / Registered date are
 * staged, then committed together on "Apply". The count badge reflects what is
 * actually applied, not the draft.
 */
export function PatientFilters({
  query,
  activeCount,
  onApply,
  onClear,
}: PatientFiltersProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FilterDraft>(() => toDraft(query));

  // Re-seed the draft from the currently-applied query every time the popover
  // opens. Done in the open handler (an event), not an effect.
  function handleOpenChange(next: boolean) {
    if (next) setDraft(toDraft(query));
    setOpen(next);
  }

  function apply() {
    onApply({
      status: draft.status,
      sex: draft.sex,
      ageMin: parseAge(draft.ageMin),
      ageMax: parseAge(draft.ageMax),
      registeredFrom: draft.registeredFrom === '' ? null : draft.registeredFrom,
      registeredTo: draft.registeredTo === '' ? null : draft.registeredTo,
    });
    setOpen(false);
  }

  function clear() {
    onClear();
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" aria-label="Filter patients">
          <ListFilter aria-hidden="true" />
          Filters
          {activeCount > 0 && (
            <Badge variant="neutral" className="ml-0.5 tabular-nums">
              {activeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 gap-3">
        <p className="text-sm font-medium">Filter patients</p>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="patient-filter-status">Status</Label>
          <Select
            value={draft.status}
            onValueChange={(value) =>
              setDraft((d) => ({ ...d, status: value as PatientStatusFilter }))
            }
          >
            <SelectTrigger id="patient-filter-status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="deceased">Deceased</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="patient-filter-sex">Sex</Label>
          <Select
            value={draft.sex}
            onValueChange={(value) =>
              setDraft((d) => ({ ...d, sex: value as PatientSexFilter }))
            }
          >
            <SelectTrigger id="patient-filter-sex" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any sex</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1 text-sm text-foreground">Age range</legend>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              max={150}
              value={draft.ageMin}
              onChange={(e) =>
                setDraft((d) => ({ ...d, ageMin: e.target.value }))
              }
              aria-label="Minimum age"
              placeholder="Min"
            />
            <span aria-hidden="true" className="text-muted-foreground">
              –
            </span>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              max={150}
              value={draft.ageMax}
              onChange={(e) =>
                setDraft((d) => ({ ...d, ageMax: e.target.value }))
              }
              aria-label="Maximum age"
              placeholder="Max"
            />
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1 text-sm text-foreground">Registered</legend>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={draft.registeredFrom}
              max={draft.registeredTo || undefined}
              onChange={(e) =>
                setDraft((d) => ({ ...d, registeredFrom: e.target.value }))
              }
              aria-label="Registered from"
            />
            <span aria-hidden="true" className="text-muted-foreground">
              –
            </span>
            <Input
              type="date"
              value={draft.registeredTo}
              min={draft.registeredFrom || undefined}
              onChange={(e) =>
                setDraft((d) => ({ ...d, registeredTo: e.target.value }))
              }
              aria-label="Registered to"
            />
          </div>
        </fieldset>

        <div className="mt-1 flex items-center justify-between gap-2">
          <Button
            variant="outline"
            onClick={clear}
            disabled={activeCount === 0}
          >
            Clear filters
          </Button>
          <Button onClick={apply}>Apply</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
