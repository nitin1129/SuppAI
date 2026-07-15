"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CoffeeIcon,
  Plus,
  User,
  Video,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import { useDoctorSession } from "@/lib/partner/auth";
import {
  APPOINTMENT_STATUS_LABELS,
  WEEKDAYS,
  fetchAppointments,
  fetchAvailability,
  saveAvailability,
  updateAppointmentStatus,
} from "@/lib/partner/service";
import type {
  Appointment,
  AppointmentStatus,
  DoctorAvailability,
  TimeWindow,
  Weekday,
} from "@/lib/partner/types";

const EASE = [0.22, 1, 0.36, 1] as const;

type Tab = "today" | "calendar" | "settings";

export default function DoctorDashboardPage() {
  const { session } = useDoctorSession();
  const doctorId = session?.doctorId ?? "doc-1";
  const [appointments, setAppointments] = useState<Appointment[] | null>(null);
  const [availability, setAvailability] = useState<DoctorAvailability | null>(
    null,
  );
  const [tab, setTab] = useState<Tab>("today");
  const [selectedDate, setSelectedDate] = useState<string>(isoToday());

  useEffect(() => {
    if (!doctorId) return;
    let alive = true;
    fetchAppointments(doctorId).then((a) => alive && setAppointments(a));
    fetchAvailability(doctorId).then((a) => alive && setAvailability(a));
    return () => {
      alive = false;
    };
  }, [doctorId]);

  async function handleStatusChange(id: string, status: AppointmentStatus) {
    if (!appointments) return;
    setAppointments(
      appointments.map((a) => (a.id === id ? { ...a, status } : a)),
    );
    await updateAppointmentStatus(doctorId, id, status);
  }

  async function setLeaveForDate(
    date: string,
    enabled: boolean,
    message?: string,
  ) {
    if (!availability) return;
    const next: DoctorAvailability = { ...availability };
    const messages = { ...(availability.leaveMessages ?? {}) };
    if (enabled) {
      if (!next.blocked.includes(date))
        next.blocked = [...next.blocked, date].sort();
      if (message !== undefined) {
        if (message) messages[date] = message;
        else delete messages[date];
      }
    } else {
      next.blocked = next.blocked.filter((d) => d !== date);
      delete messages[date];
    }
    next.leaveMessages = messages;
    setAvailability(next);
    await saveAvailability(next);
  }

  return (
    <div className="space-y-7">
      {/* ============================== Hero ============================== */}
      <motion.section
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
      >
        <h1 className="text-[28px] font-bold leading-[1.1] tracking-tight text-[#0f3a26]">
          {greeting()}, {prettyName(session?.username)}.
        </h1>
      </motion.section>

      {/* ============================== Tabs ============================== */}
      <nav className="flex items-center gap-1 border-b border-[#0f3a26]/8">
        {(
          [
            { id: "today", label: "Today" },
            { id: "calendar", label: "Calendar" },
            { id: "settings", label: "Settings" },
          ] as { id: Tab; label: string }[]
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative px-4 py-3 text-[13px] font-semibold transition ${
              tab === t.id
                ? "text-[#006E42]"
                : "text-[#0f3a26]/55 hover:text-[#0f3a26]"
            }`}
          >
            {t.label}
            {tab === t.id && (
              <motion.span
                layoutId="doctor-tab"
                className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-[#006E42]"
              />
            )}
          </button>
        ))}
      </nav>

      {/* ============================== Panels ============================== */}
      {tab === "today" && (
        <TodayPanel
          appointments={appointments}
          availability={availability}
          onStatusChange={handleStatusChange}
          onSetLeave={setLeaveForDate}
        />
      )}

      {tab === "calendar" && (
        <CalendarPanel
          appointments={appointments}
          availability={availability}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onStatusChange={handleStatusChange}
          onSetLeave={setLeaveForDate}
        />
      )}

      {tab === "settings" && (
        <SettingsPanel
          availability={availability}
          onChange={setAvailability}
          onSetLeave={setLeaveForDate}
        />
      )}
    </div>
  );
}

/* ============================== Today panel ============================== */

function TodayPanel({
  appointments,
  availability,
  onStatusChange,
  onSetLeave,
}: {
  appointments: Appointment[] | null;
  availability: DoctorAvailability | null;
  onStatusChange: (id: string, s: AppointmentStatus) => void;
  onSetLeave: (date: string, enabled: boolean, message?: string) => void;
}) {
  const [drafting, setDrafting] = useState(false);
  const [draft, setDraft] = useState("");

  if (!appointments)
    return (
      <div className="h-72 animate-pulse rounded-2xl bg-white ring-1 ring-[#0f3a26]/8" />
    );

  const todayISO = isoToday();
  const onLeave = availability?.blocked.includes(todayISO) ?? false;
  const leaveMessage = availability?.leaveMessages?.[todayISO] ?? "";

  const today = appointments
    .filter((a) => a.schedule.date === todayISO)
    .sort((a, b) => a.schedule.slotLabel.localeCompare(b.schedule.slotLabel));

  const next7 = appointments
    .filter(
      (a) => a.schedule.date > todayISO && a.status === "upcoming",
    )
    .sort((a, b) => a.schedule.date.localeCompare(b.schedule.date))
    .slice(0, 4);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.55fr_1fr]">
      {/* Left: today's day */}
      <section>
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#006E42]">
              {longDate(todayISO)}
            </p>
            <p className="mt-1.5 text-[20px] font-bold tracking-tight text-[#0f3a26]">
              {onLeave
                ? "You're off today."
                : today.length === 0
                  ? "No appointments today."
                  : `${today.length} appointment${today.length === 1 ? "" : "s"}.`}
            </p>
          </div>

          {!onLeave && !drafting && (
            <button
              onClick={() => setDrafting(true)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold text-[#006E42] transition hover:bg-[#006E42]/8"
            >
              <CoffeeIcon className="h-3.5 w-3.5" />
              Take today off
            </button>
          )}
        </div>

        {/* Leave drafting */}
        {drafting && !onLeave && (
          <div className="mt-5 rounded-2xl bg-white p-5 ring-1 ring-[#0f3a26]/8">
            <p className="text-[12.5px] font-semibold text-[#0f3a26]">
              Take today off
            </p>
            <p className="mt-1 text-[11.5px] text-[#0f3a26]/55">
              Optional message your patients will see.
            </p>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="e.g. Attending a conference today, back tomorrow."
              rows={2}
              className="mt-3 w-full resize-none rounded-xl border border-[#0f3a26]/10 bg-white px-3.5 py-2.5 text-[13.5px] text-[#0f3a26] placeholder:text-[#0f3a26]/35 focus:border-[#006E42]/40 focus:outline-none focus:ring-2 focus:ring-[#006E42]/15"
            />
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => {
                  onSetLeave(todayISO, true, draft.trim() || undefined);
                  setDrafting(false);
                  setDraft("");
                }}
                className="rounded-lg bg-[#006E42] px-3.5 py-2 text-[12.5px] font-semibold text-white transition hover:bg-[#005634]"
              >
                Confirm leave
              </button>
              <button
                onClick={() => {
                  setDrafting(false);
                  setDraft("");
                }}
                className="rounded-lg px-3 py-2 text-[12.5px] font-medium text-[#0f3a26]/65 transition hover:bg-[#0f3a26]/5"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Leave banner */}
        {onLeave && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="mt-5 rounded-2xl bg-[#006E42]/[0.06] p-5 ring-1 ring-inset ring-[#006E42]/20"
          >
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#006E42]">
              <CoffeeIcon className="h-3 w-3" />
              No bookings today
            </p>
            {leaveMessage && (
              <p className="mt-2 max-w-prose text-[13.5px] leading-relaxed text-[#0f3a26]/85">
                &quot;{leaveMessage}&quot;
              </p>
            )}
            <button
              onClick={() => onSetLeave(todayISO, false)}
              className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-[#006E42] hover:underline"
            >
              Cancel leave →
            </button>
          </motion.div>
        )}

        {/* Today's appointments */}
        {!onLeave && (
          <div className="mt-5">
            {today.length === 0 ? (
              <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-[#0f3a26]/8">
                <p className="text-[13.5px] font-semibold text-[#0f3a26]">
                  Nothing on the books.
                </p>
                <p className="mt-1 text-[12px] text-[#0f3a26]/55">
                  New bookings appear here as they come in.
                </p>
              </div>
            ) : (
              <ul className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#0f3a26]/8">
                {today.map((a, i) => (
                  <li
                    key={a.id}
                    className={
                      i === today.length - 1 ? "" : "border-b border-[#0f3a26]/6"
                    }
                  >
                    <AppointmentRow
                      appt={a}
                      onStatusChange={onStatusChange}
                      timelineMarker
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      {/* Right: coming up */}
      <aside>
        <div className="flex items-baseline justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0f3a26]/55">
            Coming up
          </p>
          <p className="text-[10.5px] tabular-nums text-[#0f3a26]/45">
            next 7 days
          </p>
        </div>

        {next7.length === 0 ? (
          <div className="mt-3 rounded-2xl bg-white p-8 text-center ring-1 ring-[#0f3a26]/8">
            <p className="text-[12.5px] text-[#0f3a26]/55">
              Nothing booked yet for the rest of the week.
            </p>
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {next7.map((a) => (
              <li
                key={a.id}
                className="flex items-start gap-3 rounded-xl bg-white p-3.5 ring-1 ring-[#0f3a26]/8"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#006E42]/8 text-[#006E42]">
                  <span className="text-[10px] font-bold uppercase tracking-tight tabular-nums">
                    {shortDate(a.schedule.date)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-[#0f3a26]">
                    {a.patient.fullName}
                  </p>
                  <p className="text-[11px] text-[#0f3a26]/55">
                    {a.schedule.slotLabel} ·{" "}
                    {a.mode === "video" ? "Video" : "In-clinic"}
                  </p>
                </div>
                <span className="text-[11px] font-semibold tabular-nums text-[#0f3a26]/70">
                  ₹{a.fee.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}

/* ============================== Calendar panel ============================== */

function CalendarPanel({
  appointments,
  availability,
  selectedDate,
  onSelectDate,
  onStatusChange,
  onSetLeave,
}: {
  appointments: Appointment[] | null;
  availability: DoctorAvailability | null;
  selectedDate: string;
  onSelectDate: (d: string) => void;
  onStatusChange: (id: string, s: AppointmentStatus) => void;
  onSetLeave: (date: string, enabled: boolean, message?: string) => void;
}) {
  const today = new Date();
  const [cursor, setCursor] = useState(() => {
    const d = new Date(selectedDate);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  if (!appointments)
    return (
      <div className="h-96 animate-pulse rounded-2xl bg-white ring-1 ring-[#0f3a26]/8" />
    );

  const grid = monthGrid(cursor.year, cursor.month);
  const counts = appointments.reduce(
    (acc, a) => {
      acc[a.schedule.date] = (acc[a.schedule.date] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const dayAppointments = appointments
    .filter((a) => a.schedule.date === selectedDate)
    .sort((a, b) => a.schedule.slotLabel.localeCompare(b.schedule.slotLabel));

  const leaveMessage = availability?.leaveMessages?.[selectedDate] ?? "";
  const isLeave = availability?.blocked.includes(selectedDate) ?? false;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
      {/* Calendar */}
      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#0f3a26]/8">
        <div className="flex items-center justify-between px-5 py-4">
          <p className="text-[16px] font-bold tracking-tight text-[#0f3a26]">
            {new Date(cursor.year, cursor.month, 1).toLocaleDateString("en-IN", {
              month: "long",
              year: "numeric",
            })}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const m = cursor.month - 1;
                setCursor(
                  m < 0
                    ? { year: cursor.year - 1, month: 11 }
                    : { year: cursor.year, month: m },
                );
              }}
              aria-label="Previous month"
              className="grid h-8 w-8 place-items-center rounded-lg text-[#0f3a26]/55 transition hover:bg-[#0f3a26]/5 hover:text-[#006E42]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                onSelectDate(isoToday());
                setCursor({
                  year: today.getFullYear(),
                  month: today.getMonth(),
                });
              }}
              className="rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold text-[#006E42] transition hover:bg-[#006E42]/8"
            >
              Today
            </button>
            <button
              onClick={() => {
                const m = cursor.month + 1;
                setCursor(
                  m > 11
                    ? { year: cursor.year + 1, month: 0 }
                    : { year: cursor.year, month: m },
                );
              }}
              aria-label="Next month"
              className="grid h-8 w-8 place-items-center rounded-lg text-[#0f3a26]/55 transition hover:bg-[#0f3a26]/5 hover:text-[#006E42]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 px-3 pb-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0f3a26]/40">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 p-3">
          {grid.map((cell, i) => {
            if (!cell) return <div key={i} className="aspect-square" />;
            const isToday = cell.iso === isoToday();
            const isSelected = cell.iso === selectedDate;
            const count = counts[cell.iso] ?? 0;
            const isBlocked = availability?.blocked.includes(cell.iso);
            return (
              <button
                key={cell.iso}
                onClick={() => onSelectDate(cell.iso)}
                className={`relative flex aspect-square flex-col items-stretch justify-between rounded-lg p-1.5 text-left transition ${
                  isSelected
                    ? "bg-[#006E42] text-white shadow-[0_8px_18px_-10px_rgba(0,110,66,0.55)]"
                    : isToday
                      ? "ring-1 ring-inset ring-[#006E42]/40 text-[#006E42]"
                      : isBlocked
                        ? "bg-[#c14040]/[0.05] text-[#c14040]/80"
                        : "text-[#0f3a26] hover:bg-[#0f3a26]/[0.03]"
                }`}
              >
                <span
                  className={`text-[12.5px] font-semibold tabular-nums ${
                    isSelected ? "text-white" : ""
                  }`}
                >
                  {cell.day}
                </span>
                {count > 0 && (
                  <span
                    className={`self-end rounded-full px-1.5 text-[9.5px] font-bold tabular-nums ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-[#006E42]/12 text-[#006E42]"
                    }`}
                  >
                    {count}
                  </span>
                )}
                {isBlocked && !isSelected && (
                  <span
                    aria-hidden
                    className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[#c14040]"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day detail */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#006E42]">
              {selectedDate === isoToday()
                ? "Today"
                : isInPast(selectedDate)
                  ? "Past"
                  : "Coming up"}
            </p>
            <p className="mt-0.5 text-[16px] font-bold tracking-tight text-[#0f3a26]">
              {longDate(selectedDate)}
            </p>
          </div>
          {!isLeave && selectedDate >= isoToday() && (
            <button
              onClick={() => onSetLeave(selectedDate, true)}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11.5px] font-semibold text-[#006E42] transition hover:bg-[#006E42]/8"
            >
              <CoffeeIcon className="h-3 w-3" />
              Day off
            </button>
          )}
        </div>

        {isLeave && (
          <div className="rounded-xl bg-[#006E42]/[0.05] p-4 ring-1 ring-inset ring-[#006E42]/15">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#006E42]">
              <CoffeeIcon className="-mt-0.5 mr-1 inline h-3 w-3" />
              Day off
            </p>
            {leaveMessage && (
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#0f3a26]/75">
                &quot;{leaveMessage}&quot;
              </p>
            )}
            <button
              onClick={() => onSetLeave(selectedDate, false)}
              className="mt-2 text-[11.5px] font-semibold text-[#006E42] hover:underline"
            >
              Remove
            </button>
          </div>
        )}

        {dayAppointments.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center ring-1 ring-[#0f3a26]/8">
            <p className="text-[12.5px] text-[#0f3a26]/55">
              {isLeave ? "Patients have been notified." : "No appointments."}
            </p>
          </div>
        ) : (
          <ul className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#0f3a26]/8">
            {dayAppointments.map((a, i) => (
              <li
                key={a.id}
                className={
                  i === dayAppointments.length - 1
                    ? ""
                    : "border-b border-[#0f3a26]/6"
                }
              >
                <AppointmentRow appt={a} onStatusChange={onStatusChange} compact />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ============================== Settings panel ============================== */

function SettingsPanel({
  availability,
  onChange,
  onSetLeave,
}: {
  availability: DoctorAvailability | null;
  onChange: (a: DoctorAvailability) => void;
  onSetLeave: (date: string, enabled: boolean, message?: string) => void;
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [pickerDate, setPickerDate] = useState("");
  const [pickerMessage, setPickerMessage] = useState("");

  if (!availability)
    return (
      <div className="h-72 animate-pulse rounded-2xl bg-white ring-1 ring-[#0f3a26]/8" />
    );

  async function save(next: DoctorAvailability) {
    onChange(next);
    await saveAvailability(next);
  }
  function addWindow(day: Weekday) {
    const next = structuredClone(availability!);
    next.weekly[day] = [...next.weekly[day], { start: "09:00", end: "17:00" }];
    save(next);
  }
  function removeWindow(day: Weekday, idx: number) {
    const next = structuredClone(availability!);
    next.weekly[day] = next.weekly[day].filter((_, i) => i !== idx);
    save(next);
  }
  function updateWindow(
    day: Weekday,
    idx: number,
    field: keyof TimeWindow,
    value: string,
  ) {
    const next = structuredClone(availability!);
    next.weekly[day] = next.weekly[day].map((w, i) =>
      i === idx ? { ...w, [field]: value } : w,
    );
    save(next);
  }

  const sortedLeave = [...availability.blocked].sort();

  return (
    <div className="space-y-8">
      {/* Weekly schedule — single quiet surface */}
      <section>
        <h2 className="text-[15px] font-bold tracking-tight text-[#0f3a26]">
          Your weekly hours
        </h2>

        <ul className="mt-4 divide-y divide-[#0f3a26]/8 rounded-2xl bg-white ring-1 ring-[#0f3a26]/8">
          {WEEKDAYS.map((d) => {
            const windows = availability.weekly[d.id];
            return (
              <li
                key={d.id}
                className="grid grid-cols-[56px_1fr_auto] items-center gap-3 px-4 py-3"
              >
                <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#0f3a26]/65">
                  {d.label}
                </p>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                  {windows.length === 0 && (
                    <p className="text-[11.5px] italic text-[#0f3a26]/40">
                      Closed
                    </p>
                  )}
                  {windows.map((w, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <input
                        type="time"
                        value={w.start}
                        onChange={(e) =>
                          updateWindow(d.id, idx, "start", e.target.value)
                        }
                        className="rounded-md bg-[#0f3a26]/[0.03] px-1.5 py-1 text-[12px] tabular-nums text-[#0f3a26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006E42]/30"
                      />
                      <span className="text-[#0f3a26]/30">–</span>
                      <input
                        type="time"
                        value={w.end}
                        onChange={(e) =>
                          updateWindow(d.id, idx, "end", e.target.value)
                        }
                        className="rounded-md bg-[#0f3a26]/[0.03] px-1.5 py-1 text-[12px] tabular-nums text-[#0f3a26] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006E42]/30"
                      />
                      <button
                        onClick={() => removeWindow(d.id, idx)}
                        aria-label="Remove"
                        className="grid h-6 w-6 place-items-center rounded text-[#0f3a26]/35 transition hover:text-[#c14040]"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => addWindow(d.id)}
                  aria-label="Add window"
                  className="grid h-7 w-7 place-items-center rounded-md text-[#006E42] transition hover:bg-[#006E42]/8"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>

        <button
          onClick={() => setShowAdvanced((v) => !v)}
          className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-medium text-[#0f3a26]/55 transition hover:text-[#006E42]"
        >
          {showAdvanced ? "Hide" : "Show"} advanced
          <ChevronRight
            className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-90" : ""}`}
          />
        </button>

        {showAdvanced && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[11.5px] font-medium text-[#0f3a26]">
                Slot duration
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {[15, 20, 30, 45, 60].map((m) => (
                  <button
                    key={m}
                    onClick={() =>
                      save({
                        ...availability,
                        slotMinutes:
                          m as DoctorAvailability["slotMinutes"],
                      })
                    }
                    className={`rounded-md px-2.5 py-1 text-[11.5px] font-semibold transition ${
                      availability.slotMinutes === m
                        ? "bg-[#006E42] text-white"
                        : "bg-[#0f3a26]/[0.03] text-[#0f3a26]/70 hover:bg-[#0f3a26]/[0.06]"
                    }`}
                  >
                    {m} min
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11.5px] font-medium text-[#0f3a26]">
                Minimum notice
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {[1, 2, 4, 8, 24].map((h) => (
                  <button
                    key={h}
                    onClick={() => save({ ...availability, noticeHours: h })}
                    className={`rounded-md px-2.5 py-1 text-[11.5px] font-semibold transition ${
                      availability.noticeHours === h
                        ? "bg-[#006E42] text-white"
                        : "bg-[#0f3a26]/[0.03] text-[#0f3a26]/70 hover:bg-[#0f3a26]/[0.06]"
                    }`}
                  >
                    {h} h
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Time off — one tight row of inputs */}
      <section>
        <h2 className="text-[15px] font-bold tracking-tight text-[#0f3a26]">
          Scheduled days off
        </h2>

        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 ring-1 ring-[#0f3a26]/8">
          <input
            type="date"
            value={pickerDate}
            min={isoToday()}
            onChange={(e) => setPickerDate(e.target.value)}
            className="rounded-lg border border-[#0f3a26]/10 bg-white px-2.5 py-2 text-[13px] text-[#0f3a26] focus:border-[#006E42]/40 focus:outline-none focus:ring-2 focus:ring-[#006E42]/15"
          />
          <input
            value={pickerMessage}
            onChange={(e) => setPickerMessage(e.target.value)}
            placeholder="Optional note for patients"
            className="min-w-[200px] flex-1 rounded-lg border border-[#0f3a26]/10 bg-white px-3 py-2 text-[13px] text-[#0f3a26] placeholder:text-[#0f3a26]/35 focus:border-[#006E42]/40 focus:outline-none focus:ring-2 focus:ring-[#006E42]/15"
          />
          <button
            onClick={() => {
              if (!pickerDate) return;
              onSetLeave(pickerDate, true, pickerMessage.trim() || undefined);
              setPickerDate("");
              setPickerMessage("");
            }}
            disabled={!pickerDate}
            className="inline-flex items-center gap-1 rounded-lg bg-[#006E42] px-3.5 py-2 text-[12.5px] font-semibold text-white transition hover:bg-[#005634] disabled:opacity-40"
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
        </div>

        {sortedLeave.length === 0 ? (
          <p className="mt-4 text-[12px] text-[#0f3a26]/45">
            None scheduled.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-[#0f3a26]/6 rounded-2xl bg-white ring-1 ring-[#0f3a26]/8">
            {sortedLeave.map((d) => (
              <li
                key={d}
                className="flex items-center gap-3 px-4 py-3"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#006E42]/8 text-[#006E42]">
                  <span className="text-[10px] font-bold uppercase tabular-nums">
                    {shortDate(d)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-semibold text-[#0f3a26]">
                    {longDate(d)}
                  </p>
                  {availability.leaveMessages?.[d] && (
                    <p className="mt-0.5 truncate text-[11.5px] text-[#0f3a26]/55">
                      {availability.leaveMessages[d]}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => onSetLeave(d, false)}
                  className="grid h-7 w-7 place-items-center rounded-md text-[#0f3a26]/35 transition hover:bg-[#c14040]/10 hover:text-[#c14040]"
                  aria-label="Remove"
                >
                  <X className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ============================== Shared rows ============================== */

function AppointmentRow({
  appt,
  onStatusChange,
  timelineMarker,
  compact,
}: {
  appt: Appointment;
  onStatusChange: (id: string, s: AppointmentStatus) => void;
  timelineMarker?: boolean;
  compact?: boolean;
}) {
  return (
    <div className="flex items-start gap-4 px-5 py-4">
      {timelineMarker && (
        <div className="pt-1 text-right">
          <p className="text-[14px] font-bold tabular-nums text-[#0f3a26]">
            {appt.schedule.slotLabel.split(" - ")[0]}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-[#0f3a26]/45">
            {appt.mode === "video" ? "Video" : "Clinic"}
          </p>
        </div>
      )}
      {!timelineMarker && (
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#006E42]/8 text-[#006E42]">
          {appt.mode === "video" ? (
            <Video className="h-4 w-4" />
          ) : (
            <User className="h-4 w-4" />
          )}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-[13.5px] font-bold text-[#0f3a26]">
            {appt.patient.fullName}
          </p>
          {!timelineMarker && (
            <p className="text-[11px] font-semibold tabular-nums text-[#0f3a26]/65">
              {appt.schedule.slotLabel}
            </p>
          )}
        </div>
        <p className="mt-0.5 text-[12px] text-[#0f3a26]/60">{appt.reason}</p>
        {!compact && (
          <p className="mt-1 text-[10.5px] text-[#0f3a26]/45">
            {appt.patient.gender} · {ageFrom(appt.patient.dob)} · ₹
            {appt.fee.toLocaleString()}
          </p>
        )}
        <div className="mt-2 flex items-center gap-1.5">
          <StatusPill status={appt.status} />
          {(appt.status === "upcoming" || appt.status === "in-progress") && (
            <>
              <button
                onClick={() => onStatusChange(appt.id, "completed")}
                className="inline-flex items-center gap-1 rounded-md bg-[#006E42]/8 px-2 py-1 text-[10.5px] font-semibold text-[#006E42] transition hover:bg-[#006E42]/15"
              >
                <CheckCircle2 className="h-3 w-3" />
                Done
              </button>
              <button
                onClick={() => onStatusChange(appt.id, "no-show")}
                className="inline-flex items-center gap-1 rounded-md bg-[#c14040]/8 px-2 py-1 text-[10.5px] font-semibold text-[#c14040] transition hover:bg-[#c14040]/15"
              >
                <XCircle className="h-3 w-3" />
                No-show
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: AppointmentStatus }) {
  const tone: Record<AppointmentStatus, string> = {
    upcoming: "bg-[#006E42]/10 text-[#006E42]",
    "in-progress": "bg-[#c79a3d]/15 text-[#9c7426]",
    completed: "bg-[#0f3a26]/8 text-[#0f3a26]/65",
    "no-show": "bg-[#c14040]/10 text-[#c14040]",
    cancelled: "bg-[#0f3a26]/8 text-[#0f3a26]/45",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${tone[status]}`}
    >
      {APPOINTMENT_STATUS_LABELS[status]}
    </span>
  );
}

/* ============================== Helpers ============================== */

function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}
function isInPast(iso: string): boolean {
  return iso < isoToday();
}
function monthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7;
  const cells: ({ iso: string; day: number } | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= lastDate; d++) {
    const iso = new Date(year, month, d).toISOString().slice(0, 10);
    cells.push({ iso, day: d });
  }
  while (cells.length % 7) cells.push(null);
  return cells;
}
function longDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });
  } catch {
    return iso;
  }
}
function shortDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return iso;
  }
}
function ageFrom(dob: string): string {
  try {
    const years =
      (Date.now() - new Date(dob).getTime()) /
      (365.25 * 24 * 60 * 60 * 1000);
    return `${Math.floor(years)} yrs`;
  } catch {
    return "";
  }
}
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
function prettyName(u?: string) {
  if (!u) return "doctor";
  return u.split(/[.@_-]/)[0].replace(/^./, (c) => c.toUpperCase());
}
