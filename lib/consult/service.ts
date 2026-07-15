import type { Doctor, Specialty } from "./types";

const NETWORK_DELAY = 350;
function delay<T>(value: T, ms = NETWORK_DELAY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

const SPECIALTIES: Specialty[] = [
  { id: "nutritionist", label: "Nutritionist", description: "Diet, deficiencies & supplements" },
  { id: "general-physician", label: "General Physician", description: "Everyday health & first opinions" },
  { id: "dietician", label: "Dietician", description: "Clinical meal & weight plans" },
  { id: "endocrinologist", label: "Endocrinologist", description: "Thyroid, hormones & diabetes" },
  { id: "dermatologist", label: "Dermatologist", description: "Skin, hair & nails" },
  { id: "gastroenterologist", label: "Gastroenterologist", description: "Gut & digestive health" },
];

const DOCTORS: Doctor[] = [
  {
    id: "dr-meera-nair",
    name: "Dr. Meera Nair",
    specialtyId: "nutritionist",
    specialtyLabel: "Clinical Nutritionist",
    qualifications: "PhD Nutrition, RD",
    experienceYears: 14,
    rating: 4.9,
    reviewCount: 1280,
    languages: ["English", "Hindi", "Malayalam"],
    bio: "Meera helps clients reverse deficiencies and metabolic issues through food-first protocols, backed by lab data. She specialises in PCOS, thyroid and gut-led nutrition.",
    fee: 699,
    clinic: "SuppAI Care, Indiranagar",
    modes: ["video", "in-clinic"],
    nextAvailable: "Today",
    reviews: [
      { author: "Anita R.", rating: 5, text: "Finally someone who read my reports properly. My B12 is back to normal.", when: "2 weeks ago" },
      { author: "Karthik S.", rating: 5, text: "Practical plan, no fad diets. Lost 6kg in 3 months.", when: "1 month ago" },
    ],
  },
  {
    id: "dr-arjun-rao",
    name: "Dr. Arjun Rao",
    specialtyId: "general-physician",
    specialtyLabel: "General Physician",
    qualifications: "MBBS, MD (Internal Medicine)",
    experienceYears: 11,
    rating: 4.8,
    reviewCount: 2140,
    languages: ["English", "Hindi", "Kannada"],
    bio: "Arjun handles everyday concerns, infections and preventive screening. Known for clear explanations and conservative, evidence-based prescriptions.",
    fee: 499,
    clinic: "SuppAI Care, Koramangala",
    modes: ["video", "in-clinic"],
    nextAvailable: "Today",
    reviews: [
      { author: "Priya M.", rating: 5, text: "Patient and thorough. Didn't over-prescribe.", when: "5 days ago" },
      { author: "Rohan T.", rating: 4, text: "Good consult, slightly ran over time but worth it.", when: "3 weeks ago" },
    ],
  },
  {
    id: "dr-sara-iqbal",
    name: "Dr. Sara Iqbal",
    specialtyId: "dietician",
    specialtyLabel: "Sports & Clinical Dietician",
    qualifications: "MSc Dietetics, CDE",
    experienceYears: 9,
    rating: 4.7,
    reviewCount: 860,
    languages: ["English", "Hindi", "Urdu"],
    bio: "Sara builds performance and clinical meal plans for athletes and people managing diabetes. Macro-precise, culturally flexible plans.",
    fee: 599,
    clinic: "SuppAI Care, HSR Layout",
    modes: ["video"],
    nextAvailable: "Tomorrow",
    reviews: [
      { author: "Vivek N.", rating: 5, text: "My sugar levels are far steadier now.", when: "1 week ago" },
    ],
  },
  {
    id: "dr-leela-menon",
    name: "Dr. Leela Menon",
    specialtyId: "endocrinologist",
    specialtyLabel: "Endocrinologist",
    qualifications: "MBBS, MD, DM (Endocrinology)",
    experienceYears: 17,
    rating: 4.9,
    reviewCount: 1540,
    languages: ["English", "Tamil", "Malayalam"],
    bio: "Leela treats thyroid disorders, PCOS and diabetes. She combines medication with lifestyle change and tracks outcomes closely.",
    fee: 899,
    clinic: "SuppAI Care, Indiranagar",
    modes: ["video", "in-clinic"],
    nextAvailable: "In 2 days",
    reviews: [
      { author: "Sneha K.", rating: 5, text: "Took my PCOS seriously and gave a real plan.", when: "2 weeks ago" },
    ],
  },
  {
    id: "dr-tara-bose",
    name: "Dr. Tara Bose",
    specialtyId: "dermatologist",
    specialtyLabel: "Dermatologist",
    qualifications: "MBBS, MD (Dermatology)",
    experienceYears: 12,
    rating: 4.8,
    reviewCount: 1980,
    languages: ["English", "Hindi", "Bengali"],
    bio: "Tara treats acne, hair fall and pigmentation with evidence-based regimens, and links skin issues back to nutrition and hormones where relevant.",
    fee: 749,
    clinic: "SuppAI Care, Whitefield",
    modes: ["video", "in-clinic"],
    nextAvailable: "Today",
    reviews: [
      { author: "Megha P.", rating: 5, text: "My hair fall finally has a real diagnosis.", when: "1 week ago" },
    ],
  },
  {
    id: "dr-imran-shaikh",
    name: "Dr. Imran Shaikh",
    specialtyId: "gastroenterologist",
    specialtyLabel: "Gastroenterologist",
    qualifications: "MBBS, MD, DM (Gastro)",
    experienceYears: 15,
    rating: 4.9,
    reviewCount: 1120,
    languages: ["English", "Hindi", "Marathi"],
    bio: "Imran focuses on IBS, acidity and gut-microbiome health, combining medication with diet and lifestyle correction.",
    fee: 849,
    clinic: "SuppAI Care, Koramangala",
    modes: ["video", "in-clinic"],
    nextAvailable: "Tomorrow",
    reviews: [
      { author: "Deepak V.", rating: 5, text: "First doctor to actually fix my acidity.", when: "3 weeks ago" },
    ],
  },
  {
    id: "dr-nisha-gupta",
    name: "Dr. Nisha Gupta",
    specialtyId: "general-physician",
    specialtyLabel: "General Physician",
    qualifications: "MBBS, DNB",
    experienceYears: 8,
    rating: 4.7,
    reviewCount: 1640,
    languages: ["English", "Hindi"],
    bio: "Nisha handles preventive checkups, infections and chronic-care follow-ups with a friendly, no-rush approach.",
    fee: 449,
    clinic: "SuppAI Care, HSR Layout",
    modes: ["video"],
    nextAvailable: "Today",
    reviews: [
      { author: "Aman J.", rating: 5, text: "Quick, clear and kind. Great for routine stuff.", when: "4 days ago" },
    ],
  },
];

export async function fetchSpecialties(): Promise<Specialty[]> {
  return delay(SPECIALTIES);
}

export async function fetchDoctors(
  specialtyId: string,
  pincode?: string,
): Promise<Doctor[]> {
  void pincode;
  const matches =
    !specialtyId || specialtyId === "all"
      ? [...DOCTORS]
      : DOCTORS.filter((d) => d.specialtyId === specialtyId);
  // Recommended order: highest rated first, then most reviewed.
  matches.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
  return delay(matches);
}

export async function fetchDoctor(id: string): Promise<Doctor | null> {
  return delay(DOCTORS.find((d) => d.id === id) ?? null);
}
