"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Languages,
  MapPin,
  Stethoscope,
  Star,
  User,
  Video,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useBooking } from "./booking/BookingContext";
import { DoctorAvatar } from "./booking/DoctorAvatar";
import { useCart } from "@/lib/cart/CartContext";
import { fetchDoctors, fetchSpecialties } from "@/lib/consult/service";
import type { ConsultMode, Doctor, Specialty } from "@/lib/consult/types";
import type { ConsultOrder } from "@/lib/booking/order";
import { fetchSlots } from "@/lib/health-tests/service";
import type { Patient, Schedule, TimeSlot } from "@/lib/health-tests/types";
import { MONTHS, WEEKDAYS, formatBookingDate, toISO } from "@/lib/booking/date";

const PLATFORM_FEE = 29;
const STEPS = ["Profile", "Patient", "Schedule", "Review"] as const;

export function ConsultView({ onHome }: { onHome?: () => void }) {
  useBooking();
  const router = useRouter();
  const { addItem } = useCart();

  function addConsultToCart(order: ConsultOrder) {
    addItem({
      kind: "consult",
      doctor: order.doctor,
      mode: order.mode,
      patient: order.patient,
      schedule: order.schedule,
      fee: order.fee,
      platformFee: order.platformFee,
    });
    router.push("/dashboard/cart");
  }

  const [specialties, setSpecialties] = useState<Specialty[] | null>(null);
  const [specialty, setSpecialty] = useState<string>("");
  const [pincode, setPincode] = useState("");
  // Results are tagged with the query that produced them, so "loading" is simply
  // "the latest results are for a different query".
  const doctorQuery = `${specialty}|${pincode}`;
  const [doctorResult, setDoctorResult] = useState<{ query: string; doctors: Doctor[] } | null>(null);
  const doctors = doctorResult ? doctorResult.doctors : null;
  const loading = doctorResult?.query !== doctorQuery;
  const [selected, setSelected] = useState<Doctor | null>(null);

  useEffect(() => {
    let alive = true;
    fetchSpecialties().then((s) => {
      if (!alive) return;
      setSpecialties(s);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    const query = `${specialty}|${pincode}`;
    fetchDoctors(specialty || "all", pincode).then((d) => {
      if (!alive) return;
      setDoctorResult({ query, doctors: d });
    });
    return () => {
      alive = false;
    };
  }, [specialty, pincode]);

  if (selected) {
    return (
      <ConsultWizard
        doctor={selected}
        onExit={() => setSelected(null)}
        onCheckout={addConsultToCart}
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
          <Stethoscope className="h-3 w-3" />
          Consult a doctor
        </div>
        <h2 className="mt-4 text-[25px] font-semibold leading-[1.15] tracking-tight text-[#0f3a26] sm:text-[34px] sm:leading-[1.1]">
          Find the right specialist.
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-[#0f3a26]/60">
          Pick a specialty and your area, then choose a doctor for a video or
          in-clinic consultation.
        </p>
      </div>

      {/* Specialty chips with pincode on the right corner */}
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <div className="flex flex-1 flex-wrap gap-2">
          <SpecialtyChip
            label="All"
            active={specialty === ""}
            onClick={() => setSpecialty("")}
          />
          {(specialties ?? []).map((s) => (
            <SpecialtyChip
              key={s.id}
              label={s.label}
              active={specialty === s.id}
              onClick={() => setSpecialty(s.id)}
            />
          ))}
        </div>

        <div className="relative w-[180px] shrink-0">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#006E42]/50" />
          <input
            value={pincode}
            onChange={(e) =>
              setPincode(e.target.value.replace(/[^\d]/g, "").slice(0, 6))
            }
            inputMode="numeric"
            placeholder="Pincode"
            className="w-full rounded-full border border-[#006E42]/15 bg-white py-2 pl-9 pr-3 text-[13px] text-[#0f3a26] placeholder:text-[#006E42]/35 focus:border-[#006E42] focus:outline-none focus:ring-2 focus:ring-[#006E42]/15"
          />
        </div>
      </div>

      {/* Results */}
      <div className="mt-7">
        <p className="mb-3 text-[12px] text-[#0f3a26]/55">
          {doctors ? `${doctors.length} doctors` : "Loading"}
          {pincode.length === 6 ? ` near ${pincode}` : " · recommended"} ·
          sorted by rating
        </p>
        {loading || !doctors ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[150px] animate-pulse rounded-2xl bg-white ring-1 ring-[#006E42]/8"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {doctors.map((d) => (
              <DoctorCard key={d.id} doctor={d} onView={() => setSelected(d)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SpecialtyChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-[12.5px] font-medium transition ${
        active
          ? "bg-[#006E42] text-white"
          : "bg-white text-[#0f3a26]/75 ring-1 ring-[#006E42]/15 hover:ring-[#006E42]/35"
      }`}
    >
      {label}
    </button>
  );
}

function DoctorCard({
  doctor: d,
  onView,
}: {
  doctor: Doctor;
  onView: () => void;
}) {
  return (
    <div className="flex flex-col rounded-2xl bg-white p-5 ring-1 ring-[#006E42]/10 transition hover:ring-[#006E42]/25">
      <div className="flex items-start gap-4">
        <DoctorAvatar id={d.id} name={d.name} />
        <div className="min-w-0 flex-1">
          <p className="text-[15.5px] font-semibold text-[#0f3a26]">{d.name}</p>
          <p className="text-[12.5px] text-[#0f3a26]/60">{d.specialtyLabel}</p>
          <p className="mt-0.5 text-[11.5px] text-[#0f3a26]/45">
            {d.qualifications}
          </p>
        </div>
        <span className="rounded-full bg-[#006E42]/8 px-2.5 py-0.5 text-[11px] font-medium text-[#006E42]">
          {d.nextAvailable}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-[#0f3a26]/65">
        <span className="inline-flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 fill-[#006E42] text-[#006E42]" />
          {d.rating} ({(d.reviewCount / 1000).toFixed(1)}k)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-[#006E42]" />
          {d.experienceYears} yrs exp
        </span>
        {d.modes.includes("video") && (
          <span className="inline-flex items-center gap-1.5">
            <Video className="h-3.5 w-3.5 text-[#006E42]" />
            Video
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#006E42]/8 pt-4">
        <p className="text-[14px] font-semibold text-[#0f3a26]">
          ₹{d.fee}
          <span className="ml-1 text-[11px] font-normal text-[#0f3a26]/45">
            consult
          </span>
        </p>
        <button
          onClick={onView}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#006E42] px-4 py-1.5 text-[12.5px] font-medium text-white transition hover:bg-[#005634]"
        >
          View profile
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------- WIZARD ------------------------------- */

function ConsultWizard({
  doctor,
  onExit,
  onCheckout,
}: {
  doctor: Doctor;
  onExit: () => void;
  onCheckout: (order: ConsultOrder) => void;
}) {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<ConsultMode>(doctor.modes[0]);
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
    true,
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
    const order: ConsultOrder = {
      kind: "consult",
      reference: `SA-DOC-${doctor.id.slice(3, 7).toUpperCase()}`,
      doctor,
      mode,
      patient,
      schedule,
      fee: doctor.fee,
      platformFee: PLATFORM_FEE,
      total: doctor.fee + PLATFORM_FEE,
    };
    onCheckout(order);
  }

  return (
    <div className="flex h-full flex-col px-4 pb-4 pt-2 md:px-10">
      <div className="shrink-0">
        <button
          onClick={onExit}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#0f3a26]/60 transition hover:text-[#006E42]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All doctors
        </button>

        <div className="mt-3 flex items-center gap-2">
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
              <StepProfile doctor={doctor} mode={mode} setMode={setMode} />
            )}
            {step === 1 && (
              <StepPatient patient={patient} setPatient={setPatient} />
            )}
            {step === 2 && (
              <StepSchedule schedule={schedule} setSchedule={setSchedule} />
            )}
            {step === 3 && (
              <StepReview
                doctor={doctor}
                mode={mode}
                patient={patient}
                schedule={schedule}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="shrink-0 border-t border-[#006E42]/10 pt-4">
        <div className="flex items-center justify-between">
          <button
            onClick={back}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium text-[#0f3a26]/70 transition hover:bg-[#006E42]/5"
          >
            <ArrowLeft className="h-4 w-4" />
            {step === 0 ? "Back to doctors" : "Back"}
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

/* ---------------------------- STEP: PROFILE ---------------------------- */

function StepProfile({
  doctor: d,
  mode,
  setMode,
}: {
  doctor: Doctor;
  mode: ConsultMode;
  setMode: (m: ConsultMode) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div>
        <div className="flex items-start gap-4">
          <DoctorAvatar id={d.id} name={d.name} className="h-16 w-16 text-[18px]" />
          <div>
            <h3 className="text-[22px] font-semibold tracking-tight text-[#0f3a26]">
              {d.name}
            </h3>
            <p className="text-[13.5px] text-[#0f3a26]/65">{d.specialtyLabel}</p>
            <p className="mt-0.5 text-[12px] text-[#0f3a26]/45">
              {d.qualifications}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-[#0f3a26]/65">
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-[#006E42] text-[#006E42]" />
                {d.rating} · {d.reviewCount.toLocaleString()} reviews
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[#006E42]" />
                {d.experienceYears} yrs
              </span>
            </div>
          </div>
        </div>

        <p className="mt-5 text-[13.5px] leading-[1.6] text-[#0f3a26]/70">
          {d.bio}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-[12px] text-[#0f3a26]/60">
          <Languages className="h-3.5 w-3.5 text-[#006E42]" />
          {d.languages.join(", ")}
        </div>

        <div className="mt-6">
          <p className="mb-2.5 text-[12px] font-medium text-[#006E42]">
            Patient reviews
          </p>
          <div className="space-y-2.5">
            {d.reviews.map((r, i) => (
              <div
                key={i}
                className="rounded-xl bg-[#0f3a26]/[0.03] p-3.5 ring-1 ring-[#0f3a26]/6"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[12.5px] font-semibold text-[#0f3a26]">
                    {r.author}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#006E42]">
                    <Star className="h-3 w-3 fill-[#006E42] text-[#006E42]" />
                    {r.rating}
                  </span>
                </div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-[#0f3a26]/70">
                  {r.text}
                </p>
                <p className="mt-1 text-[10.5px] text-[#0f3a26]/40">{r.when}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking sidebar */}
      <div className="h-fit rounded-2xl bg-white p-5 ring-1 ring-[#006E42]/12">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#006E42]/65">
          Consultation
        </p>
        <p className="mt-1 text-[24px] font-semibold text-[#0f3a26]">
          ₹{d.fee}
        </p>
        <p className="text-[12px] text-[#0f3a26]/55">Next available {d.nextAvailable.toLowerCase()}</p>

        <p className="mb-2 mt-5 text-[12px] font-medium text-[#006E42]">Mode</p>
        <div className="space-y-2">
          {d.modes.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-[13px] font-medium transition ${
                mode === m
                  ? "bg-[#006E42]/5 text-[#006E42] ring-2 ring-[#006E42]/40"
                  : "bg-white text-[#0f3a26]/75 ring-1 ring-[#006E42]/12 hover:ring-[#006E42]/30"
              }`}
            >
              {m === "video" ? (
                <Video className="h-4 w-4" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
              {m === "video" ? "Video consultation" : "In-clinic visit"}
            </button>
          ))}
        </div>
        {mode === "in-clinic" && (
          <p className="mt-3 text-[11.5px] leading-relaxed text-[#0f3a26]/55">
            {d.clinic}
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------------------------- STEP: PATIENT ---------------------------- */

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
      <h3 className="text-[20px] font-semibold tracking-tight text-[#0f3a26]">
        Who is the consult for?
      </h3>
      <p className="mb-6 mt-1 text-[13px] text-[#0f3a26]/55">
        The doctor sees these details before your appointment.
      </p>
      <div className="space-y-4">
        <FieldLabel label="Full name">
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
        </FieldLabel>
        <div className="grid grid-cols-2 gap-4">
          <FieldLabel label="Date of birth">
            <input
              type="date"
              value={patient.dob}
              onChange={(e) => setPatient({ ...patient, dob: e.target.value })}
              className="w-full rounded-xl border border-[#006E42]/15 bg-white px-4 py-3 text-[15px] text-[#0f3a26] focus:border-[#006E42] focus:outline-none focus:ring-2 focus:ring-[#006E42]/15"
            />
          </FieldLabel>
          <FieldLabel label="Phone">
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
          </FieldLabel>
        </div>
        <FieldLabel label="Gender">
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
        </FieldLabel>
      </div>
    </div>
  );
}

/* ---------------------------- STEP: SCHEDULE ---------------------------- */

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
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 30);

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
  for (let d = 1; d <= daysInMonth; d++)
    cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d));

  const canPrev =
    viewMonth.getFullYear() > tomorrow.getFullYear() ||
    (viewMonth.getFullYear() === tomorrow.getFullYear() &&
      viewMonth.getMonth() > tomorrow.getMonth());
  const canNext =
    viewMonth.getFullYear() < maxDate.getFullYear() ||
    (viewMonth.getFullYear() === maxDate.getFullYear() &&
      viewMonth.getMonth() < maxDate.getMonth());

  return (
    <div className="max-w-2xl">
      <h3 className="text-[20px] font-semibold tracking-tight text-[#0f3a26]">
        Pick an appointment slot
      </h3>
      <p className="mb-6 mt-1 text-[13px] text-[#0f3a26]/55">
        Choose a day and time that works for you.
      </p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[300px_1fr]">
        <div className="rounded-2xl bg-white p-4 ring-1 ring-[#006E42]/12">
          <div className="flex items-center justify-between px-1 pb-3">
            <p className="text-[14px] font-semibold text-[#0f3a26]">
              {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setViewMonth(
                    new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1),
                  )
                }
                disabled={!canPrev}
                className="grid h-7 w-7 place-items-center rounded-lg text-[#0f3a26]/60 transition hover:bg-[#006E42]/8 disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() =>
                  setViewMonth(
                    new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1),
                  )
                }
                disabled={!canNext}
                className="grid h-7 w-7 place-items-center rounded-lg text-[#0f3a26]/60 transition hover:bg-[#006E42]/8 disabled:opacity-30"
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
                        : "text-[#0f3a26]/80 hover:bg-[#006E42]/8"
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          {!schedule.date ? (
            <div className="flex h-full min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-[#006E42]/15 text-center text-[13px] text-[#0f3a26]/45">
              <p className="px-6">Pick a date to see slots.</p>
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

/* ---------------------------- STEP: REVIEW ---------------------------- */

function StepReview({
  doctor: d,
  mode,
  patient,
  schedule,
}: {
  doctor: Doctor;
  mode: ConsultMode;
  patient: Patient;
  schedule: Schedule;
}) {
  const total = d.fee + PLATFORM_FEE;
  return (
    <div>
      <h3 className="text-[20px] font-semibold tracking-tight text-[#0f3a26]">
        Review your consultation
      </h3>
      <p className="mb-6 mt-1 text-[13px] text-[#0f3a26]/55">
        Confirm the details. We&apos;ll add this to your cart for checkout.
      </p>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#006E42]/12">
          <div className="flex items-center gap-3 border-b border-[#006E42]/8 p-5">
            <DoctorAvatar id={d.id} name={d.name} className="h-11 w-11 text-[14px]" />
            <div>
              <p className="text-[15px] font-semibold text-[#0f3a26]">{d.name}</p>
              <p className="mt-0.5 text-[12.5px] text-[#0f3a26]/55">
                {d.specialtyLabel}
              </p>
            </div>
          </div>
          <dl className="divide-y divide-[#006E42]/8 text-[13px]">
            <ReviewRow
              label="Mode"
              value={mode === "video" ? "Video consultation" : `In-clinic · ${d.clinic}`}
            />
            <ReviewRow
              label="When"
              value={`${formatBookingDate(schedule.date)}, ${schedule.slotLabel}`}
            />
            <ReviewRow
              label="Patient"
              value={`${patient.fullName} · ${patient.gender} · ${patient.dob}`}
            />
            <ReviewRow label="Phone" value={patient.phone} />
          </dl>
        </div>

        <div className="flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-[#006E42] to-[#00532f] p-6 text-white">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/65">
            Amount summary
          </p>
          <div className="mt-4 space-y-2.5 text-[13px]">
            <div className="flex items-center justify-between">
              <span className="text-white/70">Consultation fee</span>
              <span>₹{d.fee}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70">Platform fee</span>
              <span>₹{PLATFORM_FEE}</span>
            </div>
          </div>
          <div className="mt-auto pt-6">
            <div className="flex items-end justify-between border-t border-white/15 pt-4">
              <span className="text-[13px] text-white/75">Total payable</span>
              <span className="text-[30px] font-semibold leading-none">
                ₹{total}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
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
