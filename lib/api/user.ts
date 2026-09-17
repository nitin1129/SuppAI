"use client";

import { registerUser } from "./meals";

/* Meal planning needs a user_id from the backend's own register call. We ask
   for one the first time it is needed and keep it, so the person never sees a
   registration step they did not ask for. */

const LS_API_USER = "suppai.api.user.v1";

export type ApiUser = { userId: string; name: string; email: string };

export function readApiUser(): ApiUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_API_USER);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ApiUser>;
    return parsed.userId ? { userId: parsed.userId, name: parsed.name ?? "", email: parsed.email ?? "" } : null;
  } catch {
    return null;
  }
}

export function clearApiUser() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LS_API_USER);
  } catch {
    /* ignore */
  }
}

/** The stored id, or a fresh registration when there is none. */
export async function ensureApiUser(name: string, email: string): Promise<ApiUser> {
  const existing = readApiUser();
  if (existing) return existing;
  const res = await registerUser(name, email);
  const user: ApiUser = { userId: res.user_id, name: res.name || name, email };
  try {
    localStorage.setItem(LS_API_USER, JSON.stringify(user));
  } catch {
    /* a plan still works this session without the id being kept */
  }
  return user;
}
