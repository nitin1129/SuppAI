"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  CreditCard,
  Crown,
  Gift,
  Heart,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Stethoscope,
  TestTube,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useWishlist } from "@/lib/cart/WishlistContext";
import type { WishlistItem } from "@/lib/cart/types";
import {
  type Address,
  type Payment,
  type Profile,
  type Wallet as WalletType,
  type WalletOffer,
  MORE_WALLET_OFFERS,
  WALLET_OFFERS,
  addMoney,
  deleteAddress,
  fetchAddresses,
  fetchPayments,
  fetchProfile,
  fetchWallet,
  initials,
  saveAddress,
  saveProfile,
  setDefaultAddress,
} from "@/lib/account/service";
import { fetchSubscriptions } from "@/lib/subscriptions/service";

const EASE = [0.22, 1, 0.36, 1] as const;
const CARD = "rounded-3xl bg-white shadow-[0_2px_4px_-2px_rgba(15,58,38,0.08),0_16px_36px_-20px_rgba(15,58,38,0.30)] ring-1 ring-[#0f3a26]/10";

export function AccountView() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [subCount, setSubCount] = useState(0);
  const { items: wishItems } = useWishlist();

  useEffect(() => {
    fetchProfile().then(setProfile);
    fetchAddresses().then(setAddresses);
    fetchWallet().then(setWallet);
    fetchPayments().then(setPayments);
    fetchSubscriptions().then((s) => setSubCount(s.length));
  }, []);

  return (
    <div className="grid grid-cols-12 items-stretch gap-6 px-6 py-6 md:px-10">
      <Rise i={0} className="col-span-12 lg:col-span-8">
        <AccountDetails profile={profile} onSaveProfile={setProfile} addresses={addresses} onChangeAddresses={setAddresses} />
      </Rise>
      <Rise i={1} className="col-span-12 lg:col-span-4">
        <MembershipTile plan={profile?.plan ?? ""} subscriptions={subCount} />
      </Rise>

      <Rise i={2} className="col-span-12 lg:col-span-8">
        <WalletCard wallet={wallet} onChange={setWallet} />
      </Rise>
      <Rise i={3} className="col-span-12 lg:col-span-4">
        <WishlistTile items={wishItems} />
      </Rise>

      <Rise i={4} className="col-span-12">
        <PaymentsCard payments={payments} />
      </Rise>
    </div>
  );
}

function Rise({ i, className, children }: { i: number; className?: string; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE, delay: reduce ? 0 : i * 0.06 }}
      className={`h-full ${className ?? ""}`}
    >
      {children}
    </motion.div>
  );
}

/* ============================== Account details ============================== */

const EMPTY_ADDR = { label: "Home", line: "", city: "", pincode: "" };
const MAX_ADDR = 2;

