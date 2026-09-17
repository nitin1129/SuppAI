"use client";

import { useMemo, useState } from "react";

import { useHydrated } from "@/lib/hooks/useHydrated";

import type { AdminSession, AdminUser } from "./types";

const LS_KEY = "suppai.admin.session";
const SESSION_DAYS = 7;

/** Demo build: any email/password passes. */
function fakeUser(email: string): AdminUser {
  const name = email
    .split("@")[0]
    .split(/[._-]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return {
    id: `admin-${email}`,
    name: name || "Admin",
    email,
    role: email.startsWith("editor") ? "editor" : "owner",
    avatarInitials: initials || "AD",
  };
}

function read(): AdminSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminSession;
    if (new Date(parsed.expiresAt).getTime() < Date.now()) {
      localStorage.removeItem(LS_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function write(s: AdminSession | null) {
  if (typeof window === "undefined") return;
  if (s) localStorage.setItem(LS_KEY, JSON.stringify(s));
  else localStorage.removeItem(LS_KEY);
}

export async function signIn(
  email: string,
  password: string,
): Promise<AdminSession> {
  await new Promise((r) => setTimeout(r, 300));
  // Replace with real API in production.
  if (!email || !password) throw new Error("Email and password required");
  if (password.length < 4) throw new Error("Password too short");
  const session: AdminSession = {
    user: fakeUser(email),
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(
      Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString(),
  };
  write(session);
  return session;
}

export async function signOut(): Promise<void> {
  await new Promise((r) => setTimeout(r, 100));
  write(null);
}

export function getSession(): AdminSession | null {
  return read();
}

/** Hook for client components, auto-hydrated on mount. */
export function useAdminSession(): {
  session: AdminSession | null;
  hydrated: boolean;
  refresh: () => void;
} {
  const hydrated = useHydrated();
  // Bumped by refresh() so the session is re-read from storage.
  const [version, setVersion] = useState(0);
  const session = useMemo(() => (hydrated && version >= 0 ? read() : null), [hydrated, version]);

  return {
    session,
    hydrated,
    refresh: () => setVersion((v) => v + 1),
  };
}
