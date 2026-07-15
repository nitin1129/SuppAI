import type { StepDef } from "./types";

const ENTITY = [
  { value: "proprietorship", label: "Proprietorship" },
  { value: "partnership", label: "Partnership" },
  { value: "llp", label: "LLP" },
  { value: "private_limited", label: "Private Limited" },
  { value: "public_limited", label: "Public Limited" },
  { value: "other", label: "Other" },
];

const CATEGORIES = [
  { value: "pharma", label: "Medicines / Pharma" },
  { value: "diagnostic_kits", label: "Diagnostic Kits" },
  { value: "medical_devices", label: "Medical Devices" },
  { value: "consumables", label: "Consumables" },
  { value: "equipment", label: "Equipment" },
  { value: "mixed", label: "Mixed / Other" },
];

const SETTLEMENT = [
  { value: "weekly", label: "Weekly" },
  { value: "fortnightly", label: "Fortnightly" },
  { value: "monthly", label: "Monthly" },
];

const PAYMENT_TERMS = [
  { value: "advance", label: "Advance" },
  { value: "on_delivery", label: "On delivery" },
  { value: "credit", label: "Credit (15-30 days)" },
];

const GST_TYPE = [
  { value: "regular", label: "Regular" },
  { value: "composition", label: "Composition" },
  { value: "unregistered", label: "Unregistered" },
];

