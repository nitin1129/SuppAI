"use client";

/* Shared plumbing for the health backend.

   By default calls go to this app's own origin at /api/upstream, which
   next.config forwards to the backend. That keeps the browser on one origin,
   so a site served over https can still reach a backend that speaks plain
   http. Set NEXT_PUBLIC_API_BASE_URL to call the backend directly instead
   (handy in local development). */

const configured = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").trim();

export const API_BASE = (configured || "/api/upstream").replace(/\/+$/, "");

/** Absolute URL for a path the API handed us, e.g. a download link. */
export function apiUrl(path: string): string {
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

type Options = { method?: "GET" | "POST"; body?: unknown };

export async function apiRequest<T>(path: string, options: Options = {}): Promise<T> {
  const { method = "GET", body } = options;

  let res: Response;
  try {
    res = await fetch(apiUrl(path), {
      method,
      headers: body === undefined
        ? { Accept: "application/json" }
        : { Accept: "application/json", "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error("Could not reach the server. Check your connection and try again.");
  }

  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json() as Promise<T>;
}

/* The API reports problems in a few shapes: {"error": "..."} for its own
   checks and FastAPI's {"detail": [...]} for validation. Prefer its words. */
async function errorMessage(res: Response): Promise<string> {
  try {
    const data: unknown = await res.json();
    if (data && typeof data === "object") {
      const record = data as Record<string, unknown>;
      if (typeof record.error === "string") return record.error;
      if (typeof record.detail === "string") return record.detail;
      if (Array.isArray(record.detail)) {
        const first = record.detail[0] as { msg?: string; loc?: unknown[] } | undefined;
        if (first?.msg) {
          const field = Array.isArray(first.loc) ? String(first.loc[first.loc.length - 1]) : "";
          return field ? `${field}: ${first.msg}` : first.msg;
        }
      }
    }
  } catch {
    /* fall through to the status message */
  }
  return `The server could not process that (error ${res.status}).`;
}
