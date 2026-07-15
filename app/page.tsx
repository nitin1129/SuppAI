import { ClosingCTA } from "@/components/landing/ClosingCTA";
import { FeatureRow } from "@/components/landing/FeatureRow";
import { Footer } from "@/components/landing/Footer";
import { HeroInteractive } from "@/components/landing/HeroInteractive";
import { LandingNav } from "@/components/landing/LandingNav";
import { StatsStrip } from "@/components/landing/StatsStrip";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-white text-[#0f3a26]">
      <LandingNav />
      <main>
        <HeroInteractive />
        <StatsStrip />
        <FeatureRow />
        <ClosingCTA />
      </main>
      <Footer />
    </div>
  );
}
