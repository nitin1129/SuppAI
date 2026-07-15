"use client";

import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { PublicPage } from "@/components/shell/PublicPage";
import { fetchBlogs } from "@/lib/admin/service";
import type { BlogPost } from "@/lib/admin/types";

export default function Page() {
  const [posts, setPosts] = useState<BlogPost[] | null>(null);

  useEffect(() => {
    fetchBlogs().then((all) => {
      const live = all
        .filter((b) => b.status === "published")
        .sort((a, b) => new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime());
      setPosts(live);
    });
  }, []);

  return (
    <PublicPage title="Blogs" subtitle="Practical, evidence-led reads on health, nutrition, and diagnostics.">
      {!posts ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-56 animate-pulse rounded-2xl bg-white ring-1 ring-[#0f3a26]/8" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="grid place-items-center rounded-2xl bg-white p-14 text-center shadow-[0_2px_4px_-2px_rgba(15,58,38,0.08),0_16px_36px_-20px_rgba(15,58,38,0.30)] ring-1 ring-[#0f3a26]/10">
          <p className="text-[15px] font-bold text-[#0f3a26]">No articles published yet</p>
          <p className="mt-1 text-[12.5px] text-[#0f3a26]/55">New posts appear here as soon as they go live.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {posts.map((p) => (
            <Link key={p.id} href={`/blog/${p.slug}`} className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_4px_-2px_rgba(15,58,38,0.08),0_16px_36px_-20px_rgba(15,58,38,0.30)] ring-1 ring-[#0f3a26]/10 transition hover:ring-[#006E42]/30">
              {p.coverImage && (
                <div className="relative h-40 overflow-hidden">
                  <span className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${p.coverImage})` }} aria-hidden />
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10.5px] font-semibold text-[#006E42] backdrop-blur">{p.category}</span>
                </div>
              )}
              <div className="flex flex-1 flex-col p-5">
                {!p.coverImage && <span className="mb-2 w-fit rounded-full bg-[#006E42]/8 px-2.5 py-1 text-[10.5px] font-semibold text-[#006E42]">{p.category}</span>}
                <h2 className="text-[15.5px] font-bold leading-snug text-[#0f3a26]">{p.title}</h2>
                <p className="mt-1.5 flex-1 text-[12.5px] leading-relaxed text-[#0f3a26]/60">{p.excerpt}</p>
                <div className="mt-4 flex items-center justify-between text-[11.5px]">
                  <span className="inline-flex items-center gap-1.5 text-[#0f3a26]/45">
                    <Clock className="h-3 w-3" />{p.readMinutes} min read
                    {p.publishedAt && <> · {new Date(p.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</>}
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#006E42]">Read<ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span>
                </div>
                <p className="mt-1 text-[10.5px] text-[#0f3a26]/40">{p.author} · {p.authorRole}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PublicPage>
  );
}
