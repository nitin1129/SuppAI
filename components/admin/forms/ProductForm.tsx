"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  ImageIcon,
  Loader2,
  Plus,
  Save,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { SeoPanel } from "@/components/admin/SeoPanel";
import { productJsonLd, scoreProductSeo } from "@/lib/admin/seo";
import {
  fetchAdminProducts,
  saveAdminProduct,
  slugify,
} from "@/lib/admin/service";
import type { AdminProduct, ProductStatus } from "@/lib/admin/types";

const EASE = [0.22, 1, 0.36, 1] as const;

const CATEGORIES = [
  { id: "vitamins", label: "Vitamins" },
  { id: "performance", label: "Performance" },
  { id: "ayurveda", label: "Ayurveda" },
  { id: "omega", label: "Omega & Fats" },
  { id: "plant", label: "Plant proteins" },
  { id: "recovery", label: "Recovery" },
  { id: "equipment", label: "Equipment" },
  { id: "wearables", label: "Wearables" },
];

type Props = {
  initial?: AdminProduct;
};

type FormState = {
  name: string;
  slug: string;
  brand: string;
  categoryId: string;
  sku: string;
  description: string;
  longDescription: string;
  dosage: string;
  ingredients: string[];
  cost: number;
  mrp: number;
  price: number;
  taxPercent: number;
  stock: number;
  lowStockThreshold: number;
  coverImage: string;
  gallery: string[];
  tags: string[];
  badge: AdminProduct["badge"] | "";
  status: ProductStatus;
  isFeatured: boolean;
  subscribable: boolean;
  metaTitle: string;
  metaDescription: string;
};

const EMPTY: FormState = {
  name: "",
  slug: "",
  brand: "",
  categoryId: "vitamins",
  sku: "",
  description: "",
  longDescription: "",
  dosage: "",
  ingredients: [],
  cost: 0,
  mrp: 0,
  price: 0,
  taxPercent: 18,
  stock: 0,
  lowStockThreshold: 10,
  coverImage: "",
  gallery: [],
  tags: [],
  badge: "",
  status: "draft",
  isFeatured: false,
  subscribable: true,
  metaTitle: "",
  metaDescription: "",
};

function fromProduct(p: AdminProduct): FormState {
  return {
    name: p.name,
    slug: p.slug,
    brand: p.brand,
    categoryId: p.categoryId,
    sku: p.sku,
    description: p.description,
    longDescription: p.longDescription,
    dosage: p.dosage ?? "",
    ingredients: p.ingredients,
    cost: p.cost,
    mrp: p.mrp,
    price: p.price,
    taxPercent: p.taxPercent,
    stock: p.stock,
    lowStockThreshold: p.lowStockThreshold,
    coverImage: p.coverImage,
    gallery: p.gallery,
    tags: p.tags,
    badge: p.badge ?? "",
    status: p.status,
    isFeatured: p.isFeatured,
    subscribable: p.subscribable,
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
  };
}

