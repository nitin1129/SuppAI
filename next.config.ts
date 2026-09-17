import type { NextConfig } from "next";

/* The health backend runs on plain HTTP. A browser on an https page may not
   call it directly (the request is blocked, or upgraded to https and fails
   the TLS handshake), so the browser calls this app instead and the server
   forwards to the backend. Set API_UPSTREAM_URL to the backend origin. */
const upstream = (process.env.API_UPSTREAM_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "")
  .trim()
  .replace(/\/+$/, "");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async rewrites() {
    if (!upstream) return [];
    return [{ source: "/api/upstream/:path*", destination: `${upstream}/:path*` }];
  },
};

export default nextConfig;
