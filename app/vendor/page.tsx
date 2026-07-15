"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Box,
  Check,
  ChevronDown,
  ClipboardList,
  ImageIcon,
  IndianRupee,
  Loader2,
  PackageCheck,
  Plus,
  ShoppingBag,
  Trash2,
  TrendingUp,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useVendorSession } from "@/lib/partner/auth";
import {
  VENDOR_CATEGORIES,
  type ListingStatus,
  type NewListing,
  type VendorOrder,
  type VendorOrderStatus,
  type VendorProduct,
  type VendorReport,
  ORDER_STATUS_FLOW,
  effectivePrice,
  fetchVendorOrders,
  fetchVendorProducts,
  fetchVendorReport,
  marginPct,
  removeProduct,
  requestListing,
  resubmitListing,
  setDiscount,
  setOrderStatus,
  setStock,
} from "@/lib/vendor/service";

const CARD = "rounded-2xl bg-white ring-1 ring-[#0f3a26]/8";
const EASE = [0.22, 1, 0.36, 1] as const;

const LISTING_META: Record<ListingStatus, { label: string; cls: string }> = {
  listed: { label: "Listed", cls: "bg-[#006E42]/10 text-[#006E42]" },
  pending: { label: "Awaiting review", cls: "bg-[#c79a3d]/14 text-[#9c7426]" },
  changes_requested: { label: "Changes requested", cls: "bg-[#c79a3d]/14 text-[#9c7426]" },
  rejected: { label: "Rejected", cls: "bg-[#c14040]/10 text-[#c14040]" },
};
const ORDER_META: Record<VendorOrderStatus, { label: string; cls: string; dot: string }> = {
  placed: { label: "Placed", cls: "bg-[#0f3a26]/6 text-[#0f3a26]/70", dot: "bg-[#0f3a26]/40" },
  packed: { label: "Packed", cls: "bg-[#c79a3d]/14 text-[#9c7426]", dot: "bg-[#c79a3d]" },
  shipped: { label: "Shipped", cls: "bg-[#006E42]/10 text-[#006E42]", dot: "bg-[#006E42]" },
  delivered: { label: "Delivered", cls: "bg-[#006E42]/10 text-[#006E42]", dot: "bg-[#006E42]" },
  cancelled: { label: "Cancelled", cls: "bg-[#c14040]/10 text-[#c14040]", dot: "bg-[#c14040]" },
};

/** Read an uploaded image, downscale it, and return a compact data URL (fits localStorage). */
async function fileToDataUrl(file: File, maxDim = 900): Promise<string> {
  const raw = await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
  return new Promise<string>((res) => {
    const img = new window.Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return res(raw);
      ctx.drawImage(img, 0, 0, w, h);
      res(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => res(raw);
    img.src = raw;
  });
}

type Tab = "overview" | "products" | "orders";

export default function VendorDashboard() {
  const { session, hydrated } = useVendorSession();
  const vendorId = session?.vendorId ?? "vendor-1";
  const vendorName = session?.vendorName ?? "Vendor";
  const [tab, setTab] = useState<Tab>("overview");
  const [products, setProducts] = useState<VendorProduct[] | null>(null);
  const [orders, setOrders] = useState<VendorOrder[] | null>(null);
  const [report, setReport] = useState<VendorReport | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    fetchVendorProducts(vendorId).then(setProducts);
    fetchVendorOrders(vendorId).then(setOrders);
    fetchVendorReport(vendorId).then(setReport);
  }, [hydrated, vendorId]);

  async function refresh() {
    setProducts(await fetchVendorProducts(vendorId));
    setReport(await fetchVendorReport(vendorId));
  }
  async function refreshOrders() {
    setOrders(await fetchVendorOrders(vendorId));
    setReport(await fetchVendorReport(vendorId));
  }

  if (!hydrated) return null;

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-[#0f3a26]">Dashboard</h1>
          <p className="mt-0.5 text-[13px] text-[#0f3a26]/55">Your catalogue, orders, and performance at a glance.</p>
        </div>
      </div>

      {/* stats */}
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Revenue" value={report ? `₹${report.revenue.toLocaleString()}` : "—"} icon={IndianRupee} accent />
        <Stat label="Orders" value={report ? String(report.orders) : "—"} icon={ShoppingBag} />
        <Stat label="Units sold" value={report ? String(report.unitsSold) : "—"} icon={TrendingUp} />
        <Stat label="Listed products" value={report ? String(report.listed) : "—"} icon={PackageCheck} />
      </div>

      {/* tabs */}
      <div className="mt-6 inline-flex rounded-xl bg-[#0f3a26]/[0.05] p-1">
        {(["overview", "products", "orders"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-1.5 text-[12.5px] font-semibold capitalize transition ${tab === t ? "bg-white text-[#0f3a26] shadow-sm ring-1 ring-[#0f3a26]/8" : "text-[#0f3a26]/55 hover:text-[#0f3a26]/80"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === "overview" && <Overview report={report} orders={orders} />}
        {tab === "products" && <Products products={products} vendorId={vendorId} vendorName={vendorName} onChange={refresh} />}
        {tab === "orders" && <Orders orders={orders} onChange={refreshOrders} />}
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon, accent }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 ring-1 ${accent ? "bg-[#006E42] ring-[#006E42]" : "bg-white ring-[#0f3a26]/8"}`}>
      <div className="flex items-center justify-between">
        <p className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${accent ? "text-[#9af2c4]" : "text-[#0f3a26]/45"}`}>{label}</p>
        <Icon className={`h-4 w-4 ${accent ? "text-[#9af2c4]" : "text-[#006E42]"}`} />
      </div>
      <p className={`mt-2 text-[23px] font-bold tabular-nums tracking-tight ${accent ? "text-white" : "text-[#0f3a26]"}`}>{value}</p>
    </div>
  );
}

