export type Option = { id: string; label: string };

export const genderOptions: Option[] = [
  { id: "female", label: "Female" },
  { id: "male", label: "Male" },
  { id: "non-binary", label: "Non-binary / Prefer not to say" },
  { id: "other", label: "Other" },
];

export const healthGoals: Option[] = [
  { id: "weight", label: "Weight management" },
  { id: "energy", label: "Energy boost" },
  { id: "hormonal", label: "Hormonal balance" },
  { id: "bone-joint", label: "Bone & joint health" },
  { id: "muscle", label: "Muscle gain" },
  { id: "skin-hair-nails", label: "Skin, hair & nails" },
  { id: "gut", label: "Gut health" },
  { id: "immune", label: "Immune support" },
  { id: "fertility", label: "Fertility & reproductive health" },
  { id: "menstrual", label: "Menstrual wellness / Menopause support" },
  { id: "other", label: "Other" },
];

export const allergies: Option[] = [
  { id: "dairy", label: "Dairy" },
  { id: "gluten", label: "Gluten" },
  { id: "soy", label: "Soy" },
  { id: "peanuts", label: "Peanuts" },
  { id: "tree-nuts", label: "Tree nuts" },
  { id: "eggs", label: "Eggs" },
  { id: "shellfish", label: "Shellfish" },
  { id: "fish", label: "Fish" },
  { id: "corn", label: "Corn" },
  { id: "nightshades", label: "Nightshades" },
  { id: "sweeteners", label: "Artificial sweeteners" },
  { id: "caffeine", label: "Caffeine" },
  { id: "alcohol", label: "Alcohol" },
  { id: "other", label: "Other" },
];

export const dietaryPatterns: Option[] = [
  { id: "omnivore", label: "Omnivore" },
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "pescatarian", label: "Pescatarian" },
  { id: "keto", label: "Low-carb / Keto" },
  { id: "gluten-free", label: "Gluten-free" },
  { id: "jain", label: "Jain / Sattvic" },
  { id: "other", label: "Other" },
];

export const conditions: Option[] = [
  { id: "diabetes", label: "Diabetes / Insulin resistance" },
  { id: "pcos", label: "PCOS / PCOD" },
  { id: "bp-chol", label: "High BP / cholesterol" },
  { id: "thyroid", label: "Thyroid imbalance" },
  { id: "hormonal", label: "Hormonal imbalance" },
  { id: "digestive", label: "Digestive disorders (IBS, IBD)" },
  { id: "menstrual", label: "Menstrual / menopause issues" },
  { id: "autoimmune", label: "Autoimmune disease" },
  { id: "none", label: "None of the above" },
  { id: "other", label: "Other" },
];

export const activityLevels: Option[] = [
  { id: "sedentary", label: "Little movement" },
  { id: "light", label: "Walking & stretching daily" },
  { id: "moderate", label: "Exercise 2–3 times a week" },
  { id: "active", label: "Daily training" },
];

export const supplementPrefs: Option[] = [
  { id: "herbal", label: "Herbal" },
  { id: "clinical", label: "Clinical-grade" },
  { id: "vegan", label: "Vegan" },
  { id: "gluten-free", label: "Gluten-free" },
  { id: "gelatin-free", label: "Gelatin-free" },
  { id: "soy-free", label: "Soy-free" },
  { id: "corn-free", label: "Corn-free" },
  { id: "cruelty-free", label: "Cruelty-free" },
];

export type OnboardingAnswers = {
  fullName: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  goals: string[];
  allergies: string[];
  diet: string;
  conditions: string[];
  activity: string;
  supplementPrefs: string[];
};

export const initialAnswers: OnboardingAnswers = {
  fullName: "",
  age: "",
  gender: "",
  height: "",
  weight: "",
  goals: [],
  allergies: [],
  diet: "",
  conditions: [],
  activity: "",
  supplementPrefs: [],
};
