"use client";

import { Bell, Search } from "lucide-react";

type Props = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

export function AdminTopbar({ title, subtitle, actions }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#0f3a26]/8 bg-[#fbfdfb]/85 backdrop-blur-xl">
      <div className="flex items-center justify-between px-8 py-4">
        <div className="min-w-0">
          <h1 className="truncate text-[18px] font-bold tracking-tight text-[#0f3a26]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 truncate text-[12px] text-[#0f3a26]/55">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden items-center gap-2 rounded-xl bg-white px-3 py-2 text-[12.5px] text-[#0f3a26]/55 ring-1 ring-[#0f3a26]/8 focus-within:ring-[#006E42]/40 md:flex md:w-64">
            <Search className="h-3.5 w-3.5 text-[#0f3a26]/40" />
            <input
              placeholder="Search admin…"
              className="w-full bg-transparent text-[#0f3a26] placeholder:text-[#0f3a26]/35 focus:outline-none"
            />
          </div>

          <button
            aria-label="Notifications"
            className="relative grid h-9 w-9 place-items-center rounded-xl bg-white text-[#0f3a26]/60 ring-1 ring-[#0f3a26]/8 transition hover:text-[#006E42]"
          >
            <Bell className="h-4 w-4" />
          </button>

          {actions}
        </div>
      </div>
    </header>
  );
}
