import type {
  AvailabilityResult,
  TestPackage,
  TimeSlot,
  Vendor,
} from "./types";

/**
 * Mock data service. Every function is async and returns a Promise so the
 * call sites already behave like real network requests. To switch to a live
 * backend later, replace the bodies with `fetch(...)` calls and keep the
 * signatures identical.
 */

const NETWORK_DELAY = 350;

function delay<T>(value: T, ms = NETWORK_DELAY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// Lab registry. Features are lab-wide; price/MRP are applied per package below.
type LabBase = Pick<
  Vendor,
  | "id"
  | "name"
  | "accreditation"
  | "rating"
  | "reviews"
  | "turnaroundHours"
  | "homeCollection"
  | "onlineBooking"
  | "digitalResults"
>;

const LABS: LabBase[] = [
  { id: "lalpath", name: "Dr. Lal PathLabs", accreditation: "NABL · CAP", rating: 4.7, reviews: 31200, turnaroundHours: 24, homeCollection: true, onlineBooking: true, digitalResults: true },
  { id: "metropolis", name: "Metropolis Healthcare", accreditation: "NABL · CAP", rating: 4.6, reviews: 24800, turnaroundHours: 24, homeCollection: true, onlineBooking: true, digitalResults: true },
  { id: "srl", name: "SRL Diagnostics", accreditation: "NABL", rating: 4.4, reviews: 18900, turnaroundHours: 36, homeCollection: true, onlineBooking: false, digitalResults: true },
  { id: "thyrocare", name: "Thyrocare", accreditation: "NABL · CAP", rating: 4.6, reviews: 18420, turnaroundHours: 24, homeCollection: true, onlineBooking: true, digitalResults: true },
  { id: "healthians", name: "Healthians", accreditation: "NABL", rating: 4.5, reviews: 14300, turnaroundHours: 18, homeCollection: true, onlineBooking: false, digitalResults: true },
  { id: "apollo", name: "Apollo Diagnostics", accreditation: "NABL · ISO", rating: 4.7, reviews: 24110, turnaroundHours: 12, homeCollection: true, onlineBooking: true, digitalResults: true },
];

// Multiplier so each lab prices the same package a little differently.
const LAB_PRICE_FACTOR: Record<string, number> = {
  lalpath: 1.15,
  metropolis: 1.1,
  srl: 0.95,
  thyrocare: 1.0,
  healthians: 0.9,
  apollo: 1.2,
};

function vendorsFor(basePrice: number, baseMrp: number): Vendor[] {
  return LABS.map((lab) => {
    const f = LAB_PRICE_FACTOR[lab.id] ?? 1;
    return {
      ...lab,
      price: Math.round((basePrice * f) / 10) * 10 - 1,
      mrp: Math.round((baseMrp * f) / 10) * 10,
    };
  });
}

const PACKAGES: TestPackage[] = [
  {
    id: "full-body-advanced",
    name: "Full Body Checkup — Advanced",
    tagline: "Our most complete screening across every major system.",
    category: "full-body",
    parameterCount: 92,
    fastingRequired: true,
    popular: true,
    highlights: [
      "Complete blood count & lipid profile",
      "Liver, kidney & thyroid function",
      "Vitamin D, B12 & iron studies",
      "Diabetes (HbA1c) & cardiac risk",
    ],
    vendors: vendorsFor(1500, 3200),
  },
  {
    id: "full-body-basic",
    name: "Full Body Checkup — Essential",
    tagline: "The core panel for an annual health baseline.",
    category: "full-body",
    parameterCount: 58,
    fastingRequired: true,
    highlights: [
      "Complete blood count",
      "Lipid & liver profile",
      "Blood sugar (fasting)",
      "Thyroid (TSH)",
    ],
    vendors: vendorsFor(850, 1800),
  },
  {
    id: "cbc",
    name: "Complete Blood Count (CBC)",
    tagline: "A quick read on infection, anaemia and overall blood health.",
    category: "blood",
    parameterCount: 28,
    fastingRequired: false,
    highlights: [
      "Haemoglobin & RBC indices",
      "WBC differential count",
      "Platelet count",
    ],
    vendors: vendorsFor(300, 500),
  },
  {
    id: "thyroid",
    name: "Thyroid Profile (T3, T4, TSH)",
    tagline: "Check how your thyroid is steering metabolism and energy.",
    category: "specialty",
    parameterCount: 3,
    fastingRequired: false,
    highlights: ["Total T3 & T4", "TSH (ultrasensitive)", "Reported same day"],
    vendors: vendorsFor(400, 700),
  },
  {
    id: "vitamin",
    name: "Vitamin Deficiency Panel",
    tagline: "Pinpoint the gaps behind fatigue, mood and immunity.",
    category: "specialty",
    parameterCount: 6,
    fastingRequired: false,
    highlights: ["Vitamin D (25-OH)", "Vitamin B12", "Folate & iron studies"],
    vendors: vendorsFor(1100, 2200),
  },
  {
    id: "diabetes",
    name: "Diabetes Care Panel",
    tagline: "Track sugar control and catch insulin resistance early.",
    category: "specialty",
    parameterCount: 5,
    fastingRequired: true,
    highlights: ["HbA1c", "Fasting & PP glucose", "Insulin (fasting)"],
    vendors: vendorsFor(600, 1100),
  },
];

const SLOT_LABELS = [
  "6:00 AM",
  "7:00 AM",
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
];

export async function fetchTestPackages(): Promise<TestPackage[]> {
  return delay(PACKAGES);
}

export async function fetchPackage(id: string): Promise<TestPackage | null> {
  return delay(PACKAGES.find((p) => p.id === id) ?? null);
}

export async function checkAvailability(
  pincode: string,
): Promise<AvailabilityResult> {
  const clean = pincode.trim();
  const serviceable = /^\d{6}$/.test(clean) && !clean.startsWith("0");
  return delay({
    pincode: clean,
    serviceable,
    earliestDate: "tomorrow",
    message: serviceable
      ? "Home sample collection is available at this location."
      : "We do not service this pincode yet. Try a nearby one.",
  });
}

export async function fetchSlots(dateISO: string): Promise<TimeSlot[]> {
  // Deterministic mock: a couple of mid-morning slots marked unavailable.
  const taken = new Set(["9:00 AM", "1:00 PM"]);
  void dateISO;
  return delay(
    SLOT_LABELS.map((label, i) => ({
      id: `slot-${i}`,
      label,
      available: !taken.has(label),
    })),
  );
}
