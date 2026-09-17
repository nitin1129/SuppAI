"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  EyeOff,
  Globe,
  Image as ImageIcon,
  Loader2,
  Plus,
  Save,
  Send,
  Tag,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { SeoPanel } from "@/components/admin/SeoPanel";
import { articleJsonLd, scoreBlogSeo } from "@/lib/admin/seo";
import { estimateRead, fetchBlogs, saveBlog, slugify } from "@/lib/admin/service";
import type { BlogPost, BlogStatus } from "@/lib/admin/types";

const EASE = [0.22, 1, 0.36, 1] as const;

type Props = {
  initial?: BlogPost;
};

type FormState = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImage: string;
  author: string;
  authorRole: string;
  category: string;
  tags: string[];
  status: BlogStatus;
  publishedAt: string;
  scheduledFor: string;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  keywords: string[];
  canonicalUrl: string;
  noIndex: boolean;
};

const EMPTY: FormState = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  coverImage: "",
  author: "",
  authorRole: "",
  category: "Nutrition",
  tags: [],
  status: "draft",
  publishedAt: "",
  scheduledFor: "",
  metaTitle: "",
  metaDescription: "",
  ogImage: "",
  keywords: [],
  canonicalUrl: "",
  noIndex: false,
};

function fromBlog(b: BlogPost): FormState {
  return {
    title: b.title,
    slug: b.slug,
    excerpt: b.excerpt,
    body: b.body,
    coverImage: b.coverImage,
    author: b.author,
    authorRole: b.authorRole,
    category: b.category,
    tags: b.tags,
    status: b.status,
    publishedAt: b.publishedAt?.slice(0, 16) ?? "",
    scheduledFor: b.scheduledFor?.slice(0, 16) ?? "",
    metaTitle: b.metaTitle,
    metaDescription: b.metaDescription,
    ogImage: b.ogImage,
    keywords: b.keywords,
    canonicalUrl: b.canonicalUrl ?? "",
    noIndex: b.noIndex,
  };
}

