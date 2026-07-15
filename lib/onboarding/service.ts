"use client";

import type {
  Application,
  AppStatus,
  Credentials,
  PartnerKind,
  UploadedFile,
} from "./types";

const LS_APPS = "suppai.onboarding.apps.v2";
const LS_DRAFT = (kind: PartnerKind) => `suppai.onboarding.draft.${kind}`;

const DELAY = 200;
const delay = <T,>(v: T, ms = DELAY): Promise<T> =>
  new Promise((r) => setTimeout(() => r(v), ms));

function read(): Application[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_APPS);
    return raw ? (JSON.parse(raw) as Application[]) : seed();
  } catch {
    return [];
  }
}
function writeAll(list: Application[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_APPS, JSON.stringify(list));
  } catch {
    /* quota: ignore */
  }
}
function uid(p: string) {
  return `${p}-${Math.random().toString(36).slice(2, 9)}`;
}
function ref(kind: PartnerKind) {
  const n = Math.floor(1000 + Math.random() * 9000);
  const p = kind === "lab" ? "LAB" : kind === "vendor" ? "VEN" : "DOC";
  return `SA-${p}-${n}`;
}

/* ----------------------------- Draft (save & resume) ----------------------------- */

export type DraftState = {
  step: number;
  data: Record<string, string | boolean | string[]>;
  files: UploadedFile[];
  updatedAt: string;
};

export function readDraft(kind: PartnerKind): DraftState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_DRAFT(kind));
    return raw ? (JSON.parse(raw) as DraftState) : null;
  } catch {
    return null;
  }
}

export function writeDraft(kind: PartnerKind, draft: DraftState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_DRAFT(kind), JSON.stringify(draft));
  } catch {
    /* quota: ignore (likely large file previews) */
  }
}

export function clearDraft(kind: PartnerKind) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LS_DRAFT(kind));
}

/* ----------------------------- Submit ----------------------------- */

export async function submitApplication(input: {
  kind: PartnerKind;
  data: Record<string, string | boolean | string[]>;
  files: UploadedFile[];
  displayName: string;
  location: string;
}): Promise<Application> {
  const now = new Date().toISOString();
  const app: Application = {
    id: uid(input.kind),
    kind: input.kind,
    reference: ref(input.kind),
    status: "submitted",
    data: input.data,
    files: input.files,
    displayName: input.displayName || "Unnamed applicant",
    location: input.location || "",
    createdAt: now,
    updatedAt: now,
    submittedAt: now,
  };
  const list = read();
  writeAll([app, ...list]);
  clearDraft(input.kind);
  return delay(app, 500);
}

/* ----------------------------- Admin reads ----------------------------- */

export async function fetchApplications(
  kind: PartnerKind,
): Promise<Application[]> {
  return delay(read().filter((a) => a.kind === kind));
}

export async function fetchApplication(
  id: string,
): Promise<Application | null> {
  return delay(read().find((a) => a.id === id) ?? null);
}

/* ----------------------------- Admin actions ----------------------------- */

export async function setStatus(
  id: string,
  status: AppStatus,
  note?: string,
): Promise<Application | null> {
  const list = read();
  let updated: Application | null = null;
  const next = list.map((a) => {
    if (a.id !== id) return a;
    updated = {
      ...a,
      status,
      reviewNote: note ?? a.reviewNote,
      reviewedAt: new Date().toISOString(),
      reviewedBy: "admin",
    };
    return updated;
  });
  writeAll(next);
  return delay(updated, 250);
}

function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/(dr|prof)\.?\s+/i, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, ".")
    .replace(/\.+/g, ".")
    .replace(/^\.|\.$/g, "");
}
const WORDS = ["Coral", "Maple", "Harbor", "Lumen", "Cedar", "Quartz", "Vista", "Aspen"];
const SYMS = ["#", "@", "$", "%", "&"];
function genPassword() {
  const seed = Math.floor(Math.random() * 1e6);
  return `${WORDS[seed % WORDS.length]}${100 + (seed % 900)}${SYMS[seed % SYMS.length]}`;
}

