"use client";

import {
  Activity,
  Bandage,
  Cable,
  CircleDot,
  Cylinder,
  Dumbbell,
  Footprints,
  HeartPulse,
  Layers,
  Moon,
  Shirt,
  Vibrate,
  Watch,
  Weight,
  type LucideIcon,
} from "lucide-react";
import { useId } from "react";

import { products } from "@/lib/shop/data";
import { isPlaceholderImage, packFor, type PackIcon } from "@/lib/shop/packs";

type Material = {
  body: string;
  cap: string;
  label: string;
  stripe: string;
  text: string;
  sub: string;
  edge?: string;
};

/* Real-world containers per category, in the category's own colour. */
const MATERIALS: Record<string, Material> = {
  vitamins: { body: "#fbfdfb", cap: "#006E42", label: "#ffffff", stripe: "#006E42", text: "#0f3a26", sub: "#0f3a2699", edge: "#0f3a261f" },
  ayurveda: { body: "#9a6a2c", cap: "#2f2412", label: "#f6eedb", stripe: "#8b6a2a", text: "#3b2a10", sub: "#3b2a10a6" },
  omega: { body: "#1e5d8a", cap: "#f6faf7", label: "#ffffff", stripe: "#1e5d8a", text: "#123a57", sub: "#123a57a6" },
  performance: { body: "#14402b", cap: "#9af2c4", label: "#14402b", stripe: "#9af2c4", text: "#ffffff", sub: "#9af2c4" },
  plant: { body: "#dccaa1", cap: "#3a7a3c", label: "#fffdf6", stripe: "#3a7a3c", text: "#23482a", sub: "#23482aa6" },
};
const TIN: Material = { body: "#3a7a3c", cap: "#2c5e2e", label: "#f4efdf", stripe: "#c79a3d", text: "#23482a", sub: "#23482aa6" };
const BOXES: Record<string, { face: string; top: string; side: string }> = {
  equipment: { face: "#2f3542", top: "#4a5160", side: "#1f242d" },
  wearables: { face: "#5a3a8a", top: "#7657a6", side: "#422a68" },
  recovery: { face: "#c46a4a", top: "#d88b6f", side: "#a1543a" },
};
const SWATCH_FALLBACK: Record<string, string> = {
  vitamins: "#dfeae0", performance: "#e6e2d7", ayurveda: "#ece2cb", omega: "#d6e0e8",
  plant: "#dde7d6", equipment: "#dee1e3", wearables: "#e2dee6", recovery: "#e8d8d2",
};
const ICONS: Record<PackIcon, LucideIcon> = {
  bands: Cable, mat: Layers, kettlebell: Weight, dumbbell: Dumbbell, rope: Activity, wheel: CircleDot,
  watch: Watch, tracker: HeartPulse, apparel: Shirt, shoes: Footprints, sleep: Moon,
  massage: Vibrate, roller: Cylinder, ball: CircleDot, sleeve: Bandage,
};

function labelSize(label: string, max: number) {
  const n = label.length;
  if (n <= 3) return max;
  if (n <= 5) return max * 0.8;
  if (n <= 7) return max * 0.64;
  return max * 0.52;
}

type ProductRef = { id: string; name: string; categoryId: string; swatch?: string };

