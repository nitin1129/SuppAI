import { Activity, HeartPulse, ShieldCheck, Sparkles } from "lucide-react";

import { PublicPage } from "@/components/shell/PublicPage";

const VALUES = [
  { icon: HeartPulse, title: "Health you can act on", body: "We turn dense lab reports into a clear plan you can actually follow, day by day." },
  { icon: ShieldCheck, title: "Privacy first", body: "Your health data is encrypted and only used to serve you. You stay in control of it." },
  { icon: Activity, title: "Backed by real data", body: "Plans, supplements, and tests are matched to your markers, not generic advice." },
  { icon: Sparkles, title: "Made simple", body: "A calm, guided experience from upload to plan to shop, with no jargon." },
];

export default function Page() {
  return (
    <PublicPage title="About SuppAI" subtitle="Your health, understood.">
      <div className="space-y-5 text-[13.5px] leading-relaxed text-[#0f3a26]/70">
        <p>SuppAI started with a simple frustration: people get a lab report full of numbers and no idea what to do next. We built SuppAI to close that gap.</p>
        <p>Upload your report and we read your markers, flag what needs attention, and build a day-by-day routine and weekly plan around your body. From there you can book doctors and lab tests, order the supplements and foods you actually need, and track everything in one place.</p>
        <p>Our goal is to make good health boringly easy, so the right next step is always obvious.</p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {VALUES.map((v) => (
          <div key={v.title} className="rounded-2xl bg-white p-5 shadow-[0_2px_4px_-2px_rgba(15,58,38,0.08),0_16px_36px_-20px_rgba(15,58,38,0.30)] ring-1 ring-[#0f3a26]/10">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#006E42]/8 text-[#006E42]"><v.icon className="h-5 w-5" /></span>
            <p className="mt-3 text-[14px] font-bold text-[#0f3a26]">{v.title}</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-[#0f3a26]/60">{v.body}</p>
          </div>
        ))}
      </div>
    </PublicPage>
  );
}
