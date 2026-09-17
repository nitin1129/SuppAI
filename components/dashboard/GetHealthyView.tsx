"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Droplet,
  Loader2,
  MapPin,
  ShieldCheck,
  Star,
  TestTube,
  User,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { useBooking } from "./booking/BookingContext";
import { VendorLogo } from "./booking/VendorLogo";
import { useCart } from "@/lib/cart/CartContext";
import {
  checkAvailability,
  fetchSlots,
  fetchTestPackages,
} from "@/lib/health-tests/service";
import type { PendingOrder } from "@/lib/booking/order";
import type {
  Address,
  AvailabilityResult,
  Patient,
  Schedule,
  TestPackage,
  TimeSlot,
  Vendor,
} from "@/lib/health-tests/types";

const HOME_COLLECTION_FEE = 100;
const STEPS = ["Lab", "Location", "Patient", "Schedule", "Review"] as const;

export function GetHealthyView({ onHome }: { onHome?: () => void } = {}) {
  useBooking();
  const router = useRouter();
  const { addItem } = useCart();

  function addTestToCart(order: PendingOrder) {
    if (order.kind !== "test") return;
    addItem({
      kind: "test",
      vendorName: order.vendor.name,
      vendorLogo: undefined,
      tests: [order.pkg],
      patient: order.patient,
      schedule: order.schedule,
      subtotal: order.subtotal,
      collectionFee: order.homeCollectionFee,
    });
    router.push("/dashboard/cart");
  }

  const [packages, setPackages] = useState<TestPackage[] | null>(null);
  const [selected, setSelected] = useState<TestPackage | null>(null);

  useEffect(() => {
    let alive = true;
    fetchTestPackages().then((p) => alive && setPackages(p));
    return () => {
      alive = false;
    };
  }, []);

  if (selected) {
    return (
      <BookingWizard
        pkg={selected}
        onExit={() => setSelected(null)}
        onCheckout={addTestToCart}
      />
    );
  }

  return (
    <div className="px-4 pb-12 pt-2 md:px-10 md:pb-14">
      {onHome && (
        <button
          onClick={onHome}
          className="mb-3 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#0f3a26]/60 transition hover:text-[#006E42]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Diagnose & Consult
        </button>
      )}
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#006E42]/8 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[#006E42]">
          <TestTube className="h-3 w-3" />
          Lab tests
        </div>
        <h2 className="mt-4 text-[25px] font-semibold leading-[1.15] tracking-tight text-[#0f3a26] sm:text-[34px] sm:leading-[1.1]">
          Book a test. We come to you.
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-[#0f3a26]/60">
          Pick a package, choose a lab, and schedule a home sample collection
          between 6 AM and 6 PM.
        </p>
      </div>

      {!packages ? (
        <CatalogSkeleton />
      ) : (
        <div className="mt-9 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {packages.map((p, i) => (
            <PackageCard
              key={p.id}
              pkg={p}
              index={i}
              onSelect={() => setSelected(p)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function fromPrice(pkg: TestPackage) {
  return Math.min(...pkg.vendors.map((v) => v.price));
}

function PackageCard({
  pkg,
  index,
  onSelect,
}: {
  pkg: TestPackage;
  index: number;
  onSelect: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      onClick={onSelect}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white p-6 text-left ring-1 ring-[#006E42]/10 transition hover:ring-[#006E42]/30 hover:shadow-[0_18px_40px_-22px_rgba(0,110,66,0.3)]"
    >
      {pkg.popular && (
        <span className="absolute right-5 top-5 rounded-full bg-[#006E42] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
          Most booked
        </span>
      )}
      <h3 className="pr-24 text-[17px] font-semibold tracking-tight text-[#0f3a26]">
        {pkg.name}
      </h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-[#0f3a26]/60">
        {pkg.tagline}
      </p>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] text-[#0f3a26]/65">
        <span className="inline-flex items-center gap-1.5">
          <ClipboardList className="h-3.5 w-3.5 text-[#006E42]" />
          {pkg.parameterCount} parameters
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Droplet className="h-3.5 w-3.5 text-[#006E42]" />
          {pkg.fastingRequired ? "Fasting required" : "No fasting"}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-[#006E42]" />
          {pkg.vendors.length} labs
        </span>
      </div>

      <div className="mt-5 flex items-end justify-between border-t border-[#006E42]/8 pt-4">
        <div>
          <p className="text-[11px] text-[#0f3a26]/50">Starts at</p>
          <p className="text-[20px] font-semibold text-[#0f3a26]">
            ₹{fromPrice(pkg)}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#006E42] px-4 py-2 text-[13px] font-medium text-white transition group-hover:bg-[#005634]">
          View labs
          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </motion.button>
  );
}

function CatalogSkeleton() {
  return (
    <div className="mt-9 grid grid-cols-1 gap-4 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-[208px] animate-pulse rounded-2xl bg-white ring-1 ring-[#006E42]/8"
        />
      ))}
    </div>
  );
}

/* ------------------------------- WIZARD ------------------------------- */

function BookingWizard({
  pkg,
  onExit,
  onCheckout,
}: {
  pkg: TestPackage;
  onExit: () => void;
  onCheckout: (order: PendingOrder) => void;
}) {
  const [step, setStep] = useState(0);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [address, setAddress] = useState<Address>({
    pincode: "",
    line1: "",
    line2: "",
    city: "",
  });
  const [availability, setAvailability] = useState<AvailabilityResult | null>(
    null,
  );
  const [patient, setPatient] = useState<Patient>({
    fullName: "",
    dob: "",
    gender: "",
    phone: "",
  });
  const [schedule, setSchedule] = useState<Schedule>({
    date: "",
    slotId: "",
    slotLabel: "",
  });

  const valid = [
    !!vendor,
    !!availability?.serviceable &&
      address.line1.trim().length > 3 &&
      address.city.trim().length > 1,
    patient.fullName.trim().length > 1 &&
      patient.dob !== "" &&
      patient.gender !== "" &&
      /^\d{10}$/.test(patient.phone),
    schedule.date !== "" && schedule.slotId !== "",
    true,
  ];

  function next() {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else finalize();
  }

  function back() {
    if (step === 0) onExit();
    else setStep((s) => s - 1);
  }

  function finalize() {
    if (!vendor) return;
    const subtotal = vendor.price;
    const fee = vendor.homeCollection ? HOME_COLLECTION_FEE : 0;
    const discount = Math.max(0, vendor.mrp - vendor.price);
    const order: PendingOrder = {
      kind: "test",
      reference: `SA-${pkg.id.slice(0, 3).toUpperCase()}-${vendor.id.slice(0, 3).toUpperCase()}`,
      pkg,
      vendor,
      address,
      patient,
      schedule,
      subtotal,
      homeCollectionFee: fee,
      discount,
      total: subtotal + fee,
    };
    onCheckout(order);
  }

  return (
    <div className="flex h-full flex-col px-4 pb-4 pt-2 md:px-10">
      {/* Header + stepper */}
      <div className="shrink-0">
        <button
          onClick={onExit}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#0f3a26]/60 transition hover:text-[#006E42]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All packages
        </button>
        <h2 className="mt-3 text-[24px] font-semibold tracking-tight text-[#0f3a26]">
          {pkg.name}
        </h2>

        <div className="mt-5 flex items-center gap-2">
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

      {/* Step body */}
      <div className="no-scrollbar mt-7 min-h-0 flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === 0 && (
              <StepLab pkg={pkg} vendor={vendor} onPick={setVendor} />
            )}
            {step === 1 && (
              <StepLocation
                address={address}
                setAddress={setAddress}
                availability={availability}
                setAvailability={setAvailability}
              />
            )}
            {step === 2 && (
              <StepPatient patient={patient} setPatient={setPatient} />
            )}
            {step === 3 && (
              <StepSchedule schedule={schedule} setSchedule={setSchedule} />
            )}
            {step === 4 && vendor && (
              <StepReview
                pkg={pkg}
                vendor={vendor}
                address={address}
                patient={patient}
                schedule={schedule}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
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
            {step === STEPS.length - 1 ? "Add to cart" : "Continue"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ STEP 1: LAB ------------------------------ */

function StepLab({
  pkg,
  vendor,
  onPick,
}: {
  pkg: TestPackage;
  vendor: Vendor | null;
  onPick: (v: Vendor) => void;
}) {
  return (
    <div>
      <StepHeading
        title="Choose a lab"
        hint="Same test, accredited labs. Pick on price or turnaround."
      />
      <div className="mb-6 rounded-xl bg-[#006E42]/[0.04] p-4 ring-1 ring-[#006E42]/8">
        <p className="text-[12px] font-medium text-[#006E42]">
          What this covers
        </p>
        <ul className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {pkg.highlights.map((h) => (
            <li
              key={h}
              className="flex items-center gap-2 text-[12.5px] text-[#0f3a26]/70"
            >
              <Check className="h-3.5 w-3.5 shrink-0 text-[#006E42]" />
              {h}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {pkg.vendors.map((v) => (
          <LabTile
            key={v.id}
            vendor={v}
            active={vendor?.id === v.id}
            onSelect={() => onPick(v)}
          />
        ))}
      </div>
    </div>
  );
}

function LabTile({
  vendor: v,
  active,
  onSelect,
}: {
  vendor: Vendor;
  active: boolean;
  onSelect: () => void;
}) {
  const features = [
    { label: "Home sample collection", on: v.homeCollection },
    { label: "Online booking", on: v.onlineBooking },
    { label: "Digital results access", on: v.digitalResults },
  ];
  return (
    <div
      className={`flex flex-col rounded-2xl bg-[#0f3a26]/[0.03] p-5 transition ${
        active ? "ring-2 ring-[#006E42]/50" : "ring-1 ring-[#0f3a26]/8"
      }`}
    >
      <div className="flex items-start gap-4">
        <VendorLogo
          vendorId={v.id}
          name={v.name}
          className="h-12 w-[68px] text-[11px]"
        />
        <div className="min-w-0 flex-1">
          <p className="text-[16px] font-semibold leading-tight text-[#0f3a26]">
            {v.name}
          </p>
          <div className="mt-1 flex items-center gap-2 text-[11.5px] text-[#0f3a26]/55">
            <span className="inline-flex items-center gap-1">
              <Star className="h-3 w-3 fill-[#006E42] text-[#006E42]" />
              {v.rating}
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {v.turnaroundHours}h report
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[16px] font-semibold text-[#0f3a26]">₹{v.price}</p>
          <p className="text-[11px] text-[#0f3a26]/40 line-through">₹{v.mrp}</p>
        </div>
      </div>

      <ul className="mt-4 space-y-1.5">
        {features.map((f) => (
          <li
            key={f.label}
            className={`flex items-center gap-2 text-[13px] ${
              f.on ? "text-[#0f3a26]/80" : "text-[#0f3a26]/35"
            }`}
          >
            {f.on ? (
              <Check className="h-3.5 w-3.5 shrink-0 text-[#006E42]" />
            ) : (
              <X className="h-3.5 w-3.5 shrink-0 text-[#0f3a26]/30" />
            )}
            {f.label}
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-center justify-between border-t border-[#0f3a26]/8 pt-4">
        <span className="text-[12px] text-[#0f3a26]/55">
          {v.accreditation}
        </span>
        <button
          onClick={onSelect}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12.5px] font-medium transition ${
            active
              ? "bg-[#006E42] text-white"
              : "bg-[#0f3a26] text-white hover:bg-[#0f3a26]/85"
          }`}
        >
          {active ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Selected
            </>
          ) : (
            "Select lab"
          )}
        </button>
      </div>
    </div>
  );
}

/* --------------------------- STEP 2: LOCATION --------------------------- */

function StepLocation({
  address,
  setAddress,
  availability,
  setAvailability,
}: {
  address: Address;
  setAddress: (a: Address) => void;
  availability: AvailabilityResult | null;
  setAvailability: (a: AvailabilityResult | null) => void;
}) {
  const [checking, setChecking] = useState(false);

  async function onPincode(pincode: string) {
    const clean = pincode.replace(/[^\d]/g, "").slice(0, 6);
    setAddress({ ...address, pincode: clean });
    setAvailability(null);
    if (clean.length === 6) {
      setChecking(true);
      const result = await checkAvailability(clean);
      setAvailability(result);
      setChecking(false);
    }
  }

  return (
    <div className="max-w-xl">
      <StepHeading
        title="Where should we collect?"
        hint="Enter your pincode to confirm home collection is available."
      />
      <div className="space-y-4">
        <Field label="Pincode">
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#006E42]/50" />
            <input
              value={address.pincode}
              onChange={(e) => onPincode(e.target.value)}
              inputMode="numeric"
              placeholder="560001"
              className="w-full rounded-xl border border-[#006E42]/15 bg-white py-3 pl-10 pr-4 text-[15px] text-[#0f3a26] placeholder:text-[#006E42]/30 focus:border-[#006E42] focus:outline-none focus:ring-2 focus:ring-[#006E42]/15"
            />
            {checking && (
              <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#006E42]" />
            )}
          </div>
        </Field>

        {availability && (
          <div
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-[12.5px] font-medium ${
              availability.serviceable
                ? "bg-[#006E42]/8 text-[#006E42]"
                : "bg-[#a82929]/8 text-[#a82929]"
            }`}
          >
            {availability.serviceable ? (
              <Check className="h-4 w-4" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            {availability.message}
          </div>
        )}

        <Field label="Address line">
          <input
            value={address.line1}
            onChange={(e) => setAddress({ ...address, line1: e.target.value })}
            placeholder="Flat / house no, building, street"
            className="w-full rounded-xl border border-[#006E42]/15 bg-white px-4 py-3 text-[15px] text-[#0f3a26] placeholder:text-[#006E42]/30 focus:border-[#006E42] focus:outline-none focus:ring-2 focus:ring-[#006E42]/15"
          />
        </Field>
        <Field label="Landmark / area (optional)">
          <input
            value={address.line2}
            onChange={(e) => setAddress({ ...address, line2: e.target.value })}
            placeholder="Near…"
            className="w-full rounded-xl border border-[#006E42]/15 bg-white px-4 py-3 text-[15px] text-[#0f3a26] placeholder:text-[#006E42]/30 focus:border-[#006E42] focus:outline-none focus:ring-2 focus:ring-[#006E42]/15"
          />
        </Field>
        <Field label="City">
          <input
            value={address.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
            placeholder="Bengaluru"
            className="w-full rounded-xl border border-[#006E42]/15 bg-white px-4 py-3 text-[15px] text-[#0f3a26] placeholder:text-[#006E42]/30 focus:border-[#006E42] focus:outline-none focus:ring-2 focus:ring-[#006E42]/15"
          />
        </Field>
      </div>
    </div>
  );
}

/* ---------------------------- STEP 3: PATIENT ---------------------------- */

function StepPatient({
  patient,
  setPatient,
}: {
  patient: Patient;
  setPatient: (p: Patient) => void;
}) {
  const genders: { id: Patient["gender"]; label: string }[] = [
    { id: "female", label: "Female" },
    { id: "male", label: "Male" },
    { id: "other", label: "Other" },
  ];
  return (
    <div className="max-w-xl">
      <StepHeading
        title="Who is the test for?"
        hint="Details go on the lab report, so match the patient's ID."
      />
      <div className="space-y-4">
        <Field label="Full name">
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#006E42]/50" />
            <input
              value={patient.fullName}
              onChange={(e) =>
                setPatient({ ...patient, fullName: e.target.value })
              }
              placeholder="Jane Sharma"
              className="w-full rounded-xl border border-[#006E42]/15 bg-white py-3 pl-10 pr-4 text-[15px] text-[#0f3a26] placeholder:text-[#006E42]/30 focus:border-[#006E42] focus:outline-none focus:ring-2 focus:ring-[#006E42]/15"
            />
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Date of birth">
            <input
              type="date"
              value={patient.dob}
              onChange={(e) => setPatient({ ...patient, dob: e.target.value })}
              className="w-full rounded-xl border border-[#006E42]/15 bg-white px-4 py-3 text-[15px] text-[#0f3a26] focus:border-[#006E42] focus:outline-none focus:ring-2 focus:ring-[#006E42]/15"
            />
          </Field>
          <Field label="Phone">
            <input
              value={patient.phone}
              onChange={(e) =>
                setPatient({
                  ...patient,
                  phone: e.target.value.replace(/[^\d]/g, "").slice(0, 10),
                })
              }
              inputMode="numeric"
              placeholder="10-digit mobile"
              className="w-full rounded-xl border border-[#006E42]/15 bg-white px-4 py-3 text-[15px] text-[#0f3a26] placeholder:text-[#006E42]/30 focus:border-[#006E42] focus:outline-none focus:ring-2 focus:ring-[#006E42]/15"
            />
          </Field>
        </div>

        <Field label="Gender">
          <div className="grid grid-cols-3 gap-2.5">
            {genders.map((g) => (
              <button
                key={g.id}
                onClick={() => setPatient({ ...patient, gender: g.id })}
                className={`rounded-xl py-2.5 text-[13px] font-medium transition ${
                  patient.gender === g.id
                    ? "bg-[#006E42]/5 text-[#006E42] ring-2 ring-[#006E42]/40"
                    : "bg-white text-[#0f3a26]/75 ring-1 ring-[#006E42]/12 hover:ring-[#006E42]/30"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </Field>
      </div>
    </div>
  );
}

/* --------------------------- STEP 4: SCHEDULE --------------------------- */

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatBookingDate(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function StepSchedule({
  schedule,
  setSchedule,
}: {
  schedule: Schedule;
  setSchedule: (s: Schedule) => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Booking window: tomorrow through 60 days out.
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 60);

  const [viewMonth, setViewMonth] = useState(
    new Date(tomorrow.getFullYear(), tomorrow.getMonth(), 1),
  );
  // Slots are tagged with their date; a different date means "still loading".
  const [slotResult, setSlotResult] = useState<{ date: string; slots: TimeSlot[] } | null>(null);
  const slots = slotResult && slotResult.date === schedule.date ? slotResult.slots : null;

  useEffect(() => {
    if (!schedule.date) return;
    let alive = true;
    const date = schedule.date;
    fetchSlots(date).then((s) => alive && setSlotResult({ date, slots: s }));
    return () => {
      alive = false;
    };
  }, [schedule.date]);

  const firstDay = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(
    viewMonth.getFullYear(),
    viewMonth.getMonth() + 1,
    0,
  ).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d));
  }

  const canPrev =
    viewMonth.getFullYear() > tomorrow.getFullYear() ||
    (viewMonth.getFullYear() === tomorrow.getFullYear() &&
      viewMonth.getMonth() > tomorrow.getMonth());
  const canNext =
    viewMonth.getFullYear() < maxDate.getFullYear() ||
    (viewMonth.getFullYear() === maxDate.getFullYear() &&
      viewMonth.getMonth() < maxDate.getMonth());

  function shiftMonth(delta: number) {
    setViewMonth(
      new Date(viewMonth.getFullYear(), viewMonth.getMonth() + delta, 1),
    );
  }

  return (
    <div className="max-w-2xl">
      <StepHeading
        title="Pick a collection slot"
        hint="A phlebotomist visits your address. Slots run 6 AM to 6 PM."
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[300px_1fr]">
        {/* Calendar */}
        <div className="rounded-2xl bg-white p-4 ring-1 ring-[#006E42]/12">
          <div className="flex items-center justify-between px-1 pb-3">
            <p className="text-[14px] font-semibold text-[#0f3a26]">
              {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => shiftMonth(-1)}
                disabled={!canPrev}
                aria-label="Previous month"
                className="grid h-7 w-7 place-items-center rounded-lg text-[#0f3a26]/60 transition hover:bg-[#006E42]/8 hover:text-[#006E42] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => shiftMonth(1)}
                disabled={!canNext}
                aria-label="Next month"
                className="grid h-7 w-7 place-items-center rounded-lg text-[#0f3a26]/60 transition hover:bg-[#006E42]/8 hover:text-[#006E42] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((w, i) => (
              <span
                key={i}
                className="grid h-7 place-items-center text-[10.5px] font-medium uppercase text-[#0f3a26]/35"
              >
                {w}
              </span>
            ))}
            {cells.map((date, i) => {
              if (!date) return <span key={`e-${i}`} />;
              const iso = toISO(date);
              const disabled = date < tomorrow || date > maxDate;
              const selected = schedule.date === iso;
              return (
                <button
                  key={iso}
                  disabled={disabled}
                  onClick={() =>
                    setSchedule({ date: iso, slotId: "", slotLabel: "" })
                  }
                  className={`grid h-9 place-items-center rounded-lg text-[13px] font-medium transition ${
                    selected
                      ? "bg-[#006E42] text-white"
                      : disabled
                        ? "cursor-not-allowed text-[#0f3a26]/20"
                        : "text-[#0f3a26]/80 hover:bg-[#006E42]/8 hover:text-[#006E42]"
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time slots */}
        <div>
          {!schedule.date ? (
            <div className="flex h-full min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-[#006E42]/15 text-center text-[13px] text-[#0f3a26]/45">
              <p className="px-6">Pick a date to see available slots.</p>
            </div>
          ) : (
            <>
              <p className="mb-2.5 text-[12px] font-medium text-[#006E42]">
                Slots for {formatBookingDate(schedule.date)}
              </p>
              {!slots ? (
                <div className="grid grid-cols-3 gap-2.5">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-10 animate-pulse rounded-lg bg-white ring-1 ring-[#006E42]/8"
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2.5">
                  {slots.map((s) => (
                    <button
                      key={s.id}
                      disabled={!s.available}
                      onClick={() =>
                        setSchedule({
                          ...schedule,
                          slotId: s.id,
                          slotLabel: s.label,
                        })
                      }
                      className={`rounded-lg py-2.5 text-[12.5px] font-medium transition ${
                        schedule.slotId === s.id
                          ? "bg-[#006E42] text-white"
                          : s.available
                            ? "bg-white text-[#0f3a26]/80 ring-1 ring-[#006E42]/12 hover:ring-[#006E42]/30"
                            : "cursor-not-allowed bg-[#0f3a26]/[0.03] text-[#0f3a26]/25 line-through"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- STEP 5: REVIEW ---------------------------- */

function StepReview({
  pkg,
  vendor,
  address,
  patient,
  schedule,
}: {
  pkg: TestPackage;
  vendor: Vendor;
  address: Address;
  patient: Patient;
  schedule: Schedule;
}) {
  const fee = vendor.homeCollection ? HOME_COLLECTION_FEE : 0;
  const total = vendor.price + fee;
  const dayLabel = formatBookingDate(schedule.date);

  return (
    <div>
      <StepHeading
        title="Review your booking"
        hint="Confirm the details. You'll complete payment next."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.5fr_1fr]">
        {/* Booking details */}
        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#006E42]/12">
          <div className="flex items-center gap-3 border-b border-[#006E42]/8 p-5">
            <VendorLogo vendorId={vendor.id} name={vendor.name} className="h-10 w-10" />
            <div>
              <p className="text-[15px] font-semibold text-[#0f3a26]">{pkg.name}</p>
              <p className="mt-0.5 text-[12.5px] text-[#0f3a26]/55">
                {vendor.name} · {vendor.accreditation} · report in{" "}
                {vendor.turnaroundHours}h
              </p>
            </div>
          </div>
          <dl className="divide-y divide-[#006E42]/8 text-[13px]">
            <ReviewRow
              label="Patient"
              value={`${patient.fullName} · ${patient.gender} · ${patient.dob}`}
            />
            <ReviewRow label="Phone" value={patient.phone} />
            <ReviewRow
              label="Collection"
              value={`${dayLabel}, ${schedule.slotLabel}`}
            />
            <ReviewRow
              label="Address"
              value={[address.line1, address.line2, address.city, address.pincode]
                .filter(Boolean)
                .join(", ")}
            />
            <ReviewRow
              label="Test"
              value={`${pkg.parameterCount} parameters · ${
                pkg.fastingRequired ? "fasting required" : "no fasting"
              }`}
            />
          </dl>
        </div>

        {/* Price summary */}
        <div className="flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-[#006E42] to-[#00532f] p-6 text-white">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/65">
            Amount summary
          </p>
          <div className="mt-4 space-y-2.5 text-[13px]">
            <SummaryRow label="Test price" value={`₹${vendor.price}`} />
            <SummaryRow label="Home collection" value={`₹${fee}`} />
            <SummaryRow
              label="You save"
              value={`₹${Math.max(0, vendor.mrp - vendor.price)}`}
              highlight
            />
          </div>
          <div className="mt-auto pt-6">
            <div className="flex items-end justify-between border-t border-white/15 pt-4">
              <span className="text-[13px] text-white/75">Total payable</span>
              <span className="text-[30px] font-semibold leading-none">
                ₹{total}
              </span>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-white/55">
              Inclusive of all taxes. We&apos;ll add this to your cart for checkout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/70">{label}</span>
      <span className={highlight ? "font-semibold text-[#9af2c4]" : "text-white"}>
        {value}
      </span>
    </div>
  );
}

/* ------------------------------- HELPERS ------------------------------- */

function StepHeading({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="mb-6">
      <h3 className="text-[20px] font-semibold tracking-tight text-[#0f3a26]">
        {title}
      </h3>
      <p className="mt-1 text-[13px] text-[#0f3a26]/55">{hint}</p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-medium text-[#006E42]">
        {label}
      </label>
      {children}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-6 px-5 py-3">
      <dt className="shrink-0 text-[#0f3a26]/55">{label}</dt>
      <dd className="text-right font-medium text-[#0f3a26]">{value}</dd>
    </div>
  );
}