export function BlogForm({ initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(
    initial ? fromBlog(initial) : EMPTY,
  );
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [metaTitleTouched, setMetaTitleTouched] = useState(
    !!(initial && initial.metaTitle !== initial.title),
  );
  const [metaDescTouched, setMetaDescTouched] = useState(
    !!(initial && initial.metaDescription !== initial.excerpt),
  );
  const [ogTouched, setOgTouched] = useState(
    !!(initial && initial.ogImage !== initial.coverImage),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<null | BlogStatus>(null);
  const [savedToast, setSavedToast] = useState<string | null>(null);
  const [allBlogs, setAllBlogs] = useState<BlogPost[]>([]);

  useEffect(() => {
    fetchBlogs().then(setAllBlogs);
  }, []);

  // Auto-derivations
  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((s) => {
      const next = { ...s, [key]: value };
      if (key === "title") {
        const t = value as string;
        if (!slugTouched) next.slug = slugify(t);
        if (!metaTitleTouched) next.metaTitle = t;
      }
      if (key === "excerpt" && !metaDescTouched) {
        next.metaDescription = value as string;
      }
      if (key === "coverImage" && !ogTouched) {
        next.ogImage = value as string;
      }
      return next;
    });
  }

  const wordCount = useMemo(
    () => form.body.split(/\s+/).filter(Boolean).length,
    [form.body],
  );
  const readMin = useMemo(() => estimateRead(form.body), [form.body]);

  const seoReport = useMemo(
    () =>
      scoreBlogSeo({
        title: form.title,
        slug: form.slug,
        excerpt: form.excerpt,
        body: form.body,
        coverImage: form.coverImage,
        metaTitle: form.metaTitle,
        metaDescription: form.metaDescription,
        ogImage: form.ogImage,
        keywords: form.keywords,
        author: form.author,
        authorRole: form.authorRole,
      }),
    [form],
  );

  const jsonLd = useMemo(
    () =>
      articleJsonLd({
        title: form.metaTitle || form.title || "Untitled",
        slug: form.slug || "untitled",
        excerpt: form.excerpt,
        coverImage: form.coverImage,
        author: form.author || "Anonymous",
        authorRole: form.authorRole,
        publishedAt: form.publishedAt
          ? new Date(form.publishedAt).toISOString()
          : initial?.publishedAt,
        category: form.category,
        keywords: form.keywords,
        metaDescription: form.metaDescription,
        ogImage: form.ogImage,
        updatedAt: initial?.updatedAt,
      }),
    [form, initial?.publishedAt, initial?.updatedAt],
  );

  function validate(intent: BlogStatus): boolean {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Required.";
    if (!form.slug.trim()) e.slug = "Required.";
    else {
      const collides = allBlogs.some(
        (b) => b.slug === form.slug && b.id !== initial?.id,
      );
      if (collides) e.slug = "Slug already in use.";
    }
    if (!form.author.trim()) e.author = "Required.";
    if (!form.excerpt.trim()) e.excerpt = "Required (used in previews).";
    if (intent === "published" && !form.body.trim()) e.body = "Cannot publish empty.";
    if (intent === "scheduled" && !form.scheduledFor)
      e.scheduledFor = "Pick a date.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave(intent: BlogStatus) {
    if (!validate(intent)) return;
    setSaving(intent);
    try {
      const nowISO = new Date().toISOString();
      await saveBlog({
        id: initial?.id,
        title: form.title.trim(),
        slug: form.slug.trim(),
        excerpt: form.excerpt.trim(),
        body: form.body,
        coverImage: form.coverImage.trim(),
        author: form.author.trim(),
        authorRole: form.authorRole.trim(),
        category: form.category,
        tags: form.tags,
        status: intent,
        publishedAt:
          intent === "published"
            ? form.publishedAt
              ? new Date(form.publishedAt).toISOString()
              : nowISO
            : initial?.publishedAt,
        scheduledFor:
          intent === "scheduled" && form.scheduledFor
            ? new Date(form.scheduledFor).toISOString()
            : undefined,
        readMinutes: readMin,
        metaTitle: form.metaTitle.trim() || form.title.trim(),
        metaDescription: form.metaDescription.trim() || form.excerpt.trim(),
        ogImage: form.ogImage.trim() || form.coverImage.trim(),
        keywords: form.keywords,
        canonicalUrl: form.canonicalUrl.trim() || undefined,
        noIndex: form.noIndex,
      });
      setSavedToast(
        intent === "published"
          ? "Post published."
          : intent === "scheduled"
            ? "Post scheduled."
            : "Draft saved.",
      );
      setTimeout(() => router.push("/admin/blogs"), 600);
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Save failed." });
    } finally {
      setSaving(null);
    }
  }

  const isPublished = initial?.status === "published";

  return (
    <main className="no-scrollbar flex-1 overflow-y-auto bg-[#fbfdfb]">
      {/* Action bar */}
      <div className="sticky top-0 z-10 border-b border-[#0f3a26]/8 bg-[#fbfdfb]/90 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 px-8 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#0f3a26]/45">
              <span>{initial ? "Editing" : "New post"}</span>
              <span aria-hidden>·</span>
              <StatusPill status={form.status} />
              {initial && (
                <>
                  <span aria-hidden>·</span>
                  <span>
                    Updated{" "}
                    {new Date(initial.updatedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </>
              )}
            </div>
            <h1 className="mt-1 truncate text-[18px] font-bold tracking-tight text-[#0f3a26]">
              {form.title || "Untitled post"}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => router.push("/admin/blogs")}
              className="rounded-lg px-3 py-2 text-[12.5px] font-medium text-[#0f3a26]/65 transition hover:bg-[#0f3a26]/5"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSave("draft")}
              disabled={saving !== null}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-[12.5px] font-semibold text-[#0f3a26] ring-1 ring-inset ring-[#0f3a26]/10 transition hover:ring-[#006E42]/35 disabled:opacity-50"
            >
              {saving === "draft" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save draft
            </button>
            <button
              onClick={() => handleSave("published")}
              disabled={saving !== null}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#006E42] px-3.5 py-2 text-[12.5px] font-semibold text-white shadow-[0_8px_18px_-10px_rgba(0,110,66,0.55)] transition hover:bg-[#005634] disabled:opacity-50"
            >
              {saving === "published" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              {isPublished ? "Save & re-publish" : "Publish"}
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 gap-x-10 px-8 py-8 lg:grid-cols-[1fr_360px]">
        {/* Left: editor */}
        <div className="min-w-0">
          {errors.form && (
            <p className="mb-5 rounded-lg bg-[#c14040]/10 px-3 py-2 text-[12px] font-medium text-[#c14040] ring-1 ring-[#c14040]/20">
              {errors.form}
            </p>
          )}

          {/* Title + slug — primary identity */}
          <Section label="Identity">
            <FieldGroup>
              <Field label="Title" error={errors.title} required>
                <input
                  value={form.title}
                  onChange={(e) => patch("title", e.target.value)}
                  placeholder="A clear, scannable headline"
                  className={inputCls(!!errors.title)}
                />
              </Field>
              <Field label="URL slug" error={errors.slug} required>
                <div className="flex items-center gap-1 rounded-xl border border-[#0f3a26]/10 bg-white px-3.5 py-2.5 text-[14px] focus-within:border-[#006E42]/40 focus-within:ring-2 focus-within:ring-[#006E42]/15">
                  <span className="text-[#0f3a26]/45">/blog/</span>
                  <input
                    value={form.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      patch("slug", slugify(e.target.value));
                    }}
                    placeholder="auto-generated-from-title"
                    className="flex-1 bg-transparent text-[#0f3a26] placeholder:text-[#0f3a26]/35 focus:outline-none"
                  />
                </div>
              </Field>
            </FieldGroup>

            <Field
              label="Excerpt"
              hint="One or two sentences that summarise the post. Used in lists and as the SEO description default."
              error={errors.excerpt}
              required
            >
              <textarea
                value={form.excerpt}
                onChange={(e) => patch("excerpt", e.target.value)}
                placeholder="What will the reader take away from this post?"
                rows={3}
                className={`${inputCls(!!errors.excerpt)} resize-none leading-relaxed`}
              />
              <Hint right>{form.excerpt.length} / 220</Hint>
            </Field>
          </Section>

          {/* Body */}
          <Section label="Body" hint="Markdown is supported.">
            <Field label="Article body" error={errors.body}>
              <textarea
                value={form.body}
                onChange={(e) => patch("body", e.target.value)}
                placeholder="## Open strong, then unpack the idea…"
                rows={18}
                className={`${inputCls(!!errors.body)} resize-y font-[family-name:var(--font-sans)] leading-[1.7]`}
              />
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#0f3a26]/55">
                <span>
                  <Clock className="-mt-0.5 mr-1 inline h-3 w-3" />
                  {readMin} min read · {wordCount.toLocaleString()} words
                </span>
                <span>Markdown supported</span>
              </div>
            </Field>
          </Section>

          {/* Media */}
          <Section label="Media">
            <FieldGroup>
              <Field
                label="Cover image URL"
                hint="Used at the top of the post. Also defaults the OG image."
              >
                <input
                  value={form.coverImage}
                  onChange={(e) => patch("coverImage", e.target.value)}
                  placeholder="https://…"
                  className={inputCls(false)}
                />
              </Field>
            </FieldGroup>
            {form.coverImage && (
              <div className="mt-4 overflow-hidden rounded-xl bg-[#0f3a26]/[0.04] ring-1 ring-inset ring-[#0f3a26]/8">
                {/* eslint-disable-next-line @next/next/no-img-element -- previews an arbitrary URL or uploaded blob, which next/image cannot load */}
                <img
                  src={form.coverImage}
                  alt="Cover preview"
                  className="aspect-[5/3] w-full object-cover"
                  onError={(e) =>
                    ((e.target as HTMLImageElement).style.display = "none")
                  }
                />
              </div>
            )}
          </Section>

          {/* Authorship + Taxonomy */}
          <Section label="Authorship & taxonomy">
            <FieldGroup cols={2}>
              <Field label="Author" required error={errors.author}>
                <input
                  value={form.author}
                  onChange={(e) => patch("author", e.target.value)}
                  placeholder="Dr. Meera Nair"
                  className={inputCls(!!errors.author)}
                />
              </Field>
              <Field label="Author role">
                <input
                  value={form.authorRole}
                  onChange={(e) => patch("authorRole", e.target.value)}
                  placeholder="Clinical Nutritionist"
                  className={inputCls(false)}
                />
              </Field>
            </FieldGroup>
            <FieldGroup cols={2}>
              <Field label="Category">
                <select
                  value={form.category}
                  onChange={(e) => patch("category", e.target.value)}
                  className={inputCls(false)}
                >
                  {["Nutrition", "Performance", "Sleep", "Recovery", "Research", "Stories"].map(
                    (c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ),
                  )}
                </select>
              </Field>
              <Field label="Tags" hint="Press Enter or comma to add.">
                <ChipInput
                  values={form.tags}
                  onChange={(v) => patch("tags", v)}
                  placeholder="vitamin d, deficiency"
                />
              </Field>
            </FieldGroup>
          </Section>

          {/* Publishing */}
          <Section label="Publishing">
            <FieldGroup cols={3}>
              <Field label="Status">
                <select
                  value={form.status}
                  onChange={(e) =>
                    patch("status", e.target.value as BlogStatus)
                  }
                  className={inputCls(false)}
                >
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                </select>
              </Field>
              {form.status === "scheduled" && (
                <Field label="Scheduled for" error={errors.scheduledFor} required>
                  <input
                    type="datetime-local"
                    value={form.scheduledFor}
                    onChange={(e) => patch("scheduledFor", e.target.value)}
                    className={inputCls(!!errors.scheduledFor)}
                  />
                </Field>
              )}
              {form.status === "published" && (
                <Field label="Published at" hint="Override the publish timestamp.">
                  <input
                    type="datetime-local"
                    value={form.publishedAt}
                    onChange={(e) => patch("publishedAt", e.target.value)}
                    className={inputCls(false)}
                  />
                </Field>
              )}
              <Field label="Read time">
                <div className="rounded-xl border border-[#0f3a26]/10 bg-[#0f3a26]/[0.03] px-3.5 py-2.5 text-[14px] text-[#0f3a26]/65">
                  {readMin} min (auto)
                </div>
              </Field>
            </FieldGroup>
          </Section>

          {/* SEO */}
          <Section
            label="SEO & metadata"
            hint="What search engines and social platforms will see."
          >
            <Field
              label="Meta title"
              hint="Defaults to the post title. Keep under 60 characters."
            >
              <input
                value={form.metaTitle}
                onChange={(e) => {
                  setMetaTitleTouched(true);
                  patch("metaTitle", e.target.value);
                }}
                placeholder="Defaults to the post title"
                className={inputCls(false)}
              />
              <Hint right>{form.metaTitle.length} / 60</Hint>
            </Field>

            <Field
              label="Meta description"
              hint="Defaults to the excerpt. Keep under 160 characters."
            >
              <textarea
                value={form.metaDescription}
                onChange={(e) => {
                  setMetaDescTouched(true);
                  patch("metaDescription", e.target.value);
                }}
                rows={2}
                placeholder="Defaults to the excerpt"
                className={`${inputCls(false)} resize-none`}
              />
              <Hint right>{form.metaDescription.length} / 160</Hint>
            </Field>

            <FieldGroup cols={2}>
              <Field
                label="OG image URL"
                hint="Defaults to the cover image."
              >
                <input
                  value={form.ogImage}
                  onChange={(e) => {
                    setOgTouched(true);
                    patch("ogImage", e.target.value);
                  }}
                  placeholder="Defaults to cover image"
                  className={inputCls(false)}
                />
              </Field>
              <Field label="Canonical URL">
                <input
                  value={form.canonicalUrl}
                  onChange={(e) => patch("canonicalUrl", e.target.value)}
                  placeholder="https://… (if cross-posted)"
                  className={inputCls(false)}
                />
              </Field>
            </FieldGroup>

            <Field
              label="Keywords"
              hint="Comma-separated. Less critical than meta description for ranking."
            >
              <ChipInput
                values={form.keywords}
                onChange={(v) => patch("keywords", v)}
                placeholder="vitamin d, deficiency, supplements"
              />
            </Field>

            <label className="mt-4 flex items-start gap-2.5 text-[13px] text-[#0f3a26]/75">
              <input
                type="checkbox"
                checked={form.noIndex}
                onChange={(e) => patch("noIndex", e.target.checked)}
                className="mt-1 h-3.5 w-3.5 rounded border-[#0f3a26]/30 text-[#006E42] focus:ring-[#006E42]"
              />
              <span>
                <span className="font-semibold text-[#0f3a26]">
                  Hide from search engines
                </span>
                <br />
                <span className="text-[12px] text-[#0f3a26]/55">
                  Adds a {`<meta name="robots" content="noindex">`} tag.
                </span>
              </span>
            </label>
          </Section>
        </div>

        {/* Right: previews + status */}
        <aside className="mt-8 lg:mt-0">
          <div className="lg:sticky lg:top-24 lg:space-y-5">
            <SeoPanel report={seoReport} jsonLd={jsonLd} title="SEO health · Article schema" />

            <PreviewCard label="Google search preview">
              <SerpPreview
                title={form.metaTitle || form.title || "Untitled post"}
                slug={form.slug || "untitled"}
                description={
                  form.metaDescription ||
                  form.excerpt ||
                  "A preview of how this post appears in search."
                }
              />
            </PreviewCard>

            <PreviewCard label="Open Graph card">
              <OgPreview
                title={form.metaTitle || form.title || "Untitled post"}
                image={form.ogImage || form.coverImage}
                slug={form.slug || "untitled"}
                description={
                  form.metaDescription ||
                  form.excerpt ||
                  "Shared link preview on Twitter/LinkedIn/WhatsApp."
                }
              />
            </PreviewCard>

            <div className="rounded-xl bg-white p-4 ring-1 ring-inset ring-[#0f3a26]/8">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#0f3a26]/55">
                Quick stats
              </p>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-[12px]">
                <StatRow label="Read time" value={`${readMin} min`} />
                <StatRow label="Word count" value={wordCount.toLocaleString()} />
                <StatRow label="Views" value={(initial?.views ?? 0).toLocaleString()} />
                <StatRow label="Tags" value={form.tags.length.toString()} />
              </dl>
            </div>

            {form.noIndex && (
              <div className="flex items-start gap-2 rounded-xl bg-[#c79a3d]/15 p-3 text-[11.5px] text-[#9c7426] ring-1 ring-inset ring-[#c79a3d]/30">
                <EyeOff className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <p>
                  This post is hidden from search engines. Switch off the noindex
                  flag when ready to be discovered.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Save toast */}
      {savedToast && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-xl bg-[#0f3a26] px-4 py-2.5 text-[13px] font-semibold text-[#e6efe9] shadow-[0_18px_36px_-12px_rgba(15,58,38,0.4)]"
        >
          <CheckCircle2 className="h-4 w-4 text-[#9af2c4]" />
          {savedToast}
        </motion.div>
      )}
    </main>
  );
}

/* --------------------------- Layout helpers --------------------------- */

function Section({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-[#0f3a26]/8 py-8 first:pt-0 last:border-b-0">
      <div className="mb-5 max-w-prose">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#006E42]">
          {label}
        </p>
        {hint && (
          <p className="mt-1.5 text-[12.5px] text-[#0f3a26]/55">{hint}</p>
        )}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function FieldGroup({
  children,
  cols = 1,
}: {
  children: React.ReactNode;
  cols?: 1 | 2 | 3;
}) {
  const grid =
    cols === 3
      ? "grid grid-cols-1 gap-5 md:grid-cols-3"
      : cols === 2
        ? "grid grid-cols-1 gap-5 md:grid-cols-2"
        : "space-y-5";
  return <div className={grid}>{children}</div>;
}

function Field({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-baseline gap-1.5 text-[11.5px] font-medium text-[#0f3a26]">
        <span>{label}</span>
        {required && <span className="text-[#c14040]" aria-label="required">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1.5 text-[11px] text-[#0f3a26]/55">{hint}</p>
      )}
      {error && (
        <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-[#c14040]">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

function Hint({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: boolean;
}) {
  return (
    <p
      className={`mt-1.5 text-[10.5px] text-[#0f3a26]/45 ${right ? "text-right" : ""}`}
    >
      {children}
    </p>
  );
}

function inputCls(hasError: boolean) {
  return `w-full rounded-xl border bg-white px-3.5 py-2.5 text-[14px] text-[#0f3a26] placeholder:text-[#0f3a26]/30 focus:outline-none focus:ring-2 ${
    hasError
      ? "border-[#c14040]/50 focus:border-[#c14040] focus:ring-[#c14040]/15"
      : "border-[#0f3a26]/10 focus:border-[#006E42]/40 focus:ring-[#006E42]/15"
  }`;
}

function StatusPill({ status }: { status: BlogStatus }) {
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

/* --------------------------- Chip input --------------------------- */

function ChipInput({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [text, setText] = useState("");
  function add(raw: string) {
    const v = raw.trim().toLowerCase();
    if (!v || values.includes(v)) return;
    onChange([...values, v]);
    setText("");
  }
  function remove(v: string) {
    onChange(values.filter((x) => x !== v));
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-[#0f3a26]/10 bg-white px-2 py-1.5 focus-within:border-[#006E42]/40 focus-within:ring-2 focus-within:ring-[#006E42]/15">
      {values.map((v) => (
        <span
          key={v}
          className="inline-flex items-center gap-1 rounded-md bg-[#006E42]/8 px-2 py-0.5 text-[11.5px] font-medium text-[#006E42]"
        >
          <Tag className="h-2.5 w-2.5" />
          {v}
          <button
            type="button"
            onClick={() => remove(v)}
            aria-label={`Remove ${v}`}
            className="grid h-4 w-4 place-items-center rounded-sm text-[#006E42]/65 transition hover:bg-[#006E42]/15 hover:text-[#006E42]"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      ))}
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add(text);
          } else if (e.key === "Backspace" && text === "" && values.length) {
            onChange(values.slice(0, -1));
          }
        }}
        onBlur={() => text && add(text)}
        placeholder={values.length === 0 ? placeholder : ""}
        className="min-w-[120px] flex-1 bg-transparent px-1 py-1 text-[13px] text-[#0f3a26] placeholder:text-[#0f3a26]/30 focus:outline-none"
      />
      {text && (
        <button
          type="button"
          onClick={() => add(text)}
          className="inline-flex items-center gap-1 rounded-md bg-[#006E42]/10 px-2 py-0.5 text-[11px] font-semibold text-[#006E42]"
        >
          <Plus className="h-2.5 w-2.5" /> Add
        </button>
      )}
    </div>
  );
}

/* --------------------------- Previews --------------------------- */

function PreviewCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-inset ring-[#0f3a26]/8">
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#0f3a26]/55">
        {label}
      </p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function SerpPreview({
  title,
  slug,
  description,
}: {
  title: string;
  slug: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-[10.5px] text-[#0f3a26]/55">
        suppai.health <span className="mx-0.5">›</span> blog{" "}
        <span className="mx-0.5">›</span> {slug}
      </p>
      <p className="mt-1 line-clamp-2 text-[16px] leading-snug text-[#1a0dab]">
        {title.length > 60 ? title.slice(0, 57) + "…" : title}
      </p>
      <p className="mt-1 line-clamp-3 text-[12.5px] leading-snug text-[#0f3a26]/70">
        {description.length > 160
          ? description.slice(0, 157) + "…"
          : description}
      </p>
    </div>
  );
}

function OgPreview({
  title,
  image,
  slug,
  description,
}: {
  title: string;
  image?: string;
  slug: string;
  description: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg ring-1 ring-inset ring-[#0f3a26]/8">
      <div className="relative aspect-[1200/630] bg-[#0f3a26]/[0.04]">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- previews an arbitrary URL or uploaded blob, which next/image cannot load
          <img
            src={image}
            alt="OG preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center text-[#0f3a26]/35">
            <ImageIcon className="h-6 w-6" />
          </div>
        )}
      </div>
      <div className="bg-white px-3 py-2.5">
        <p className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#0f3a26]/45">
          <Globe className="h-2.5 w-2.5" />
          suppai.health/blog/{slug}
        </p>
        <p className="mt-1 line-clamp-2 text-[13px] font-semibold text-[#0f3a26]">
          {title}
        </p>
        <p className="mt-0.5 line-clamp-2 text-[11.5px] text-[#0f3a26]/60">
          {description}
        </p>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#0f3a26]/[0.03] px-3 py-2">
      <dt className="text-[10px] uppercase tracking-[0.14em] text-[#0f3a26]/45">
        {label}
      </dt>
      <dd className="mt-0.5 text-[14px] font-bold tabular-nums text-[#0f3a26]">
        {value}
      </dd>
    </div>
  );
}
