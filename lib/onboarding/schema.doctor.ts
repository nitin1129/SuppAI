import type { StepDef } from "./types";

const GENDER = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Others" },
];

const QUALIFICATIONS = [
  { value: "mbbs", label: "MBBS" },
  { value: "md", label: "MD" },
  { value: "ms", label: "MS" },
  { value: "dm_mch", label: "DM / MCH" },
  { value: "dnb", label: "DNB" },
  { value: "bds_mds", label: "BDS / MDS" },
  { value: "bams_bhms", label: "BAMS / BHMS" },
  { value: "other", label: "Others" },
];

const CONSULT_MODES = [
  { value: "video", label: "Video" },
  { value: "chat", label: "Chat" },
  { value: "in_person", label: "In-person" },
];

export const DOCTOR_STEPS: StepDef[] = [
  {
    id: "personal",
    title: "Personal details",
    subtitle: "Your identity and contact information.",
    fields: [
      { key: "fullName", label: "Full name (as per registration)", type: "text", required: true, placeholder: "Dr. Leela Menon" },
      { key: "fatherSpouseName", label: "Father's / Spouse name", type: "text", required: true, half: true },
      { key: "gender", label: "Gender", type: "select", required: true, half: true, options: GENDER },
      { key: "dob", label: "Date of birth", type: "date", required: true, half: true },
      { key: "nationality", label: "Nationality", type: "text", required: true, half: true, placeholder: "Indian" },
      { key: "mobile", label: "Mobile number", type: "tel", required: true, half: true, pattern: "^\\d{10}$", patternMessage: "10-digit number." },
      { key: "altNumber", label: "Alternate number", type: "tel", half: true, pattern: "^\\d{10}$", patternMessage: "10-digit number." },
      { key: "email", label: "Email address", type: "email", required: true, half: true },
      { key: "languages", label: "Languages spoken", type: "chips", required: true, half: true, hint: "Press Enter to add." },
      { key: "address", label: "Residential address", type: "textarea", required: true },
      { key: "cityState", label: "City / State", type: "text", required: true, half: true },
      { key: "pincode", label: "Pincode", type: "text", required: true, half: true, pattern: "^\\d{6}$", patternMessage: "6-digit pincode." },
    ],
  },
  {
    id: "identity",
    title: "Identity",
    subtitle: "Your PAN and Aadhaar for verification.",
    fields: [
      { key: "pan", label: "PAN number", type: "text", required: true, half: true, placeholder: "ABCDE1234F", pattern: "^[A-Za-z]{5}[0-9]{4}[A-Za-z]$", patternMessage: "Format: ABCDE1234F" },
      { key: "aadhaar", label: "Aadhaar number", type: "text", half: true, pattern: "^\\d{12}$", patternMessage: "12-digit Aadhaar." },
    ],
  },
  {
    id: "qualification",
    title: "Medical registration & qualification",
    subtitle: "Your degrees and specialties.",
    fields: [
      { key: "highestQualification", label: "Highest qualification", type: "select", required: true, half: true, options: QUALIFICATIONS },
      { key: "primarySpecialty", label: "Primary specialty", type: "text", required: true, half: true, placeholder: "Cardiology" },
      { key: "superSpecialty", label: "Super specialty", type: "text", half: true, placeholder: "Interventional cardiology" },
    ],
  },
  {
    id: "teleconsultation",
    title: "Teleconsultation details",
    subtitle: "Registration, experience, and how you consult.",
    fields: [
      { key: "medicalRegNo", label: "Medical registration number", type: "text", required: true, half: true },
      { key: "registrationCouncil", label: "Registration council (State / MCI / NMC)", type: "text", required: true, half: true },
      { key: "yearOfRegistration", label: "Year of registration", type: "number", required: true, half: true },
      { key: "registrationValidTill", label: "Registration valid till", type: "date", required: true, half: true },
      { key: "experienceYears", label: "Total years of experience", type: "number", required: true, half: true },
      { key: "currentAffiliation", label: "Current affiliation / hospital", type: "text", required: true, half: true },
      { key: "consultModes", label: "Consultation modes offered", type: "multiselect", required: true, half: true, hint: "Select all that apply.", options: CONSULT_MODES },
      { key: "consultationFee", label: "Consultation fee (INR)", type: "number", required: true, half: true },
      { key: "avgDuration", label: "Avg. consult duration (min)", type: "number", required: true, half: true },
    ],
  },
  {
    id: "bank",
    title: "Bank & settlement details",
    subtitle: "Where payouts are settled.",
    fields: [
      { key: "accountHolder", label: "Account holder name", type: "text", required: true, half: true },
      { key: "bankName", label: "Bank name", type: "text", required: true, half: true },
      { key: "accountNumber", label: "Account number", type: "text", required: true, half: true },
      { key: "ifsc", label: "IFSC code", type: "text", required: true, half: true, pattern: "^[A-Za-z]{4}0[A-Za-z0-9]{6}$", patternMessage: "e.g. HDFC0001234" },
      { key: "branch", label: "Branch", type: "text", required: true, half: true },
      { key: "upiId", label: "UPI ID", type: "text", required: true, half: true, placeholder: "name@bank" },
    ],
  },
  {
    id: "documents",
    title: "Mandatory documents",
    subtitle: "Attach a self-attested copy of each.",
    docs: [
      { key: "medical_reg", label: "Medical Registration Certificate (Council / NMC)", required: true },
      { key: "highest_degree", label: "Highest Qualification Degree Certificate", required: true },
      { key: "mbbs_degree", label: "MBBS Degree Certificate", required: true },
      { key: "pan_card", label: "PAN Card", required: true },
      { key: "aadhaar_card", label: "Aadhaar Card", required: true },
      { key: "photo", label: "Passport-size Photograph", required: true },
      { key: "bank_proof", label: "Cancelled Cheque / Bank Proof", required: true },
      { key: "cv", label: "Curriculum Vitae (CV)", required: true },
      { key: "experience_cert", label: "Experience / Relieving Certificate", hint: "If applicable." },
      { key: "esign", label: "Digital Signature specimen / e-Sign consent", required: true },
    ],
  },
  {
    id: "declarations",
    title: "Compliance & declarations",
    subtitle: "Confirm each statement, then sign to submit.",
    consents: [
      { key: "comp_reg", label: "I hold a valid medical registration and am authorised to practise in India.", required: true },
      { key: "comp_guidelines", label: "I agree to abide by the Telemedicine Practice Guidelines (BoG / NMC).", required: true },
      { key: "comp_share", label: "I consent to sharing my professional details on the SUPPAI platform.", required: true },
      { key: "comp_privacy", label: "I accept the Patient Data Confidentiality and Privacy Undertaking.", required: true },
      { key: "comp_records", label: "I will maintain proper records and issue prescriptions per applicable norms.", required: true },
      { key: "decl_true", label: "All information and documents provided are true, correct and current.", required: true },
      { key: "decl_valid", label: "My registration is valid, subsisting and not under suspension.", required: true },
      { key: "decl_misconduct", label: "I have never been convicted or found guilty of professional misconduct.", required: true },
      { key: "decl_verify", label: "SUPPAI may verify any information or credential submitted.", required: true },
      { key: "decl_notify", label: "I will immediately notify SUPPAI of any change, suspension or action affecting my registration.", required: true },
    ],
    fields: [
      { key: "declFullName", label: "Full name (signature)", type: "text", required: true, half: true },
      { key: "declPlace", label: "Place", type: "text", required: true, half: true },
      { key: "declDate", label: "Date", type: "date", required: true, half: true },
    ],
  },
];

export function doctorSummary(data: Record<string, string | boolean | string[]>) {
  return {
    displayName: (data.fullName as string) || "Unnamed applicant",
    location: (data.cityState as string) || "",
  };
}
