import {
  Activity,
  Apple,
  Banknote,
  Bell,
  BookOpen,
  Bot,
  Box,
  Brain,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Crown,
  Database,
  Droplet,
  Dumbbell,
  FileBarChart,
  FileText,
  Footprints,
  Gift,
  Heart,
  HelpCircle,
  History,
  Info,
  Languages,
  LifeBuoy,
  Lock,
  Mail,
  MessageCircle,
  Moon,
  Pill,
  Receipt,
  RotateCcw,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Smile,
  Sparkles,
  Stethoscope,
  Target,
  TestTube,
  Truck,
  User,
  Users,
  UtensilsCrossed,
  Video,
  type LucideIcon,
} from "lucide-react";

export type Feature = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

export type Section = {
  id: string;
  number: string;
  title: string;
  blurb: string;
  icon: LucideIcon;
  href: string;
  features: Feature[];
};

export const sectionHref = (id: string) =>
  id === "overview" || id === "get-healthy" ? "/dashboard" : `/dashboard/${id}`;

const SECTIONS_RAW: Omit<Section, "href">[] = [
  {
    id: "get-healthy",
    number: "2.0",
    title: "Get Healthy",
    blurb: "Build the daily habits that move the needle.",
    icon: Heart,
    features: [
      { id: "meal-plans", label: "Meal plans", description: "Weekly plans tuned to your goals and deficiencies.", icon: UtensilsCrossed },
      { id: "workouts", label: "Workout plans", description: "Strength, cardio, and recovery routines for any level.", icon: Dumbbell },
      { id: "sleep", label: "Sleep tracker", description: "Track quality, duration, and patterns over time.", icon: Moon },
      { id: "habits", label: "Habit builder", description: "Tiny daily wins that compound into vitality.", icon: CheckCircle2 },
      { id: "mindfulness", label: "Mindfulness", description: "Guided meditation and breathwork sessions.", icon: Brain },
      { id: "water", label: "Hydration", description: "Hit your daily water targets effortlessly.", icon: Droplet },
      { id: "steps", label: "Step tracker", description: "Daily movement goals synced with your device.", icon: Footprints },
      { id: "recipes", label: "Recipes", description: "Macro-balanced recipes for every preference.", icon: Apple },
    ],
  },
  {
    id: "diagnose",
    number: "3.0",
    title: "Diagnose & Consult",
    blurb: "From lab data to a clear medical opinion.",
    icon: Stethoscope,
    features: [
      { id: "upload-report", label: "Upload reports", description: "PDF, image, or scan — we parse it all.", icon: FileText },
      { id: "ai-analysis", label: "AI report analysis", description: "Deficiencies, risks, and trends in seconds.", icon: Bot },
      { id: "symptoms", label: "Symptom checker", description: "Describe what you feel — get likely causes.", icon: Activity },
      { id: "book", label: "Book consultation", description: "Same-day slots with verified specialists.", icon: Calendar },
      { id: "specialists", label: "Specialist directory", description: "Hepatologists, endocrinologists, and more.", icon: Users },
      { id: "video", label: "Video consults", description: "Secure virtual visits from your phone.", icon: Video },
      { id: "lab", label: "Lab test booking", description: "Order tests at home, results in the app.", icon: TestTube },
      { id: "rx", label: "Prescription history", description: "All your prescriptions, organized and searchable.", icon: ClipboardList },
    ],
  },
  {
    id: "shop",
    number: "4.0",
    title: "Shop",
    blurb: "Curated supplements, foods, and tools.",
    icon: ShoppingBag,
    features: [
      { id: "supplements", label: "Supplements", description: "Pharmacy-grade picks matched to your reports.", icon: Pill },
      { id: "nutraceuticals", label: "Nutraceuticals", description: "Adaptogens, peptides, and clinical-grade picks.", icon: Sparkles },
      { id: "foods", label: "Healthy foods", description: "Whole foods, snacks, and pantry staples.", icon: Apple },
      { id: "equipment", label: "Equipment", description: "Home workout gear, scales, and trackers.", icon: Dumbbell },
      { id: "bundles", label: "Curated bundles", description: "Goal-based stacks at a better price.", icon: Box },
      { id: "reorder", label: "Reorder", description: "One-tap reorder of your usual stack.", icon: RotateCcw },
      { id: "track-orders", label: "Track orders", description: "Live shipment tracking and delivery ETAs.", icon: Truck },
      { id: "wishlist", label: "Wishlist", description: "Save items for later or for special offers.", icon: Heart },
    ],
  },
  {
    id: "plans",
    number: "5.0",
    title: "Plans & Membership",
    blurb: "Manage your subscription and unlock more.",
    icon: Crown,
    features: [
      { id: "current", label: "Current plan", description: "See benefits and usage of your active plan.", icon: ShieldCheck },
      { id: "upgrade", label: "Upgrade plan", description: "Step up for more consults, faster analysis.", icon: Crown },
      { id: "benefits", label: "Member benefits", description: "Discounts, priority support, and perks.", icon: Gift },
      { id: "referrals", label: "Referrals", description: "Invite friends — earn credits both ways.", icon: Users },
      { id: "family", label: "Family plans", description: "Add up to 4 family members on one plan.", icon: Users },
      { id: "billing", label: "Billing", description: "Manage cards, billing cycles, and methods.", icon: CreditCard },
      { id: "invoices", label: "Invoices", description: "Download invoices for taxes or insurance.", icon: Receipt },
      { id: "subscription", label: "Subscription", description: "Pause, resume, or cancel anytime.", icon: Banknote },
    ],
  },
  {
    id: "track",
    number: "6.0",
    title: "Track & Manage",
    blurb: "Everything you measure, in one timeline.",
    icon: FileBarChart,
    features: [
      { id: "timeline", label: "Health timeline", description: "Reports, visits, and milestones over time.", icon: History },
      { id: "symptoms-log", label: "Symptoms log", description: "Daily diary your doctor can review.", icon: ClipboardList },
      { id: "meds", label: "Medication tracker", description: "Reminders and adherence streaks.", icon: Pill },
      { id: "labs", label: "Lab history", description: "Compare markers across reports.", icon: TestTube },
      { id: "goals", label: "Goals progress", description: "Visualize progress toward each health goal.", icon: Target },
      { id: "measurements", label: "Body measurements", description: "Weight, waist, body composition over time.", icon: Ruler },
      { id: "mood", label: "Mood journal", description: "Spot the patterns between mood, sleep, and food.", icon: Smile },
      { id: "appointments", label: "Appointments", description: "All upcoming and past appointments.", icon: CalendarDays },
    ],
  },
  {
    id: "account",
    number: "7.0",
    title: "Account",
    blurb: "Your profile, preferences, and privacy.",
    icon: User,
    features: [
      { id: "profile", label: "Profile", description: "Name, photo, contact info, and bio.", icon: User },
      { id: "onboarding", label: "Onboarding answers", description: "Update your goals and preferences.", icon: ClipboardList },
      { id: "notifications", label: "Notifications", description: "Choose what we ping you about.", icon: Bell },
      { id: "privacy", label: "Privacy & data", description: "Export, delete, or restrict your data.", icon: Lock },
      { id: "devices", label: "Connected devices", description: "Apple Health, Fitbit, Oura, and more.", icon: Smartphone },
      { id: "language", label: "Language", description: "Switch the app to your preferred language.", icon: Languages },
      { id: "security", label: "Security", description: "Passwords, 2FA, and session management.", icon: ShieldCheck },
      { id: "linked-emails", label: "Linked emails", description: "Manage backup and recovery emails.", icon: Mail },
    ],
  },
  {
    id: "support",
    number: "8.0",
    title: "Support",
    blurb: "We're here when you need a hand.",
    icon: LifeBuoy,
    features: [
      { id: "help", label: "Help center", description: "Step-by-step guides for every feature.", icon: HelpCircle },
      { id: "contact", label: "Contact us", description: "Reach our care team directly.", icon: Mail },
      { id: "faq", label: "FAQs", description: "Quick answers to common questions.", icon: BookOpen },
      { id: "chat", label: "Live chat", description: "Real human help, weekdays 9–6.", icon: MessageCircle },
      { id: "bug", label: "Report a bug", description: "Help us fix something that's not working.", icon: Info },
      { id: "feature", label: "Feature request", description: "Suggest what we should build next.", icon: Sparkles },
      { id: "community", label: "Community", description: "Join the SuppAI member community.", icon: Users },
      { id: "data", label: "Terms & data", description: "Our policies, simply explained.", icon: Database },
    ],
  },
];

export const sections: Section[] = SECTIONS_RAW.map((s) => ({
  ...s,
  href: sectionHref(s.id),
}));

export function getSection(id: string) {
  return sections.find((s) => s.id === id);
}
