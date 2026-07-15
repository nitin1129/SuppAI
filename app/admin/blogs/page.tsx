"use client";

import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { deleteBlog, fetchBlogs } from "@/lib/admin/service";
import type { BlogPost } from "@/lib/admin/types";

type StatusFilter = "all" | BlogPost["status"];

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[] | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

  useEffect(() => {
    fetchBlogs().then(setBlogs);
  }, []);

  const filtered = useMemo(() => {
    if (!blogs) return [];
    return blogs.filter((b) => {
      if (status !== "all" && b.status !== status) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [blogs, query, status]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    await deleteBlog(id);
    setBlogs((cur) => (cur ? cur.filter((b) => b.id !== id) : cur));
  }

  return (
    <>
      <AdminTopbar
        title="Blog posts"
        subtitle="Write, edit, and publish editorial content."
        actions={
          <Link
            href="/admin/blogs/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#006E42] px-3.5 py-2 text-[12.5px] font-semibold text-white transition hover:bg-[#005634]"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={3} />
            New post
          </Link>
        }
      />

      <main className="no-scrollbar flex-1 overflow-y-auto px-8 py-7">
        {/* Toolbar */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-[13px] text-[#0f3a26]/55 ring-1 ring-[#0f3a26]/8 focus-within:ring-[#006E42]/40 md:w-80">
            <Search className="h-3.5 w-3.5 text-[#0f3a26]/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, author, tag…"
              className="w-full bg-transparent text-[#0f3a26] placeholder:text-[#0f3a26]/35 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {(["all", "published", "draft", "scheduled"] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`rounded-full px-3 py-1 text-[12px] font-medium capitalize transition ${
                  status === s
                    ? "bg-[#006E42] text-white"
                    : "bg-white text-[#0f3a26]/70 ring-1 ring-[#0f3a26]/8 hover:ring-[#006E42]/30"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#0f3a26]/8">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#0f3a26]/8 text-left text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#0f3a26]/45">
                <th className="px-5 py-3">Title</th>
                <th className="px-3 py-3">Author</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Views</th>
                <th className="px-3 py-3">Updated</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!blogs && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[12.5px] text-[#0f3a26]/55">
                    Loading posts…
                  </td>
                </tr>
              )}
              {blogs && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-[12.5px] text-[#0f3a26]/55">
                    No posts match your filters.
                  </td>
                </tr>
              )}
              {filtered.map((b) => (
                <tr key={b.id} className="border-b border-[#0f3a26]/6 last:border-b-0">
                  <td className="px-5 py-3.5">
                    <p className="text-[13px] font-semibold text-[#0f3a26]">{b.title}</p>
                    <p className="mt-0.5 text-[11px] text-[#0f3a26]/55">{b.category} · {b.tags.slice(0, 3).join(", ") || "no tags"}</p>
                  </td>
                  <td className="px-3 py-3.5">
                    <p className="text-[12.5px] text-[#0f3a26]">{b.author}</p>
                    <p className="text-[10.5px] text-[#0f3a26]/55">{b.authorRole}</p>
                  </td>
                  <td className="px-3 py-3.5"><StatusPill status={b.status} /></td>
                  <td className="px-3 py-3.5 text-[12.5px] tabular-nums text-[#0f3a26]">
                    {b.views.toLocaleString()}
                  </td>
                  <td className="px-3 py-3.5 text-[11.5px] text-[#0f3a26]/65">
                    {new Date(b.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Link
                        href={`/admin/blogs/${b.id}`}
                        className="grid h-8 w-8 place-items-center rounded-lg text-[#0f3a26]/65 transition hover:bg-[#006E42]/8 hover:text-[#006E42]"
                        aria-label="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-[#0f3a26]/65 transition hover:bg-[#c14040]/10 hover:text-[#c14040]"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
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
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${s.bg} ${s.fg}`}
    >
      {s.label}
    </span>
  );
}
