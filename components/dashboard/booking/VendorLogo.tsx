type Props = {
  vendorId: string;
  name: string;
  className?: string;
};

// Distinct brand-flavored marks per provider. Swap for real <img> logos
// once vendor assets are available (keep the same id mapping).
const brands: Record<string, { bg: string; fg: string; mark: string }> = {
  lalpath: { bg: "#f4c542", fg: "#b3261e", mark: "Lp" },
  metropolis: { bg: "#0a8f3c", fg: "#ffffff", mark: "M" },
  srl: { bg: "#ffffff", fg: "#1f5fb0", mark: "SRL" },
  thyrocare: { bg: "#0a4da2", fg: "#ffffff", mark: "Tc" },
  healthians: { bg: "#0bb5a6", fg: "#ffffff", mark: "H" },
  apollo: { bg: "#ffffff", fg: "#7b2d8e", mark: "Ap" },
};

export function VendorLogo({ vendorId, name, className = "h-11 w-11" }: Props) {
  const brand = brands[vendorId] ?? {
    bg: "#006E42",
    fg: "#ffffff",
    mark: name.slice(0, 2),
  };

  return (
    <span
      className={`grid shrink-0 place-items-center rounded-lg text-[13px] font-bold tracking-tight ring-1 ring-black/10 ${className}`}
      style={{ background: brand.bg, color: brand.fg }}
      aria-label={name}
    >
      {brand.mark}
    </span>
  );
}
