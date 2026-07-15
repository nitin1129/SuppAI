"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { BlogForm } from "@/components/admin/forms/BlogForm";
import { fetchBlog } from "@/lib/admin/service";
import type { BlogPost } from "@/lib/admin/types";

export default function EditBlogPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;
  const [blog, setBlog] = useState<BlogPost | null | undefined>(undefined);

  useEffect(() => {
    if (!id) return;
    fetchBlog(id).then((b) => setBlog(b));
  }, [id]);

  if (blog === undefined) {
    return (
      <div className="grid flex-1 place-items-center text-[12.5px] text-[#0f3a26]/55">
        Loading post…
      </div>
    );
  }

  if (blog === null) {
    return (
      <div className="grid flex-1 place-items-center px-8 text-center">
        <div>
          <p className="text-[14px] font-bold text-[#0f3a26]">Post not found.</p>
          <button
            onClick={() => router.push("/admin/blogs")}
            className="mt-3 text-[12.5px] font-semibold text-[#006E42] hover:underline"
          >
            Back to all posts
          </button>
        </div>
      </div>
    );
  }

  return <BlogForm initial={blog} />;
}
