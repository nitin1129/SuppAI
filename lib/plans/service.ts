import type { PolicyOption, Preferences, ProPlan } from "./types";

const NETWORK_DELAY = 350;
function delay<T>(value: T, ms = NETWORK_DELAY): Promise<T> {
  return new Promise((r) => setTimeout(() => r(value), ms));
}

const PLANS: ProPlan[] = [
  {
    id: "daily",
    label: "Daily",
    price: 49,
    period: "/day",
    perDay: 49,
    blurb: "Try Pro for a day. No commitment.",
    features: [
      "AI report analysis",
      "Personalized supplement stack",
      "Today's meal plan",
      "Chat with care team",
    ],
  },
  {
    id: "weekly",
    label: "Weekly",
    price: 99,
    period: "/week",
    perDay: 14,
    blurb: "The full SuppAI experience, billed weekly.",
    highlight: "Best value",
    features: [
      "Everything in Daily",
      "Weekly meal & workout plans",
      "Wearable & lab tracking",
      "Doctor consult included",
      "One free home lab pickup",
      "20% off supplements & labs",
      "Priority support",
    ],
  },
];

const POLICIES: PolicyOption[] = [
  {
    id: "star-essential-5",
    insurer: "Star Health",
    cover: 500000,
    termYears: 1,
    premium: 6480,
    features: ["Cashless at 14,000+ hospitals", "Day-care procedures", "Pre & post hospitalisation 30/60 days"],
  },
  {
    id: "star-essential-10",
    insurer: "Star Health",
    cover: 1000000,
    termYears: 1,
    premium: 9320,
    features: ["Cashless at 14,000+ hospitals", "Day-care procedures", "Restore benefit (50%)"],
  },
  {
    id: "hdfc-optima-10",
    insurer: "HDFC ERGO",
    cover: 1000000,
    termYears: 1,
    premium: 10240,
    features: ["No room rent cap", "Restoration benefit (100%)", "Annual health check up", "Cashless at 13,000+ hospitals"],
  },
  {
    id: "hdfc-optima-20",
    insurer: "HDFC ERGO",
    cover: 2000000,
    termYears: 1,
    premium: 14860,
    features: ["No room rent cap", "Restoration 100%", "Annual check up", "Worldwide emergency cover"],
  },
  {
    id: "niva-reassure-10",
    insurer: "Niva Bupa",
    cover: 1000000,
    termYears: 1,
    premium: 11650,
    features: ["No co-pay", "Restoration unlimited", "Health coach access"],
  },
  {
    id: "niva-reassure-25",
    insurer: "Niva Bupa",
    cover: 2500000,
    termYears: 1,
    premium: 18900,
    features: ["Worldwide emergency cover", "Maternity & newborn (after 24 mo)", "No co-pay", "Wellness rewards up to 30%"],
  },
  {
    id: "icici-elevate-5",
    insurer: "ICICI Lombard",
    cover: 500000,
    termYears: 1,
    premium: 5950,
    features: ["Power booster benefit", "Annual health check up", "Cashless at 7,500+ hospitals"],
  },
  {
    id: "icici-elevate-15",
    insurer: "ICICI Lombard",
    cover: 1500000,
    termYears: 1,
    premium: 13280,
    features: ["Power booster benefit", "No room rent cap", "Maternity rider available"],
  },
  {
    id: "tata-medicare-10",
    insurer: "Tata AIG",
    cover: 1000000,
    termYears: 1,
    premium: 9890,
    features: ["Bariatric surgery cover", "Day-care 540+", "Pre & post 60/90 days"],
  },
  {
    id: "tata-medicare-20",
    insurer: "Tata AIG",
    cover: 2000000,
    termYears: 1,
    premium: 16400,
    features: ["Cumulative bonus 50% per claim-free year", "No-claim discount up to 50%", "Mental illness cover"],
  },
];

export async function fetchProPlans(): Promise<ProPlan[]> {
  return delay(PLANS);
}

export async function fetchPolicies(): Promise<PolicyOption[]> {
  return delay(POLICIES);
}

/**
 * Score policies by distance from preferences. Lower score = closer fit.
 * Returns the same list with a fitScore attached and pre-sorted.
 */
export type RankedPolicy = PolicyOption & {
  fitScore: number;
  recommended: boolean;
  monthlyPremium: number;
};

export async function rankPolicies(
  prefs: Preferences,
): Promise<RankedPolicy[]> {
  const targetAnnual = prefs.yearlyBudget;
  const targetCover = prefs.coverLakhs * 100000;

  const ranked: RankedPolicy[] = POLICIES.map((p) => {
    const coverDist = Math.abs(p.cover - targetCover) / targetCover;
    const premiumDist =
      Math.abs(p.premium - targetAnnual) / Math.max(1, targetAnnual);
    // Cover mismatch weighted higher than premium overshoot.
    const fitScore = coverDist * 1.6 + premiumDist;
    return {
      ...p,
      fitScore,
      recommended: false,
      monthlyPremium: Math.round(p.premium / 12),
    };
  }).sort((a, b) => a.fitScore - b.fitScore);

  // Flag top 2 as recommended.
  ranked.slice(0, 2).forEach((p) => (p.recommended = true));
  return delay(ranked);
}