/* ------------------------------ Overview ------------------------------ */

function Overview({ report, orders }: { report: VendorReport | null; orders: VendorOrder[] | null }) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.4fr]">
      <div className={`${CARD} p-5`}>
        <h2 className="text-[14px] font-bold tracking-tight text-[#0f3a26]">Catalogue health</h2>
        <div className="mt-4 space-y-3">
          <Line label="Listed and live" value={report?.listed ?? 0} tone="ok" />
          <Line label="Awaiting review" value={report?.pending ?? 0} tone="warn" />
          <Line label="Out of stock" value={report?.outOfStock ?? 0} tone="bad" />
        </div>
        <div className="mt-4 border-t border-[#0f3a26]/8 pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0f3a26]/45">Top seller</p>
          <p className="mt-1 text-[14px] font-bold text-[#0f3a26]">{report?.topProduct ?? "—"}</p>
        </div>
      </div>

      <div className={`${CARD} p-5`}>
        <h2 className="text-[14px] font-bold tracking-tight text-[#0f3a26]">Recent orders</h2>
        <ul className="mt-3 divide-y divide-[#0f3a26]/6">
          {(orders ?? []).slice(0, 5).map((o) => {
            const m = ORDER_META[o.status];
            return (
              <li key={o.id} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-semibold text-[#0f3a26]">{o.productName}</p>
                  <p className="text-[10.5px] text-[#0f3a26]/50">{o.reference} · {o.customer} · Qty {o.qty}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${m.cls}`}>{m.label}</span>
                <span className="w-20 text-right text-[12.5px] font-bold tabular-nums text-[#0f3a26]">₹{o.amount.toLocaleString()}</span>
              </li>
            );
          })}
          {orders && orders.length === 0 && <li className="py-6 text-center text-[12px] text-[#0f3a26]/50">No orders yet.</li>}
        </ul>
      </div>
    </div>
  );
}

function Line({ label, value, tone }: { label: string; value: number; tone: "ok" | "warn" | "bad" }) {
  const dot = tone === "ok" ? "bg-[#006E42]" : tone === "warn" ? "bg-[#c79a3d]" : "bg-[#c14040]";
  return (
    <div className="flex items-center justify-between text-[13px]">
      <span className="inline-flex items-center gap-2 text-[#0f3a26]/70"><span className={`h-1.5 w-1.5 rounded-full ${dot}`} />{label}</span>
      <span className="font-bold tabular-nums text-[#0f3a26]">{value}</span>
    </div>
  );
}

/* ------------------------------ Products ------------------------------ */

function Products({ products, vendorId, vendorName, onChange }: { products: VendorProduct[] | null; vendorId: string; vendorName: string; onChange: () => void }) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<VendorProduct | null>(null);
  const open = adding || !!editing;

  function startAdd() { setEditing(null); setAdding((a) => !a); }
  function startEdit(p: VendorProduct) { setAdding(false); setEditing(p); }
  function close() { setAdding(false); setEditing(null); }
  function done() { close(); onChange(); }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[13px] text-[#0f3a26]/55">Add products, mark items out of stock, or remove them. New listings go to SuppAI for review.</p>
        <button onClick={startAdd} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#006E42] px-3.5 py-2 text-[12.5px] font-semibold text-white transition hover:bg-[#005634]">
          <Plus className="h-3.5 w-3.5" />Request new listing
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div key={editing?.id ?? "new"} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, ease: EASE }} className="mb-4">
            <ListingForm vendorId={vendorId} vendorName={vendorName} editProduct={editing} onDone={done} onCancel={close} />
          </motion.div>
        )}
      </AnimatePresence>

      {!products ? (
        <div className={`h-40 animate-pulse ${CARD}`} />
      ) : products.length === 0 ? (
        <div className={`${CARD} grid place-items-center p-12 text-center`}>
          <Box className="h-7 w-7 text-[#0f3a26]/30" />
          <p className="mt-3 text-[14px] font-bold text-[#0f3a26]">No products yet</p>
          <p className="mt-1 text-[12.5px] text-[#0f3a26]/55">Request your first listing to get started.</p>
        </div>
      ) : (
        <ul className={`overflow-hidden ${CARD}`}>
          {products.map((p, i) => (
            <ProductRow key={p.id} p={p} first={i === 0} onChange={onChange} onEdit={() => startEdit(p)} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ProductRow({ p, first, onChange, onEdit }: { p: VendorProduct; first: boolean; onChange: () => void; onEdit: () => void }) {
  const [busy, setBusy] = useState(false);
  const meta = LISTING_META[p.listing];
  const outOfStock = p.stock === "out_of_stock";
  const needsUpdate = p.listing === "changes_requested" || p.listing === "rejected";

  async function toggleStock() {
    setBusy(true);
    await setStock(p.id, outOfStock ? "active" : "out_of_stock");
    setBusy(false);
    onChange();
  }
  async function remove() {
    setBusy(true);
    await removeProduct(p.id);
    setBusy(false);
    onChange();
  }

  return (
    <li className={`flex flex-wrap items-center gap-3 p-4 ${first ? "" : "border-t border-[#0f3a26]/6"}`}>
      <span className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#0f3a26]/[0.04] ring-1 ring-inset ring-[#0f3a26]/8">
        {p.coverImage && <span className="block h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${p.coverImage})` }} aria-hidden />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-[13.5px] font-semibold text-[#0f3a26]">{p.name}</p>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.cls}`}>{meta.label}</span>
          {p.listing === "listed" && outOfStock && <span className="shrink-0 rounded-full bg-[#c14040]/10 px-2 py-0.5 text-[10px] font-semibold text-[#c14040]">Out of stock</span>}
        </div>
        <p className="mt-0.5 text-[11px] text-[#0f3a26]/55">{p.brand} · {p.category} · MRP ₹{p.mrp.toLocaleString()} · Sells ₹{p.price.toLocaleString()}{p.discountPct > 0 ? ` · ${p.discountPct}% off → ₹${effectivePrice(p).toLocaleString()}` : ""} · Margin {marginPct(p)}%</p>
        {needsUpdate && p.note && (
          <p className={`mt-1 text-[11px] font-medium ${p.listing === "rejected" ? "text-[#c14040]" : "text-[#9c7426]"}`}>
            {p.listing === "rejected" ? "Reason: " : "Feedback: "}{p.note}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {needsUpdate && (
          <button onClick={onEdit} className="inline-flex items-center gap-1.5 rounded-lg bg-[#006E42]/8 px-3 py-1.5 text-[11.5px] font-semibold text-[#006E42] transition hover:bg-[#006E42]/14">
            <Plus className="h-3.5 w-3.5" />Edit & resubmit
          </button>
        )}
        {p.listing === "listed" && <DiscountControl p={p} onChange={onChange} />}
        {p.listing === "listed" && (
          <button onClick={toggleStock} disabled={busy} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11.5px] font-semibold transition ${outOfStock ? "bg-[#006E42]/8 text-[#006E42] hover:bg-[#006E42]/14" : "bg-[#c79a3d]/12 text-[#9c7426] hover:bg-[#c79a3d]/20"}`}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : outOfStock ? <Check className="h-3.5 w-3.5" /> : null}
            {outOfStock ? "Mark in stock" : "Mark out of stock"}
          </button>
        )}
        <button onClick={remove} disabled={busy} aria-label="Remove product" className="grid h-8 w-8 place-items-center rounded-lg text-[#0f3a26]/35 transition hover:bg-[#c14040]/8 hover:text-[#c14040]">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}

function DiscountControl({ p, onChange }: { p: VendorProduct; onChange: () => void }) {
  const [val, setVal] = useState(String(p.discountPct || ""));
  const [busy, setBusy] = useState(false);
  async function commit() {
    const n = Number(val) || 0;
    if (n === p.discountPct) return;
    setBusy(true);
    await setDiscount(p.id, n);
    setBusy(false);
    onChange();
  }
  return (
    <label className="inline-flex items-center gap-1 rounded-lg bg-[#f1f7f3] px-2 py-1.5 text-[11px] font-medium text-[#0f3a26]/60 ring-1 ring-inset ring-[#0f3a26]/[0.08]" title="Promotional discount, editable anytime">
      Disc
      <input
        value={val}
        onChange={(e) => setVal(e.target.value.replace(/[^0-9]/g, ""))}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); (e.target as HTMLInputElement).blur(); } }}
        className="w-8 bg-transparent text-center text-[12px] font-semibold text-[#0f3a26] focus:outline-none"
      />
      %
      {busy && <Loader2 className="h-3 w-3 animate-spin text-[#006E42]" />}
    </label>
  );
}

function ListingForm({ vendorId, vendorName, editProduct, onDone, onCancel }: { vendorId: string; vendorName: string; editProduct?: VendorProduct | null; onDone: () => void; onCancel: () => void }) {
  const numStr = (n?: number) => (n && n > 0 ? String(n) : "");
  const [f, setF] = useState({
    name: editProduct?.name ?? "", brand: editProduct?.brand ?? "", category: editProduct?.category ?? VENDOR_CATEGORIES[0], hsn: editProduct?.hsn ?? "",
    coverImage: editProduct?.coverImage ?? "",
    description: editProduct?.description ?? "", longDescription: editProduct?.longDescription ?? "", dosage: editProduct?.dosage ?? "",
    mrp: numStr(editProduct?.mrp), supplyCost: numStr(editProduct?.supplyCost), price: numStr(editProduct?.price),
    discountPct: editProduct?.discountPct ? String(editProduct.discountPct) : "",
    gstPct: editProduct ? String(editProduct.gstPct) : "18", stockQty: numStr(editProduct?.stockQty),
    moq: editProduct ? String(editProduct.moq) : "10", leadTimeDays: editProduct ? String(editProduct.leadTimeDays) : "3",
  });
  const [gallery, setGallery] = useState<string[]>(editProduct?.gallery ?? []);
  const [ingredients, setIngredients] = useState<string[]>(editProduct?.ingredients ?? []);
  const [tags, setTags] = useState<string[]>(editProduct?.tags ?? []);
  const [busy, setBusy] = useState(false);
  const coverRef = useRef<HTMLInputElement>(null);
  const set = (k: keyof typeof f) => (v: string) => setF((cur) => ({ ...cur, [k]: v }));

  async function onCoverFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    set("coverImage")(await fileToDataUrl(file));
    if (coverRef.current) coverRef.current.value = "";
  }

  const mrp = Number(f.mrp) || 0, cost = Number(f.supplyCost) || 0, price = Number(f.price) || 0, disc = Number(f.discountPct) || 0;
  const margin = price ? Math.round(((price - cost) / price) * 100) : 0;
  const custSave = mrp ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const effPrice = Math.round(price * (1 - disc / 100));
  const totalImages = (f.coverImage.trim() ? 1 : 0) + gallery.length;
  const valid = f.name.trim() && f.coverImage.trim() && totalImages >= 3 && mrp > 0 && price > 0;

  async function submit() {
    if (!valid || busy) return;
    setBusy(true);
    const draft: NewListing = {
      name: f.name.trim(), brand: f.brand.trim(), category: f.category, hsn: f.hsn.trim() || undefined,
      coverImage: f.coverImage.trim(), gallery,
      description: f.description.trim(), longDescription: f.longDescription.trim(), dosage: f.dosage.trim() || undefined,
      ingredients, tags,
      mrp, supplyCost: cost, price, discountPct: disc,
      gstPct: Number(f.gstPct) || 0, stockQty: Number(f.stockQty) || 0, moq: Number(f.moq) || 1, leadTimeDays: Number(f.leadTimeDays) || 1,
    };
    if (editProduct) await resubmitListing(editProduct.id, draft);
    else await requestListing(vendorId, vendorName, draft);
    setBusy(false);
    onDone();
  }

  return (
    <div className={`${CARD} p-5`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[13.5px] font-bold text-[#0f3a26]">{editProduct ? "Edit & resubmit product" : "Request a new product listing"}</h3>
        <button onClick={onCancel} aria-label="Close" className="grid h-7 w-7 place-items-center rounded-lg text-[#0f3a26]/50 hover:bg-[#0f3a26]/6"><X className="h-4 w-4" /></button>
      </div>

      <FormSection label="Product">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Fld className="col-span-2 sm:col-span-2" label="Product name" value={f.name} onChange={set("name")} />
          <Fld label="Brand" value={f.brand} onChange={set("brand")} />
          <Sel label="Category" value={f.category} onChange={set("category")} options={VENDOR_CATEGORIES} />
          <Fld label="HSN / Barcode" value={f.hsn} onChange={set("hsn")} />
          <Fld label="Stock quantity" value={f.stockQty} onChange={set("stockQty")} numeric />
        </div>
        <Fld className="mt-3 block" label="Short description" value={f.description} onChange={set("description")} />
        <label className="mt-3 block">
          <span className="mb-1 block text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#0f3a26]/50">Long description</span>
          <textarea value={f.longDescription} onChange={(e) => set("longDescription")(e.target.value)} rows={3} className="w-full resize-y rounded-lg border border-[#0f3a26]/12 bg-white px-3 py-2 text-[13px] leading-relaxed text-[#0f3a26] focus:border-[#006E42]/40 focus:outline-none focus:ring-2 focus:ring-[#006E42]/15" />
        </label>
      </FormSection>

      <FormSection label="Images (cover + gallery)">
        <div className="flex items-start gap-4">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#0f3a26]/[0.04] ring-1 ring-inset ring-[#0f3a26]/8">
            {f.coverImage ? (
              <span className="block h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${f.coverImage})` }} aria-hidden />
            ) : (
              <span className="grid h-full w-full place-items-center text-[#0f3a26]/30"><ImageIcon className="h-6 w-6" /></span>
            )}
            <span className="absolute left-1 top-1 rounded bg-white/90 px-1 py-0.5 text-[8px] font-bold text-[#006E42]">Cover</span>
          </div>
          <div>
            <p className="text-[11.5px] font-medium text-[#0f3a26]">Cover image (default)</p>
            <p className="mt-0.5 text-[11px] text-[#0f3a26]/50">The main photo, shown first.</p>
            <div className="mt-2 flex items-center gap-2">
              <button type="button" onClick={() => coverRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg bg-[#006E42] px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-[#005634]"><Upload className="h-3.5 w-3.5" />{f.coverImage ? "Replace" : "Upload cover"}</button>
              {f.coverImage && <button type="button" onClick={() => set("coverImage")("")} className="rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[#0f3a26]/55 hover:bg-[#0f3a26]/5">Remove</button>}
            </div>
            <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={(e) => onCoverFile(e.target.files)} />
          </div>
        </div>
        <div className="mt-4">
          <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#0f3a26]/50">Following images</p>
          <ImagesInput images={gallery} onChange={setGallery} max={4} />
        </div>
        <p className={`mt-1.5 text-[11px] ${totalImages < 3 ? "text-[#c14040]" : "text-[#0f3a26]/50"}`}>{totalImages} image{totalImages === 1 ? "" : "s"} total. Add a cover plus at least 2 more (3 minimum).</p>
      </FormSection>

      <FormSection label="Pricing, margin & discount">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Fld label="MRP (₹)" value={f.mrp} onChange={set("mrp")} numeric />
          <Fld label="Supply cost (₹)" value={f.supplyCost} onChange={set("supplyCost")} numeric />
          <Fld label="Selling price (₹)" value={f.price} onChange={set("price")} numeric />
          <Fld label="GST %" value={f.gstPct} onChange={set("gstPct")} numeric />
          <Fld label="Vendor discount %" value={f.discountPct} onChange={set("discountPct")} numeric />
          <Fld label="MOQ" value={f.moq} onChange={set("moq")} numeric />
          <Fld label="Lead time (days)" value={f.leadTimeDays} onChange={set("leadTimeDays")} numeric />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 rounded-xl bg-[#f1f7f3] px-4 py-2.5 text-[12px] ring-1 ring-inset ring-[#0f3a26]/[0.08]">
          <span className="text-[#0f3a26]/60">Margin <b className="text-[#0f3a26]">{margin}%</b></span>
          <span className="text-[#0f3a26]/60">Customer save <b className="text-[#0f3a26]">{custSave}%</b></span>
          <span className="text-[#0f3a26]/60">After discount <b className="text-[#006E42]">₹{effPrice.toLocaleString()}</b></span>
        </div>
      </FormSection>

      <FormSection label="Composition (optional)">
        <Fld label="Dosage / usage" value={f.dosage} onChange={set("dosage")} />
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ChipInput label="Ingredients" values={ingredients} onChange={setIngredients} placeholder="Vitamin A, B-Complex…" />
          <ChipInput label="Tags" values={tags} onChange={setTags} placeholder="Daily, Adult" />
        </div>
      </FormSection>

      <div className="mt-5 flex items-center gap-2">
        <button onClick={submit} disabled={!valid || busy} className="inline-flex items-center gap-1.5 rounded-xl bg-[#006E42] px-4 py-2 text-[12.5px] font-semibold text-white transition hover:bg-[#005634] disabled:opacity-45">
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ClipboardList className="h-3.5 w-3.5" />}{editProduct ? "Resubmit for review" : "Submit for review"}
        </button>
        <p className="text-[11px] text-[#0f3a26]/50">SuppAI reviews and finalises listings (SKU, SEO) before they go live.</p>
      </div>
    </div>
  );
}

function ImagesInput({ images, onChange, max }: { images: string[]; onChange: (v: string[]) => void; max: number }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    const room = max - images.length;
    const picked = Array.from(files).slice(0, room);
    const urls = await Promise.all(picked.map((file) => fileToDataUrl(file)));
    onChange([...images, ...urls]);
    setBusy(false);
    if (ref.current) ref.current.value = "";
  }

  return (
    <div>
      <div className="grid grid-cols-4 gap-2">
        {images.map((src, i) => (
          <div key={i} className="group relative aspect-square overflow-hidden rounded-lg bg-[#0f3a26]/[0.04] ring-1 ring-inset ring-[#0f3a26]/8">
            <span className="block h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${src})` }} aria-hidden />
            <button type="button" onClick={() => onChange(images.filter((_, idx) => idx !== i))} aria-label="Remove" className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded bg-white/90 text-[#0f3a26]/60 opacity-0 transition group-hover:opacity-100 hover:text-[#c14040]"><X className="h-3 w-3" /></button>
          </div>
        ))}
        {images.length < max && (
          <button type="button" onClick={() => ref.current?.click()} className="grid aspect-square place-items-center gap-1 rounded-lg border border-dashed border-[#0f3a26]/20 text-[#0f3a26]/45 transition hover:border-[#006E42]/40 hover:text-[#006E42]">
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
            <span className="text-[9.5px] font-semibold">Upload</span>
          </button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
      <p className="mt-1.5 text-[10.5px] text-[#0f3a26]/45">Upload up to {max} images. JPG or PNG.</p>
    </div>
  );
}

function FormSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-[#0f3a26]/8 py-4 first:border-t-0 first:pt-0">
      <p className="mb-2.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#006E42]">{label}</p>
      {children}
    </div>
  );
}

function ChipInput({ label, values, onChange, placeholder }: { label: string; values: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [text, setText] = useState("");
  function add(raw: string) {
    const v = raw.trim();
    if (!v || values.includes(v)) return;
    onChange([...values, v]);
    setText("");
  }
  return (
    <label className="block">
      <span className="mb-1 block text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#0f3a26]/50">{label}</span>
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-[#0f3a26]/12 bg-white px-2 py-1.5 focus-within:border-[#006E42]/40 focus-within:ring-2 focus-within:ring-[#006E42]/15">
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 rounded-md bg-[#006E42]/8 px-2 py-0.5 text-[11px] font-medium text-[#006E42]">
            {v}
            <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} aria-label={`Remove ${v}`}><X className="h-2.5 w-2.5" /></button>
          </span>
        ))}
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(text); } }}
          onBlur={() => text && add(text)}
          placeholder={values.length === 0 ? placeholder : ""}
          className="min-w-[90px] flex-1 bg-transparent px-1 py-0.5 text-[13px] text-[#0f3a26] placeholder:text-[#0f3a26]/30 focus:outline-none"
        />
      </div>
    </label>
  );
}

