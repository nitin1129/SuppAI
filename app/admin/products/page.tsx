"use client";

import { AlertCircle, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { deleteAdminProduct, fetchAdminProducts } from "@/lib/admin/service";
import type { AdminProduct } from "@/lib/admin/types";

const CATEGORY_LABELS: Record<string, string> = {
  vitamins: "Vitamins",
  performance: "Performance",
  ayurveda: "Ayurveda",
  omega: "Omega & Fats",
  plant: "Plant proteins",
  recovery: "Recovery",
  equipment: "Equipment",
  wearables: "Wearables",
};

type StatusFilter = "all" | AdminProduct["status"];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [category, setCategory] = useState<string>("all");

  useEffect(() => {
    fetchAdminProducts().then(setProducts);
  }, []);

  const categories = useMemo(() => {
    if (!products) return [];
    return Array.from(new Set(products.map((p) => p.categoryId)));
  }, [products]);

  const filtered = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (category !== "all" && p.categoryId !== category) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    });
  }, [products, query, status, category]);

  const lowStockCount = useMemo(
    () =>
      (products ?? []).filter((p) => p.stock <= p.lowStockThreshold && p.status === "active")
        .length,
    [products],
  );

  async function handleDelete(id: string) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    await deleteAdminProduct(id);
    setProducts((cur) => (cur ? cur.filter((p) => p.id !== id) : cur));
  }

  return (
    <>
      <AdminTopbar
        title="Products"
        subtitle={`${products?.length ?? 0} SKUs · ${lowStockCount} low stock`}
        actions={
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#006E42] px-3.5 py-2 text-[12.5px] font-semibold text-white transition hover:bg-[#005634]"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={3} />
            New product
          </Link>
        }
      />

      <main className="no-scrollbar flex-1 overflow-y-auto px-8 py-7">
        {/* Toolbar */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-[13px] text-[#0f3a26]/55 ring-1 ring-[#0f3a26]/8 focus-within:ring-[#006E42]/40 md:w-72">
            <Search className="h-3.5 w-3.5 text-[#0f3a26]/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, brand, SKU…"
              className="w-full bg-transparent text-[#0f3a26] placeholder:text-[#0f3a26]/35 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-full bg-white px-3 py-1 text-[12px] font-medium text-[#0f3a26]/75 ring-1 ring-[#0f3a26]/8 focus:outline-none focus:ring-[#006E42]/40"
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c] ?? c}
                </option>
              ))}
            </select>
            {(["all", "active", "draft", "archived", "out_of_stock"] as StatusFilter[]).map(
              (s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`rounded-full px-3 py-1 text-[12px] font-medium capitalize transition ${
                    status === s
                      ? "bg-[#006E42] text-white"
                      : "bg-white text-[#0f3a26]/70 ring-1 ring-[#0f3a26]/8 hover:ring-[#006E42]/30"
                  }`}
                >
                  {s.replace("_", " ")}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Grid */}
        {!products && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[180px] animate-pulse rounded-2xl bg-white ring-1 ring-[#0f3a26]/8"
              />
            ))}
          </div>
        )}

        {products && filtered.length === 0 && (
          <div className="grid place-items-center rounded-2xl bg-white p-12 text-center ring-1 ring-[#0f3a26]/8">
            <p className="text-[14px] font-bold text-[#0f3a26]">No products match.</p>
            <p className="mt-1 text-[12.5px] text-[#0f3a26]/55">
              Try a different category or status filter.
            </p>
          </div>
        )}

        {products && filtered.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProductRow key={p.id} p={p} onDelete={() => handleDelete(p.id)} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

function ProductRow({
  p,
  onDelete,
}: {
  p: AdminProduct;
  onDelete: () => void;
}) {
  const isLowStock = p.stock <= p.lowStockThreshold;
  const margin = p.price > 0 ? Math.round(((p.price - p.cost) / p.price) * 100) : 0;

  return (
    <article className="group overflow-hidden rounded-2xl bg-white ring-1 ring-[#0f3a26]/8 transition hover:ring-[#006E42]/35">
      <div className="flex gap-4 p-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#0f3a26]/[0.04] ring-1 ring-inset ring-[#0f3a26]/8">
          {p.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.coverImage}
              alt={p.name}
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0f3a26]/55">
                {p.brand}
              </p>
              <h3 className="mt-0.5 truncate text-[14px] font-bold text-[#0f3a26]">
                {p.name}
              </h3>
              <div className="mt-0.5 flex items-center gap-2">
                <p className="text-[10.5px] tabular-nums text-[#0f3a26]/45">SKU {p.sku}</p>
                {p.vendorName && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#006E42]/8 px-1.5 py-0.5 text-[9.5px] font-semibold text-[#006E42]">
                    Vendor · {p.vendorName}
                  </span>
                )}
              </div>
            </div>
            <StatusBadge status={p.status} />
          </div>

          <dl className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
            <div>
              <dt className="text-[9.5px] uppercase tracking-[0.12em] text-[#0f3a26]/45">
                Price
              </dt>
              <dd className="mt-0.5 text-[12.5px] font-bold tabular-nums text-[#0f3a26]">
                ₹{p.price.toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-[9.5px] uppercase tracking-[0.12em] text-[#0f3a26]/45">
                Margin
              </dt>
              <dd
                className={`mt-0.5 text-[12.5px] font-bold tabular-nums ${
                  margin >= 50 ? "text-[#006E42]" : "text-[#0f3a26]"
                }`}
              >
                {margin}%
              </dd>
            </div>
            <div>
              <dt className="text-[9.5px] uppercase tracking-[0.12em] text-[#0f3a26]/45">
                Stock
              </dt>
              <dd
                className={`mt-0.5 inline-flex items-center gap-1 text-[12.5px] font-bold tabular-nums ${
                  isLowStock ? "text-[#c14040]" : "text-[#0f3a26]"
                }`}
              >
                {isLowStock && <AlertCircle className="h-3 w-3" />}
                {p.stock}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#0f3a26]/6 bg-[#fbfdfb]/65 px-4 py-2.5">
        <p className="text-[10.5px] text-[#0f3a26]/55">
          Updated {new Date(p.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </p>
        <div className="flex items-center gap-1">
          <Link
            href={`/admin/products/${p.id}`}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11.5px] font-semibold text-[#006E42] transition hover:bg-[#006E42]/8"
            aria-label="Edit"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </Link>
          <button
            onClick={onDelete}
            className="grid h-7 w-7 place-items-center rounded-lg text-[#0f3a26]/55 transition hover:bg-[#c14040]/10 hover:text-[#c14040]"
            aria-label="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: AdminProduct["status"] }) {
  const map = {
    active: { bg: "bg-[#006E42]/10", fg: "text-[#006E42]", label: "Active" },
    draft: { bg: "bg-[#0f3a26]/8", fg: "text-[#0f3a26]/65", label: "Draft" },
    archived: { bg: "bg-[#0f3a26]/8", fg: "text-[#0f3a26]/45", label: "Archived" },
    out_of_stock: { bg: "bg-[#c14040]/10", fg: "text-[#c14040]", label: "OOS" },
  } as const;
  const s = map[status];
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider ${s.bg} ${s.fg}`}
    >
      {s.label}
    </span>
  );
}
