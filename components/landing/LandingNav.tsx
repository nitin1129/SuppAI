"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const links = [
  { label: "Home", href: "#home" },
  { label: "Product", href: "#product" },
  { label: "Blog", href: "#blog" },
];

export function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center" aria-label="SuppAI home">
          <div className="relative h-[60px] w-[100px] overflow-hidden">
            <Image
              src="/logos/supp-ai-bw.png"
              alt="SuppAI"
              width={870}
              height={1230}
              priority
              className="absolute left-0 top-[-8px] h-auto w-[100px]"
            />
          </div>
        </Link>

        <ul className="hidden items-center gap-9 md:flex">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                className="text-[14px] font-medium text-white/85 transition hover:text-white"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/signin"
            className="text-[14px] font-medium text-white/85 transition hover:text-white"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-white px-5 py-2 text-[14px] font-medium text-[#006E42] transition hover:bg-white/90"
          >
            Sign up
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-lg text-white md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/10 bg-[#005634] px-6 py-5 md:hidden">
          <ul className="flex flex-col gap-3">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-1 text-[14px] font-medium text-white"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li className="flex gap-3 pt-2">
              <Link
                href="/signin"
                className="flex-1 rounded-full border border-white/30 px-4 py-2 text-center text-[13px] font-medium text-white"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="flex-1 rounded-full bg-white px-4 py-2 text-center text-[13px] font-medium text-[#006E42]"
              >
                Sign up
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
