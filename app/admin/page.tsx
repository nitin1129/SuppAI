"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, CalendarDays, ClipboardList, FileText, LifeBuoy, PackageCheck, Plus, Store, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { StatTile } from "@/components/admin/StatTile";
import { useAdminSession } from "@/lib/admin/auth";
import { fetchBlogs, fetchMetrics } from "@/lib/admin/service";
import type { AdminMetric, BlogPost } from "@/lib/admin/types";
import { fetchApplications } from "@/lib/onboarding/service";
import { fetchTickets } from "@/lib/support/service";
import { fetchAllVendorProducts } from "@/lib/vendor/service";

type Attention = { listings: number; applications: number; tickets: number };

export default function AdminOverviewPage() {
  const { session } = useAdminSession();
  const [metrics, setMetrics] = useState<AdminMetric[] | null>(null);
  const [recentBlogs, setRecentBlogs] = useState<BlogPost[]>([]);
  const [attention, setAttention] = useState<Attention | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetchAllVendorProducts(),
      Promise.all([fetchApplications("lab"), fetchApplications("doctor"), fetchApplications("vendor")]),
      fetchTickets(),
    ]).then(([vps, appsArr, tickets]) => {
      if (!alive) return;
      setAttention({
        listings: vps.filter((p) => p.listing === "pending").length,
        applications: appsArr.flat().filter((a) => a.status === "submitted" || a.status === "under_review").length,
        tickets: tickets.filter((t) => t.status === "open" || t.status === "in_progress").length,
      });
    });
    fetchMetrics().then((m) => alive && setMetrics(m));
    fetchBlogs().then((bs) => {
      if (!alive) return;
      const sorted = [...bs].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
      setRecentBlogs(sorted.slice(0, 5));
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <AdminTopbar
        title={`Welcome back, ${session?.user.name.split(" ")[0] ?? "Admin"}`}
        subtitle="Snapshot of platform activity and content."
      />

      <main className="no-scrollbar flex-1 overflow-y-auto px-8 py-7">
        {/* Quick actions */}
        <div className="mb-7 flex flex-wrap items-center gap-2">
          <Link
            href="/admin/blogs/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#006E42] px-3.5 py-2 text-[12.5px] font-semibold text-white transition hover:bg-[#005634]"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={3} />
            New blog post
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-[12.5px] font-semibold text-[#0f3a26] ring-1 ring-inset ring-[#0f3a26]/10 transition hover:ring-[#006E42]/30"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={3} />
            New product
          </Link>
          <Link
            href="/admin/vendors"
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-[12.5px] font-semibold text-[#0f3a26] ring-1 ring-inset ring-[#0f3a26]/10 transition hover:ring-[#006E42]/30"
          >
            <Store className="h-3.5 w-3.5" />
            Vendor catalogue
          </Link>
        </div>

        {/* Needs attention */}
        <section className="mb-8">
          <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#0f3a26]/45">Needs your attention</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <AttentionCard icon={PackageCheck} count={attention?.listings} label="Vendor listing requests" cta="Review listings" href="/admin/vendors" ready={!!attention} />
            <AttentionCard icon={ClipboardList} count={attention?.applications} label="Partner applications" cta="Review onboarding" href="/admin/onboarding/vendors" ready={!!attention} />
            <AttentionCard icon={LifeBuoy} count={attention?.tickets} label="Open support tickets" cta="Open support" href="/admin/support" ready={!!attention} />
          </div>
        </section>

        {/* Metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(metrics ?? Array.from({ length: 6 }).map(() => null)).map((m, i) =>
            m ? (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
              >
                <StatTile metric={m} />
              </motion.div>
            ) : (
              <div
                key={i}
                className="h-[124px] animate-pulse rounded-2xl bg-white ring-1 ring-[#0f3a26]/8"
              />
            ),
          )}
        </div>

        {/* Recent blog updates */}
        <section className="mt-10">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-[16px] font-bold tracking-tight text-[#0f3a26]">
              Recent blog posts
            </h2>
            <Link
              href="/admin/blogs"
              className="inline-flex items-center gap-1 text-[12.5px] font-medium text-[#006E42] hover:underline"
            >
              All posts
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <ul className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#0f3a26]/8">
            {recentBlogs.length === 0 && (
              <li className="p-6 text-center text-[12.5px] text-[#0f3a26]/55">
                No blog posts yet. <Link href="/admin/blogs/new" className="font-semibold text-[#006E42]">Create your first.</Link>
              </li>
            )}
            {recentBlogs.map((b) => (
              <li
                key={b.id}
                className="flex items-center gap-4 border-b border-[#0f3a26]/8 px-5 py-3.5 last:border-b-0"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#006E42]/8 text-[#006E42]">
                  <FileText className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-[#0f3a26]">
                    {b.title}
                  </p>
                  <p className="text-[11px] text-[#0f3a26]/55">
                    {b.author} · {b.category} · {b.readMinutes} min read
                  </p>
                </div>
                <StatusPill status={b.status} />
                <Link
                  href={`/admin/blogs/${b.id}`}
                  className="text-[12px] font-semibold text-[#006E42] hover:underline"
                >
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Manage the platform */}
        <section className="mt-10">
          <h2 className="mb-4 text-[16px] font-bold tracking-tight text-[#0f3a26]">Manage the platform</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <QuickCard icon={ClipboardList} title="Orders" body="Every product, lab, consult, and insurance order in one report." href="/admin/orders" ctaLabel="Open orders" />
            <QuickCard icon={CalendarDays} title="Bookings" body="Lab tests, consults, and insurance bookings with a section report." href="/admin/bookings" ctaLabel="Open bookings" />
            <QuickCard icon={Users} title="Members" body="Every end user. Activate, suspend, hold, or ban accounts." href="/admin/users" ctaLabel="Open members" />
            <QuickCard icon={Store} title="Vendor catalogue" body="Approve vendor listings and keep the live catalogue in shape." href="/admin/vendors" ctaLabel="Open catalogue" />
          </div>
        </section>
      </main>
    </>
  );
}

function AttentionCard({
  icon: Icon,
  count,
  label,
  cta,
  href,
  ready,
}: {
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  label: string;
  cta: string;
  href: string;
  ready: boolean;
}) {
  const has = (count ?? 0) > 0;
  return (
    <Link
      href={href}
      className={`group flex items-center gap-4 rounded-2xl bg-white p-5 ring-1 transition ${has ? "ring-[#c79a3d]/30 hover:ring-[#c79a3d]/50" : "ring-[#0f3a26]/8 hover:ring-[#006E42]/25"}`}
    >
      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${has ? "bg-[#c79a3d]/12 text-[#9c7426]" : "bg-[#006E42]/8 text-[#006E42]"}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-[26px] font-bold leading-none tabular-nums ${ready ? "text-[#0f3a26]" : "text-[#0f3a26]/30"}`}>
          {ready ? (count ?? 0) : "—"}
        </p>
        <p className="mt-1 text-[12px] text-[#0f3a26]/60">{label}</p>
      </div>
      <span className="inline-flex shrink-0 items-center gap-1 text-[12px] font-semibold text-[#006E42]">
        {cta}
        <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function StatusPill({ status }: { status: BlogPost["status"] }) {
  const map = {
    published: { bg: "bg-[#006E42]/10", fg: "text-[#006E42]", label: "Published" },
    draft: { bg: "bg-[#0f3a26]/8", fg: "text-[#0f3a26]/65", label: "Draft" },
    scheduled: { bg: "bg-[#c79a3d]/15", fg: "text-[#9c7426]", label: "Scheduled" },
  } as const;
  const s = map[status];
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider ${s.bg} ${s.fg}`}
    >
      {s.label}
    </span>
  );
}

function QuickCard({
  icon: Icon,
  title,
  body,
  href,
  ctaLabel,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  href: string;
  ctaLabel: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl bg-white p-5 ring-1 ring-[#0f3a26]/8">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#006E42]/8 text-[#006E42]">
        <Icon className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <p className="text-[14px] font-bold text-[#0f3a26]">{title}</p>
        <p className="mt-1 text-[12.5px] leading-relaxed text-[#0f3a26]/60">
          {body}
        </p>
      </div>
      <Link
        href={href}
        className="text-[12.5px] font-semibold text-[#006E42] hover:underline"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
