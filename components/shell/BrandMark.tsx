import Image from "next/image";

type Props = {
  variant?: "full" | "mark" | "inverse" | "compact";
  className?: string;
};

export function BrandMark({ variant = "full", className = "" }: Props) {
  // Trimmed colored logo (no canvas padding), horizontal 1.64:1. For light
  // in-app surfaces and cards.
  if (variant === "compact") {
    return (
      <Image
        src="/logos/supp-ai-logo.png"
        alt="SuppAI"
        width={2292}
        height={1397}
        priority
        className={`h-auto object-contain ${className || "w-[56px]"}`}
      />
    );
  }

  // Detailed white logo (drawn variant, not a flat silhouette) for green / dark
  // surfaces. No background.
  if (variant === "inverse") {
    return (
      <Image
        src="/logos/supp-ai-white.png"
        alt="SuppAI"
        width={2332}
        height={1436}
        priority
        className={`h-auto object-contain ${className || "w-[56px]"}`}
      />
    );
  }

  if (variant === "mark") {
    return (
      <Image
        src="/logos/supp-ai-mark.svg"
        alt="SuppAI"
        width={62}
        height={20}
        priority
        className={`h-auto object-contain ${className || "w-[52px]"}`}
      />
    );
  }

  // Light surfaces: the primary (colored) logo. Used by the member dashboard.
  return (
    <Image
      src="/logos/supp-ai-primary.png"
      alt="SuppAI"
      width={420}
      height={560}
      priority
      className={`h-auto object-contain ${className}`}
    />
  );
}
