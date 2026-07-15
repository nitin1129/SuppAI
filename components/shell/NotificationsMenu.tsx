"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Bell,
  CalendarClock,
  CheckCheck,
  FileText,
  Package,
  Repeat,
  Wallet,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  type NotifType,
  type Notification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  relTime,
} from "@/lib/account/service";

const EASE = [0.22, 1, 0.36, 1] as const;

const ICON: Record<NotifType, React.ComponentType<{ className?: string }>> = {
  order: Package,
  report: FileText,
  appointment: CalendarClock,
  wallet: Wallet,
  subscription: Repeat,
};

export function NotificationsMenu() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[] | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications().then(setItems);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const unread = items?.filter((n) => !n.read).length ?? 0;

  function onRead(id: string) {
    setItems((cur) => (cur ? cur.map((n) => (n.id === id ? { ...n, read: true } : n)) : cur));
    markNotificationRead(id);
  }
  function readAll() {
    setItems((cur) => (cur ? cur.map((n) => ({ ...n, read: true })) : cur));
    markAllNotificationsRead();
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        aria-expanded={open}
        className={`relative grid h-10 w-10 place-items-center rounded-xl bg-white ring-1 transition ${
          open ? "text-[#006E42] ring-[#006E42]/40" : "text-[#0f3a26]/65 ring-[#006E42]/12 hover:text-[#006E42]"
        }`}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-1.5 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#006E42] px-1 text-[10px] font-bold leading-none text-white ring-2 ring-[#f6faf7] tabular-nums">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="absolute right-0 top-12 z-50 w-[360px] origin-top-right overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_-20px_rgba(0,30,18,0.4)] ring-1 ring-[#0f3a26]/8"
            role="dialog"
            aria-label="Notifications"
          >
            <div className="flex items-center justify-between border-b border-[#0f3a26]/8 px-4 py-3">
              <p className="text-[13px] font-bold text-[#0f3a26]">
                Notifications
                {unread > 0 && <span className="ml-1.5 text-[11px] font-medium text-[#006E42]">{unread} new</span>}
              </p>
              {unread > 0 && (
                <button onClick={readAll} className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#006E42] transition hover:underline">
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="no-scrollbar max-h-[400px] overflow-y-auto">
              {!items ? (
                <div className="space-y-2 p-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-14 animate-pulse rounded-xl bg-[#0f3a26]/[0.03]" />
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <Bell className="mx-auto h-6 w-6 text-[#0f3a26]/25" />
                  <p className="mt-2 text-[12.5px] font-semibold text-[#0f3a26]">You&apos;re all caught up.</p>
                  <p className="mt-0.5 text-[11.5px] text-[#0f3a26]/55">New updates will show up here.</p>
                </div>
              ) : (
                <ul className="p-1.5">
                  {items.map((n) => {
                    const Icon = ICON[n.type];
                    return (
                      <li key={n.id}>
                        <button
                          onClick={() => onRead(n.id)}
                          className={`flex w-full items-start gap-3 rounded-xl px-2.5 py-2.5 text-left transition ${
                            n.read ? "hover:bg-[#0f3a26]/[0.03]" : "bg-[#006E42]/[0.05] hover:bg-[#006E42]/[0.08]"
                          }`}
                        >
                          <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${n.read ? "bg-[#0f3a26]/[0.05] text-[#0f3a26]/50" : "bg-[#006E42]/10 text-[#006E42]"}`}>
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className={`truncate text-[12.5px] ${n.read ? "font-semibold text-[#0f3a26]/80" : "font-bold text-[#0f3a26]"}`}>
                                {n.title}
                              </p>
                              <span className="shrink-0 text-[10px] text-[#0f3a26]/40">{relTime(n.at)}</span>
                            </div>
                            <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-relaxed text-[#0f3a26]/60">{n.body}</p>
                          </div>
                          {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#006E42]" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
