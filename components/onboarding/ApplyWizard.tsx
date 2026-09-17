"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  Loader2,
  Lock,
  RotateCcw,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useHydrated } from "@/lib/hooks/useHydrated";

import { BrandMark } from "@/components/shell/BrandMark";
import {
  clearDraft,
  readDraft,
  readFileToUpload,
  submitApplication,
  writeDraft,
} from "@/lib/onboarding/service";
import type {
  DocSlot,
  FieldDef,
  PartnerKind,
  StepDef,
  UploadedFile,
} from "@/lib/onboarding/types";

const EASE = [0.22, 1, 0.36, 1] as const;

type FormData = Record<string, string | boolean | string[]>;

type Props = {
  kind: PartnerKind;
  steps: StepDef[];
  /** Marketing headline + sub for the left rail. */
  intro: { eyebrow: string; title: string; subtitle: string };
  summarize: (data: FormData) => { displayName: string; location: string };
};

export function ApplyWizard({ kind, steps, intro, summarize }: Props) {
  const reduce = useReducedMotion();
  const hydrated = useHydrated();
  const [offerHandled, setOfferHandled] = useState(false);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>({});
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ reference: string } | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  // Capture any saved draft once, as the client hydrates. It is kept in state (not
  // re-read) because auto-save below starts overwriting storage straight away.
  const [savedDraft, setSavedDraft] = useState<ReturnType<typeof readDraft> | undefined>(undefined);
  if (hydrated && savedDraft === undefined) {
    const d = readDraft(kind);
    setSavedDraft(d && (Object.keys(d.data).length > 0 || d.files.length > 0) ? d : null);
  }
  const resumeOffer = !!savedDraft && !offerHandled;

  // Auto-save draft on change (after hydration, before submit).
  useEffect(() => {
    if (!hydrated || done) return;
    const t = setTimeout(() => {
      writeDraft(kind, {
        step,
        data,
        files,
        updatedAt: new Date().toISOString(),
      });
    }, 400);
    return () => clearTimeout(t);
  }, [kind, step, data, files, hydrated, done]);

  function resume() {
    if (savedDraft) {
      setData(savedDraft.data);
      setFiles(savedDraft.files);
      setStep(Math.min(savedDraft.step, steps.length - 1));
    }
    setOfferHandled(true);
  }
  function startFresh() {
    clearDraft(kind);
    setOfferHandled(true);
  }

  const current = steps[step];
  const pct = Math.round(((step + (done ? 1 : 0)) / steps.length) * 100);
  const lastStep = step === steps.length - 1;

  function setField(key: string, value: string | boolean | string[]) {
    setData((d) => ({ ...d, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: "" } : e));
  }

  function visibleFields(fields: FieldDef[]) {
    return fields.filter((f) => {
      if (!f.showIf) return true;
      const v = data[f.showIf.key];
      if (f.showIf.equals !== undefined) return v === f.showIf.equals;
      return Boolean(v);
    });
  }

  function validateStep(): boolean {
    const e: Record<string, string> = {};
    for (const f of visibleFields(current.fields ?? [])) {
      const v = data[f.key];
      if (f.required && (v === undefined || v === "" || (Array.isArray(v) && v.length === 0))) {
        e[f.key] = "Required.";
        continue;
      }
      if (f.pattern && typeof v === "string" && v) {
        const re = new RegExp(f.pattern);
        if (!re.test(v)) e[f.key] = f.patternMessage ?? "Invalid format.";
      }
    }
    for (const d of current.docs ?? []) {
      if (d.required && !files.some((x) => x.docKey === d.key)) {
        e[`doc:${d.key}`] = "Required document.";
      }
    }
    for (const c of current.consents ?? []) {
      if (c.required && data[c.key] !== true) {
        e[c.key] = "Please confirm.";
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function goNext() {
    if (!validateStep()) {
      topRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      return;
    }
    if (lastStep) {
      handleSubmit();
      return;
    }
    setStep((s) => s + 1);
    topRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }
  function goBack() {
    if (step === 0) return;
    setStep((s) => s - 1);
    topRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  async function handleSubmit() {
    setSubmitting(true);
    const { displayName, location } = summarize(data);
    const app = await submitApplication({ kind, data, files, displayName, location });
    setSubmitting(false);
    setDone({ reference: app.reference });
  }

  async function addFile(docKey: string, file: File) {
    const uploaded = await readFileToUpload(file, docKey);
    setFiles((prev) => [...prev.filter((f) => f.docKey !== docKey), uploaded]);
    setErrors((e) => (e[`doc:${docKey}`] ? { ...e, [`doc:${docKey}`]: "" } : e));
  }
  function removeFile(docKey: string) {
    setFiles((prev) => prev.filter((f) => f.docKey !== docKey));
  }

  if (done) {
    return <SuccessScreen kind={kind} reference={done.reference} />;
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-[#f6faf7] lg:grid-cols-[300px_1fr]">
      {/* Left rail */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#006E42] px-8 py-9 text-white lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#9af2c4]/15 blur-[100px]"
        />
        <div className="relative">
          <BrandMark variant="inverse" className="w-[58px]" />
          <p className="mt-9 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9af2c4]">
            {intro.eyebrow}
          </p>
          <h1 className="mt-2 text-[26px] font-bold leading-[1.12] tracking-tight">
            {intro.title}
          </h1>
          <p className="mt-2.5 text-[13px] leading-relaxed text-white/70">
            {intro.subtitle}
          </p>

          <ol className="mt-9 space-y-1">
            {steps.map((s, i) => {
              const state = i < step ? "done" : i === step ? "current" : "todo";
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => i < step && setStep(i)}
                    disabled={i > step}
                    className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-[13px] transition ${
                      state === "current"
                        ? "bg-white/10 font-semibold text-white"
                        : state === "done"
                          ? "text-white/80 hover:bg-white/5"
                          : "text-white/40"
                    }`}
                  >
                    <span
                      className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                        state === "done"
                          ? "bg-[#9af2c4] text-[#006E42]"
                          : state === "current"
                            ? "bg-white text-[#006E42]"
                            : "bg-white/10 text-white/50"
                      }`}
                    >
                      {state === "done" ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
                    </span>
                    {s.title}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <p className="relative inline-flex items-center gap-1.5 text-[11px] text-white/55">
          <Lock className="h-3 w-3" />
          Your information is encrypted and confidential.
        </p>
      </aside>

      {/* Right content */}
      <main className="flex flex-col">
        {/* Progress header */}
        <header className="sticky top-0 z-10 border-b border-[#0f3a26]/8 bg-[#f6faf7]/90 px-6 py-4 backdrop-blur-xl sm:px-10">
          <div ref={topRef} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 lg:hidden">
              <BrandMark variant="compact" className="w-[52px]" />
            </div>
            <p className="text-[12px] font-medium text-[#0f3a26]/60">
              Step {step + 1} of {steps.length}
            </p>
            <p className="text-[12px] font-semibold tabular-nums text-[#006E42]">
              {pct}% complete
            </p>
          </div>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#0f3a26]/8">
            <motion.div
              className="h-full rounded-full bg-[#006E42]"
              initial={false}
              animate={{ width: `${Math.max(6, ((step + 1) / steps.length) * 100)}%` }}
              transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
            />
          </div>
        </header>

        <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-8 sm:px-10">
          {/* Resume banner */}
          {resumeOffer && (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center gap-3 rounded-xl bg-white p-4 ring-1 ring-[#006E42]/20"
            >
              <RotateCcw className="h-4 w-4 shrink-0 text-[#006E42]" />
              <div className="flex-1 text-[12.5px]">
                <p className="font-semibold text-[#0f3a26]">Welcome back.</p>
                <p className="text-[#0f3a26]/60">We saved your progress on this device.</p>
              </div>
              <button onClick={resume} className="rounded-lg bg-[#006E42] px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-[#005634]">
                Resume
              </button>
              <button onClick={startFresh} className="rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[#0f3a26]/55 transition hover:bg-[#0f3a26]/5">
                Start over
              </button>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <h2 className="text-[22px] font-bold tracking-tight text-[#0f3a26]">
                {current.title}
              </h2>
              {current.subtitle && (
                <p className="mt-1.5 text-[13.5px] text-[#0f3a26]/55">{current.subtitle}</p>
              )}

              {/* Fields */}
              {current.fields && (
                <div className="mt-7 grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
                  {visibleFields(current.fields).map((f) => (
                    <FieldRenderer
                      key={f.key}
                      field={f}
                      value={data[f.key]}
                      error={errors[f.key]}
                      onChange={(v) => setField(f.key, v)}
                    />
                  ))}
                </div>
              )}

              {/* Documents */}
              {current.docs && (
                <div className="mt-7 space-y-3">
                  {current.docs.map((d) => (
                    <DocRow
                      key={d.key}
                      slot={d}
                      file={files.find((f) => f.docKey === d.key)}
                      error={errors[`doc:${d.key}`]}
                      onPick={(file) => addFile(d.key, file)}
                      onRemove={() => removeFile(d.key)}
                    />
                  ))}
                </div>
              )}

              {/* Consents */}
              {current.consents && (
                <ul className="mt-7 space-y-3">
                  {current.consents.map((c) => (
                    <li key={c.key}>
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          checked={data[c.key] === true}
                          onChange={(e) => setField(c.key, e.target.checked)}
                          className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#0f3a26]/30 text-[#006E42] focus:ring-[#006E42]"
                        />
                        <span className={`text-[13px] leading-relaxed ${errors[c.key] ? "text-[#c14040]" : "text-[#0f3a26]/80"}`}>
                          {c.label}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Footer nav */}
          <div className="mt-10 flex items-center justify-between border-t border-[#0f3a26]/8 pt-6">
            <button
              onClick={goBack}
              disabled={step === 0}
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-[#0f3a26]/65 transition hover:bg-[#0f3a26]/5 disabled:opacity-0"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              onClick={goNext}
              disabled={submitting}
              className="group inline-flex items-center gap-2 rounded-xl bg-[#006E42] px-6 py-3 text-[14px] font-semibold text-white shadow-[0_12px_26px_-12px_rgba(0,110,66,0.6)] transition hover:bg-[#005634] disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : lastStep ? (
                <>
                  Submit application
                  <CheckCircle2 className="h-4 w-4" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ============================== Field renderer ============================== */

function FieldRenderer({
  field: f,
  value,
  error,
  onChange,
}: {
  field: FieldDef;
  value: string | boolean | string[] | undefined;
  error?: string;
  onChange: (v: string | boolean | string[]) => void;
}) {
  const full = !f.half;
  const base = `w-full rounded-xl border bg-white px-3.5 py-2.5 text-[14px] text-[#0f3a26] placeholder:text-[#0f3a26]/30 focus:outline-none focus:ring-2 ${
    error
      ? "border-[#c14040]/50 focus:border-[#c14040] focus:ring-[#c14040]/15"
      : "border-[#0f3a26]/10 focus:border-[#006E42]/40 focus:ring-[#006E42]/15"
  }`;

  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="mb-1.5 flex items-baseline gap-1.5 text-[11.5px] font-medium text-[#0f3a26]">
        {f.label}
        {f.required && <span className="text-[#c14040]">*</span>}
      </label>

      {f.type === "textarea" ? (
        <textarea
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={f.placeholder}
          rows={3}
          className={`${base} resize-y leading-relaxed`}
        />
      ) : f.type === "select" ? (
        <select
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={base}
        >
          <option value="">Select…</option>
          {f.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : f.type === "radio" ? (
        <div className="flex gap-2">
          {f.options?.map((o) => {
            const active = value === o.value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => onChange(o.value)}
                className={`flex-1 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition ${
                  active
                    ? "bg-[#006E42] text-white"
                    : "bg-white text-[#0f3a26]/70 ring-1 ring-inset ring-[#0f3a26]/10 hover:ring-[#006E42]/30"
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      ) : f.type === "multiselect" ? (
        <div className="flex flex-wrap gap-2">
          {f.options?.map((o) => {
            const arr = (value as string[]) ?? [];
            const active = arr.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => onChange(active ? arr.filter((x) => x !== o.value) : [...arr, o.value])}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition ${
                  active
                    ? "bg-[#006E42] text-white"
                    : "bg-white text-[#0f3a26]/70 ring-1 ring-inset ring-[#0f3a26]/10 hover:ring-[#006E42]/30"
                }`}
              >
                {active && <Check className="h-3.5 w-3.5" />}
                {o.label}
              </button>
            );
          })}
        </div>
      ) : f.type === "chips" ? (
        <ChipsField values={(value as string[]) ?? []} onChange={onChange} placeholder={f.placeholder} hasError={!!error} />
      ) : (
        <input
          type={f.type}
          value={(value as string) ?? ""}
          onChange={(e) =>
            onChange(f.key === "pan" ? e.target.value.toUpperCase() : e.target.value)
          }
          placeholder={f.placeholder}
          className={`${base} ${f.type === "number" ? "tabular-nums" : ""}`}
        />
      )}

      {f.hint && !error && <p className="mt-1.5 text-[11px] text-[#0f3a26]/50">{f.hint}</p>}
      {error && <p className="mt-1.5 text-[11px] font-medium text-[#c14040]">{error}</p>}
    </div>
  );
}

function ChipsField({
  values,
  onChange,
  placeholder,
  hasError,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  hasError: boolean;
}) {
  const [text, setText] = useState("");
  function add(raw: string) {
    const v = raw.trim();
    if (!v || values.includes(v)) return;
    onChange([...values, v]);
    setText("");
  }
  return (
    <div
      className={`flex flex-wrap items-center gap-1.5 rounded-xl border bg-white px-2 py-1.5 focus-within:ring-2 ${
        hasError ? "border-[#c14040]/50" : "border-[#0f3a26]/10 focus-within:border-[#006E42]/40 focus-within:ring-[#006E42]/15"
      }`}
    >
      {values.map((v) => (
        <span key={v} className="inline-flex items-center gap-1 rounded-md bg-[#006E42]/8 px-2 py-0.5 text-[11.5px] font-medium text-[#006E42]">
          {v}
          <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} aria-label={`Remove ${v}`}>
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
          }
        }}
        onBlur={() => text && add(text)}
        placeholder={values.length === 0 ? placeholder : ""}
        className="min-w-[100px] flex-1 bg-transparent px-1 py-1 text-[13px] text-[#0f3a26] placeholder:text-[#0f3a26]/30 focus:outline-none"
      />
    </div>
  );
}

/* ============================== Document row ============================== */

function DocRow({
  slot,
  file,
  error,
  onPick,
  onRemove,
}: {
  slot: DocSlot;
  file?: UploadedFile;
  error?: string;
  onPick: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-[#006E42]/20">
        <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#006E42]/8 text-[#006E42]">
          {file.dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={file.dataUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <FileText className="h-5 w-5" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold text-[#0f3a26]">{slot.label}</p>
          <p className="truncate text-[11px] text-[#0f3a26]/55">
            {file.name} · {formatSize(file.size)}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-[#006E42]/8 px-2 py-0.5 text-[10px] font-semibold text-[#006E42]">
          <Check className="h-2.5 w-2.5" />
          Attached
        </span>
        <button
          onClick={onRemove}
          aria-label="Remove file"
          className="grid h-8 w-8 place-items-center rounded-lg text-[#0f3a26]/45 transition hover:bg-[#c14040]/10 hover:text-[#c14040]"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`flex w-full items-center gap-3 rounded-xl border border-dashed bg-white/60 p-3 text-left transition hover:bg-white ${
          error ? "border-[#c14040]/50" : "border-[#0f3a26]/20 hover:border-[#006E42]/40"
        }`}
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#0f3a26]/[0.04] text-[#0f3a26]/50">
          <Upload className="h-4 w-4" />
        </span>
        <div className="flex-1">
          <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[#0f3a26]">
            {slot.label}
            {slot.required && <span className="text-[#c14040]">*</span>}
          </p>
          <p className="text-[11px] text-[#0f3a26]/50">
            {slot.hint ?? "PDF, JPG or PNG. Click to upload."}
          </p>
        </div>
        <span className="rounded-lg bg-[#006E42]/8 px-3 py-1.5 text-[11.5px] font-semibold text-[#006E42]">
          Upload
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
          e.target.value = "";
        }}
      />
      {error && <p className="mt-1.5 text-[11px] font-medium text-[#c14040]">{error}</p>}
    </div>
  );
}

/* ============================== Success ============================== */

function SuccessScreen({ kind, reference }: { kind: PartnerKind; reference: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f6faf7] px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="w-full max-w-[460px] rounded-3xl bg-white p-8 text-center ring-1 ring-[#0f3a26]/8"
      >
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#006E42]/10 text-[#006E42]">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h1 className="mt-5 text-[24px] font-bold tracking-tight text-[#0f3a26]">
          Application submitted.
        </h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-[#0f3a26]/60">
          Thanks for applying to partner with SuppAI. Our team will review your{" "}
          {kind === "lab" ? "lab" : "clinician"} application and get back to you by
          email. You can close this page.
        </p>
        <div className="mt-6 rounded-xl bg-[#0f3a26]/[0.03] px-4 py-3">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#0f3a26]/45">
            Reference number
          </p>
          <p className="mt-1 text-[18px] font-bold tabular-nums text-[#0f3a26]">{reference}</p>
        </div>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center gap-1.5 text-[13px] font-semibold text-[#006E42] hover:underline"
        >
          Back to SuppAI
        </Link>
      </motion.div>
    </div>
  );
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
