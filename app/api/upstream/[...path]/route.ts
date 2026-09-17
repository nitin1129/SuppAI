import type { NextRequest } from "next/server";

/* Proxy to the health backend.

   The backend has no certificate, so a browser on an https page cannot call
   it directly. It calls this route instead, on the site's own origin, and the
   server forwards the request over plain http.

   The response is returned with Cache-Control: no-store, no-transform. The CDN
   in front of the site was emptying small proxied replies, which reaches the
   browser as "Unexpected end of JSON input"; no-transform tells any
   intermediary to pass the body through untouched. */

export const dynamic = "force-dynamic";

const upstream = (process.env.API_UPSTREAM_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "")
  .trim()
  .replace(/\/+$/, "");

function problem(message: string, status: number) {
  return Response.json({ error: message }, {
    status,
    headers: { "Cache-Control": "no-store, no-transform" },
  });
}

async function forward(request: NextRequest, path: string[]): Promise<Response> {
  if (!upstream) return problem("API_UPSTREAM_URL is not set on the server.", 500);

  const target = `${upstream}/${path.join("/")}${request.nextUrl.search}`;
  const headers: HeadersInit = { Accept: "application/json" };
  const contentType = request.headers.get("content-type");
  if (contentType) headers["Content-Type"] = contentType;

  let response: Response;
  try {
    response = await fetch(target, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.text(),
      cache: "no-store",
    });
  } catch (e) {
    // The reason matters when this fails in production: wrong scheme, refused
    // connection, DNS. Say which, rather than a blank 500.
    return problem(`Could not reach the backend at ${upstream}: ${e instanceof Error ? e.message : "unknown error"}`, 502);
  }

  // Read the body fully, then hand it back with an exact length, so nothing
  // downstream has to guess at a streamed response.
  const body = await response.arrayBuffer();
  const headersOut: Record<string, string> = {
    "Content-Type": response.headers.get("content-type") ?? "application/json",
    "Content-Length": String(body.byteLength),
    "Cache-Control": "no-store, no-transform",
  };
  // Keeps the filename on the meal plan PDF download.
  const disposition = response.headers.get("content-disposition");
  if (disposition) headersOut["Content-Disposition"] = disposition;

  return new Response(body, { status: response.status, headers: headersOut });
}

export async function GET(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return forward(request, path);
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return forward(request, path);
}

export async function PUT(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return forward(request, path);
}

export async function DELETE(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return forward(request, path);
}