/** A drawn product: bottle, tub, tin, or box, with its printed label. */
export function Packshot({ product, className = "" }: { product: ProductRef; className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const pack = packFor(product);
  const swatch = product.swatch ?? products.find((p) => p.id === product.id)?.swatch ?? SWATCH_FALLBACK[product.categoryId] ?? "#e7eee9";

  return (
    <div className={`relative ${className}`} style={{ background: swatch }}>
      <svg viewBox="0 0 200 200" className="h-full w-full" role="img" aria-label={product.name}>
        <defs>
          <linearGradient id={`vol${uid}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#000" stopOpacity="0.14" />
            <stop offset="0.28" stopColor="#fff" stopOpacity="0.2" />
            <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.18" />
          </linearGradient>
          <radialGradient id={`glow${uid}`} cx="0.5" cy="0.45" r="0.5">
            <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* soft light behind the object */}
        <rect x="0" y="0" width="200" height="200" fill={`url(#glow${uid})`} />

        {/* ground shadow */}
        <ellipse cx="100" cy="171" rx="60" ry="9" fill="#0f3a26" opacity="0.06" />
        <ellipse cx="100" cy="171" rx="44" ry="6" fill="#0f3a26" opacity="0.1" />

        <g className="transition-transform duration-500 ease-out motion-safe:group-hover:-translate-y-[3px]">
          {pack.form === "box" ? (
            <BoxShape uid={uid} product={product} label={pack.label} sub={pack.sub} icon={pack.icon} />
          ) : pack.form === "tub" ? (
            <TubShape uid={uid} m={MATERIALS[product.categoryId] ?? MATERIALS.performance} label={pack.label} sub={pack.sub} kraft={product.categoryId === "plant"} />
          ) : pack.form === "tin" ? (
            <TinShape uid={uid} label={pack.label} sub={pack.sub} />
          ) : (
            <BottleShape
              uid={uid}
              m={MATERIALS[pack.form === "amber" ? "ayurveda" : pack.form === "softgel" ? "omega" : "vitamins"]}
              label={pack.label}
              sub={pack.sub}
              glass={pack.form === "amber"}
            />
          )}
        </g>
      </svg>
    </div>
  );
}

function BottleShape({ uid, m, label, sub, glass }: { uid: string; m: Material; label: string; sub: string; glass?: boolean }) {
  return (
    <>
      <clipPath id={`bottle${uid}`}>
        <rect x="56" y="62" width="88" height="110" rx="18" />
      </clipPath>
      {/* cap */}
      <rect x="69" y="34" width="62" height="26" rx="5" fill={m.cap} />
      {Array.from({ length: 7 }).map((_, i) => (
        <line key={i} x1={76 + i * 8} x2={76 + i * 8} y1="39" y2="55" stroke="#000" strokeOpacity="0.12" strokeWidth="1.4" />
      ))}
      <rect x="78" y="58" width="44" height="7" fill={m.cap} opacity="0.85" />
      {/* body + label */}
      <g clipPath={`url(#bottle${uid})`}>
        <rect x="56" y="62" width="88" height="110" fill={m.body} opacity={glass ? 0.94 : 1} />
        <rect x="56" y="90" width="88" height="58" fill={m.label} />
        <rect x="56" y="90" width="88" height="6" fill={m.stripe} />
        <rect x="64" y="68" width="6" height="100" rx="3" fill="#fff" opacity={glass ? 0.3 : 0.55} />
        <rect x="56" y="62" width="88" height="110" fill={`url(#vol${uid})`} />
      </g>
      {m.edge && <rect x="56.5" y="62.5" width="87" height="109" rx="17.5" fill="none" stroke={m.edge} />}
      <text x="100" y="126" textAnchor="middle" fontWeight="800" fontSize={labelSize(label, 23)} letterSpacing="0.5" fill={m.text}>
        {label}
      </text>
      <text x="100" y="140" textAnchor="middle" fontWeight="600" fontSize="8" letterSpacing="0.6" fill={m.sub}>
        {sub}
      </text>
    </>
  );
}

function TubShape({ uid, m, label, sub, kraft }: { uid: string; m: Material; label: string; sub: string; kraft?: boolean }) {
  return (
    <>
      <clipPath id={`tub${uid}`}>
        <rect x="42" y="72" width="116" height="98" rx="14" />
      </clipPath>
      {/* lid */}
      <rect x="38" y="50" width="124" height="28" rx="8" fill={m.cap} />
      <rect x="38" y="70" width="124" height="3" fill="#000" opacity="0.12" />
      <g clipPath={`url(#tub${uid})`}>
        <rect x="42" y="72" width="116" height="98" fill={m.body} />
        {kraft ? (
          <>
            <rect x="42" y="92" width="116" height="58" fill={m.label} />
            <rect x="42" y="92" width="116" height="6" fill={m.stripe} />
          </>
        ) : (
          <rect x="42" y="98" width="116" height="4" fill={m.stripe} />
        )}
        <rect x="52" y="78" width="7" height="86" rx="3.5" fill="#fff" opacity="0.18" />
        <rect x="42" y="72" width="116" height="98" fill={`url(#vol${uid})`} />
      </g>
      <text x="100" y={kraft ? 128 : 134} textAnchor="middle" fontWeight="800" fontSize={labelSize(label, 26)} letterSpacing="0.8" fill={m.text}>
        {label}
      </text>
      <text x="100" y={kraft ? 142 : 150} textAnchor="middle" fontWeight="600" fontSize="8.5" letterSpacing="0.8" fill={m.sub}>
        {sub}
      </text>
    </>
  );
}

function TinShape({ uid, label, sub }: { uid: string; label: string; sub: string }) {
  const m = TIN;
  return (
    <>
      <clipPath id={`tin${uid}`}>
        <rect x="62" y="60" width="76" height="112" rx="8" />
      </clipPath>
      <rect x="58" y="42" width="84" height="22" rx="5" fill={m.cap} />
      <rect x="58" y="58" width="84" height="2" fill="#000" opacity="0.14" />
      <g clipPath={`url(#tin${uid})`}>
        <rect x="62" y="60" width="76" height="112" fill={m.body} />
        <rect x="62" y="86" width="76" height="62" fill={m.label} />
        <rect x="62" y="86" width="76" height="5" fill={m.stripe} />
        <rect x="69" y="66" width="5" height="100" rx="2.5" fill="#fff" opacity="0.22" />
        <rect x="62" y="60" width="76" height="112" fill={`url(#vol${uid})`} />
      </g>
      <text x="100" y="122" textAnchor="middle" fontWeight="800" fontSize={labelSize(label, 20)} letterSpacing="0.5" fill={m.text}>
        {label}
      </text>
      <text x="100" y="136" textAnchor="middle" fontWeight="600" fontSize="7.5" letterSpacing="0.6" fill={m.sub}>
        {sub}
      </text>
    </>
  );
}

function BoxShape({ uid, product, label, sub, icon }: { uid: string; product: ProductRef; label: string; sub: string; icon?: PackIcon }) {
  const c = BOXES[product.categoryId] ?? BOXES.equipment;
  const Icon = ICONS[icon ?? "dumbbell"];
  return (
    <>
      <polygon points="48,66 146,66 158,52 60,52" fill={c.top} />
      <polygon points="146,66 158,52 158,158 146,172" fill={c.side} />
      <rect x="48" y="66" width="98" height="106" rx="3" fill={c.face} />
      <rect x="48" y="66" width="98" height="106" rx="3" fill={`url(#vol${uid})`} opacity="0.6" />
      <rect x="48" y="66" width="98" height="4" fill="#fff" opacity="0.12" />
      <Icon x={75} y={82} width={44} height={44} color="#ffffff" strokeWidth={1.6} />
      <text x="97" y="148" textAnchor="middle" fontWeight="800" fontSize={labelSize(label, 17)} letterSpacing="1.2" fill="#ffffff">
        {label}
      </text>
      <text x="97" y="160" textAnchor="middle" fontWeight="600" fontSize="7.5" letterSpacing="0.8" fill="#ffffff" opacity="0.72">
        {sub}
      </text>
    </>
  );
}

/** A real uploaded image when the product has one, the drawn packshot otherwise. */
export function ProductVisual({
  product,
  image,
  className = "",
  imgClassName = "object-cover",
}: {
  product: ProductRef;
  image?: string | null;
  className?: string;
  imgClassName?: string;
}) {
  if (!isPlaceholderImage(image)) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- vendor uploads can be data URLs, which next/image cannot load */}
        <img src={image as string} alt={product.name} className={`h-full w-full ${imgClassName}`} />
      </div>
    );
  }
  return <Packshot product={product} className={className} />;
}
