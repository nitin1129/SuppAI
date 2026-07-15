"use client";

import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Markdown } from "@/components/blog/Markdown";
import { PublicPage } from "@/components/shell/PublicPage";
import { fetchBlogs } from "@/lib/admin/service";
import type { BlogPost } from "@/lib/admin/types";

export default function BlogArticlePage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined);

  useEffect(() => {
    if (!slug) return;
    fetchBlogs().then((all) => {
      setPost(all.find((b) => b.slug === slug && b.status === "published") ?? null);
    });
  }, [slug]);

  if (post === undefined) {
    return (
      <PublicPage title="Loading article…">
        <div className="space-y-4">
          <div className="h-56 animate-pulse rounded-2xl bg-white ring-1 ring-[#0f3a26]/8" />
          <div className="h-4 w-2/3 animate-pulse rounded-full bg-[#0f3a26]/8" />
          <div className="h-4 w-full animate-pulse rounded-full bg-[#0f3a26]/8" />
          <div className="h-4 w-5/6 animate-pulse rounded-full bg-[#0f3a26]/8" />
        </div>
      </PublicPage>
    );
  }

  if (post === null) {
    return (
      <PublicPage title="Article not found" subtitle="This post may have been moved, or it is not published yet.">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#006E42] hover:underline">
          <ArrowLeft className="h-4 w-4" />Back to all articles
        </Link>
      </PublicPage>
    );
  }

  return (
    <PublicPage title={post.title} subtitle={post.excerpt}>
      {/* Byline */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-[#0f3a26]/8 pb-5 text-[12px] text-[#0f3a26]/55">
        <span className="rounded-full bg-[#006E42]/8 px-2.5 py-1 text-[10.5px] font-semibold text-[#006E42]">{post.category}</span>
        <span className="font-medium text-[#0f3a26]/75">{post.author}</span>
        {post.authorRole && <span className="text-[#0f3a26]/45">· {post.authorRole}</span>}
        {post.publishedAt && <span>· {new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>}
        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{post.readMinutes} min read</span>
      </div>

      {/* Cover */}
      {post.coverImage && (
        <div className="mt-6 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-[#0f3a26]/[0.04] ring-1 ring-inset ring-[#0f3a26]/8">
          <span className="block h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${post.coverImage})` }} aria-hidden />
        </div>
      )}

      {/* Body */}
      <article className="mt-8">
        <Markdown source={post.body} />
      </article>

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2 border-t border-[#0f3a26]/8 pt-6">
          {post.tags.map((t) => (
            <span key={t} className="rounded-full bg-[#f1f7f3] px-3 py-1 text-[11.5px] font-medium text-[#0f3a26]/65 ring-1 ring-inset ring-[#0f3a26]/[0.08]">#{t}</span>
          ))}
        </div>
      )}

      <div className="mt-8">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#006E42] hover:underline">
          <ArrowLeft className="h-4 w-4" />Back to all articles
        </Link>
      </div>
    </PublicPage>
  );
}