function AccountDetails({
  profile,
  onSaveProfile,
  addresses,
  onChangeAddresses,
}: {
  profile: Profile | null;
  onSaveProfile: (p: Profile) => void;
  addresses: Address[] | null;
  onChangeAddresses: (a: Address[]) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Profile | null>(null);
  const [busy, setBusy] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [addr, setAddr] = useState<typeof EMPTY_ADDR & { id?: string }>(EMPTY_ADDR);
  const [addrBusy, setAddrBusy] = useState(false);

  useEffect(() => {
    if (profile) setForm(profile);
  }, [profile]);

  if (!profile || !form) return <div className={`h-72 animate-pulse ${CARD}`} />;

  async function saveProfileForm() {
    if (!form) return;
    setBusy(true);
    const saved = await saveProfile(form);
    setBusy(false);
    onSaveProfile(saved);
    setEditing(false);
  }
  function startAdd() { setAddr(EMPTY_ADDR); setAdding(true); setEditingId(null); }
  function startEdit(a: Address) { setAddr({ id: a.id, label: a.label, line: a.line, city: a.city, pincode: a.pincode }); setEditingId(a.id); setAdding(false); }
  async function saveAddr() {
    setAddrBusy(true);
    const next = await saveAddress(addr);
    setAddrBusy(false);
    onChangeAddresses(next);
    setAdding(false);
    setEditingId(null);
  }
  const showAddrForm = adding || editingId;
  const atMax = (addresses?.length ?? 0) >= MAX_ADDR;

  return (
    <section className={`${CARD} h-full p-6 md:p-7`}>
      {/* Identity + contact */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#006E42] text-[22px] font-bold text-white">{initials(profile.name)}</span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[21px] font-bold leading-tight tracking-tight text-[#0f3a26]">{editing ? "Edit details" : profile.name}</h1>
              {!editing && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#006E42]/8 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#006E42]"><Crown className="h-2.5 w-2.5" />{profile.plan}</span>
              )}
            </div>
            <p className="mt-1 text-[12px] text-[#0f3a26]/50">Account holder details and delivery addresses.</p>
          </div>
        </div>

        {editing ? (
          <div className="flex items-center gap-2">
            <button onClick={saveProfileForm} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg bg-[#006E42] px-3.5 py-2 text-[12.5px] font-semibold text-white transition hover:bg-[#005634] disabled:opacity-60">{busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}Save</button>
            <button onClick={() => { setForm(profile); setEditing(false); }} className="rounded-lg px-3 py-2 text-[12.5px] font-medium text-[#0f3a26]/55 transition hover:bg-[#0f3a26]/5">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-[12.5px] font-semibold text-[#0f3a26] ring-1 ring-inset ring-[#0f3a26]/10 transition hover:ring-[#006E42]/35"><Pencil className="h-3.5 w-3.5" />Edit</button>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ContactCell icon={Mail} label="Name" editing={editing} value={form.name} onChange={(v) => setForm({ ...form, name: v })} display={profile.name} />
        <ContactCell icon={Mail} label="Email" editing={editing} value={form.email} onChange={(v) => setForm({ ...form, email: v })} display={profile.email} />
        <ContactCell icon={Phone} label="Phone" editing={editing} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} display={`+91 ${profile.phone}`} />
      </div>

      {/* Addresses */}
      <div className="mt-6 border-t border-[#0f3a26]/8 pt-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[13px] font-bold tracking-tight text-[#0f3a26]">Delivery addresses <span className="ml-1 text-[11px] font-medium text-[#0f3a26]/40">({addresses?.length ?? 0}/{MAX_ADDR})</span></h2>
          {!showAddrForm && !atMax && (
            <button onClick={startAdd} className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#006E42] transition hover:underline"><Plus className="h-3.5 w-3.5" />Add address</button>
          )}
        </div>

        {showAddrForm && (
          <div className="mb-3 rounded-2xl bg-[#0f3a26]/[0.025] p-4 ring-1 ring-inset ring-[#0f3a26]/8">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <FieldInput label="Label" value={addr.label} onChange={(v) => setAddr({ ...addr, label: v })} />
              <FieldInput label="Pincode" value={addr.pincode} onChange={(v) => setAddr({ ...addr, pincode: v })} />
              <div className="sm:col-span-2"><FieldInput label="Address line" value={addr.line} onChange={(v) => setAddr({ ...addr, line: v })} /></div>
              <FieldInput label="City" value={addr.city} onChange={(v) => setAddr({ ...addr, city: v })} />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button onClick={saveAddr} disabled={addrBusy || !addr.line || !addr.city} className="inline-flex items-center gap-1.5 rounded-lg bg-[#006E42] px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-[#005634] disabled:opacity-50">{addrBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}{editingId ? "Save changes" : "Add address"}</button>
              <button onClick={() => { setAdding(false); setEditingId(null); }} className="rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[#0f3a26]/55 transition hover:bg-[#0f3a26]/5">Cancel</button>
            </div>
          </div>
        )}

        {addresses && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {addresses.slice(0, MAX_ADDR).map((a) => (
              <div key={a.id} className="flex items-start gap-3 rounded-2xl bg-[#f1f7f3] p-4 ring-1 ring-inset ring-[#0f3a26]/[0.09] shadow-[0_1px_2px_rgba(15,58,38,0.06)]">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#006E42]/8 text-[#006E42]"><MapPin className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[12.5px] font-semibold text-[#0f3a26]">{a.label}</p>
                    {a.isDefault && <span className="rounded-full bg-[#006E42]/8 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-[#006E42]">Default</span>}
                  </div>
                  <p className="mt-0.5 text-[11.5px] leading-relaxed text-[#0f3a26]/60">{a.line}, {a.city} {a.pincode}</p>
                  <div className="mt-2 flex items-center gap-3 text-[11px] font-medium">
                    {!a.isDefault && <button onClick={() => setDefaultAddress(a.id).then(onChangeAddresses)} className="text-[#006E42] transition hover:underline">Set default</button>}
                    <button onClick={() => startEdit(a)} className="text-[#0f3a26]/55 transition hover:text-[#006E42]">Edit</button>
                    <button onClick={() => deleteAddress(a.id).then(onChangeAddresses)} className="ml-auto text-[#0f3a26]/40 transition hover:text-[#c14040]"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </div>
            ))}
            {addresses.length < MAX_ADDR && !showAddrForm && (
              <button onClick={startAdd} className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-[#0f3a26]/15 p-4 text-[12px] font-semibold text-[#0f3a26]/50 transition hover:border-[#006E42]/40 hover:text-[#006E42]">
                <Plus className="h-4 w-4" />
                Add another address
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function ContactCell({
  icon: Icon,
  label,
  editing,
  value,
  onChange,
  display,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  editing: boolean;
  value: string;
  onChange: (v: string) => void;
  display: string;
}) {
  return (
    <div className="rounded-2xl bg-[#f1f7f3] p-3.5 ring-1 ring-inset ring-[#0f3a26]/[0.09] shadow-[0_1px_2px_rgba(15,58,38,0.06)]">
      <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0f3a26]/45"><Icon className="h-3 w-3 text-[#006E42]" />{label}</p>
      {editing ? (
        <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full rounded-lg border border-[#0f3a26]/[0.14] bg-[#f6faf7] shadow-[inset_0_1px_2px_rgba(15,58,38,0.04)] px-2.5 py-1.5 text-[13px] text-[#0f3a26] focus:border-[#006E42]/40 focus:outline-none focus:ring-2 focus:ring-[#006E42]/15" />
      ) : (
        <p className="mt-1 truncate text-[13.5px] font-semibold text-[#0f3a26]">{display}</p>
      )}
    </div>
  );
}

/* ============================== Membership tile ============================== */

function MembershipTile({ plan, subscriptions }: { plan: string; subscriptions: number }) {
  const [renewal, setRenewal] = useState<string | null>(null);
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setRenewal(d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }));
  }, []);

  const rows = [
    { label: "Next renewal", value: renewal ?? "In 7 days" },
    { label: "Plan price", value: "₹99 / week" },
  ];

  return (
    <section className={`${CARD} flex h-full flex-col p-6`}>
      <div className="flex items-start justify-between">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#006E42]/8 text-[#006E42]"><Crown className="h-5 w-5" /></span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#006E42]/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#006E42]"><span className="h-1.5 w-1.5 rounded-full bg-[#006E42]" />Active</span>
      </div>

      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0f3a26]/45">Membership</p>
      <p className="text-[22px] font-bold tracking-tight text-[#0f3a26]">{plan || "Free"} <span className="text-[13px] font-medium text-[#0f3a26]/45">· Weekly</span></p>

      <dl className="mt-4 flex-1 divide-y divide-[#0f3a26]/6">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between py-2.5">
            <dt className="text-[11.5px] text-[#0f3a26]/50">{row.label}</dt>
            <dd className="text-[12.5px] font-semibold tabular-nums text-[#0f3a26]">{row.value}</dd>
          </div>
        ))}
        <div className="flex items-center justify-between py-2.5">
          <dt className="text-[11.5px] text-[#0f3a26]/50">Auto-renew</dt>
          <dd className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#006E42]"><span className="h-1.5 w-1.5 rounded-full bg-[#006E42]" />On</dd>
        </div>
      </dl>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#0f3a26]/8 pt-4">
        <div>
          <p className="text-[19px] font-bold tabular-nums text-[#0f3a26]">{subscriptions}</p>
          <p className="text-[10.5px] text-[#0f3a26]/50">Active subscriptions</p>
        </div>
        <div>
          <p className="text-[19px] font-bold text-[#0f3a26]">2024</p>
          <p className="text-[10.5px] text-[#0f3a26]/50">Member since</p>
        </div>
      </div>

      <Link href="/dashboard/plans" className="group mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0f3a26]/[0.04] px-3 py-2.5 text-[12.5px] font-semibold text-[#0f3a26] transition hover:bg-[#006E42]/10 hover:text-[#006E42] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006E42]/30">
        Manage plan
        <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Link>
    </section>
  );
}

/* ============================== Wallet ============================== */

function WalletCard({ wallet, onChange }: { wallet: WalletType | null; onChange: (w: WalletType) => void }) {
  const [busy, setBusy] = useState<number | null>(null);
  const [offersOpen, setOffersOpen] = useState(false);
  if (!wallet) return <div className={`h-52 animate-pulse ${CARD}`} />;

  async function add(amount: number) {
    setBusy(amount);
    const next = await addMoney(amount);
    setBusy(null);
    onChange(next);
  }

  const toOffer = Math.max(0, 1000 - (wallet.balance % 1000));

  return (
    <section className={`${CARD} h-full p-6 md:p-7`}>
      <h2 className="mb-4 inline-flex items-center gap-2 text-[14px] font-bold tracking-tight text-[#0f3a26]"><Wallet className="h-4 w-4 text-[#006E42]" />Wallet</h2>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,300px)_1fr]">
        {/* Balance + add money */}
        <div className="rounded-2xl bg-[#006E42] p-5 text-white">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#9af2c4]">Available balance</p>
          <p className="mt-1.5 text-[32px] font-bold leading-none tabular-nums">₹{wallet.balance.toLocaleString()}</p>
          <p className="mt-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/60">Add money</p>
          <div className="mt-1.5 flex items-center gap-1.5">
            {[200, 500, 1000].map((amt) => (
              <button key={amt} onClick={() => add(amt)} disabled={busy !== null} className="inline-flex items-center gap-1 rounded-lg bg-white/12 px-2.5 py-1.5 text-[12px] font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/20 disabled:opacity-60">{busy === amt ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}₹{amt}</button>
            ))}
          </div>
          {toOffer > 0 && (
            <p className="mt-3 text-[10.5px] text-white/70">Add ₹{toOffer.toLocaleString()} more to unlock 5% cashback.</p>
          )}
        </div>

        {/* Offers */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0f3a26]/45"><Gift className="h-3 w-3 text-[#9c7426]" />Wallet offers</p>
            <button onClick={() => setOffersOpen(true)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11.5px] font-semibold text-[#9c7426] transition hover:bg-[#c79a3d]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c79a3d]/40">More offers<ArrowUpRight className="h-3.5 w-3.5" /></button>
          </div>
          <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {WALLET_OFFERS.map((o) => (
              <li key={o.id} className="rounded-2xl bg-[#c79a3d]/[0.07] p-3.5 ring-1 ring-inset ring-[#c79a3d]/20">
                <div className="flex items-start justify-between gap-2">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#c79a3d]/15 text-[#9c7426]"><Gift className="h-4 w-4" /></span>
                  <span className="rounded-md bg-white px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-[#9c7426] ring-1 ring-inset ring-[#c79a3d]/25">{o.code}</span>
                </div>
                <p className="mt-2 text-[13px] font-bold text-[#0f3a26]">{o.title}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-[#0f3a26]/60">{o.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <OffersDialog open={offersOpen} onClose={() => setOffersOpen(false)} />
    </section>
  );
}

/* ============================== Offers dialog ============================== */

function OffersDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const offers: WalletOffer[] = [...WALLET_OFFERS, ...MORE_WALLET_OFFERS];

  async function copy(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied((c) => (c === code ? null : c)), 1600);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <div className="absolute inset-0 bg-[#0f3a26]/45" onClick={onClose} aria-hidden />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Wallet offers"
            className={`relative flex max-h-[80vh] w-full max-w-md flex-col ${CARD} overflow-hidden`}
            initial={reduce ? false : { opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#0f3a26]/8 p-5">
              <div>
                <h2 className="text-[16px] font-bold tracking-tight text-[#0f3a26]">Wallet offers</h2>
                <p className="mt-0.5 text-[12px] text-[#0f3a26]/55">Tap a code to copy, then use it at checkout.</p>
              </div>
              <button onClick={onClose} aria-label="Close" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#0f3a26]/55 transition hover:bg-[#0f3a26]/6 hover:text-[#0f3a26] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006E42]/30"><X className="h-4 w-4" /></button>
            </div>

            <ul className="no-scrollbar flex-1 space-y-2.5 overflow-y-auto p-5">
              {offers.map((o) => (
                <li key={o.id} className="flex items-start gap-3 rounded-2xl bg-[#c79a3d]/[0.06] p-4 ring-1 ring-inset ring-[#c79a3d]/20">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#c79a3d]/15 text-[#9c7426]"><Gift className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-bold text-[#0f3a26]">{o.title}</p>
                    <p className="mt-0.5 text-[11.5px] leading-relaxed text-[#0f3a26]/60">{o.body}</p>
                    {o.expiry && <p className="mt-1 text-[10.5px] font-medium text-[#9c7426]">{o.expiry}</p>}
                  </div>
                  <button onClick={() => copy(o.code)} className="inline-flex shrink-0 items-center gap-1.5 self-center rounded-lg bg-white px-2.5 py-1.5 font-mono text-[11px] font-bold text-[#9c7426] ring-1 ring-inset ring-[#c79a3d]/30 transition hover:ring-[#c79a3d]/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c79a3d]/50">
                    {copied === o.code ? <><Check className="h-3 w-3 text-[#006E42]" />Copied</> : <><Copy className="h-3 w-3" />{o.code}</>}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============================== Wishlist tile ============================== */

const KIND_LABEL: Record<WishlistItem["kind"], string> = { product: "product", doctor: "doctor", test: "test" };

function WishThumb({ item }: { item: WishlistItem }) {
  const base = "grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-2 ring-white";
  if (item.kind === "product") {
    return <span className={`${base} bg-cover bg-center`} style={{ backgroundImage: `url(${item.image})` }} aria-hidden />;
  }
  const Icon = item.kind === "doctor" ? Stethoscope : TestTube;
  return <span className={`${base} bg-[#006E42]/8 text-[#006E42]`} aria-hidden><Icon className="h-4 w-4" /></span>;
}

function WishlistTile({ items }: { items: WishlistItem[] }) {
  const count = items.length;
  const value = items.reduce((sum, i) => sum + ("price" in i ? i.price : 0), 0);
  const byKind = items.reduce(
    (acc, i) => ((acc[i.kind] += 1), acc),
    { product: 0, doctor: 0, test: 0 } as Record<WishlistItem["kind"], number>,
  );
  const breakdown = (Object.keys(byKind) as WishlistItem["kind"][])
    .filter((k) => byKind[k] > 0)
    .map((k) => `${byKind[k]} ${KIND_LABEL[k]}${byKind[k] === 1 ? "" : "s"}`)
    .join("  ·  ");
  const preview = items.slice(0, 4);

  return (
    <Link href="/dashboard/wishlist" className={`group flex h-full flex-col ${CARD} p-6 transition hover:ring-[#006E42]/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006E42]/40`}>
      <div className="flex items-start justify-between">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#006E42]/8 text-[#006E42] transition group-hover:scale-105 group-hover:bg-[#006E42] group-hover:text-white"><Heart className="h-5 w-5" /></span>
        <ArrowUpRight className="h-4 w-4 text-[#0f3a26]/40 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#006E42]" />
      </div>

      {count === 0 ? (
        <div className="flex flex-1 flex-col justify-center py-4">
          <p className="text-[15px] font-bold text-[#0f3a26]">Nothing saved yet</p>
          <p className="mt-1 text-[11.5px] leading-relaxed text-[#0f3a26]/55">Tap the heart on any product, doctor, or test to keep it here for later.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-1 flex-col justify-center py-4">
            <p className="text-[40px] font-bold leading-none tabular-nums text-[#0f3a26]">{count}</p>
            <p className="mt-1.5 text-[13px] font-semibold text-[#0f3a26]">Saved item{count === 1 ? "" : "s"}</p>
            <p className="mt-0.5 text-[11.5px] text-[#0f3a26]/55">{breakdown}</p>
          </div>

          <div className="flex items-center justify-between border-t border-[#0f3a26]/8 pt-4">
            <div className="flex -space-x-2">
              {preview.map((i) => <WishThumb key={i.id} item={i} />)}
              {count > preview.length && (
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#0f3a26]/[0.06] text-[10px] font-bold text-[#0f3a26]/60 ring-2 ring-white">+{count - preview.length}</span>
              )}
            </div>
            {value > 0 && (
              <div className="text-right">
                <p className="text-[10px] font-medium uppercase tracking-wider text-[#0f3a26]/45">Worth</p>
                <p className="text-[13px] font-bold tabular-nums text-[#0f3a26]">₹{value.toLocaleString()}</p>
              </div>
            )}
          </div>
        </>
      )}
    </Link>
  );
}

/* ============================== Payments ============================== */

function PaymentsCard({ payments }: { payments: Payment[] | null }) {
  if (!payments) return <div className={`h-44 animate-pulse ${CARD}`} />;
  return (
    <section className={`${CARD} p-6 md:p-7`}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[14px] font-bold tracking-tight text-[#0f3a26]">Latest payments</h2>
        <Link href="/dashboard/track" className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#006E42] transition hover:underline">View orders<ArrowRight className="h-3 w-3" /></Link>
      </div>
      {payments.length === 0 ? (
        <p className="py-8 text-center text-[12px] text-[#0f3a26]/55">No payments yet.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-x-12 md:grid-cols-2">
          {payments.slice(0, 8).map((p) => (
            <li key={p.id} className="flex items-center gap-3 border-b border-[#0f3a26]/6 py-2.5 last:border-b-0">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#0f3a26]/[0.04] text-[#0f3a26]/55"><CreditCard className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-semibold text-[#0f3a26]">{p.label}</p>
                <p className="text-[10.5px] text-[#0f3a26]/50">{p.reference} · {p.method} · {new Date(p.at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
              </div>
              <p className="text-[13px] font-bold tabular-nums text-[#0f3a26]">₹{p.amount.toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ============================== Field ============================== */

function FieldInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#0f3a26]/45">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-[#0f3a26]/[0.14] bg-[#f6faf7] shadow-[inset_0_1px_2px_rgba(15,58,38,0.04)] px-3 py-2 text-[13.5px] text-[#0f3a26] focus:border-[#006E42]/40 focus:outline-none focus:ring-2 focus:ring-[#006E42]/15" />
    </label>
  );
}
