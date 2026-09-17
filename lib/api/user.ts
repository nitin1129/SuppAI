"use client";

import { registerUser } from "./meals";

/* Meal planning needs a user_id from the backend's own register call. We ask
   for one the first time it is needed and keep it, so the person never sees a
   registration step they did not ask for.

   The backend refuses an email it already holds (409) and offers no way to
   look the id up again, so a browser that loses the stored id would be locked
   out of its own address forever. When that happens we register a tagged
   variant of the same address instead: jane+suppai-a1b2c3d4@gmail.com still
   delivers to jane@gmail.com. */

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

function store(user: ApiUser) {
  try {
    localStorage.setItem(LS_API_USER, JSON.stringify(user));
  } catch {
    /* a plan still works this session without the id being kept */
  }
}

/** jane@gmail.com -> jane+suppai-4f2a9c1e@gmail.com */
function taggedEmail(email: string): string {
  const tag = `suppai-${Math.random().toString(36).slice(2, 10)}`;
  const at = email.lastIndexOf("@");
  if (at < 1) return `${email || "member"}.${tag}`;
  const local = email.slice(0, at).split("+")[0];
  return `${local}+${tag}${email.slice(at)}`;
}

const isTaken = (e: unknown) => e instanceof Error && /already registered/i.test(e.message);

/** The stored id, or a fresh registration when there is none. */
export async function ensureApiUser(name: string, email: string): Promise<ApiUser> {
  const existing = readApiUser();
  if (existing) return existing;

  let address = email;
  let res;
  try {
    res = await registerUser(name, address);
  } catch (e) {
    if (!isTaken(e)) throw e;
    // The address is spoken for and cannot be recovered, so tag it and retry.
    address = taggedEmail(email);
    res = await registerUser(name, address);
  }

  const user: ApiUser = { userId: res.user_id, name: res.name || name, email: address };
  store(user);
  return user;
}

/** The backend forgot this id (its data was reset). Register again. */
export async function renewApiUser(name: string, email: string): Promise<ApiUser> {
  clearApiUser();
  return ensureApiUser(name, email);
}
