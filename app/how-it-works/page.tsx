import { FileText, LineChart, ShoppingBag, Sparkles } from "lucide-react";

import { PublicPage } from "@/components/shell/PublicPage";

const STEPS = [
  { icon: FileText, title: "Upload your report", body: "Add your latest blood or lab test PDF. It stays private and encrypted." },
  { icon: Sparkles, title: "We analyse it", body: "SuppAI reads your markers and deficiencies and highlights what matters." },
  { icon: LineChart, title: "Get your plan", body: "A tailored day-by-day routine and a full weekly plan, built around your body." },
  { icon: ShoppingBag, title: "Track and shop", body: "Book doctors and lab tests, order what you need, and track progress in one place." },
];

export default function Page() {
  return (
    <PublicPage title="How it works" subtitle="From a confusing report to a plan you can follow, in four steps.">
      <ol className="space-y-4">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-[0_2px_4px_-2px_rgba(15,58,38,0.08),0_16px_36px_-20px_rgba(15,58,38,0.30)] ring-1 ring-[#0f3a26]/10">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#006E42] text-[15px] font-bold text-white">{i + 1}</span>
            <div>
              <p className="inline-flex items-center gap-2 text-[15px] font-bold text-[#0f3a26]"><s.icon className="h-4 w-4 text-[#006E42]" />{s.title}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-[#0f3a26]/60">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </PublicPage>
  );
}