export const VENDOR_STEPS: StepDef[] = [
  {
    id: "company",
    title: "Vendor / company details",
    subtitle: "Your registered business information.",
    fields: [
      { key: "legalName", label: "Legal name of vendor", type: "text", required: true },
      { key: "tradeName", label: "Trade / brand name", type: "text", half: true },
      { key: "entityType", label: "Type of entity", type: "select", required: true, half: true, options: ENTITY },
      { key: "yearEstablished", label: "Year of establishment", type: "number", required: true, half: true },
      { key: "natureOfBusiness", label: "Nature of business", type: "text", required: true, half: true, placeholder: "Distributor, manufacturer, trader" },
      { key: "registeredAddress", label: "Registered address", type: "textarea", required: true },
      { key: "warehouseAddress", label: "Warehouse / dispatch address", type: "textarea" },
      { key: "stateDistrict", label: "State / District", type: "text", required: true, half: true },
      { key: "pincode", label: "Pincode", type: "text", required: true, half: true, pattern: "^\\d{6}$", patternMessage: "6-digit pincode." },
      { key: "officialEmail", label: "Official email ID", type: "email", required: true, half: true },
      { key: "officialPhone", label: "Official contact number", type: "tel", required: true, half: true, pattern: "^\\d{10}$", patternMessage: "10-digit number." },
      { key: "website", label: "Website", type: "text", half: true, placeholder: "https://" },
    ],
  },
  {
    id: "signatory",
    title: "Authorised signatory",
    subtitle: "The person authorised to sign on behalf of the vendor.",
    fields: [
      { key: "signatoryName", label: "Full name", type: "text", required: true, half: true },
      { key: "signatoryDesignation", label: "Designation", type: "text", required: true, half: true },
      { key: "signatoryMobile", label: "Mobile number", type: "tel", required: true, half: true, pattern: "^\\d{10}$", patternMessage: "10-digit number." },
      { key: "signatoryEmail", label: "Email address", type: "email", required: true, half: true },
      { key: "signatoryPan", label: "PAN number", type: "text", required: true, half: true, placeholder: "ABCDE1234F", pattern: "^[A-Za-z]{5}[0-9]{4}[A-Za-z]$", patternMessage: "Format: ABCDE1234F" },
      { key: "signatoryAadhaar", label: "Aadhaar number", type: "text", required: true, half: true, pattern: "^\\d{12}$", patternMessage: "12-digit Aadhaar." },
    ],
  },
  {
    id: "categories",
    title: "Product categories & statutory",
    subtitle: "What you supply, and your tax registrations.",
    fields: [
      { key: "productCategories", label: "Product categories supplied", type: "multiselect", required: true, hint: "Select all that apply.", options: CATEGORIES },
      { key: "gstin", label: "GSTIN", type: "text", required: true, half: true },
      { key: "gstType", label: "GST registration type", type: "select", required: true, half: true, options: GST_TYPE },
      { key: "drugLicenseNo", label: "Drug License No.", type: "text", half: true, hint: "If supplying medicines / pharma." },
      { key: "drugLicenseExpiry", label: "Drug License expiry", type: "date", half: true },
      { key: "iec", label: "Import Export Code (IEC)", type: "text", half: true, hint: "If importing." },
      { key: "udyam", label: "MSME / Udyam Reg. No.", type: "text", half: true },
      { key: "coldChain", label: "Requires cold-chain / temperature-controlled storage", type: "select", half: true, options: [
        { value: "no", label: "No" }, { value: "yes", label: "Yes" },
      ] },
      { key: "imported", label: "Products are imported (Import License / IEC required)", type: "select", half: true, options: [
        { value: "no", label: "No" }, { value: "yes", label: "Yes" },
      ] },
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
      { key: "upiId", label: "UPI ID", type: "text", half: true, placeholder: "name@bank" },
      { key: "settlementCycle", label: "Preferred settlement cycle", type: "select", required: true, half: true, options: SETTLEMENT },
      { key: "paymentTerms", label: "Payment terms", type: "select", required: true, half: true, options: PAYMENT_TERMS },
    ],
  },
  {
    id: "commercials",
    title: "Commercial terms",
    subtitle: "Margins and discounts are recorded at signing.",
    fields: [
      { key: "tradeDiscount", label: "Agreed trade discount %", type: "number", half: true },
      { key: "volumeSlabs", label: "Volume discount slabs", type: "text", half: true, hint: "If any." },
      { key: "deliveryTimeline", label: "Delivery timeline (days)", type: "number", half: true },
      { key: "returnWindow", label: "Return / replacement window", type: "text", half: true, placeholder: "e.g. 7 days" },
    ],
  },
  {
    id: "documents",
    title: "Mandatory documents",
    subtitle: "Attach a self-attested copy of each.",
    docs: [
      { key: "pan_entity", label: "PAN Card of Entity", required: true },
      { key: "gst_cert", label: "GST Registration Certificate", required: true },
      { key: "incorporation", label: "Certificate of Incorporation / Registration", required: true },
      { key: "entity_deed", label: "Partnership Deed / Proprietorship Declaration", hint: "Whichever applies." },
      { key: "bank_proof", label: "Cancelled Cheque / Bank Account Proof", required: true },
      { key: "drug_license", label: "Drug License", hint: "If supplying medicines / pharma." },
      { key: "iec_license", label: "Import Export Code / Import License", hint: "If importing." },
      { key: "catalogue", label: "Product Catalogue with Price List", required: true },
      { key: "quality_certs", label: "Product Quality / ISO / CE / BIS Certificates", hint: "If applicable." },
      { key: "udyam_cert", label: "MSME / Udyam Certificate", hint: "If applicable." },
      { key: "authorisation", label: "Authorised Distributor / Manufacturer Authorisation Letter", required: true },
    ],
  },
  {
    id: "declarations",
    title: "Quality, compliance & declarations",
    subtitle: "Confirm each statement, then sign to submit.",
    consents: [
      { key: "qa_expiry", label: "All products carry valid manufacturing and expiry details as applicable.", required: true },
      { key: "qa_standards", label: "Products comply with applicable BIS / CDSCO / regulatory standards.", required: true },
      { key: "qa_batch", label: "Vendor will provide batch numbers and invoices for every supply.", required: true },
      { key: "qa_returns", label: "Vendor agrees to accept returns of damaged / near-expiry stock per policy.", required: true },
      { key: "qa_storage", label: "Vendor maintains proper storage including cold-chain where required.", required: true },
      { key: "decl_true", label: "All information, documents and product details provided are true and current.", required: true },
      { key: "decl_licenses", label: "All licenses and registrations are valid and subsisting.", required: true },
      { key: "decl_quality", label: "Products supplied will match the quality and specifications quoted.", required: true },
      { key: "decl_verify", label: "SUPPAI may verify any information or inspect stock submitted.", required: true },
      { key: "decl_notify", label: "Any change in license, pricing or product status will be notified to SUPPAI immediately.", required: true },
    ],
    fields: [
      { key: "declName", label: "Name & designation (signature)", type: "text", required: true, half: true },
      { key: "declPlace", label: "Place", type: "text", required: true, half: true },
      { key: "declDate", label: "Date", type: "date", required: true, half: true },
    ],
  },
];

export function vendorSummary(data: Record<string, string | boolean | string[]>) {
  return {
    displayName: (data.legalName as string) || (data.tradeName as string) || "Unnamed vendor",
    location: (data.stateDistrict as string) || "",
  };
}
