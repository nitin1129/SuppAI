"use client";

import { Check } from "lucide-react";

type Props = {
  label: string;
  selected: boolean;
  multi?: boolean;
  onClick: () => void;
};

export function ChoiceCard({ label, selected, multi, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative w-full overflow-hidden rounded-lg border px-3.5 py-2.5 text-left text-[13px] font-medium transition ${
        selected
          ? "border-[#006E42] bg-[#006E42]/5 text-[#006E42] ring-2 ring-[#006E42]/15"
          : "border-[#006E42]/15 bg-white text-[#0f3a26] hover:border-[#006E42]/40 hover:bg-[#006E42]/[0.03]"
      }`}
    >
      <div className="flex items-center justify-between">
        <span>{label}</span>
        <span
          className={`grid h-5 w-5 shrink-0 place-items-center transition ${
            multi ? "rounded" : "rounded-full"
          } ${
            selected
              ? "bg-[#006E42] text-white"
              : "border border-[#006E42]/25 bg-white text-transparent"
          }`}
        >
          <Check className="h-3 w-3" />
        </span>
      </div>
    </button>
  );
}
