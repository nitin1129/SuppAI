import type { StepDef } from "./types";

const ENTITY_TYPES = [
  { value: "proprietorship", label: "Proprietorship" },
  { value: "partnership", label: "Partnership" },
  { value: "llp", label: "LLP" },
  { value: "pvt_ltd", label: "Private Limited Company" },
  { value: "public_ltd", label: "Public Limited Company" },
  { value: "other", label: "Other" },
];

const YES_NO = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

/* 10 PDF sections grouped into 6 smooth steps. */
export const LAB_STEPS: StepDef[] = [
  {
    id: "centre",
    title: "Diagnostic centre details",
    subtitle: "Tell us about your laboratory.",
    fields: [
      { key: "legalName", label: "Legal name of laboratory", type: "text", required: true, placeholder: "Apex Diagnostics Pvt Ltd" },
      { key: "tradeName", label: "Trade / brand name", type: "text", half: true, placeholder: "Apex Labs" },
      { key: "yearEstablished", label: "Year of establishment", type: "number", half: true, required: true, placeholder: "2016" },
      { key: "entityType", label: "Type of entity", type: "select", required: true, options: ENTITY_TYPES },
      { key: "contactNumber", label: "Official contact number", type: "tel", half: true, required: true, pattern: "^\\d{10}$", patternMessage: "Enter a 10-digit number." },
      { key: "officialEmail", label: "Official email ID", type: "email", half: true, required: true, placeholder: "ops@lab.in" },
      { key: "registeredAddress", label: "Registered address", type: "textarea", required: true },
      { key: "operationalAddress", label: "Operational address", type: "textarea", required: true },
      { key: "state", label: "State", type: "text", half: true, required: true },
      { key: "district", label: "District", type: "text", half: true, required: true },
      { key: "pincode", label: "Pincode", type: "text", half: true, required: true, pattern: "^\\d{6}$", patternMessage: "6-digit pincode." },
      { key: "website", label: "Website", type: "text", half: true, placeholder: "lab.in" },
    ],
  },
  {
    id: "signatory",
    title: "Authorised signatory",
    subtitle: "The person authorised to sign on behalf of the lab.",
    fields: [
      { key: "signatoryName", label: "Full name", type: "text", required: true, half: true },
      { key: "designation", label: "Designation", type: "text", required: true, half: true },
      { key: "signatoryMobile", label: "Mobile number", type: "tel", required: true, half: true, pattern: "^\\d{10}$", patternMessage: "10-digit number." },
      { key: "signatoryEmail", label: "Email address", type: "email", required: true, half: true },
      { key: "pan", label: "PAN number", type: "text", required: true, half: true, placeholder: "ABCDE1234F", pattern: "^[A-Z]{5}[0-9]{4}[A-Z]$", patternMessage: "Format: ABCDE1234F" },
      { key: "aadhaar", label: "Aadhaar number", type: "text", required: true, half: true, pattern: "^\\d{12}$", patternMessage: "12-digit Aadhaar." },
    ],
  },
  {
    id: "compliance",
    title: "Regulatory & quality",
    subtitle: "Registrations, accreditation, and your medical team.",
    fields: [
      { key: "gstin", label: "GSTIN", type: "text", required: true, half: true },
      { key: "clinicalEstRegNo", label: "Clinical establishment reg. no.", type: "text", required: true, half: true },
      { key: "regExpiryDate", label: "Registration expiry date", type: "date", required: true, half: true },
      { key: "biomedicalVendor", label: "Biomedical waste disposal vendor", type: "text", required: true, half: true },
      { key: "nablAccredited", label: "NABL accredited?", type: "radio", required: true, options: YES_NO },
      { key: "nablNo", label: "NABL accreditation no.", type: "text", half: true, showIf: { key: "nablAccredited", equals: "yes" } },
      { key: "nablExpiry", label: "NABL expiry date", type: "date", half: true, showIf: { key: "nablAccredited", equals: "yes" } },
      { key: "labDirectorName", label: "Laboratory director name", type: "text", required: true, half: true },
      { key: "directorQualification", label: "Director qualification", type: "text", required: true, half: true },
      { key: "directorRegNo", label: "Director medical registration no.", type: "text", required: true, half: true },
      { key: "pathologistName", label: "Reporting pathologist name", type: "text", required: true, half: true },
      { key: "pathologistRegNo", label: "Pathologist registration no.", type: "text", required: true, half: true },
      { key: "pathologistSpecialty", label: "Pathologist specialty", type: "text", required: true, half: true },
    ],
  },
  {
    id: "service-bank",
    title: "Service & settlement",
    subtitle: "Doorstep collection and where we settle payouts.",
    fields: [
      { key: "homeCollection", label: "Home / sample collection available?", type: "radio", required: true, options: YES_NO },
      { key: "collectionAreas", label: "Collection areas / pincodes covered", type: "textarea", required: true, showIf: { key: "homeCollection", equals: "yes" }, placeholder: "560038, 560008, 560071" },
      { key: "hoursOpen", label: "Operating hours, opening", type: "time", half: true, required: true },
      { key: "hoursClose", label: "Operating hours, closing", type: "time", half: true, required: true },
      { key: "accountHolder", label: "Account holder name", type: "text", required: true, half: true },
      { key: "bankName", label: "Bank name", type: "text", required: true, half: true },
      { key: "accountNumber", label: "Account number", type: "text", required: true, half: true },
      { key: "ifsc", label: "IFSC code", type: "text", required: true, half: true },
      { key: "branch", label: "Branch", type: "text", required: true, half: true },
      { key: "upiId", label: "UPI ID", type: "text", half: true },
    ],
  },
  {
    id: "documents",
    title: "Documents",
    subtitle: "Attach a clear scan or photo of each. PDF, JPG or PNG.",
    docs: [
      { key: "pan_entity", label: "PAN card of entity", required: true },
      { key: "incorporation", label: "Certificate of incorporation / registration", required: true },
      { key: "deed", label: "Partnership deed / proprietorship declaration" },
      { key: "gst_cert", label: "GST registration certificate", required: true },
      { key: "cancelled_cheque", label: "Cancelled cheque / bank proof", required: true },
      { key: "address_proof", label: "Address proof of operational premises", required: true },
      { key: "clinical_est", label: "Clinical establishment registration certificate", required: true },
      { key: "trade_license", label: "Trade license" },
      { key: "biomedical_auth", label: "Biomedical waste management authorization" },
      { key: "nabl_cert", label: "NABL certificate + scope (or self-declaration)" },
      { key: "director_cert", label: "Director & pathologist registration certificates", required: true },
    ],
  },
  {
    id: "terms",
    title: "Terms & declarations",
    subtitle: "Commercials, data handling, and your confirmation.",
    fields: [
      { key: "revenueShareSuppai", label: "Revenue share, SuppAI %", type: "number", half: true, placeholder: "20" },
      { key: "revenueSharePartner", label: "Revenue share, partner lab %", type: "number", half: true, placeholder: "80" },
      { key: "settlementCycle", label: "Settlement cycle", type: "select", required: true, half: true, options: [
        { value: "monthly", label: "Monthly" },
        { value: "fortnightly", label: "Fortnightly" },
        { value: "weekly", label: "Weekly" },
      ] },
      { key: "paymentMode", label: "Payment mode", type: "select", required: true, half: true, options: [
        { value: "neft", label: "Bank transfer (NEFT/RTGS)" },
        { value: "upi", label: "UPI" },
        { value: "cheque", label: "Cheque" },
      ] },
      { key: "cyberContactName", label: "Data / cybersecurity contact name", type: "text", required: true, half: true },
      { key: "cyberContactEmail", label: "Contact email", type: "email", required: true, half: true },
    ],
    consents: [
      { key: "consent_confidentiality", label: "I accept the Patient Information Protection & Confidentiality Undertaking.", required: true },
      { key: "consent_datashare", label: "I consent to data sharing with SuppAI as per agreement.", required: true },
      { key: "decl_true", label: "All information and documents provided are true, correct and current.", required: true },
      { key: "decl_valid", label: "All licenses and registrations are valid and subsisting.", required: true },
      { key: "decl_authorized", label: "Reports shall be issued only by authorised, qualified personnel.", required: true },
      { key: "decl_notify", label: "Any suspension, expiry or regulatory action will be notified to SuppAI immediately.", required: true },
    ],
  },
];

/** Derive a friendly display name + location for the admin list. */
export function labSummary(data: Record<string, string | boolean | string[]>) {
  return {
    displayName: (data.tradeName as string) || (data.legalName as string) || "Unnamed lab",
    location: [data.district, data.state].filter(Boolean).join(", "),
  };
}