/** Accept the application: generate credentials and flip to Active. */
export async function acceptApplication(
  id: string,
): Promise<Application | null> {
  const list = read();
  let updated: Application | null = null;
  const next = list.map((a) => {
    if (a.id !== id) return a;
    const base =
      a.kind === "lab"
        ? `${slug(a.displayName) || "lab"}.ops`
        : a.kind === "vendor"
          ? `${slug(a.displayName) || "vendor"}.vendor`
          : `dr.${slug(a.displayName) || "doctor"}`;
    const email =
      (a.data["officialEmail"] as string) ||
      (a.data["email"] as string) ||
      `${base}@suppai.health`;
    const creds: Credentials = {
      username: base,
      email,
      tempPassword: genPassword(),
    };
    updated = {
      ...a,
      status: "active",
      credentials: creds,
      inviteSent: false,
      reviewedAt: new Date().toISOString(),
      reviewedBy: "admin",
    };
    return updated;
  });
  writeAll(next);
  return delay(updated, 400);
}

export async function regeneratePassword(
  id: string,
): Promise<Application | null> {
  const list = read();
  let updated: Application | null = null;
  const next = list.map((a) => {
    if (a.id !== id || !a.credentials) return a;
    updated = {
      ...a,
      credentials: { ...a.credentials, tempPassword: genPassword() },
      inviteSent: false,
    };
    return updated;
  });
  writeAll(next);
  return delay(updated, 300);
}

export async function markInviteSent(id: string): Promise<void> {
  const list = read();
  writeAll(list.map((a) => (a.id === id ? { ...a, inviteSent: true } : a)));
  return delay(undefined, 400);
}

export async function deleteApplication(id: string): Promise<void> {
  writeAll(read().filter((a) => a.id !== id));
  return delay(undefined, 120);
}

/* ----------------------------- Seed (demo) ----------------------------- */

