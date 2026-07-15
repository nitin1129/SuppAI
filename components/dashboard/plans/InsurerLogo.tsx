type Props = {
  insurer: string;
  className?: string;
};

// Brand-flavored monogram badges. Swap for real <img src=...> later
// by keying off the insurer name.
const brands: Record<string, { bg: string; fg: string; mark: string }> = {
  "Star Health": { bg: "#fff1e0", fg: "#e23744", mark: "★" },
  "HDFC ERGO": { bg: "#003b6e", fg: "#ffffff", mark: "H" },
  "Niva Bupa": { bg: "#005e6b", fg: "#ffffff", mark: "N" },
  "ICICI Lombard": { bg: "#b00020", fg: "#ffffff", mark: "IL" },
  "Tata AIG": { bg: "#0a2750", fg: "#ffffff", mark: "T" },
};

export function InsurerLogo({ insurer, className = "h-11 w-11" }: Props) {
  const brand = brands[insurer] ?? {
    bg: "#006E42",
    fg: "#ffffff",
    mark: insurer.slice(0, 2),
  };

  return (
    <span
      className={`grid shrink-0 place-items-center overflow-hidden rounded-xl text-[15px] font-bold tracking-tight ring-1 ring-black/8 ${className}`}
      style={{ background: brand.bg, color: brand.fg }}
      aria-label={insurer}
    >
      {brand.mark}
    </span>
  );
}
