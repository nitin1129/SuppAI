"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  FileUp,
  Lock,
  Mail,
  MessageCircle,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { rankPolicies, type RankedPolicy } from "@/lib/plans/service";
import { InsurerLogo } from "./InsurerLogo";
import { useCart } from "@/lib/cart/CartContext";
import type {
  InsuranceMember,
  MemberRelation,
  Preferences,
} from "@/lib/plans/types";

import { useBooking } from "../booking/BookingContext";

const STEPS = [
  "Recipient",
  "Members",
  "Details",
  "Preferences",
  "Policy",
  "Payment",
  "Done",
] as const;

const RELATIONS: { id: MemberRelation; label: string }[] = [
  { id: "self", label: "Self" },
  { id: "spouse", label: "Spouse" },
  { id: "son", label: "Son" },
  { id: "daughter", label: "Daughter" },
  { id: "father", label: "Father" },
  { id: "mother", label: "Mother" },
];

const HISTORY_OPTIONS = [
  "Diabetes",
  "Hypertension",
  "Thyroid",
  "Asthma",
  "Heart disease",
  "PCOS / PCOD",
  "Cancer history",
  "None",
];

type Props = {
  onExit: () => void;
};

export function InsuranceFlow({ onExit }: Props) {
  useBooking();
  const router = useRouter();
  const { addItem } = useCart();
  const [step, setStep] = useState(0);
  const [recipient, setRecipient] = useState("");
  const [members, setMembers] = useState<InsuranceMember[]>([
    {
      id: crypto.randomUUID(),
      relation: "self",
      name: "",
      age: "",
      gender: "",
      city: "",
      medicalHistory: [],
      otherMedical: "",
    },
  ]);
  const [prefs, setPrefs] = useState<Preferences>({
    yearlyBudget: 12000,
    coverLakhs: 12,
  });
  const [policies, setPolicies] = useState<RankedPolicy[] | null>(null);
  const [policyId, setPolicyId] = useState<string>("");
  const [payer, setPayer] = useState({
    fullName: "",
    pan: "",
    email: "",
    phone: "",
    panFileName: "",
  });

  // Re-rank policies whenever preferences change.
  useEffect(() => {
    let alive = true;
    rankPolicies(prefs).then((p) => {
      if (!alive) return;
      setPolicies(p);
      setPolicyId(p[0]?.id ?? "");
    });
    return () => {
      alive = false;
    };
  }, [prefs]);

  const selectedPolicy = policies?.find((p) => p.id === policyId) ?? null;

  const valid: boolean[] = [
    recipient.trim().length > 1,
    members.length > 0,
    members.every(
      (m) =>
        m.name.trim().length > 1 &&
        m.age.trim() !== "" &&
        m.gender !== "" &&
        m.city.trim().length > 1,
    ),
    prefs.yearlyBudget > 0 && prefs.coverLakhs > 0,
    !!selectedPolicy,
    payer.fullName.trim().length > 1 &&
      /^[A-Z0-9]{10}$/.test(payer.pan) &&
      /\S+@\S+\.\S+/.test(payer.email) &&
      /^\d{10}$/.test(payer.phone) &&
      payer.panFileName !== "",
    true,
  ];

  function next() {
    if (step === STEPS.length - 2) {
      // Going from Payment -> Done: route through cart instead.
      if (selectedPolicy) {
        addItem({
          kind: "insurance",
          policy: selectedPolicy,
          insurer: selectedPolicy.insurer,
          cover: selectedPolicy.cover,
          termYears: selectedPolicy.termYears,
          premium: selectedPolicy.premium,
          members: members.length,
        });
      }
      router.push("/dashboard/cart");
      return;
    } else if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    }
  }

  function back() {
    if (step === 0) onExit();
    else if (step === STEPS.length - 1) onExit();
    else setStep((s) => s - 1);
  }

  const isPayment = step === 5;
  const isDone = step === 6;

  return (
    <div className="flex h-full flex-col px-4 pb-4 pt-2 md:px-10">
      <div className="shrink-0">
        <button
          onClick={onExit}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#0f3a26]/60 transition hover:text-[#006E42]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Plans & Membership
        </button>
        <div className="mt-3 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#006E42]" />
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#006E42]">
            Health insurance
          </p>
        </div>

        <div className="mt-4 flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold transition ${
                    i < step
                      ? "bg-[#006E42] text-white"
                      : i === step
                        ? "bg-[#006E42] text-white ring-4 ring-[#006E42]/15"
                        : "bg-[#006E42]/10 text-[#0f3a26]/45"
                  }`}
                >
                  {i < step ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                <span
                  className={`hidden text-[12px] font-medium sm:block ${
                    i <= step ? "text-[#0f3a26]" : "text-[#0f3a26]/40"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <span
                  className={`h-px flex-1 ${
                    i < step ? "bg-[#006E42]" : "bg-[#006E42]/12"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="no-scrollbar mt-6 min-h-0 flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === 0 && (
              <StepRecipient recipient={recipient} setRecipient={setRecipient} />
            )}
            {step === 1 && (
              <StepMembers members={members} setMembers={setMembers} />
            )}
            {step === 2 && (
              <StepMemberDetails members={members} setMembers={setMembers} />
            )}
            {step === 3 && (
              <StepPreferences prefs={prefs} setPrefs={setPrefs} />
            )}
            {step === 4 && (
              <StepPolicy
                policies={policies}
                selectedId={policyId}
                onSelect={setPolicyId}
                prefs={prefs}
                memberCount={members.length}
              />
            )}
            {step === 5 && (
              <StepPayment payer={payer} setPayer={setPayer} policy={selectedPolicy} />
            )}
            {step === 6 && selectedPolicy && (
              <StepDone
                recipient={recipient}
                policy={selectedPolicy}
                memberCount={members.length}
                onClose={onExit}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {!isDone && (
        <div className="shrink-0 border-t border-[#006E42]/10 pt-4">
          <div className="flex items-center justify-between">
            <button
              onClick={back}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium text-[#0f3a26]/70 transition hover:bg-[#006E42]/5"
            >
              <ArrowLeft className="h-4 w-4" />
              {step === 0 ? "Cancel" : "Back"}
            </button>
            <button
              onClick={next}
              disabled={!valid[step]}
              className="inline-flex items-center gap-2 rounded-lg bg-[#006E42] px-6 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#005634] disabled:cursor-not-allowed disabled:bg-[#006E42]/30"
            >
              {isPayment ? (
                <>
                  <Lock className="h-3.5 w-3.5" />
                  Add to cart
                </>
              ) : step === 4 ? (
                "Continue to review"
              ) : (
                "Continue"
              )}
              {!isPayment && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ STEPS ------------------------------ */

function StepRecipient({
  recipient,
  setRecipient,
}: {
  recipient: string;
  setRecipient: (v: string) => void;
}) {
  return (
    <div className="max-w-xl">
      <StepHeading
        title="Who is this policy for?"
        hint="The proposer's name. They'll be the primary contact on the policy."
      />
      <FieldLabel label="Recipient's full name" required>
        <input
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="Jane Sharma"
          className="w-full rounded-xl border border-[#006E42]/15 bg-white px-4 py-3 text-[15px] text-[#0f3a26] placeholder:text-[#006E42]/30 focus:border-[#006E42] focus:outline-none focus:ring-2 focus:ring-[#006E42]/15"
        />
      </FieldLabel>
    </div>
  );
}

function StepMembers({
  members,
  setMembers,
}: {
  members: InsuranceMember[];
  setMembers: (m: InsuranceMember[]) => void;
}) {
  function add(relation: MemberRelation) {
    setMembers([
      ...members,
      {
        id: crypto.randomUUID(),
        relation,
        name: "",
        age: "",
        gender: "",
        city: "",
        medicalHistory: [],
        otherMedical: "",
      },
    ]);
  }

  function remove(id: string) {
    setMembers(members.filter((m) => m.id !== id));
  }

  return (
    <div>
      <StepHeading
        title="Who do you want to cover?"
        hint="Add yourself and family members. You can edit details next."
      />

      <p className="mb-2 text-[12px] font-medium text-[#006E42]">Add a member</p>
      <div className="flex flex-wrap gap-2">
        {RELATIONS.map((r) => (
          <button
            key={r.id}
            onClick={() => add(r.id)}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-[12.5px] font-medium text-[#0f3a26]/80 ring-1 ring-[#006E42]/15 transition hover:ring-[#006E42]/35"
          >
            <Plus className="h-3 w-3" />
            {r.label}
          </button>
        ))}
      </div>

      <p className="mb-2 mt-6 text-[12px] font-medium text-[#006E42]">
        Covered members ({members.length})
      </p>
      <ul className="space-y-2">
        {members.map((m, i) => (
          <li
            key={m.id}
            className="flex items-center gap-3 rounded-xl bg-white p-3.5 ring-1 ring-[#006E42]/12"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#006E42]/10 text-[#006E42]">
              <Users className="h-4 w-4" />
            </span>
            <div className="flex-1">
              <p className="text-[13.5px] font-semibold capitalize text-[#0f3a26]">
                Member {i + 1} · {m.relation}
              </p>
              <p className="text-[11.5px] text-[#0f3a26]/55">
                Details on next step
              </p>
            </div>
            {members.length > 1 && (
              <button
                onClick={() => remove(m.id)}
                aria-label="Remove member"
                className="grid h-8 w-8 place-items-center rounded-lg text-[#0f3a26]/45 transition hover:bg-[#a82929]/8 hover:text-[#a82929]"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StepMemberDetails({
  members,
  setMembers,
}: {
  members: InsuranceMember[];
  setMembers: (m: InsuranceMember[]) => void;
}) {
  function update(id: string, patch: Partial<InsuranceMember>) {
    setMembers(members.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }
  function toggleHistory(id: string, condition: string) {
    const m = members.find((x) => x.id === id);
    if (!m) return;
    const has = m.medicalHistory.includes(condition);
    update(id, {
      medicalHistory: has
        ? m.medicalHistory.filter((c) => c !== condition)
        : condition === "None"
          ? ["None"]
          : [...m.medicalHistory.filter((c) => c !== "None"), condition],
    });
  }

  return (
    <div>
      <StepHeading
        title="Member details"
        hint="Honest answers keep claims smooth."
      />
      <div className="space-y-5">
        {members.map((m, i) => (
          <div
            key={m.id}
            className="rounded-2xl bg-white p-5 ring-1 ring-[#006E42]/12"
          >
            <p className="mb-4 text-[13px] font-semibold capitalize text-[#0f3a26]">
              Member {i + 1} ·{" "}
              <span className="text-[#006E42]">{m.relation}</span>
            </p>
            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
              <FieldLabel label="Name" required>
                <input
                  value={m.name}
                  onChange={(e) => update(m.id, { name: e.target.value })}
                  placeholder="Full name"
                  className="w-full rounded-lg border border-[#006E42]/15 bg-white px-3.5 py-2.5 text-[14px] text-[#0f3a26] placeholder:text-[#006E42]/30 focus:border-[#006E42] focus:outline-none focus:ring-2 focus:ring-[#006E42]/15"
                />
              </FieldLabel>
              <FieldLabel label="Age" required>
                <input
                  value={m.age}
                  onChange={(e) =>
                    update(m.id, {
                      age: e.target.value.replace(/[^\d]/g, "").slice(0, 3),
                    })
                  }
                  inputMode="numeric"
                  placeholder="32"
                  className="w-full rounded-lg border border-[#006E42]/15 bg-white px-3.5 py-2.5 text-[14px] text-[#0f3a26] placeholder:text-[#006E42]/30 focus:border-[#006E42] focus:outline-none focus:ring-2 focus:ring-[#006E42]/15"
                />
              </FieldLabel>
              <FieldLabel label="Gender" required>
                <div className="flex gap-2">
                  {(["female", "male", "other"] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => update(m.id, { gender: g })}
                      className={`flex-1 rounded-lg py-2 text-[12.5px] font-medium capitalize transition ${
                        m.gender === g
                          ? "bg-[#006E42]/5 text-[#006E42] ring-2 ring-[#006E42]/40"
                          : "bg-white text-[#0f3a26]/75 ring-1 ring-[#006E42]/12 hover:ring-[#006E42]/30"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </FieldLabel>
              <FieldLabel label="City" required>
                <input
                  value={m.city}
                  onChange={(e) => update(m.id, { city: e.target.value })}
                  placeholder="Bengaluru"
                  className="w-full rounded-lg border border-[#006E42]/15 bg-white px-3.5 py-2.5 text-[14px] text-[#0f3a26] placeholder:text-[#006E42]/30 focus:border-[#006E42] focus:outline-none focus:ring-2 focus:ring-[#006E42]/15"
                />
              </FieldLabel>
            </div>

            <p className="mb-2 mt-4 text-[12px] font-medium text-[#006E42]">
              Medical history
            </p>
            <div className="flex flex-wrap gap-2">
              {HISTORY_OPTIONS.map((c) => {
                const on = m.medicalHistory.includes(c);
                return (
                  <button
                    key={c}
                    onClick={() => toggleHistory(m.id, c)}
                    className={`rounded-full px-3 py-1 text-[12px] font-medium transition ${
                      on
                        ? "bg-[#006E42] text-white"
                        : "bg-white text-[#0f3a26]/75 ring-1 ring-[#006E42]/15 hover:ring-[#006E42]/35"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const BUDGET_PRESETS = [6000, 12000, 18000, 25000, 36000];

/**
 * Cover (in lakhs) you can roughly buy for a given yearly premium.
 * Anchor: ₹25,000/yr ≈ ₹16L to ₹18L cover.
 */
export function coverRange(yearlyBudget: number) {
  const low = Math.max(3, Math.floor((yearlyBudget * 0.65) / 1000));
  const high = Math.min(50, Math.ceil((yearlyBudget * 0.72) / 1000));
  return { low, high };
}

function deriveCover(yearlyBudget: number) {
  const { low, high } = coverRange(yearlyBudget);
  return Math.round((low + high) / 2);
}

function StepPreferences({
  prefs,
  setPrefs,
}: {
  prefs: Preferences;
  setPrefs: (p: Preferences) => void;
}) {
  function update(yearlyBudget: number) {
    setPrefs({ yearlyBudget, coverLakhs: deriveCover(yearlyBudget) });
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_1fr]">
      {/* Left: budget input */}
      <div className="flex flex-col rounded-2xl bg-white p-7 ring-1 ring-[#006E42]/12">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#006E42]/65">
          What you can spend
        </p>
        <h3 className="mt-2 text-[22px] font-semibold tracking-tight text-[#0f3a26]">
          Yearly premium budget
        </h3>
        <p className="mt-1 text-[12.5px] text-[#0f3a26]/55">
          Drag the slider or pick a preset.
        </p>

        <div className="mt-6 flex items-baseline gap-2">
          <span className="text-[32px] font-bold leading-none tabular-nums text-[#0f3a26] sm:text-[44px]">
            ₹{prefs.yearlyBudget.toLocaleString()}
          </span>
          <span className="text-[13px] text-[#0f3a26]/55">/ year</span>
        </div>

        <input
          type="range"
          min={3000}
          max={60000}
          step={500}
          value={prefs.yearlyBudget}
          onChange={(e) => update(Number(e.target.value))}
          className="mt-5 w-full accent-[#006E42]"
        />
        <div className="mt-2 flex justify-between text-[10.5px] text-[#0f3a26]/45">
          <span>₹3,000</span>
          <span>₹60,000</span>
        </div>

        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          {BUDGET_PRESETS.map((b) => (
            <button
              key={b}
              onClick={() => update(b)}
              className={`rounded-full px-3 py-1 text-[12px] font-medium transition ${
                prefs.yearlyBudget === b
                  ? "bg-[#006E42] text-white"
                  : "bg-[#006E42]/8 text-[#006E42] hover:bg-[#006E42]/15"
              }`}
            >
              ₹{b.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* Right: derived coverage */}
      <div className="flex flex-col rounded-2xl bg-gradient-to-br from-[#006E42] to-[#00532f] p-7 text-white">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/65">
          Estimated cover
        </p>
        <h3 className="mt-2 text-[22px] font-semibold tracking-tight text-white">
          You&apos;ll get
        </h3>

        {(() => {
          const { low, high } = coverRange(prefs.yearlyBudget);
          return (
            <>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-[52px] font-bold leading-none tabular-nums">
                  ₹{low}L
                </span>
                <span className="text-[18px] font-medium text-white/65">to</span>
                <span className="text-[52px] font-bold leading-none tabular-nums">
                  ₹{high}L
                </span>
              </div>
              <p className="mt-1 text-[12.5px] text-white/60">
                Cover range based on partner insurer averages
              </p>
            </>
          );
        })()}

        <div className="mt-auto grid grid-cols-2 gap-4 border-t border-white/15 pt-5">
          <div>
            <p className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-white/55">
              Per month
            </p>
            <p className="mt-1 text-[16px] font-semibold tabular-nums">
              ₹{Math.round(prefs.yearlyBudget / 12).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-white/55">
              Per day
            </p>
            <p className="mt-1 text-[16px] font-semibold tabular-nums">
              ₹{Math.round(prefs.yearlyBudget / 365).toLocaleString()}
            </p>
          </div>
        </div>

        <p className="mt-3 text-[10.5px] leading-relaxed text-white/55">
          Auto-calculated. Final cover varies by insurer and underwriting.
        </p>
      </div>
    </div>
  );
}

function StepPolicy({
  policies,
  selectedId,
  onSelect,
  prefs,
  memberCount,
}: {
  policies: RankedPolicy[] | null;
  selectedId: string;
  onSelect: (id: string) => void;
  prefs: Preferences;
  memberCount: number;
}) {
  if (!policies) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-[260px] animate-pulse rounded-2xl bg-white ring-1 ring-[#006E42]/8"
          />
        ))}
      </div>
    );
  }

  const recommended = policies.filter((p) => p.recommended);
  const others = policies.filter((p) => !p.recommended);

  return (
    <div>
      <StepHeading
        title="Pick a policy"
        hint={`₹${prefs.coverLakhs}L cover · ₹${prefs.yearlyBudget.toLocaleString()}/yr budget · ${memberCount} ${memberCount === 1 ? "person" : "people"} · ${policies.length} options matched.`}
      />

      {/* Recommended container */}
      <div className="rounded-2xl bg-[#006E42]/[0.04] p-4 ring-1 ring-[#006E42]/15 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-[11.5px] font-medium uppercase tracking-[0.14em] text-[#006E42]">
            <Sparkles className="h-3 w-3" />
            Recommended for you
          </div>
          <span className="text-[11px] text-[#006E42]/65">
            Matched to your preferences
          </span>
        </div>
        <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
          {recommended.map((p) => (
            <PolicyCard
              key={p.id}
              policy={p}
              selected={p.id === selectedId}
              onSelect={() => onSelect(p.id)}
              recommended
            />
          ))}
        </div>
      </div>

      <div className="mb-3 mt-7 flex items-center gap-2 text-[11.5px] font-medium uppercase tracking-[0.14em] text-[#0f3a26]/55">
        Other options ({others.length})
      </div>
      <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
        {others.map((p) => (
          <PolicyCard
            key={p.id}
            policy={p}
            selected={p.id === selectedId}
            onSelect={() => onSelect(p.id)}
          />
        ))}
      </div>
    </div>
  );
}

function PolicyCard({
  policy: p,
  selected,
  onSelect,
  recommended,
}: {
  policy: RankedPolicy;
  selected: boolean;
  onSelect: () => void;
  recommended?: boolean;
}) {
  return (
    <button
      onClick={onSelect}
      className={`group flex w-full items-stretch gap-5 rounded-xl bg-white p-4 text-left transition-shadow duration-200 ease-out ${
        selected
          ? "shadow-[0_2px_4px_-2px_rgba(0,110,66,0.18),0_12px_24px_-18px_rgba(0,110,66,0.3)] ring-2 ring-inset ring-[#006E42]"
          : "shadow-[0_1px_2px_-1px_rgba(15,58,38,0.04)] ring-1 ring-inset ring-[#0f3a26]/8 hover:shadow-[0_2px_4px_-2px_rgba(15,58,38,0.06),0_14px_24px_-20px_rgba(0,110,66,0.2)] hover:ring-[#006E42]/30"
      }`}
    >
      {/* Prominent logo block */}
      <InsurerLogo
        insurer={p.insurer}
        className="h-[68px] w-[88px] shrink-0 text-[16px]"
      />

      {/* Body */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-[15px] font-semibold leading-tight text-[#0f3a26]">
            {p.insurer}
          </h4>
          {recommended && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#006E42]/10 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-[#006E42]">
              <Sparkles className="h-2.5 w-2.5" />
              Top match
            </span>
          )}
        </div>

        <ul className="mt-2 space-y-0.5">
          {p.features.slice(0, 3).map((f) => (
            <li
              key={f}
              className="flex items-center gap-1.5 text-[12px] text-[#0f3a26]/70"
            >
              <Check className="h-3 w-3 shrink-0 text-[#006E42]" strokeWidth={3} />
              <span className="truncate">{f}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <div className="flex min-w-0 flex-1 items-end gap-4">
            <div>
              <p className="text-[15.5px] font-bold leading-none tabular-nums text-[#0f3a26]">
                ₹{(p.cover / 100000).toFixed(0)}L
              </p>
              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-[#0f3a26]/45">
                Cover
              </p>
            </div>
            <span className="mb-1.5 h-6 w-px bg-[#0f3a26]/12" />
            <div>
              <p className="text-[15.5px] font-bold leading-none tabular-nums text-[#0f3a26]">
                ₹{p.premium.toLocaleString()}
              </p>
              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-[#0f3a26]/45">
                Per year
              </p>
            </div>
          </div>

          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[11.5px] font-semibold transition ${
              selected
                ? "bg-[#006E42] text-white"
                : "bg-[#0f3a26] text-white group-hover:bg-[#006E42]"
            }`}
          >
            {selected ? (
              <>
                <Check className="h-3 w-3" strokeWidth={3} />
                Selected
              </>
            ) : (
              "Read more ›"
            )}
          </span>
        </div>
      </div>
    </button>
  );
}

function StepPayment({
  payer,
  setPayer,
  policy,
}: {
  payer: {
    fullName: string;
    pan: string;
    email: string;
    phone: string;
    panFileName: string;
  };
  setPayer: (p: typeof payer) => void;
  policy: RankedPolicy | null;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <StepHeading
          title="Almost there"
          hint="KYC details required by the insurer. Marked with * are required."
        />
        <div className="space-y-4">
          <FieldLabel label="Full name (as on PAN)" required>
            <input
              value={payer.fullName}
              onChange={(e) => setPayer({ ...payer, fullName: e.target.value })}
              placeholder="JANE SHARMA"
              className="w-full rounded-xl border border-[#006E42]/15 bg-white px-4 py-3 text-[15px] text-[#0f3a26] placeholder:text-[#006E42]/30 focus:border-[#006E42] focus:outline-none focus:ring-2 focus:ring-[#006E42]/15"
            />
          </FieldLabel>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FieldLabel label="PAN number" required>
              <input
                value={payer.pan}
                onChange={(e) =>
                  setPayer({
                    ...payer,
                    pan: e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, "")
                      .slice(0, 10),
                  })
                }
                placeholder="ABCDE1234F"
                className="w-full rounded-xl border border-[#006E42]/15 bg-white px-4 py-3 text-[15px] uppercase tracking-wide text-[#0f3a26] placeholder:normal-case placeholder:text-[#006E42]/30 focus:border-[#006E42] focus:outline-none focus:ring-2 focus:ring-[#006E42]/15"
              />
            </FieldLabel>
            <FieldLabel label="PAN card upload" required>
              <label className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#006E42]/30 bg-white px-4 py-3 text-[13px] text-[#0f3a26]/70 transition hover:border-[#006E42]/60">
                <FileUp className="h-4 w-4 text-[#006E42]" />
                <span className="flex-1 truncate">
                  {payer.panFileName || "Tap to upload (JPG/PDF, < 2 MB)"}
                </span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setPayer({ ...payer, panFileName: f.name });
                  }}
                />
              </label>
            </FieldLabel>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FieldLabel label="Email" required>
              <input
                type="email"
                value={payer.email}
                onChange={(e) => setPayer({ ...payer, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-[#006E42]/15 bg-white px-4 py-3 text-[15px] text-[#0f3a26] placeholder:text-[#006E42]/30 focus:border-[#006E42] focus:outline-none focus:ring-2 focus:ring-[#006E42]/15"
              />
            </FieldLabel>
            <FieldLabel label="Mobile number" required>
              <input
                value={payer.phone}
                onChange={(e) =>
                  setPayer({
                    ...payer,
                    phone: e.target.value.replace(/[^\d]/g, "").slice(0, 10),
                  })
                }
                inputMode="numeric"
                placeholder="10-digit mobile"
                className="w-full rounded-xl border border-[#006E42]/15 bg-white px-4 py-3 text-[15px] text-[#0f3a26] placeholder:text-[#006E42]/30 focus:border-[#006E42] focus:outline-none focus:ring-2 focus:ring-[#006E42]/15"
              />
            </FieldLabel>
          </div>
        </div>

        <p className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#006E42]/5 px-3 py-2 text-[11.5px] font-medium text-[#006E42]">
          <Lock className="h-3.5 w-3.5" />
          Demo build: no Razorpay redirect. Clicking confirm issues the policy.
        </p>
      </div>

      <div className="flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-[#006E42] to-[#00532f] p-6 text-white">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/65">
          Premium summary
        </p>
        {policy ? (
          <>
            <p className="mt-3 text-[15px] font-semibold">{policy.insurer}</p>
            <p className="text-[12px] text-white/65">
              ₹{(policy.cover / 100000).toFixed(0)}L cover · {policy.termYears}-yr
              term
            </p>
            <div className="mt-5 space-y-2.5 text-[13px]">
              <Row label="Base premium" value={`₹${policy.premium.toLocaleString()}`} />
              <Row
                label="GST (18%)"
                value={`₹${Math.round(policy.premium * 0.18).toLocaleString()}`}
              />
            </div>
            <div className="mt-auto pt-5">
              <div className="flex items-end justify-between border-t border-white/15 pt-4">
                <span className="text-[13px] text-white/75">Total payable</span>
                <span className="text-[28px] font-semibold leading-none">
                  ₹{Math.round(policy.premium * 1.18).toLocaleString()}
                </span>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-white/55">
                Save up to ₹15,600 under Section 80D.
              </p>
            </div>
          </>
        ) : (
          <p className="mt-3 text-[12px] text-white/55">Pick a policy first.</p>
        )}
      </div>
    </div>
  );
}

function StepDone({
  recipient,
  policy,
  memberCount,
  onClose,
}: {
  recipient: string;
  policy: RankedPolicy;
  memberCount: number;
  onClose: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="max-w-lg text-center"
      >
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#006E42]/10 text-[#006E42]">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <h2 className="mt-6 text-[23px] font-semibold tracking-tight text-[#0f3a26] sm:text-[28px]">
          We&apos;re on it
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-[#0f3a26]/65">
          Thanks {recipient ? recipient.split(" ")[0] : "for your trust"}.
          Your application with {policy.insurer} for {memberCount}{" "}
          {memberCount === 1 ? "person" : "people"} has been submitted.
        </p>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#006E42]/8 px-3 py-1 text-[11.5px] font-medium text-[#006E42]">
          <ShieldCheck className="h-3.5 w-3.5" />
          Cover ₹{(policy.cover / 100000).toFixed(0)}L · valid {policy.termYears}{" "}
          {policy.termYears === 1 ? "year" : "years"}
        </div>

        <ul className="mt-7 space-y-3 text-left">
          <li className="flex items-start gap-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#006E42]/10 text-[#006E42]">
              <Clock className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-[#0f3a26]">
                Processing time
              </p>
              <p className="text-[12.5px] text-[#0f3a26]/60">
                3 to 5 business days for the insurer to verify and issue.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#006E42]/10 text-[#006E42]">
              <Mail className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-[#0f3a26]">
                Documents by email
              </p>
              <p className="text-[12.5px] text-[#0f3a26]/60">
                Policy schedule, ID card, and receipts will be emailed to you.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#006E42]/10 text-[#006E42]">
              <MessageCircle className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-[#0f3a26]">
                Questions?
              </p>
              <p className="text-[12.5px] text-[#0f3a26]/60">
                Reach our team at{" "}
                <a
                  href="mailto:care@suppai.health"
                  className="font-medium text-[#006E42] underline-offset-2 hover:underline"
                >
                  care@suppai.health
                </a>{" "}
                or open Support inside SuppAI.
              </p>
            </div>
          </li>
        </ul>

        <button
          onClick={onClose}
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#006E42] px-6 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#005634]"
        >
          Back to Plans
        </button>
      </motion.div>
    </div>
  );
}

/* ------------------------------ HELPERS ------------------------------ */

function StepHeading({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="mb-5">
      <h3 className="text-[20px] font-semibold tracking-tight text-[#0f3a26]">
        {title}
      </h3>
      <p className="mt-1 text-[13px] text-[#0f3a26]/55">{hint}</p>
    </div>
  );
}

function FieldLabel({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-medium text-[#006E42]">
        {label}
        {required && <span className="ml-0.5 text-[#a82929]">*</span>}
      </label>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/70">{label}</span>
      <span>{value}</span>
    </div>
  );
}
