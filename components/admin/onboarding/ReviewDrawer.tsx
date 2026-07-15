"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Ban,
  Check,
  CheckCircle2,
  Copy,
  FileText,
  KeyRound,
  Loader2,
  PauseCircle,
  RefreshCw,
  Send,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  acceptApplication,
  markInviteSent,
  regeneratePassword,
  setStatus,
} from "@/lib/onboarding/service";
import type { Application, FieldDef, StepDef } from "@/lib/onboarding/types";
import { STATUS_LABELS } from "@/lib/onboarding/types";

const EASE = [0.22, 1, 0.36, 1] as const;

export function ReviewDrawer({
  app,
  steps,
  onClose,
  onChange,
}: {
  app: Application | null;
  steps: StepDef[];
  onClose: () => void;
  onChange: (updated: Application) => void;
}) {
  const [busy, setBusy] = useState<null | string>(null);
  const [holdNote, setHoldNote] = useState("");
  const [showHold, setShowHold] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (app) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [app, onClose]);

  async function act(fn: () => Promise<Application | null>, key: string) {
    setBusy(key);
    const updated = await fn();
    setBusy(null);
    if (updated) onChange(updated);
  }

  return (
    <AnimatePresence>
      {app && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-[#0f3a26]/30 backdrop-blur-[2px]"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: EASE }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[720px] flex-col bg-[#fbfdfb] shadow-[-30px_0_80px_-30px_rgba(0,30,18,0.4)]"
            role="dialog"
            aria-label="Application review"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[#0f3a26]/8 px-7 py-5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[10.5px] font-semibold tracking-[0.14em] text-[#006E42] tabular-nums">
                    {app.reference}
                  </p>
                  <StatusPill status={app.status} />
                </div>
                <h2 className="mt-1 truncate text-[19px] font-bold tracking-tight text-[#0f3a26]">
                  {app.displayName}
                </h2>
                <p className="text-[12px] text-[#0f3a26]/55">
                  {app.location || "Location not provided"} · applied{" "}
                  {app.submittedAt
                    ? new Date(app.submittedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : ""}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[#0f3a26]/55 transition hover:bg-[#0f3a26]/5 hover:text-[#0f3a26]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="no-scrollbar flex-1 overflow-y-auto px-7 py-6">
              {/* Credentials (if active) */}
              {app.credentials && (
                <CredentialBlock
                  app={app}
                  busy={busy}
                  onSend={() =>
                    act(async () => {
                      await markInviteSent(app.id);
                      return { ...app, inviteSent: true };
                    }, "send")
                  }
                  onRegen={() => act(() => regeneratePassword(app.id), "regen")}
                />
              )}

              {app.reviewNote && (
                <div className="mb-6 rounded-xl bg-[#c79a3d]/10 p-3.5 text-[12px] text-[#9c7426] ring-1 ring-inset ring-[#c79a3d]/25">
                  <p className="font-semibold">Review note</p>
                  <p className="mt-0.5">{app.reviewNote}</p>
                </div>
              )}

              {/* KYC details grouped by step */}
              {steps.map((step) => {
                const fields = (step.fields ?? []).filter(
                  (f) => app.data[f.key] !== undefined && app.data[f.key] !== "",
                );
                const consents = (step.consents ?? []).filter(
                  (c) => app.data[c.key] === true,
                );
                const docs = (step.docs ?? []).map((d) => ({
                  slot: d,
                  file: app.files.find((f) => f.docKey === d.key),
                }));
                if (fields.length === 0 && consents.length === 0 && step.docs == null)
                  return null;

                return (
                  <section key={step.id} className="mb-7">
                    <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#006E42]">
                      {step.title}
                    </h3>

                    {fields.length > 0 && (
                      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                        {fields.map((f) => (
                          <div key={f.key}>
                            <dt className="text-[10.5px] uppercase tracking-[0.1em] text-[#0f3a26]/45">
                              {f.label}
                            </dt>
                            <dd className="mt-0.5 break-words text-[13px] font-medium text-[#0f3a26]">
                              {renderValue(f, app.data[f.key])}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}

                    {step.docs && (
                      <ul className="mt-2 space-y-2">
                        {docs.map(({ slot, file }) => (
                          <li
                            key={slot.key}
                            className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-[#0f3a26]/8"
                          >
                            <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#0f3a26]/[0.04] text-[#0f3a26]/45">
                              {file?.dataUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={file.dataUrl} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <FileText className="h-4 w-4" />
                              )}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-[12px] font-semibold text-[#0f3a26]">
                                {slot.label}
                              </p>
                              <p className="truncate text-[11px] text-[#0f3a26]/55">
                                {file ? file.name : "Not provided"}
                              </p>
                            </div>
                            {file ? (
                              file.dataUrl ? (
                                <a
                                  href={file.dataUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rounded-lg bg-[#006E42]/8 px-2.5 py-1 text-[11px] font-semibold text-[#006E42]"
                                >
                                  View
                                </a>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#006E42]/8 px-2 py-0.5 text-[10px] font-semibold text-[#006E42]">
                                  <Check className="h-2.5 w-2.5" />
                                  Attached
                                </span>
                              )
                            ) : (
                              <span className="rounded-full bg-[#0f3a26]/8 px-2 py-0.5 text-[10px] font-semibold text-[#0f3a26]/45">
                                Missing
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}

                    {consents.length > 0 && (
                      <ul className="mt-2 space-y-1.5">
                        {consents.map((c) => (
                          <li key={c.key} className="flex items-start gap-2 text-[12px] text-[#0f3a26]/75">
                            <Check className="mt-0.5 h-3 w-3 shrink-0 text-[#006E42]" />
                            {c.label}
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                );
              })}
            </div>

            {/* Action footer */}
            {app.status !== "active" && (
              <div className="border-t border-[#0f3a26]/8 bg-white px-7 py-4">
                {showHold ? (
                  <div className="space-y-2.5">
                    <textarea
                      value={holdNote}
                      onChange={(e) => setHoldNote(e.target.value)}
                      rows={2}
                      placeholder="Reason / note for the applicant (optional)"
                      className="w-full resize-none rounded-xl border border-[#0f3a26]/10 bg-white px-3.5 py-2.5 text-[13px] text-[#0f3a26] placeholder:text-[#0f3a26]/35 focus:border-[#006E42]/40 focus:outline-none focus:ring-2 focus:ring-[#006E42]/15"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          act(() => setStatus(app.id, "on_hold", holdNote), "hold")
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#c79a3d] px-3.5 py-2 text-[12.5px] font-semibold text-white transition hover:brightness-95"
                      >
                        <PauseCircle className="h-3.5 w-3.5" />
                        Put on hold
                      </button>
                      <button
                        onClick={() =>
                          act(() => setStatus(app.id, "rejected", holdNote), "reject")
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#c14040] px-3.5 py-2 text-[12.5px] font-semibold text-white transition hover:brightness-95"
                      >
                        <Ban className="h-3.5 w-3.5" />
                        Reject
                      </button>
                      <button
                        onClick={() => setShowHold(false)}
                        className="rounded-lg px-3 py-2 text-[12.5px] font-medium text-[#0f3a26]/55 transition hover:bg-[#0f3a26]/5"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => act(() => acceptApplication(app.id), "accept")}
                      disabled={busy === "accept"}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#006E42] px-4 py-3 text-[13.5px] font-semibold text-white transition hover:bg-[#005634] disabled:opacity-60"
                    >
                      {busy === "accept" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      Accept & issue login
                    </button>
                    {app.status === "submitted" && (
                      <button
                        onClick={() => act(() => setStatus(app.id, "under_review"), "review")}
                        className="rounded-xl bg-white px-4 py-3 text-[12.5px] font-semibold text-[#0f3a26] ring-1 ring-inset ring-[#0f3a26]/10 transition hover:ring-[#006E42]/30"
                      >
                        Mark reviewing
                      </button>
                    )}
                    <button
                      onClick={() => setShowHold(true)}
                      className="rounded-xl px-4 py-3 text-[12.5px] font-semibold text-[#c14040] ring-1 ring-inset ring-[#c14040]/20 transition hover:bg-[#c14040]/5"
                    >
                      Hold / Reject
                    </button>
                  </div>
                )}
              </div>
            )}

            {app.status === "active" && (
              <div className="border-t border-[#0f3a26]/8 bg-[#006E42]/[0.04] px-7 py-3.5 text-[12px] text-[#0f3a26]/65">
                <CheckCircle2 className="-mt-0.5 mr-1.5 inline h-3.5 w-3.5 text-[#006E42]" />
                Active partner. Reports and activity are available from their portal.
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function CredentialBlock({
  app,
  busy,
  onSend,
  onRegen,
}: {
  app: Application;
  busy: string | null;
  onSend: () => void;
  onRegen: () => void;
}) {
  const c = app.credentials!;
  return (
    <div className="mb-6 overflow-hidden rounded-2xl bg-[#006E42] text-white">
      <div className="flex items-center justify-between gap-2 px-4 pb-1 pt-3.5">
        <p className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#9af2c4]">
          <KeyRound className="h-3 w-3" />
          Login credentials
        </p>
        {app.inviteSent ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/12 px-2 py-0.5 text-[10px] font-semibold text-[#9af2c4]">
            <Check className="h-2.5 w-2.5" />
            Invite sent
          </span>
        ) : (
          <span className="rounded-full bg-white/12 px-2 py-0.5 text-[10px] font-semibold text-white/80">
            Not sent
          </span>
        )}
      </div>
      <div className="space-y-2 p-4">
        <CredRow label="Username" value={c.username} />
        <CredRow label="Email" value={c.email} />
        <CredRow label="Temporary password" value={c.tempPassword} mono />
      </div>
      <div className="flex items-center gap-2 border-t border-white/10 p-4">
        <button
          onClick={onSend}
          disabled={busy === "send" || app.inviteSent}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-2.5 text-[12.5px] font-semibold text-[#006E42] transition hover:bg-white/90 disabled:opacity-70"
        >
          {app.inviteSent ? <Check className="h-3.5 w-3.5" /> : busy === "send" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          {app.inviteSent ? "Invite sent" : "Send invite email"}
        </button>
        <button
          onClick={onRegen}
          disabled={busy === "regen"}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white/12 px-3 py-2.5 text-[12px] font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/20 disabled:opacity-60"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${busy === "regen" ? "animate-spin" : ""}`} />
          New password
        </button>
      </div>
    </div>
  );
}

function CredRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-white/10 px-3.5 py-2.5">
      <div className="min-w-0">
        <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-[#9af2c4]">{label}</p>
        <p className={`mt-0.5 truncate text-[13px] font-semibold text-white ${mono ? "font-mono" : ""}`}>{value}</p>
      </div>
      <button
        onClick={() => {
          navigator.clipboard?.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }}
        aria-label={`Copy ${label}`}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/10 text-white transition hover:bg-white/20"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

function StatusPill({ status }: { status: Application["status"] }) {
  const tone: Record<Application["status"], string> = {
    draft: "bg-[#0f3a26]/8 text-[#0f3a26]/55",
    submitted: "bg-[#c79a3d]/15 text-[#9c7426]",
    under_review: "bg-[#3a72c1]/12 text-[#2a578f]",
    on_hold: "bg-[#c79a3d]/15 text-[#9c7426]",
    rejected: "bg-[#c14040]/10 text-[#c14040]",
    active: "bg-[#006E42]/12 text-[#006E42]",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${tone[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function renderValue(f: FieldDef, value: string | boolean | string[]) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (f.options) {
    const opt = f.options.find((o) => o.value === value);
    if (opt) return opt.label;
  }
  return String(value);
}
