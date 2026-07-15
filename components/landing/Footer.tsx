import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-[#006E42]/10 bg-white px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-3">
          <Image
            src="/logos/supp-ai-primary.png"
            alt="SuppAI"
            width={420}
            height={560}
            className="h-auto w-[64px] object-contain"
          />
          <span className="text-[12px] text-[#0f3a26]/50">
            © 2026 SuppAI · Your health, intelligently managed.
          </span>
        </div>
        <div className="flex items-center gap-6 text-[12px] text-[#0f3a26]/60">
          <a href="#" className="hover:text-[#006E42]">Privacy</a>
          <a href="#" className="hover:text-[#006E42]">Terms</a>
          <a href="#" className="hover:text-[#006E42]">Contact</a>
        </div>
      </div>
    </footer>
  );
}
