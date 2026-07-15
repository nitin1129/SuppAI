"use client";

import { useEffect, useState } from "react";

import type { DoctorSession, LabSession, VendorSession } from "./types";

const SESSION_DAYS = 7;
const DOCTOR_KEY = "suppai.doctor.session";
const LAB_KEY = "suppai.lab.session";
const VENDOR_KEY = "suppai.vendor.session";

/** Mock directory. Any username starting with "doc" maps to a doctor by id. */
const DOCTOR_USERNAMES: Record<string, string> = {
  "dr.meera": "doc-1",
  "dr.arjun": "doc-2",
  "dr.kavya": "doc-3",
  "dr.rohan": "doc-4",
  "dr.priya": "doc-5",
};

const LAB_USERNAMES: Record<string, { labId: string; labName: string }> = {
  "thyrocare-ops": { labId: "lab-thyrocare", labName: "Thyrocare" },
  "redcliffe-ops": { labId: "lab-redcliffe", labName: "Redcliffe Labs" },
  "metropolis-ops": { labId: "lab-metropolis", labName: "Metropolis" },
  "agilus-ops": { labId: "lab-agilus", labName: "Agilus Diagnostics" },
};

/* ------------------------------- Doctor ------------------------------- */

function readDoctor(): DoctorSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DOCTOR_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as DoctorSession;
    if (new Date(s.expiresAt).getTime() < Date.now()) {
      localStorage.removeItem(DOCTOR_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

function writeDoctor(s: DoctorSession | null) {
  if (typeof window === "undefined") return;
  if (s) localStorage.setItem(DOCTOR_KEY, JSON.stringify(s));
  else localStorage.removeItem(DOCTOR_KEY);
}

export async function doctorSignIn(
  username: string,
  password: string,
): Promise<DoctorSession> {
  await new Promise((r) => setTimeout(r, 250));
  const key = (username.trim() || "demo").toLowerCase();
  // Demo build: any non-empty name and password works.
  void password;
  const doctorId = DOCTOR_USERNAMES[key] ?? "doc-1";
  const session: DoctorSession = {
    doctorId,
    username: key,
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(
      Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString(),
  };
  writeDoctor(session);
  return session;
}

export async function doctorSignOut(): Promise<void> {
  await new Promise((r) => setTimeout(r, 80));
  writeDoctor(null);
}

export function getDoctorSession(): DoctorSession | null {
  return readDoctor();
}

export function useDoctorSession() {
  const [session, setSession] = useState<DoctorSession | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSession(readDoctor());
    setHydrated(true);
  }, []);

  return { session, hydrated, refresh: () => setSession(readDoctor()) };
}

/* ------------------------------- Lab ------------------------------- */

function readLab(): LabSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LAB_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as LabSession;
    if (new Date(s.expiresAt).getTime() < Date.now()) {
      localStorage.removeItem(LAB_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

function writeLab(s: LabSession | null) {
  if (typeof window === "undefined") return;
  if (s) localStorage.setItem(LAB_KEY, JSON.stringify(s));
  else localStorage.removeItem(LAB_KEY);
}

export async function labSignIn(
  username: string,
  password: string,
): Promise<LabSession> {
  await new Promise((r) => setTimeout(r, 250));
  const key = (username.trim() || "demo").toLowerCase();
  // Demo build: any non-empty name and password works.
  void password;
  const lab = LAB_USERNAMES[key] ?? {
    labId: "lab-thyrocare",
    labName: "Thyrocare",
  };
  const session: LabSession = {
    labId: lab.labId,
    labName: lab.labName,
    username: key,
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(
      Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString(),
  };
  writeLab(session);
  return session;
}

export async function labSignOut(): Promise<void> {
  await new Promise((r) => setTimeout(r, 80));
  writeLab(null);
}

export function getLabSession(): LabSession | null {
  return readLab();
}

export function useLabSession() {
  const [session, setSession] = useState<LabSession | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSession(readLab());
    setHydrated(true);
  }, []);

  return { session, hydrated, refresh: () => setSession(readLab()) };
}

/* ------------------------------- Vendor ------------------------------- */

const VENDOR_USERNAMES: Record<string, { vendorId: string; vendorName: string }> = {
  "muscleblaze.vendor": { vendorId: "vendor-1", vendorName: "MuscleBlaze Nutrition" },
  "wowlife.vendor": { vendorId: "vendor-2", vendorName: "WOW Life Sciences" },
};

function readVendor(): VendorSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(VENDOR_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as VendorSession;
    if (new Date(s.expiresAt).getTime() < Date.now()) {
      localStorage.removeItem(VENDOR_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

function writeVendor(s: VendorSession | null) {
  if (typeof window === "undefined") return;
  if (s) localStorage.setItem(VENDOR_KEY, JSON.stringify(s));
  else localStorage.removeItem(VENDOR_KEY);
}

export async function vendorSignIn(username: string, password: string): Promise<VendorSession> {
  await new Promise((r) => setTimeout(r, 250));
  const key = (username.trim() || "demo").toLowerCase();
  void password;
  const v = VENDOR_USERNAMES[key] ?? { vendorId: "vendor-1", vendorName: "MuscleBlaze Nutrition" };
  const session: VendorSession = {
    vendorId: v.vendorId,
    vendorName: v.vendorName,
    username: key,
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString(),
  };
  writeVendor(session);
  return session;
}

export async function vendorSignOut(): Promise<void> {
  await new Promise((r) => setTimeout(r, 80));
  writeVendor(null);
}

export function getVendorSession(): VendorSession | null {
  return readVendor();
}

export function useVendorSession() {
  const [session, setSession] = useState<VendorSession | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSession(readVendor());
    setHydrated(true);
  }, []);

  return { session, hydrated, refresh: () => setSession(readVendor()) };
}