function Fld({ label, value, onChange, numeric, className }: { label: string; value: string; onChange: (v: string) => void; numeric?: boolean; className?: string }) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1 block text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#0f3a26]/50">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(numeric ? e.target.value.replace(/[^0-9.]/g, "") : e.target.value)}
        inputMode={numeric ? "numeric" : undefined}
        className="w-full rounded-lg border border-[#0f3a26]/12 bg-white px-3 py-2 text-[13px] text-[#0f3a26] focus:border-[#006E42]/40 focus:outline-none focus:ring-2 focus:ring-[#006E42]/15"
      />
    </label>
  );
}
function Sel({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#0f3a26]/50">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-[#0f3a26]/12 bg-white px-3 py-2 text-[13px] text-[#0f3a26] focus:border-[#006E42]/40 focus:outline-none focus:ring-2 focus:ring-[#006E42]/15">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

/* ------------------------------ Orders ------------------------------ */

function Orders({ orders, onChange }: { orders: VendorOrder[] | null; onChange: () => void }) {
  if (!orders) return <div className={`h-52 animate-pulse ${CARD}`} />;
  if (orders.length === 0) return <div className={`${CARD} grid place-items-center p-12 text-center text-[13px] text-[#0f3a26]/55`}>No orders yet.</div>;
  return (
    <ul className={`overflow-hidden ${CARD}`}>
      {orders.map((o, i) => (
        <li key={o.id} className={`flex flex-wrap items-center gap-3 p-4 ${i === 0 ? "" : "border-t border-[#0f3a26]/6"}`}>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-[#0f3a26]">{o.productName}</p>
            <p className="mt-0.5 text-[10.5px] text-[#0f3a26]/50">{o.reference} · {o.customer} · Qty {o.qty} · {new Date(o.at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
          </div>
          <OrderStatusControl o={o} onChange={onChange} />
          <span className="w-24 text-right text-[13px] font-bold tabular-nums text-[#0f3a26]">₹{o.amount.toLocaleString()}</span>
        </li>
      ))}
    </ul>
  );
}

function OrderStatusControl({ o, onChange }: { o: VendorOrder; onChange: () => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const m = ORDER_META[o.status];

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);

  async function change(s: VendorOrderStatus) {
    setOpen(false);
    if (s === o.status) return;
    setBusy(true);
    await setOrderStatus(o.id, s);
    setBusy(false);
    onChange();
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`inline-flex items-center gap-1.5 rounded-full py-1 pl-2.5 pr-2 text-[10.5px] font-semibold ring-1 ring-inset transition hover:brightness-95 ${m.cls} ring-[#0f3a26]/[0.06]`}
      >
        {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />}
        {m.label}
        <ChevronDown className={`h-3 w-3 opacity-60 transition ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: EASE }}
            className="absolute right-0 z-20 mt-1.5 w-40 overflow-hidden rounded-xl bg-white p-1 shadow-[0_16px_32px_-12px_rgba(15,58,38,0.28)] ring-1 ring-[#0f3a26]/10"
          >
            {ORDER_STATUS_FLOW.map((s) => {
              const sm = ORDER_META[s];
              const active = s === o.status;
              return (
                <button key={s} onClick={() => change(s)} role="option" aria-selected={active} className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12px] font-medium transition ${active ? "bg-[#006E42]/8 text-[#006E42]" : "text-[#0f3a26]/70 hover:bg-[#0f3a26]/[0.04]"}`}>
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${sm.dot}`} />
                  {sm.label}
                  {active && <Check className="ml-auto h-3.5 w-3.5" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
