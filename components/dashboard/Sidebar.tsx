"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { BrandMark } from "@/components/shell/BrandMark";
import type { Section } from "@/lib/dashboard-data";

type Props = {
  sections: Section[];
  active: string;
};

const COLLAPSED = 88;
const EXPANDED = 256;

export function Sidebar({ sections, active }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <motion.aside
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      initial={false}
      animate={{ width: open ? EXPANDED : COLLAPSED }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-20 flex h-screen shrink-0 flex-col overflow-hidden border-r border-[#006E42]/8 bg-white"
    >
      {/* Brand: full logo at both states, scales with sidebar width */}
      <div className="flex h-[88px] shrink-0 items-center justify-center px-3">
        <motion.div
          initial={false}
          animate={{ width: open ? 132 : 72 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <BrandMark className="w-full" />
        </motion.div>
      </div>

      <div className="mx-4 h-px bg-[#006E42]/8" />

      <nav className="no-scrollbar flex-1 overflow-y-auto py-3">
        <motion.p
          animate={{ opacity: open ? 1 : 0 }}
          transition={{ duration: 0.18 }}
          className="px-6 pb-2 pt-2 text-[10.5px] font-medium uppercase tracking-[0.14em] text-[#0f3a26]/40"
        >
          Workspace
        </motion.p>

        {sections.map((s) => (
          <NavRow
            key={s.id}
            open={open}
            active={s.id === active}
            label={s.title}
            icon={s.icon}
            href={s.href}
          />
        ))}
      </nav>

      <div className="mx-4 h-px bg-[#006E42]/8" />
      <div className="shrink-0 px-3 py-4">
        <button
          title="Sign out"
          className={`group flex h-10 w-full items-center rounded-lg text-[#0f3a26]/65 transition hover:bg-[#006E42]/[0.05] hover:text-[#006E42] ${
            open ? "gap-3 px-3" : "justify-center"
          }`}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <AnimatePresence>
            {open && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.15 }}
                className="whitespace-nowrap text-[13px] font-medium"
              >
                Sign out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}

type NavRowProps = {
  open: boolean;
  active: boolean;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
};

function NavRow({ open, active, label, icon: Icon, href }: NavRowProps) {
  return (
    <Link
      href={href}
      title={label}
      className={`group relative flex h-10 w-full items-center transition ${
        open ? "gap-3 px-6" : "justify-center"
      } ${active ? "text-[#006E42]" : "text-[#0f3a26]/65 hover:text-[#006E42]"}`}
    >
      {active && (
        <motion.span
          layoutId="dash-active-pill"
          className="absolute inset-y-1.5 left-3 right-3 -z-0 rounded-lg bg-[#006E42]/8"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      )}
      <Icon className="relative z-10 h-4 w-4 shrink-0" />
      <AnimatePresence>
        {open && (
          <motion.span
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.15 }}
            className="relative z-10 whitespace-nowrap text-[13px] font-medium"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
