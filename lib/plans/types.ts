export type ProPlan = {
  id: "daily" | "weekly";
  label: string;
  price: number;
  period: string;
  perDay: number;
  blurb: string;
  highlight?: string;
  features: string[];
};

export type MemberRelation = "self" | "spouse" | "son" | "daughter" | "father" | "mother";

export type InsuranceMember = {
  id: string;
  relation: MemberRelation;
  name: string;
  age: string;
  gender: "female" | "male" | "other" | "";
  city: string;
  medicalHistory: string[];
  otherMedical: string;
};

export type PolicyOption = {
  id: string;
  insurer: string;
  cover: number;
  termYears: 1 | 2 | 3;
  premium: number; // annual
  features: string[];
};

export type Preferences = {
  yearlyBudget: number; // INR per year
  coverLakhs: number;   // cover in lakhs (auto derived from budget)
};

export type InsuranceQuote = {
  recipient: string;
  members: InsuranceMember[];
  policy: PolicyOption;
  payer: {
    fullName: string;
    pan: string;
    email: string;
    phone: string;
    panFileName?: string;
  };
};