export function ProductForm({ initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(
    initial ? fromProduct(initial) : EMPTY,
  );
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [metaTitleTouched, setMetaTitleTouched] = useState(
    !!(initial && initial.metaTitle !== initial.name),
  );
  const [metaDescTouched, setMetaDescTouched] = useState(
    !!(initial && initial.metaDescription !== initial.description),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<null | ProductStatus>(null);
  const [savedToast, setSavedToast] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<AdminProduct[]>([]);

  useEffect(() => {
    fetchAdminProducts().then(setAllProducts);
  }, []);

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((s) => {
      const next = { ...s, [key]: value };
      if (key === "name") {
        const n = value as string;
        if (!slugTouched) next.slug = slugify(n);
        if (!metaTitleTouched) next.metaTitle = n;
      }
      if (key === "description" && !metaDescTouched) {
        next.metaDescription = value as string;
      }
      return next;
    });
  }

  const margin = useMemo(() => {
    if (!form.price) return 0;
    return Math.round(((form.price - form.cost) / form.price) * 100);
  }, [form.price, form.cost]);

  const discountPct = useMemo(() => {
    if (!form.mrp) return 0;
    return Math.round(((form.mrp - form.price) / form.mrp) * 100);
  }, [form.mrp, form.price]);

  const seoReport = useMemo(
    () =>
      scoreProductSeo({
        name: form.name,
        slug: form.slug,
        brand: form.brand,
        sku: form.sku,
        description: form.description,
        longDescription: form.longDescription,
        coverImage: form.coverImage,
        gallery: form.gallery,
        metaTitle: form.metaTitle,
        metaDescription: form.metaDescription,
        price: form.price,
        stock: form.stock,
        tags: form.tags,
      }),
    [form],
  );

  const jsonLd = useMemo(
    () =>
      productJsonLd({
        name: form.name || "Untitled",
        slug: form.slug || "untitled",
        brand: form.brand,
        sku: form.sku,
        description: form.description,
        longDescription: form.longDescription,
        price: form.price,
        mrp: form.mrp,
        stock: form.stock,
        rating: initial?.rating ?? 0,
        reviews: initial?.reviews ?? 0,
        coverImage: form.coverImage,
        gallery: form.gallery,
        metaDescription: form.metaDescription,
      }),
    [form, initial?.rating, initial?.reviews],
  );

  function validate(intent: ProductStatus): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required.";
    if (!form.brand.trim()) e.brand = "Required.";
    if (!form.sku.trim()) e.sku = "Required.";
    else {
      const collides = allProducts.some(
        (p) => p.sku === form.sku && p.id !== initial?.id,
      );
      if (collides) e.sku = "SKU already in use.";
    }
    if (form.price <= 0) e.price = "Must be > 0.";
    if (form.cost < 0) e.cost = "Cannot be negative.";
    if (form.mrp < form.price) e.mrp = "MRP must be ≥ price.";
    if (intent === "active" && form.stock <= 0)
      e.stock = "Cannot publish with 0 stock. Mark as Out of stock instead.";
    if (intent === "active" && !form.coverImage)
      e.coverImage = "Required to go live.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave(intent: ProductStatus) {
    if (!validate(intent)) return;
    setSaving(intent);
    try {
      await saveAdminProduct({
        id: initial?.id,
        name: form.name.trim(),
        slug: form.slug.trim(),
        brand: form.brand.trim(),
        categoryId: form.categoryId,
        sku: form.sku.trim().toUpperCase(),
        description: form.description.trim(),
        longDescription: form.longDescription.trim(),
        dosage: form.dosage.trim() || undefined,
        ingredients: form.ingredients,
        cost: form.cost,
        mrp: form.mrp,
        price: form.price,
        taxPercent: form.taxPercent,
        stock: form.stock,
        lowStockThreshold: form.lowStockThreshold,
        coverImage: form.coverImage.trim(),
        gallery: form.gallery,
        tags: form.tags,
        badge: form.badge || undefined,
        status: intent,
        isFeatured: form.isFeatured,
        subscribable: form.subscribable,
        metaTitle: form.metaTitle.trim() || form.name.trim(),
        metaDescription: form.metaDescription.trim() || form.description.trim(),
      });
      setSavedToast(
        intent === "active"
          ? "Product live."
          : intent === "archived"
            ? "Product archived."
            : "Draft saved.",
      );
      setTimeout(() => router.push("/admin/products"), 600);
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Save failed." });
    } finally {
      setSaving(null);
    }
  }

  return (
    <main className="no-scrollbar flex-1 overflow-y-auto bg-[#fbfdfb]">
      {/* Action bar */}
      <div className="sticky top-0 z-10 border-b border-[#0f3a26]/8 bg-[#fbfdfb]/90 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 px-8 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#0f3a26]/45">
              <span>{initial ? "Editing" : "New product"}</span>
              <span aria-hidden>·</span>
              <StatusPill status={form.status} />
              {form.sku && (
                <>
                  <span aria-hidden>·</span>
                  <span className="tabular-nums">SKU {form.sku}</span>
                </>
              )}
            </div>
            <h1 className="mt-1 truncate text-[18px] font-bold tracking-tight text-[#0f3a26]">
              {form.name || "Untitled product"}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => router.push("/admin/products")}
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
              onClick={() => handleSave("active")}
              disabled={saving !== null}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#006E42] px-3.5 py-2 text-[12.5px] font-semibold text-white shadow-[0_8px_18px_-10px_rgba(0,110,66,0.55)] transition hover:bg-[#005634] disabled:opacity-50"
            >
              {saving === "active" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              {initial?.status === "active" ? "Save & relist" : "Go live"}
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 gap-x-10 px-8 py-8 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          {errors.form && (
            <p className="mb-5 rounded-lg bg-[#c14040]/10 px-3 py-2 text-[12px] font-medium text-[#c14040] ring-1 ring-[#c14040]/20">
              {errors.form}
            </p>
          )}

          {/* Identity */}
          <Section label="Identity">
            <FieldGroup cols={2}>
              <Field label="Product name" required error={errors.name}>
                <input
                  value={form.name}
                  onChange={(e) => patch("name", e.target.value)}
                  placeholder="Daily Multivitamin"
                  className={inputCls(!!errors.name)}
                />
              </Field>
              <Field label="Brand" required error={errors.brand}>
                <input
                  value={form.brand}
                  onChange={(e) => patch("brand", e.target.value)}
                  placeholder="Carbamide Forte"
                  className={inputCls(!!errors.brand)}
                />
              </Field>
            </FieldGroup>
            <FieldGroup cols={3}>
              <Field label="Category">
                <select
                  value={form.categoryId}
                  onChange={(e) => patch("categoryId", e.target.value)}
                  className={inputCls(false)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="SKU" required error={errors.sku}>
                <input
                  value={form.sku}
                  onChange={(e) => patch("sku", e.target.value.toUpperCase())}
                  placeholder="VIT-MULTI-30"
                  className={`${inputCls(!!errors.sku)} font-mono uppercase tracking-wider`}
                />
              </Field>
              <Field label="URL slug">
                <input
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    patch("slug", slugify(e.target.value));
                  }}
                  placeholder="auto from name"
                  className={inputCls(false)}
                />
              </Field>
            </FieldGroup>
            <Field
              label="Short description"
              hint="One line, used in product cards. Defaults the meta description."
            >
              <input
                value={form.description}
                onChange={(e) => patch("description", e.target.value)}
                placeholder="23 essential vitamins & minerals."
                className={inputCls(false)}
              />
              <Hint right>{form.description.length} / 120</Hint>
            </Field>
            <Field label="Long description">
              <textarea
                value={form.longDescription}
                onChange={(e) => patch("longDescription", e.target.value)}
                rows={5}
                placeholder="Tell the full story on the detail page."
                className={`${inputCls(false)} resize-y leading-relaxed`}
              />
            </Field>
          </Section>

          {/* Media */}
          <Section label="Media">
            <Field
              label="Cover image URL"
              required
              error={errors.coverImage}
              hint="The hero image on the product detail page."
            >
              <input
                value={form.coverImage}
                onChange={(e) => patch("coverImage", e.target.value)}
                placeholder="https://…"
                className={inputCls(!!errors.coverImage)}
              />
            </Field>
            <Field
              label="Gallery"
              hint="Up to 6 additional images. Enter URLs, one per line."
            >
              <GalleryInput
                values={form.gallery}
                onChange={(v) => patch("gallery", v)}
              />
            </Field>
          </Section>

          {/* Pricing */}
          <Section label="Pricing & tax">
            <FieldGroup cols={4}>
              <Field label="Vendor cost (₹)" error={errors.cost}>
                <input
                  type="number"
                  min={0}
                  value={form.cost}
                  onChange={(e) => patch("cost", Number(e.target.value))}
                  className={`${inputCls(!!errors.cost)} tabular-nums`}
                />
              </Field>
              <Field label="MRP (₹)" error={errors.mrp}>
                <input
                  type="number"
                  min={0}
                  value={form.mrp}
                  onChange={(e) => patch("mrp", Number(e.target.value))}
                  className={`${inputCls(!!errors.mrp)} tabular-nums`}
                />
              </Field>
              <Field label="Selling price (₹)" required error={errors.price}>
                <input
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => patch("price", Number(e.target.value))}
                  className={`${inputCls(!!errors.price)} tabular-nums`}
                />
              </Field>
              <Field label="GST (%)">
                <select
                  value={form.taxPercent}
                  onChange={(e) => patch("taxPercent", Number(e.target.value))}
                  className={`${inputCls(false)} tabular-nums`}
                >
                  {[0, 5, 12, 18, 28].map((t) => (
                    <option key={t} value={t}>
                      {t}%
                    </option>
                  ))}
                </select>
              </Field>
            </FieldGroup>
          </Section>

          {/* Inventory */}
          <Section label="Inventory">
            <FieldGroup cols={3}>
              <Field label="Stock on hand" error={errors.stock}>
                <input
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) => patch("stock", Number(e.target.value))}
                  className={`${inputCls(!!errors.stock)} tabular-nums`}
                />
              </Field>
              <Field label="Low-stock alert">
                <input
                  type="number"
                  min={0}
                  value={form.lowStockThreshold}
                  onChange={(e) =>
                    patch("lowStockThreshold", Number(e.target.value))
                  }
                  className={`${inputCls(false)} tabular-nums`}
                />
              </Field>
              <Field label="Subscribable">
                <label className="flex h-[42px] items-center gap-2.5 rounded-xl border border-[#0f3a26]/10 bg-white px-3.5">
                  <input
                    type="checkbox"
                    checked={form.subscribable}
                    onChange={(e) => patch("subscribable", e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-[#0f3a26]/30 text-[#006E42] focus:ring-[#006E42]"
                  />
                  <span className="text-[12.5px] text-[#0f3a26]">
                    Show Subscribe & Save
                  </span>
                </label>
              </Field>
            </FieldGroup>
          </Section>

          {/* Composition (medicines/supplements) */}
          <Section
            label="Composition"
            hint="Relevant for supplements and medicines. Skip for equipment / wearables."
          >
            <Field label="Dosage">
              <input
                value={form.dosage}
                onChange={(e) => patch("dosage", e.target.value)}
                placeholder="1 tablet daily, after meal."
                className={inputCls(false)}
              />
            </Field>
            <Field label="Ingredients" hint="Enter and press Add to push to the list.">
              <ChipInput
                values={form.ingredients}
                onChange={(v) => patch("ingredients", v)}
                placeholder="Vitamin A, B-Complex…"
              />
            </Field>
          </Section>

          {/* Discovery */}
          <Section label="Discovery">
            <FieldGroup cols={2}>
              <Field label="Badge">
                <select
                  value={form.badge}
                  onChange={(e) =>
                    patch("badge", e.target.value as FormState["badge"])
                  }
                  className={inputCls(false)}
                >
                  <option value="">None</option>
                  <option value="Bestseller">Bestseller</option>
                  <option value="New">New</option>
                  <option value="Editor's pick">Editor&apos;s pick</option>
                </select>
              </Field>
              <Field label="Featured on homepage">
                <label className="flex h-[42px] items-center gap-2.5 rounded-xl border border-[#0f3a26]/10 bg-white px-3.5">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => patch("isFeatured", e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-[#0f3a26]/30 text-[#006E42] focus:ring-[#006E42]"
                  />
                  <span className="text-[12.5px] text-[#0f3a26]">
                    Show in featured row
                  </span>
                </label>
              </Field>
            </FieldGroup>
            <Field label="Tags" hint="Surfaced as quick filters and chips on the card.">
              <ChipInput
                values={form.tags}
                onChange={(v) => patch("tags", v)}
                placeholder="Daily, Adult"
              />
            </Field>
          </Section>

          {/* SEO */}
          <Section label="SEO">
            <Field label="Meta title" hint="Defaults to product name. Under 60 chars.">
              <input
                value={form.metaTitle}
                onChange={(e) => {
                  setMetaTitleTouched(true);
                  patch("metaTitle", e.target.value);
                }}
                placeholder="Defaults to product name"
                className={inputCls(false)}
              />
              <Hint right>{form.metaTitle.length} / 60</Hint>
            </Field>
            <Field
              label="Meta description"
              hint="Defaults to short description. Under 160 chars."
            >
              <textarea
                value={form.metaDescription}
                onChange={(e) => {
                  setMetaDescTouched(true);
                  patch("metaDescription", e.target.value);
                }}
                rows={2}
                placeholder="Defaults to short description"
                className={`${inputCls(false)} resize-none`}
              />
              <Hint right>{form.metaDescription.length} / 160</Hint>
            </Field>
          </Section>
        </div>

        {/* Right rail: live pricing + inventory summary */}
        <aside className="mt-8 lg:mt-0">
          <div className="lg:sticky lg:top-24 lg:space-y-5">
            <SeoPanel report={seoReport} jsonLd={jsonLd} title="SEO health · Product schema" />

            <div className="rounded-xl bg-white p-4 ring-1 ring-inset ring-[#0f3a26]/8">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#0f3a26]/55">
                Pricing summary
              </p>
              <dl className="mt-3 space-y-2.5 text-[12px]">
                <Row label="Sells at" value={`₹${form.price.toLocaleString()}`} bold />
                <Row label="MRP" value={`₹${form.mrp.toLocaleString()}`} />
                <Row
                  label="Customer save"
                  value={`${discountPct}%`}
                  tone={discountPct > 0 ? "good" : "muted"}
                />
                <hr className="border-[#0f3a26]/8" />
                <Row label="Vendor cost" value={`₹${form.cost.toLocaleString()}`} />
                <Row
                  label="Margin"
                  value={`${margin}%`}
                  tone={margin >= 50 ? "good" : margin >= 30 ? "muted" : "warn"}
                  bold
                />
                <Row label="GST" value={`${form.taxPercent}%`} />
              </dl>
            </div>

            <div className="rounded-xl bg-white p-4 ring-1 ring-inset ring-[#0f3a26]/8">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#0f3a26]/55">
                Inventory
              </p>
              <p className="mt-3 text-[26px] font-bold leading-none tabular-nums text-[#0f3a26]">
                {form.stock.toLocaleString()}
              </p>
              <p className="mt-1 text-[11px] text-[#0f3a26]/55">units in stock</p>
              {form.stock > 0 && form.stock <= form.lowStockThreshold && (
                <p className="mt-3 inline-flex items-center gap-1 rounded-lg bg-[#c79a3d]/15 px-2 py-1 text-[10.5px] font-semibold text-[#9c7426]">
                  <AlertCircle className="h-3 w-3" />
                  Below threshold ({form.lowStockThreshold})
                </p>
              )}
              {form.stock === 0 && (
                <p className="mt-3 inline-flex items-center gap-1 rounded-lg bg-[#c14040]/10 px-2 py-1 text-[10.5px] font-semibold text-[#c14040]">
                  <AlertCircle className="h-3 w-3" />
                  Out of stock
                </p>
              )}
            </div>

            {form.coverImage && (
              <div className="overflow-hidden rounded-xl bg-white ring-1 ring-inset ring-[#0f3a26]/8">
                <p className="px-4 pt-4 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#0f3a26]/55">
                  Cover preview
                </p>
                <div className="mt-3 aspect-[4/3] bg-[#0f3a26]/[0.04]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.coverImage}
                    alt="Cover preview"
                    className="h-full w-full object-cover"
                    onError={(e) =>
                      ((e.target as HTMLImageElement).style.display = "none")
                    }
                  />
                </div>
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
  cols?: 1 | 2 | 3 | 4;
}) {
  const grid =
    cols === 4
      ? "grid grid-cols-2 gap-5 md:grid-cols-4"
      : cols === 3
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

function StatusPill({ status }: { status: ProductStatus }) {
  const map = {
    active: { bg: "bg-[#006E42]/10", fg: "text-[#006E42]", label: "Active" },
    draft: { bg: "bg-[#0f3a26]/8", fg: "text-[#0f3a26]/65", label: "Draft" },
    archived: { bg: "bg-[#0f3a26]/8", fg: "text-[#0f3a26]/45", label: "Archived" },
    out_of_stock: { bg: "bg-[#c14040]/10", fg: "text-[#c14040]", label: "OOS" },
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

function Row({
  label,
  value,
  bold,
  tone = "default",
}: {
  label: string;
  value: string;
  bold?: boolean;
  tone?: "default" | "good" | "warn" | "muted";
}) {
  const toneCls =
    tone === "good"
      ? "text-[#006E42]"
      : tone === "warn"
        ? "text-[#c14040]"
        : tone === "muted"
          ? "text-[#0f3a26]/45"
          : "text-[#0f3a26]";
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-[#0f3a26]/65">{label}</dt>
      <dd
        className={`tabular-nums ${toneCls} ${bold ? "text-[14px] font-bold" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

/* --------------------------- Chip + Gallery --------------------------- */

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
    const v = raw.trim();
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

function GalleryInput({
  values,
  onChange,
}: {
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  function add() {
    const v = draft.trim();
    if (!v || values.includes(v) || values.length >= 6) return;
    onChange([...values, v]);
    setDraft("");
  }
  function remove(i: number) {
    onChange(values.filter((_, idx) => idx !== i));
  }
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {values.map((src, i) => (
          <div
            key={src}
            className="group relative aspect-square overflow-hidden rounded-lg bg-[#0f3a26]/[0.04] ring-1 ring-inset ring-[#0f3a26]/8"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label="Remove"
              className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-md bg-white/90 text-[#0f3a26]/65 opacity-0 transition group-hover:opacity-100 hover:text-[#c14040]"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
        {values.length < 6 && (
          <div className="grid aspect-square place-items-center rounded-lg border border-dashed border-[#0f3a26]/15 text-[#0f3a26]/35">
            <ImageIcon className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="https://… and press Add"
          className={inputCls(false)}
        />
        <button
          type="button"
          onClick={add}
          disabled={!draft.trim() || values.length >= 6}
          className="shrink-0 rounded-xl bg-white px-3 py-2 text-[12.5px] font-semibold text-[#0f3a26] ring-1 ring-inset ring-[#0f3a26]/10 transition hover:ring-[#006E42]/35 disabled:opacity-50"
        >
          Add image
        </button>
      </div>
      <p className="text-[10.5px] text-[#0f3a26]/45">
        {values.length} / 6 images
      </p>
    </div>
  );
}
