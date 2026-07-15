import { ExternalLink } from "lucide-react";
import Link from "next/link";

import { BrandMark } from "@/components/shell/BrandMark";

type IconProps = { className?: string };
const IgIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.7" fill="currentColor" stroke="none" />
  </svg>
);
const XIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
);
const InIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V23h-4V8zm7.5 0h3.8v2.05h.05c.53-1 1.83-2.05 3.76-2.05 4.02 0 4.76 2.65 4.76 6.1V23h-4v-6.6c0-1.57-.03-3.6-2.2-3.6-2.2 0-2.53 1.72-2.53 3.49V23h-4V8z" /></svg>
);
const YtIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M23.5 6.2a3 3 0 0 0-2.11-2.12C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.39.53A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.11 2.12c1.89.53 9.39.53 9.39.53s7.5 0 9.39-.53a3 3 0 0 0 2.11-2.12A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8zM9.55 15.57V8.43L15.82 12z" /></svg>
);

type FLink = { label: string; href: string; blank?: boolean };

const COMPANY: FLink[] = [
  { label: "About SuppAI", href: "/about" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Blogs", href: "/blog" },
];

const SUPPORT: FLink[] = [
  { label: "Help center", href: "/dashboard/support" },
  { label: "Track order", href: "/dashboard/track" },
  { label: "Contact us", href: "mailto:care@suppai.health", blank: true },
];

const LEGAL: FLink[] = [
  { label: "Privacy policy", href: "/privacy", blank: true },
  { label: "Terms and conditions", href: "/terms", blank: true },
  { label: "Medical disclaimer", href: "/medical-disclaimer", blank: true },
  { label: "Shipping policy", href: "/shipping", blank: true },
  { label: "Return policy", href: "/returns", blank: true },
];

const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com", icon: IgIcon },
  { label: "X", href: "https://x.com", icon: XIcon },
  { label: "LinkedIn", href: "https://linkedin.com", icon: InIcon },
  { label: "YouTube", href: "https://youtube.com", icon: YtIcon },
];

function FooterLink({ label, href, blank }: FLink) {
  const cls = "group inline-flex items-center gap-1 text-[14.5px] text-[#0f3a26]/65 transition hover:text-[#006E42]";
  if (blank) {
    return (
      <Link href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {label}
        <ExternalLink className="h-3 w-3 opacity-0 transition group-hover:opacity-60" />
      </Link>
    );
  }
  return <Link href={href} className={cls}>{label}</Link>;
}

function Column({ title, links }: { title: string; links: FLink[] }) {
  return (
    <div>
      <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#0f3a26]/40">{title}</p>
      <ul className="mt-4 space-y-3">
        {links.map((l) => <li key={l.label}><FooterLink {...l} /></li>)}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[#0f3a26]/8 bg-[#fbfdfb]">
      <div className="px-6 py-16 md:px-10">
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between lg:gap-16">
          {/* brand */}
          <div className="max-w-sm">
            <BrandMark variant="compact" className="w-[84px]" />
            <p className="mt-5 text-[14.5px] leading-relaxed text-[#0f3a26]/60">
              Your health, understood. Upload a report, get a plan built around your body, and shop what you actually need.
            </p>
            <div className="mt-6 flex items-center gap-2.5">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="grid h-11 w-11 place-items-center rounded-xl bg-[#0f3a26]/[0.04] text-[#0f3a26]/55 ring-1 ring-inset ring-[#0f3a26]/8 transition hover:bg-[#006E42]/8 hover:text-[#006E42] hover:ring-[#006E42]/25"
                >
                  <s.icon className="h-[18px] w-[18px]" />
                </a>
              ))}
            </div>
          </div>

          {/* link columns */}
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 sm:gap-14 lg:gap-20">
            <Column title="Company" links={COMPANY} />
            <Column title="Support" links={SUPPORT} />
            <Column title="Legal" links={LEGAL} />
          </div>
        </div>
      </div>

      <div className="border-t border-[#0f3a26]/8">
        <div className="flex flex-col items-center justify-between gap-2 px-6 py-5 text-[12.5px] text-[#0f3a26]/50 sm:flex-row md:px-10">
          <p>© 2026 SuppAI. All rights reserved.</p>
          <p className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#006E42]" />
            Not a substitute for professional medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
