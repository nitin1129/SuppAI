export type ConsultMode = "video" | "in-clinic";

export type Specialty = {
  id: string;
  label: string;
  description: string;
};

export type Review = {
  author: string;
  rating: number;
  text: string;
  when: string;
};

export type Doctor = {
  id: string;
  name: string;
  specialtyId: string;
  specialtyLabel: string;
  qualifications: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  languages: string[];
  bio: string;
  fee: number;
  clinic: string;
  modes: ConsultMode[];
  nextAvailable: string;
  reviews: Review[];
};
