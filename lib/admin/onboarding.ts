"use client";

/* Admin-side onboarding for partner accounts (doctors + labs).
   Generates a username + temporary password; the login email is the one the
   admin enters. Demo persistence: localStorage. */

export type PartnerKind = "doctor" | "lab";

export type LabTestOffering = {
  id: string;
  name: string;
  price: number;
};

/* Catalog mirrors the diagnose page test packages so labs price the same tests. */
export const TEST_CATALOG: LabTestOffering[] = [
  { id: "full-body-advanced", name: "Full Body Checkup — Advanced", price: 1499 },
  { id: "full-body-basic", name: "Full Body Checkup — Essential", price: 849 },
  { id: "cbc", name: "Complete Blood Count (CBC)", price: 299 },
  { id: "thyroid", name: "Thyroid Profile (T3, T4, TSH)", price: 399 },
  { id: "vitamin", name: "Vitamin Deficiency Panel", price: 1099 },
  { id: "diabetes", name: "Diabetes Care Panel", price: 599 },
  { id: "lipid", name: "Lipid Profile", price: 499 },
  { id: "liver", name: "Liver Function Test (LFT)", price: 549 },
  { id: "kidney", name: "Kidney Function Test (KFT)", price: 549 },
  { id: "iron", name: "Iron Studies", price: 699 },
];

export type DoctorOnboardInput = {
  name: string;
  email: string;
  phone: string;
  qualifications: string;
  specialty: string;
  experienceYears: number;
  bio: string;
  languages: string[];
  clinic: string;
  city: string;
  consultationFee: number;
  initialRating?: number;
  initialReviews?: number;
};

export type LabOnboardInput = {
  labName: string;
  email: string;
  phone: string;
  contactPerson: string;
  licenseNumber: string;
  city: string;
  address: string;
  homeCollection: boolean;
  tests: LabTestOffering[];
};

export type Credentials = {
  username: string;
  email: string;
  tempPassword: string;
};

export type OnboardedPartner = {
  id: string;
  kind: PartnerKind;
  displayName: string;
  credentials: Credentials;
  inviteSent: boolean;
  createdAt: string;
  updatedAt: string;
  doctor?: DoctorOnboardInput;
  lab?: LabOnboardInput;
};

const LS_KEY = "suppai.admin.partners.v2";
const DELAY = 200;
const delay = <T,>(v: T, ms = DELAY): Promise<T> =>
  new Promise((r) => setTimeout(() => r(v), ms));

function read(): OnboardedPartner[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as OnboardedPartner[]) : [];
  } catch {
    return [];
  }
}
function writeAll(list: OnboardedPartner[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/(dr|prof)\.?\s+/i, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, ".")
    .replace(/\.+/g, ".")
    .replace(/^\.|\.$/g, "");
}

const WORDS = [
  "Coral", "Maple", "Harbor", "Lumen", "Cedar", "Quartz",
  "Vista", "Willow", "Onyx", "Saffron", "Cobalt", "Aspen",
];
const SYMBOLS = ["#", "@", "$", "%", "&"];

function genPassword(seed: number): string {
  const word = WORDS[Math.abs(seed) % WORDS.length];
  const digits = String(100 + (Math.abs(seed * 37) % 900));
  const sym = SYMBOLS[Math.abs(seed * 7) % SYMBOLS.length];
  return `${word}${digits}${sym}`;
}

function randomSeed() {
  return Math.floor(Math.random() * 1_000_000);
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function uniqueUsername(
  list: OnboardedPartner[],
  desired: string,
  ignoreId?: string,
): string {
  const taken = new Set(
    list
      .filter((p) => p.id !== ignoreId)
      .map((p) => p.credentials.username),
  );
  if (!taken.has(desired)) return desired;
  let i = 2;
  while (taken.has(`${desired}${i}`)) i += 1;
  return `${desired}${i}`;
}

/* ------------------------------ Reads ------------------------------ */

export async function fetchPartners(): Promise<OnboardedPartner[]> {
  return delay(read());
}

/* ------------------------------ Create ------------------------------ */

export async function onboardDoctor(
  input: DoctorOnboardInput,
): Promise<OnboardedPartner> {
  const list = read();
  const username = uniqueUsername(list, `dr.${slug(input.name) || "doctor"}`);
  const now = new Date().toISOString();
  const partner: OnboardedPartner = {
    id: uid("doc"),
    kind: "doctor",
    displayName: input.name,
    credentials: {
      username,
      email: input.email.trim(),
      tempPassword: genPassword(randomSeed()),
    },
    inviteSent: false,
    createdAt: now,
    updatedAt: now,
    doctor: input,
  };
  writeAll([partner, ...list]);
  return delay(partner);
}

export async function onboardLab(
  input: LabOnboardInput,
): Promise<OnboardedPartner> {
  const list = read();
  const username = uniqueUsername(list, `${slug(input.labName) || "lab"}.ops`);
  const now = new Date().toISOString();
  const partner: OnboardedPartner = {
    id: uid("lab"),
    kind: "lab",
    displayName: input.labName,
    credentials: {
      username,
      email: input.email.trim(),
      tempPassword: genPassword(randomSeed()),
    },
    inviteSent: false,
    createdAt: now,
    updatedAt: now,
    lab: input,
  };
  writeAll([partner, ...list]);
  return delay(partner);
}

/* ------------------------------ Update ------------------------------ */

export async function updateDoctor(
  id: string,
  input: DoctorOnboardInput,
): Promise<OnboardedPartner> {
  const list = read();
  let updated: OnboardedPartner | null = null;
  const next = list.map((p) => {
    if (p.id !== id) return p;
    updated = {
      ...p,
      displayName: input.name,
      credentials: { ...p.credentials, email: input.email.trim() },
      updatedAt: new Date().toISOString(),
      doctor: input,
    };
    return updated;
  });
  writeAll(next);
  return delay(updated ?? list[0]);
}

export async function updateLab(
  id: string,
  input: LabOnboardInput,
): Promise<OnboardedPartner> {
  const list = read();
  let updated: OnboardedPartner | null = null;
  const next = list.map((p) => {
    if (p.id !== id) return p;
    updated = {
      ...p,
      displayName: input.labName,
      credentials: { ...p.credentials, email: input.email.trim() },
      updatedAt: new Date().toISOString(),
      lab: input,
    };
    return updated;
  });
  writeAll(next);
  return delay(updated ?? list[0]);
}

/* ------------------------------ Credentials ------------------------------ */

export async function regeneratePassword(
  id: string,
): Promise<OnboardedPartner | null> {
  const list = read();
  let updated: OnboardedPartner | null = null;
  const next = list.map((p) => {
    if (p.id !== id) return p;
    updated = {
      ...p,
      credentials: { ...p.credentials, tempPassword: genPassword(randomSeed()) },
      inviteSent: false,
      updatedAt: new Date().toISOString(),
    };
    return updated;
  });
  writeAll(next);
  return delay(updated, 350);
}

export async function markInviteSent(id: string): Promise<void> {
  const list = read();
  writeAll(list.map((p) => (p.id === id ? { ...p, inviteSent: true } : p)));
  return delay(undefined, 400);
}

export async function deletePartner(id: string): Promise<void> {
  writeAll(read().filter((p) => p.id !== id));
  return delay(undefined, 120);
}
