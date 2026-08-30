// Synthetic patient data — the stand-in for `GET /api/v1/patients` until the
// backend grows search / filter / sort / cursor params. Deterministic (no
// randomness at import time) so tests and the UI are stable. Purely synthetic
// names; any resemblance to real people is coincidental.
//
// `patientsRepository.ts` is the ONLY consumer. Nothing in `components/` or
// `pages/` imports this file.

import type { PatientWire } from '@/features/patients/types/patient.types';

const FIRST_NAMES = [
  'Adaeze', 'Emeka', 'Chidinma', 'Oluwaseun', 'Ibrahim', 'Ngozi', 'Tunde',
  'Fatima', 'Chukwuemeka', 'Aisha', 'Babatunde', 'Yetunde', 'Nnamdi', 'Halima',
  'Obinna', 'Folake', 'Suleiman', 'Amaka', 'Kelechi', 'Zainab', 'Uche',
  'Damilola', 'Musa', 'Chiamaka', 'Segun', 'Blessing', 'Abdullahi', 'Temitope',
];

const LAST_NAMES = [
  'Okonkwo', 'Adeyemi', 'Balogun', 'Okafor', 'Bello', 'Eze', 'Abubakar',
  'Nwachukwu', 'Ogunleye', 'Danjuma', 'Chukwu', 'Oyelaran', 'Mohammed',
  'Adebayo', 'Onyeka', 'Lawal', 'Ojo', 'Ibeh', 'Sani', 'Uzoma',
];

const MIDDLE_NAMES = ['Chinedu', 'Grace', 'Ayodele', 'Ifeoma', 'Sadiq', 'Ololade'];

const PAYMENT_TYPES = ['hmo', 'cash', 'corporate'] as const;
const SEXES = ['male', 'female', 'other'] as const;

