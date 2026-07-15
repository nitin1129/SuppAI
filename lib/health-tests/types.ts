export type Vendor = {
  id: string;
  name: string;
  accreditation: string;
  rating: number;
  reviews: number;
  turnaroundHours: number;
  homeCollection: boolean;
  onlineBooking: boolean;
  digitalResults: boolean;
  price: number;
  mrp: number;
};

export type TestPackage = {
  id: string;
  name: string;
  tagline: string;
  category: "full-body" | "blood" | "specialty";
  parameterCount: number;
  fastingRequired: boolean;
  popular?: boolean;
  highlights: string[];
  vendors: Vendor[];
};

export type AvailabilityResult = {
  pincode: string;
  serviceable: boolean;
  earliestDate: string;
  message: string;
};

export type TimeSlot = {
  id: string;
  label: string; // e.g. "6:00 AM"
  available: boolean;
};

export type Address = {
  pincode: string;
  line1: string;
  line2: string;
  city: string;
};

export type Patient = {
  fullName: string;
  dob: string;
  gender: "female" | "male" | "other" | "";
  phone: string;
};

export type Schedule = {
  date: string;
  slotId: string;
  slotLabel: string;
};

export type BookingDraft = {
  pkg: TestPackage | null;
  vendor: Vendor | null;
  address: Address | null;
  patient: Patient | null;
  schedule: Schedule | null;
};

export type TestOrder = {
  kind: "test";
  reference: string;
  pkg: TestPackage;
  vendor: Vendor;
  address: Address;
  patient: Patient;
  schedule: Schedule;
  subtotal: number;
  homeCollectionFee: number;
  discount: number;
  total: number;
};