function seed(): Application[] {
  const now = Date.now();
  const day = 86400000;
  const apps: Application[] = [
    {
      id: "lab-seed-1",
      kind: "lab",
      reference: "SA-LAB-4821",
      status: "submitted",
      displayName: "Apex Diagnostics",
      location: "Indiranagar, Bengaluru",
      createdAt: new Date(now - 2 * day).toISOString(),
      updatedAt: new Date(now - 2 * day).toISOString(),
      submittedAt: new Date(now - 2 * day).toISOString(),
      files: [],
      data: {
        legalName: "Apex Diagnostics Pvt Ltd",
        tradeName: "Apex Labs",
        entityType: "pvt_ltd",
        yearEstablished: "2016",
        contactNumber: "9876543210",
        registeredAddress: "12 MG Road, Bengaluru",
        operationalAddress: "8 100ft Road, Indiranagar, Bengaluru",
        state: "Karnataka",
        district: "Bengaluru Urban",
        pincode: "560038",
        officialEmail: "ops@apexdiagnostics.in",
        website: "apexdiagnostics.in",
        signatoryName: "Ramesh Gupta",
        designation: "Director",
        signatoryMobile: "9876500011",
        signatoryEmail: "ramesh@apexdiagnostics.in",
        pan: "AAACA1234F",
        nablAccredited: true,
        nablNo: "MC-2231",
        labDirectorName: "Dr. Sunil Rao",
        homeCollection: true,
        collectionAreas: "560038, 560008, 560071",
        accountHolder: "Apex Diagnostics Pvt Ltd",
        bankName: "HDFC Bank",
        ifsc: "HDFC0001234",
      },
    },
    {
      id: "lab-seed-2",
      kind: "lab",
      reference: "SA-LAB-4807",
      status: "under_review",
      displayName: "CityCare Pathology",
      location: "Bandra West, Mumbai",
      createdAt: new Date(now - 5 * day).toISOString(),
      updatedAt: new Date(now - 1 * day).toISOString(),
      submittedAt: new Date(now - 5 * day).toISOString(),
      files: [],
      data: {
        legalName: "CityCare Pathology LLP",
        entityType: "llp",
        officialEmail: "hello@citycare.in",
        signatoryName: "Meena Shah",
        pincode: "400050",
        state: "Maharashtra",
        nablAccredited: false,
      },
    },
    {
      id: "lab-seed-3",
      kind: "lab",
      reference: "SA-LAB-4790",
      status: "active",
      displayName: "Meridian Labs",
      location: "Koramangala, Bengaluru",
      createdAt: new Date(now - 20 * day).toISOString(),
      updatedAt: new Date(now - 12 * day).toISOString(),
      submittedAt: new Date(now - 20 * day).toISOString(),
      reviewedAt: new Date(now - 12 * day).toISOString(),
      inviteSent: true,
      credentials: {
        username: "meridian.ops",
        email: "ops@meridianlabs.in",
        tempPassword: "Cedar412#",
      },
      files: [],
      data: {
        legalName: "Meridian Labs Pvt Ltd",
        tradeName: "Meridian Labs",
        entityType: "pvt_ltd",
        officialEmail: "ops@meridianlabs.in",
        signatoryName: "Anita Desai",
        pincode: "560034",
        state: "Karnataka",
        district: "Bengaluru Urban",
        nablAccredited: true,
        homeCollection: true,
      },
    },
    {
      id: "doc-seed-1",
      kind: "doctor",
      reference: "SA-DOC-3310",
      status: "submitted",
      displayName: "Dr. Leela Menon",
      location: "Bengaluru",
      createdAt: new Date(now - 1 * day).toISOString(),
      updatedAt: new Date(now - 1 * day).toISOString(),
      submittedAt: new Date(now - 1 * day).toISOString(),
      files: [],
      data: {
        fullName: "Dr. Leela Menon",
        email: "leela.menon@gmail.com",
        phone: "9900112233",
        specialty: "Endocrinologist",
        qualifications: "MBBS, MD, DM",
        experienceYears: "14",
        registrationNo: "KMC-44821",
        city: "Bengaluru",
      },
    },
    {
      id: "doc-seed-2",
      kind: "doctor",
      reference: "SA-DOC-3288",
      status: "active",
      displayName: "Dr. Arjun Nair",
      location: "Chennai",
      createdAt: new Date(now - 18 * day).toISOString(),
      updatedAt: new Date(now - 10 * day).toISOString(),
      submittedAt: new Date(now - 18 * day).toISOString(),
      reviewedAt: new Date(now - 10 * day).toISOString(),
      inviteSent: true,
      credentials: {
        username: "dr.arjun.nair",
        email: "arjun.nair@gmail.com",
        tempPassword: "Maple377@",
      },
      files: [],
      data: {
        fullName: "Dr. Arjun Nair",
        email: "arjun.nair@gmail.com",
        phone: "9844556677",
        specialty: "Cardiologist",
        qualifications: "MBBS, MD, DM (Cardiology)",
        experienceYears: "11",
        registrationNo: "TNMC-33120",
        city: "Chennai",
      },
    },
  ];
  writeAll(apps);
  return apps;
}

/* ----------------------------- File helper ----------------------------- */

const PREVIEW_CAP = 600 * 1024; // 600 KB

export function readFileToUpload(
  file: File,
  docKey: string,
): Promise<UploadedFile> {
  return new Promise((resolve) => {
    const base: UploadedFile = {
      id: uid("file"),
      docKey,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    };
    if (file.type.startsWith("image/") && file.size <= PREVIEW_CAP) {
      const reader = new FileReader();
      reader.onload = () =>
        resolve({ ...base, dataUrl: reader.result as string });
      reader.onerror = () => resolve(base);
      reader.readAsDataURL(file);
    } else {
      resolve(base);
    }
  });
}
