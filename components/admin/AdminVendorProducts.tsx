"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronRight, Inbox, Loader2, MessageSquare, PackageCheck, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { saveAdminProduct } from "@/lib/admin/service";
import {
  type ListingStatus,
  type VendorProduct,
  approveListing,
  effectivePrice,
  fetchAllVendorProducts,
  marginPct,
  rejectListing,
  requestChanges,
} from "@/lib/vendor/service";

const ADMIN_CATEGORIES = [
  { id: "vitamins", label: "Vitamins" },
  { id: "performance", label: "Performance" },
  { id: "ayurveda", label: "Ayurveda" },
  { id: "omega", label: "Omega & Fats" },
  { id: "plant", label: "Plant proteins" },
  { id: "recovery", label: "Recovery" },
  { id: "equipment", label: "Equipment" },
  { id: "wearables", label: "Wearables" },
];
const CATEGORY_GUESS: Record<string, string> = {
  Supplements: "vitamins", "Medicines / Pharma": "recovery", "Medical devices": "equipment",
  Diagnostics: "equipment", Consumables: "recovery", Equipment: "equipment", Other: "vitamins",
};
const LISTING_META: Record<ListingStatus, { label: string; cls: string }> = {
  pending: { label: "Awaiting review", cls: "bg-[#c79a3d]/14 text-[#9c7426]" },
  changes_requested: { label: "Changes requested", cls: "bg-[#c79a3d]/14 text-[#9c7426]" },
  listed: { label: "Listed", cls: "bg-[#006E42]/10 text-[#006E42]" },
  rejected: { label: "Rejected", cls: "bg-[#c14040]/10 text-[#c14040]" },
};
function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function AdminVendorProducts() {
  const [products, setProducts] = useState<VendorProduct[] | null>(null);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => { fetchAllVendorProducts().then(setProducts); }, []);

  const pending = useMemo(() => (products ?? []).filter((p) => p.listing === "pending"), [products]);
  const live = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (products ?? []).filter((p) => p.listing === "listed").filter((p) => !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
  }, [products, query]);
  const selected = products?.find((p) => p.id === selectedId) ?? null;

  return (
    <>
      <AdminTopbar title="Vendor catalogue" subtitle="Click a product to review it, then approve, request changes, or reject." />

      <main className="no-scrollbar flex-1 overflow-y-auto px-8 py-7">
        {/* Pending */}
        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-[14px] font-bold tracking-tight text-[#0f3a26]">Listing requests</h2>
            <span className="rounded-full bg-[#c79a3d]/14 px-2 py-0.5 text-[11px] font-semibold text-[#9c7426]">{pending.length} pending</span>
          </div>
          {!products ? (
            <div className="h-32 animate-pulse rounded-2xl bg-white ring-1 ring-[#0f3a26]/8" />
          ) : pending.length === 0 ? (
            <div className="grid place-items-center rounded-2xl bg-white p-10 text-center ring-1 ring-[#0f3a26]/8">
              <Inbox className="h-6 w-6 text-[#0f3a26]/30" />
              <p className="mt-2 text-[13px] font-semibold text-[#0f3a26]">No requests waiting</p>
            </div>
          ) : (
            <ul className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#0f3a26]/8">
              {pending.map((p, i) => <Row key={p.id} p={p} first={i === 0} onOpen={() => setSelectedId(p.id)} />)}
            </ul>
          )}
        </section>

        {/* Live */}
        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[14px] font-bold tracking-tight text-[#0f3a26]">Live vendor products <span className="ml-1 text-[12px] font-medium text-[#0f3a26]/45">({live.length})</span></h2>
            <div className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-[13px] text-[#0f3a26]/55 ring-1 ring-[#0f3a26]/8 focus-within:ring-[#006E42]/40 md:w-72">
              <Search className="h-3.5 w-3.5 text-[#0f3a26]/40" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search product or brand…" className="w-full bg-transparent text-[#0f3a26] placeholder:text-[#0f3a26]/35 focus:outline-none" />
            </div>
          </div>
          {!products ? (
            <div className="h-40 animate-pulse rounded-2xl bg-white ring-1 ring-[#0f3a26]/8" />
          ) : live.length === 0 ? (
            <div className="grid place-items-center rounded-2xl bg-white p-10 text-center ring-1 ring-[#0f3a26]/8">
              <PackageCheck className="h-6 w-6 text-[#0f3a26]/30" />
              <p className="mt-2 text-[13px] font-semibold text-[#0f3a26]">Nothing listed yet</p>
            </div>
          ) : (
            <ul className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#0f3a26]/8">
              {live.map((p, i) => <Row key={p.id} p={p} first={i === 0} onOpen={() => setSelectedId(p.id)} />)}
            </ul>
          )}
        </section>
      </main>

      <ReviewDrawer product={selected} onClose={() => setSelectedId(null)} onUpdate={setProducts} />
    </>
  );
}

function Row({ p, first, onOpen }: { p: VendorProduct; first: boolean; onOpen: () => void }) {
  const meta = LISTING_META[p.listing];
  return (
    <li>
      <button onClick={onOpen} className={`flex w-full items-center gap-4 px-4 py-3 text-left transition hover:bg-[#0f3a26]/[0.02] ${first ? "" : "border-t border-[#0f3a26]/6"}`}>
        <span className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-[#0f3a26]/[0.04] ring-1 ring-inset ring-[#0f3a26]/8">
          {p.coverImage && <span className="block h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${p.coverImage})` }} aria-hidden />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-[13px] font-semibold text-[#0f3a26]">{p.name}</p>
            {p.stock === "out_of_stock" && <span className="rounded-full bg-[#c14040]/10 px-2 py-0.5 text-[10px] font-semibold text-[#c14040]">Out of stock</span>}
          </div>
          <p className="mt-0.5 text-[10.5px] text-[#0f3a26]/50">{p.brand} · {p.vendorName} · Margin {marginPct(p)}%</p>
        </div>
        <span className={`hidden rounded-full px-2 py-0.5 text-[10px] font-semibold sm:inline ${meta.cls}`}>{meta.label}</span>
        <span className="w-24 text-right text-[13px] font-bold tabular-nums text-[#0f3a26]">₹{p.price.toLocaleString()}</span>
        <ChevronRight className="h-4 w-4 shrink-0 text-[#0f3a26]/30" />
      </button>
    </li>
  );
}

function ReviewDrawer({ product, onClose, onUpdate }: { product: VendorProduct | null; onClose: () => void; onUpdate: (list: VendorProduct[]) => void }) {
  const reduce = useReducedMotion();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [mode, setMode] = useState<null | "approve" | "reject" | "changes">(null);
  const [note, setNote] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("vitamins");
  const [badge, setBadge] = useState("");
  const [featured, setFeatured] = useState(false);
  const [hero, setHero] = useState(0);

  // Reset the review form for each product opened.
  const [seenProduct, setSeenProduct] = useState<typeof product>(null);
  if (product && product !== seenProduct) {
    setSeenProduct(product);
    setMode(null); setNote(""); setSku(""); setBadge(""); setFeatured(false); setHero(0); setErr(null);
    setCategoryId(CATEGORY_GUESS[product.category] ?? "vitamins");
  }

  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [product, onClose]);

  if (!product) return <AnimatePresence />;
  const p = product;
  const images = [p.coverImage, ...(p.gallery ?? [])].filter(Boolean);
  const eff = effectivePrice(p);
  const totalImages = images.length;
  const isPending = p.listing === "pending";
  const missing: string[] = [];
  if (!p.coverImage) missing.push("cover image");
  if (totalImages < 3) missing.push(`${3 - totalImages} more image${3 - totalImages === 1 ? "" : "s"}`);
  if (!p.description) missing.push("description");
  if (p.price <= 0) missing.push("price");

  async function publish() {
    if (!sku.trim() || busy) return;
    setBusy(true);
    setErr(null);
    try {
      await saveAdminProduct({
        name: p.name, brand: p.brand, categoryId, slug: slugify(p.name), sku: sku.trim().toUpperCase(),
        description: p.description, longDescription: p.longDescription, dosage: p.dosage, ingredients: p.ingredients,
        cost: p.supplyCost, mrp: p.mrp, price: eff, taxPercent: p.gstPct, stock: p.stockQty, lowStockThreshold: 10,
        coverImage: p.coverImage, gallery: p.gallery, tags: p.tags, badge: (badge || undefined) as never,
        status: "active", isFeatured: featured, subscribable: true, vendorId: p.vendorId, vendorName: p.vendorName,
      });
      onUpdate(await approveListing(p.id));
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not publish this product. Try again.");
    } finally {
      setBusy(false);
    }
  }
  async function reject() {
    setBusy(true);
    setErr(null);
    try { onUpdate(await rejectListing(p.id, note.trim() || "Does not meet listing requirements.")); onClose(); }
    catch (e) { setErr(e instanceof Error ? e.message : "Could not reject. Try again."); }
    finally { setBusy(false); }
  }
  async function changes() {
    setBusy(true);
    setErr(null);
    try { onUpdate(await requestChanges(p.id, note.trim() || "Please update the product and resubmit.")); onClose(); }
    catch (e) { setErr(e instanceof Error ? e.message : "Could not send feedback. Try again."); }
    finally { setBusy(false); }
  }

  const meta = LISTING_META[p.listing];

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
        <div className="absolute inset-0 bg-[#0c1614]/35" onClick={onClose} aria-hidden />
        <motion.aside
          role="dialog" aria-modal="true" aria-label={p.name}
          className="relative flex h-full w-full max-w-[480px] flex-col bg-[#fbfdfb] shadow-2xl"
          initial={reduce ? false : { x: 44, opacity: 0.6 }} animate={{ x: 0, opacity: 1 }} exit={reduce ? { opacity: 0 } : { x: 44, opacity: 0 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* header */}
          <div className="flex items-start gap-3 border-b border-[#0f3a26]/8 p-5">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-[15px] font-bold text-[#0f3a26]">{p.name}</p>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.cls}`}>{meta.label}</span>
              </div>
              <p className="mt-0.5 text-[11.5px] text-[#0f3a26]/55">{p.brand} · {p.vendorName}</p>
            </div>
            <button onClick={onClose} aria-label="Close" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#0f3a26]/50 transition hover:bg-[#0f3a26]/6 hover:text-[#0f3a26]"><X className="h-4 w-4" /></button>
          </div>

          <div className="no-scrollbar flex-1 overflow-y-auto p-5">
            {/* gallery */}
            <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#0f3a26]/[0.04] ring-1 ring-inset ring-[#0f3a26]/8">
              {images[hero] ? <span className="block h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${images[hero]})` }} aria-hidden /> : <span className="grid h-full w-full place-items-center text-[12px] text-[#c14040]">No image</span>}
            </div>
            {images.length > 1 && (
              <div className="mt-2 grid grid-cols-5 gap-2">
                {images.map((src, i) => (
                  <button key={i} onClick={() => setHero(i)} className={`aspect-square overflow-hidden rounded-lg bg-cover bg-center ring-2 ${i === hero ? "ring-[#006E42]" : "ring-transparent"}`} style={{ backgroundImage: `url(${src})` }} aria-label={`Image ${i + 1}`} />
                ))}
              </div>
            )}
            <p className="mt-2 text-[11px] text-[#0f3a26]/45">{totalImages} image{totalImages === 1 ? "" : "s"}</p>

            {/* details */}
            <div className="mt-4 space-y-3">
              {p.description && <p className="text-[13px] leading-relaxed text-[#0f3a26]/75">{p.description}</p>}
              {p.longDescription && <p className="text-[12px] leading-relaxed text-[#0f3a26]/60">{p.longDescription}</p>}
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl bg-[#f1f7f3] p-3.5 text-[12px] ring-1 ring-inset ring-[#0f3a26]/[0.08]">
                <Info k="Category" v={p.category} /><Info k="HSN" v={p.hsn ?? "—"} />
                <Info k="MRP" v={`₹${p.mrp.toLocaleString()}`} /><Info k="Supply cost" v={`₹${p.supplyCost.toLocaleString()}`} />
                <Info k="Sells at" v={`₹${p.price.toLocaleString()}`} /><Info k="Margin" v={`${marginPct(p)}%`} />
                <Info k="Discount" v={p.discountPct > 0 ? `${p.discountPct}% → ₹${eff.toLocaleString()}` : "None"} /><Info k="GST" v={`${p.gstPct}%`} />
                <Info k="Stock" v={String(p.stockQty)} /><Info k="MOQ" v={String(p.moq)} />
                <Info k="Lead time" v={`${p.leadTimeDays} days`} />
              </dl>
              {(p.ingredients?.length ?? 0) > 0 && <p className="text-[11.5px] text-[#0f3a26]/60"><b className="text-[#0f3a26]/75">Ingredients:</b> {p.ingredients.join(", ")}</p>}
              {(p.tags?.length ?? 0) > 0 && <div className="flex flex-wrap gap-1.5">{p.tags.map((t) => <span key={t} className="rounded-full bg-[#0f3a26]/6 px-2 py-0.5 text-[10.5px] font-medium text-[#0f3a26]/60">{t}</span>)}</div>}
              {missing.length > 0 && <p className="inline-flex items-center gap-1.5 rounded-lg bg-[#c14040]/8 px-2.5 py-1 text-[11px] font-medium text-[#c14040]">Missing: {missing.join(", ")}</p>}
              {p.note && !isPending && <p className={`rounded-lg px-3 py-2 text-[11.5px] font-medium ${p.listing === "rejected" ? "bg-[#c14040]/8 text-[#c14040]" : "bg-[#c79a3d]/10 text-[#9c7426]"}`}>{p.listing === "rejected" ? "Rejected: " : "Feedback sent: "}{p.note}</p>}
            </div>
          </div>

          {/* actions (pending only) */}
          {isPending && (
            <div className="border-t border-[#0f3a26]/8 p-4">
              {err && <p role="alert" className="mb-2.5 rounded-lg bg-[#c14040]/8 px-3 py-2 text-[11.5px] font-medium text-[#c14040] ring-1 ring-inset ring-[#c14040]/20">{err}</p>}
              {mode === null && (
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={() => setMode("approve")} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#006E42] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#005634]"><Check className="h-4 w-4" />Approve</button>
                  <button onClick={() => setMode("changes")} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2.5 text-[12.5px] font-semibold text-[#9c7426] ring-1 ring-inset ring-[#c79a3d]/30 transition hover:bg-[#c79a3d]/8"><MessageSquare className="h-3.5 w-3.5" />Changes</button>
                  <button onClick={() => setMode("reject")} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2.5 text-[12.5px] font-semibold text-[#c14040] ring-1 ring-inset ring-[#c14040]/25 transition hover:bg-[#c14040]/6"><X className="h-3.5 w-3.5" />Reject</button>
                </div>
              )}

              {mode === "approve" && (
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#006E42]">Finish & publish</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <label className="block"><span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#0f3a26]/50">SKU *</span>
                      <input value={sku} onChange={(e) => setSku(e.target.value.toUpperCase())} placeholder="VEN-WHEY-01" className="w-full rounded-lg border border-[#0f3a26]/12 bg-white px-2.5 py-1.5 font-mono text-[12.5px] uppercase text-[#0f3a26] focus:border-[#006E42]/40 focus:outline-none focus:ring-2 focus:ring-[#006E42]/15" /></label>
                    <label className="block"><span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#0f3a26]/50">Category</span>
                      <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full rounded-lg border border-[#0f3a26]/12 bg-white px-2.5 py-1.5 text-[12.5px] text-[#0f3a26] focus:border-[#006E42]/40 focus:outline-none">{ADMIN_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select></label>
                    <label className="block"><span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#0f3a26]/50">Badge</span>
                      <select value={badge} onChange={(e) => setBadge(e.target.value)} className="w-full rounded-lg border border-[#0f3a26]/12 bg-white px-2.5 py-1.5 text-[12.5px] text-[#0f3a26] focus:border-[#006E42]/40 focus:outline-none"><option value="">None</option><option>Bestseller</option><option>New</option><option>Editor&apos;s pick</option></select></label>
                    <label className="flex items-end gap-2 pb-1.5"><input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-3.5 w-3.5 rounded border-[#0f3a26]/30 text-[#006E42] focus:ring-[#006E42]" /><span className="text-[12px] text-[#0f3a26]">Feature</span></label>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={publish} disabled={!sku.trim() || busy} className="inline-flex items-center gap-1.5 rounded-lg bg-[#006E42] px-3.5 py-2 text-[12.5px] font-semibold text-white transition hover:bg-[#005634] disabled:opacity-50">{busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PackageCheck className="h-3.5 w-3.5" />}Publish to catalogue</button>
                    <button onClick={() => setMode(null)} className="rounded-lg px-3 py-2 text-[12px] font-medium text-[#0f3a26]/55 hover:bg-[#0f3a26]/5">Back</button>
                  </div>
                </div>
              )}

              {(mode === "changes" || mode === "reject") && (
                <div>
                  <p className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] ${mode === "reject" ? "text-[#c14040]" : "text-[#9c7426]"}`}>{mode === "reject" ? "Reason for rejection" : "Feedback to vendor"}</p>
                  <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={mode === "reject" ? "Does not meet requirements" : "Lower the price, add a clearer photo…"} className="w-full rounded-lg border border-[#0f3a26]/12 bg-white px-3 py-2 text-[12.5px] text-[#0f3a26] focus:border-[#006E42]/40 focus:outline-none focus:ring-2 focus:ring-[#006E42]/15" />
                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={mode === "reject" ? reject : changes} disabled={busy} className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12.5px] font-semibold text-white transition disabled:opacity-50 ${mode === "reject" ? "bg-[#c14040] hover:bg-[#a83535]" : "bg-[#9c7426] hover:bg-[#846222]"}`}>{busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : mode === "reject" ? <X className="h-3.5 w-3.5" /> : <MessageSquare className="h-3.5 w-3.5" />}{mode === "reject" ? "Confirm reject" : "Send feedback"}</button>
                    <button onClick={() => setMode(null)} className="rounded-lg px-3 py-2 text-[12px] font-medium text-[#0f3a26]/55 hover:bg-[#0f3a26]/5">Back</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.aside>
      </motion.div>
    </AnimatePresence>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return <div className="flex items-baseline justify-between"><dt className="text-[#0f3a26]/55">{k}</dt><dd className="font-semibold text-[#0f3a26]">{v}</dd></div>;
}
