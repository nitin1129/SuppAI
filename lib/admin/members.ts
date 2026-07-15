"use client";

/* End-user (member) directory for the admin. Frontend-only, localStorage-backed. */

const DELAY = 160;
const delay = <T,>(v: T, ms = DELAY): Promise<T> => new Promise((r) => setTimeout(() => r(v), ms));

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : fallback; } catch { return fallback; }
}
function writeLocal<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

export type MemberStatus = "active" | "suspended" | "on_hold" | "banned";

export type Member = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  joinedAt: string;
  orders: number;
  spend: number;
  status: MemberStatus;
  statusReason?: string;
  statusAt?: string;
};

export const STATUS_META: Record<MemberStatus, { label: string; cls: string; dot: string }> = {
  active: { label: "Active", cls: "bg-[#006E42]/10 text-[#006E42]", dot: "bg-[#006E42]" },
  on_hold: { label: "On hold", cls: "bg-[#c79a3d]/14 text-[#9c7426]", dot: "bg-[#c79a3d]" },
  suspended: { label: "Suspended", cls: "bg-[#c79a3d]/14 text-[#9c7426]", dot: "bg-[#c79a3d]" },
  banned: { label: "Banned", cls: "bg-[#c14040]/10 text-[#c14040]", dot: "bg-[#c14040]" },
};

const LS = "suppai.admin.members.v1";

function seed(): Member[] {
  const now = Date.now();
  const day = 86400000;
  const mk = (i: number, name: string, city: string, orders: number, spend: number, status: MemberStatus = "active", reason?: string): Member => ({
    id: `mem-${i}`,
    name,
    email: `${name.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
    phone: `98${(76543210 - i * 111).toString().slice(0, 8)}`,
    city,
    joinedAt: new Date(now - (30 + i * 12) * day).toISOString(),
    orders,
    spend,
    status,
    statusReason: reason,
    statusAt: status === "active" ? undefined : new Date(now - i * day).toISOString(),
  });
  return [
    mk(1, "Jane Sharma", "Bengaluru", 24, 48200),
    mk(2, "Arjun Rao", "Mumbai", 11, 21400),
    mk(3, "Meera Nair", "Kochi", 7, 9800),
    mk(4, "Kabir Shah", "Delhi", 3, 4200, "on_hold", "Payment dispute under review."),
    mk(5, "Sara Thomas", "Chennai", 16, 30500),
    mk(6, "Rohan Kapoor", "Pune", 2, 1800, "suspended", "Repeated failed KYC attempts."),
    mk(7, "Neha Verma", "Jaipur", 9, 14300),
    mk(8, "Imran Ali", "Hyderabad", 1, 900, "banned", "Fraudulent chargebacks confirmed."),
    mk(9, "Divya Menon", "Bengaluru", 19, 36100),
    mk(10, "Aditya Nair", "Kochi", 5, 6700),
  ];
}

export async function fetchMembers(): Promise<Member[]> {
  return delay(readLocal(LS, seed()));
}

export async function setMemberStatus(id: string, status: MemberStatus, reason?: string): Promise<Member[]> {
  const next = readLocal(LS, seed()).map((m) =>
    m.id === id
      ? { ...m, status, statusReason: status === "active" ? undefined : reason, statusAt: status === "active" ? undefined : new Date().toISOString() }
      : m,
  );
  writeLocal(LS, next);
  return delay(next, 200);
}

export function initials(name: string) {
  return name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}
