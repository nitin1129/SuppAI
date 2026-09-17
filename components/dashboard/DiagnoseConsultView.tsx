"use client";

import { motion } from "framer-motion";
import { ArrowRight, Stethoscope, TestTube } from "lucide-react";
import { useState } from "react";

import { ConsultView } from "./ConsultView";
import { GetHealthyView } from "./GetHealthyView";

type Mode = "hub" | "test" | "consult";

export function DiagnoseConsultView() {
  const [mode, setMode] = useState<Mode>("hub");

  if (mode === "test") return <GetHealthyView onHome={() => setMode("hub")} />;
  if (mode === "consult") return <ConsultView onHome={() => setMode("hub")} />;

  return (
    <div className="px-4 pb-12 pt-2 md:px-10 md:pb-14">
      <div className="max-w-2xl">
        <h2 className="text-[25px] font-semibold leading-[1.15] tracking-tight text-[#0f3a26] sm:text-[34px] sm:leading-[1.1]">
          What do you need today?
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-[#0f3a26]/60">
          Book a diagnostic test with home collection, or consult a verified
          doctor by video or in person.
        </p>
      </div>

      <div className="mt-9 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <OptionCard
          icon={<TestTube className="h-6 w-6" />}
          title="Diagnose"
          kicker="Lab tests"
          description="Full body checkups, CBC, thyroid, vitamins and more. Compare accredited labs and book home sample collection."
          bullets={["6 partner labs", "Home collection", "Digital reports"]}
          onClick={() => setMode("test")}
          delay={0}
        />
        <OptionCard
          icon={<Stethoscope className="h-6 w-6" />}
          title="Consult"
          kicker="Talk to a doctor"
          description="Find nutritionists, physicians, dieticians and specialists. View profiles and book a video or in-clinic consult."
          bullets={["Verified doctors", "Video or in-clinic", "Same-day slots"]}
          onClick={() => setMode("consult")}
          delay={0.08}
        />
      </div>
    </div>
  );
}

function OptionCard({
  icon,
  kicker,
  title,
  description,
  bullets,
  onClick,
  delay,
}: {
  icon: React.ReactNode;
  kicker: string;
  title: string;
  description: string;
  bullets: string[];
  onClick: () => void;
  delay: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-3xl bg-white p-7 text-left ring-1 ring-[#006E42]/10 transition hover:ring-[#006E42]/30 hover:shadow-[0_24px_50px_-26px_rgba(0,110,66,0.35)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#006E42]/[0.06] blur-3xl transition group-hover:bg-[#006E42]/[0.12]"
      />
      <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-[#006E42] text-white">
        {icon}
      </span>
      <p className="relative mt-5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#006E42]/65">
        {kicker}
      </p>
      <h3 className="relative mt-1 text-[24px] font-semibold tracking-tight text-[#0f3a26]">
        {title}
      </h3>
      <p className="relative mt-2 max-w-md text-[13.5px] leading-relaxed text-[#0f3a26]/60">
        {description}
      </p>
      <div className="relative mt-5 flex flex-wrap gap-2">
        {bullets.map((b) => (
          <span
            key={b}
            className="rounded-full bg-[#006E42]/8 px-3 py-1 text-[11.5px] font-medium text-[#006E42]"
          >
            {b}
          </span>
        ))}
      </div>
      <span className="relative mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#006E42]">
        Continue
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </span>
    </motion.button>
  );
}
