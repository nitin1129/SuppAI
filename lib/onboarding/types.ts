/* Partner onboarding (lab + doctor KYC applications).
   Frontend-only: persisted to localStorage behind async service stubs. */

export type PartnerKind = "lab" | "doctor" | "vendor";

export type AppStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "on_hold"
  | "rejected"
  | "active";

export type UploadedFile = {
  id: string;
  docKey: string;
  name: string;
  size: number;
  type: string;
  /** Data URL preview (images under the cap). Undefined for large / non-image. */
  dataUrl?: string;
  uploadedAt: string;
};

export type Credentials = {
  username: string;
  email: string;
  tempPassword: string;
};

export type Application = {
  id: string;
  kind: PartnerKind;
  reference: string;
  status: AppStatus;
  /** Flat map of all answered fields, keyed by field key. */
  data: Record<string, string | boolean | string[]>;
  files: UploadedFile[];
  displayName: string;
  location: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  reviewNote?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  credentials?: Credentials;
  inviteSent?: boolean;
};

/* ----------------------------- Form schema ----------------------------- */

export type FieldType =
  | "text"
  | "email"
  | "tel"
  | "number"
  | "date"
  | "time"
  | "textarea"
  | "select"
  | "radio"
  | "multiselect"
  | "checkbox"
  | "chips";

export type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  options?: { value: string; label: string }[];
  /** Half width in a two-column grid. */
  half?: boolean;
  /** Regex (string source) for validation, e.g. PAN / pincode. */
  pattern?: string;
  patternMessage?: string;
  /** Only show when this other field (key) is truthy / equals value. */
  showIf?: { key: string; equals?: string };
};

export type DocSlot = {
  key: string;
  label: string;
  required?: boolean;
  hint?: string;
};

export type StepDef = {
  id: string;
  title: string;
  subtitle?: string;
  /** Form fields (rendered in a responsive grid). */
  fields?: FieldDef[];
  /** Document upload slots. */
  docs?: DocSlot[];
  /** Consent / declaration checkboxes rendered as a list. */
  consents?: { key: string; label: string; required?: boolean }[];
};

export const STATUS_LABELS: Record<AppStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under review",
  on_hold: "On hold",
  rejected: "Rejected",
  active: "Active",
};