// A small deterministic PRNG so the generated set never shifts between runs.
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function isoDate(year: number, month: number, day: number): string {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

function rfc3339(year: number, month: number, day: number): string {
  return `${isoDate(year, month, day)}T09:30:00Z`;
}

function generated(): PatientWire[] {
  const rand = mulberry32(42);
  const out: PatientWire[] = [];

  for (let i = 0; i < 44; i += 1) {
    const seq = i + 1;
    const first = FIRST_NAMES[i % FIRST_NAMES.length]!;
    const last = LAST_NAMES[(i * 3) % LAST_NAMES.length]!;
    const hasMiddle = rand() > 0.55;
    const hasEmail = rand() > 0.35;
    const sex = SEXES[Math.floor(rand() * 3)]!;
    const paymentType = PAYMENT_TYPES[Math.floor(rand() * 3)]!;

    const birthYear = 1945 + Math.floor(rand() * 78); // 1945..2022
    const birthMonth = 1 + Math.floor(rand() * 12);
    const birthDay = 1 + Math.floor(rand() * 28);

    const regYear = 2023 + Math.floor(rand() * 3); // 2023..2025
    const regMonth = 1 + Math.floor(rand() * 12);
    const regDay = 1 + Math.floor(rand() * 28);

    out.push({
      id: `pat-${String(1000 + seq)}`,
      zrn: `ZRN-LAG-${String(seq).padStart(6, '0')}`,
      firstName: first,
      lastName: last,
      ...(hasMiddle
        ? { middleName: MIDDLE_NAMES[i % MIDDLE_NAMES.length]! }
        : {}),
      ...(hasEmail
        ? {
            email: `${first}.${last}${seq}@example.test`.toLowerCase(),
          }
        : {}),
      phoneNumber: `0${803 + (i % 7)}${String(1000000 + seq * 137).slice(0, 7)}`,
      dateOfBirth: isoDate(birthYear, birthMonth, birthDay),
      gender: sex,
      paymentType,
      nextOfKin: {
        name: `${MIDDLE_NAMES[(i + 1) % MIDDLE_NAMES.length]!} ${last}`,
        phone: `0703${String(2000000 + seq * 91).slice(0, 7)}`,
        relationship: sex === 'male' ? 'Spouse' : 'Sibling',
        address: `${seq} Marina Road, Lagos`,
      },
      isActive: rand() > 0.18,
      createdAt: rfc3339(regYear, regMonth, regDay),
      updatedAt: rfc3339(regYear, regMonth, regDay),
    });
  }

  return out;
}

// Hand-authored edge cases — the imperfect real-world data the UI must survive.
const EDGE_CASES: PatientWire[] = [
  {
    // Very long name + no middle name + missing email.
    id: 'pat-9001',
    zrn: 'ZRN-LAG-090001',
    firstName: 'Oluwafunmilayo-Adebisi',
    lastName: 'Ogundimu-Akintola-Balogun',
    phoneNumber: '08031234567',
    dateOfBirth: '1939-02-11',
    gender: 'female',
    paymentType: 'cash',
    nextOfKin: {
      name: 'Adebisi Ogundimu',
      phone: '07030000001',
      relationship: 'Daughter',
      address: '14 Awolowo Road, Ikoyi, Lagos',
    },
    isActive: true,
    createdAt: '2023-01-04T08:15:00Z',
    updatedAt: '2025-06-20T11:00:00Z',
  },
  {
    // Newborn, registered days after birth, no phone of their own.
    id: 'pat-9002',
    zrn: 'ZRN-LAG-090002',
    firstName: 'Baby',
    lastName: 'Nwosu',
    phoneNumber: '',
    dateOfBirth: isoNDaysAgo(6),
    gender: 'male',
    paymentType: 'hmo',
    nextOfKin: {
      name: 'Chidera Nwosu',
      phone: '08090000002',
      relationship: 'Mother',
      address: '2 Hospital Road, Yaba, Lagos',
    },
    isActive: true,
    createdAt: isoNDaysAgo(4),
    updatedAt: isoNDaysAgo(4),
  },
  {
    // Duplicate full name #1 — different ZRN, different DOB.
    id: 'pat-9003',
    zrn: 'ZRN-LAG-090003',
    firstName: 'John',
    lastName: 'Okoro',
    email: 'john.okoro.a@example.test',
    phoneNumber: '08051112233',
    dateOfBirth: '1988-07-19',
    gender: 'male',
    paymentType: 'corporate',
    nextOfKin: {
      name: 'Ada Okoro',
      phone: '07031112233',
      relationship: 'Spouse',
      address: '9 Allen Avenue, Ikeja, Lagos',
    },
    isActive: true,
    createdAt: '2024-03-12T10:05:00Z',
    updatedAt: '2024-03-12T10:05:00Z',
  },
  {
    // Duplicate full name #2 — same name as pat-9003.
    id: 'pat-9004',
    zrn: 'ZRN-LAG-090004',
    firstName: 'John',
    lastName: 'Okoro',
    phoneNumber: '08052223344',
    dateOfBirth: '1996-11-30',
    gender: 'male',
    paymentType: 'cash',
    nextOfKin: {
      name: 'Peter Okoro',
      phone: '07032223344',
      relationship: 'Brother',
      address: '17 Bode Thomas, Surulere, Lagos',
    },
    isActive: false,
    createdAt: '2025-02-01T14:20:00Z',
    updatedAt: '2025-08-02T09:00:00Z',
  },
  {
    // Inactive, elderly, HMO.
    id: 'pat-9005',
    zrn: 'ZRN-LAG-090005',
    firstName: 'Musa',
    lastName: 'Abdullahi',
    middleName: 'Garba',
    email: 'musa.abdullahi@example.test',
    phoneNumber: '0806 555 0199',
    dateOfBirth: '1951-05-02',
    gender: 'male',
    paymentType: 'hmo',
    nextOfKin: {
      name: 'Halima Abdullahi',
      phone: '07035550199',
      relationship: 'Spouse',
      address: '4 Ahmadu Bello Way, Victoria Island, Lagos',
    },
    isActive: false,
    createdAt: '2023-09-27T07:45:00Z',
    updatedAt: '2025-01-15T16:30:00Z',
  },
  {
    // Registered today.
    id: 'pat-9006',
    zrn: 'ZRN-LAG-090006',
    firstName: 'Chinelo',
    lastName: 'Umeh',
    email: 'chinelo.umeh@example.test',
    phoneNumber: '08123456789',
    dateOfBirth: '2001-09-14',
    gender: 'female',
    paymentType: 'cash',
    nextOfKin: {
      name: 'Ifeanyi Umeh',
      phone: '07039876543',
      relationship: 'Father',
      address: '23 Opebi Road, Ikeja, Lagos',
    },
    isActive: true,
    createdAt: isoNDaysAgo(0),
    updatedAt: isoNDaysAgo(0),
  },
];

function isoNDaysAgo(n: number): string {
  const d = new Date();
  d.setUTCHours(9, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString();
}

/** The full synthetic dataset. Ordering here is arbitrary; the repo sorts. */
export const PATIENT_FIXTURES: PatientWire[] = [...generated(), ...EDGE_CASES];
