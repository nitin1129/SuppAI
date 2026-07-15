"use client";

import { ApplyWizard } from "@/components/onboarding/ApplyWizard";
import { VENDOR_STEPS, vendorSummary } from "@/lib/onboarding/schema.vendor";

export default function JoinVendorPage() {
  return (
    <ApplyWizard
      kind="vendor"
      steps={VENDOR_STEPS}
      summarize={vendorSummary}
      intro={{
        eyebrow: "Product vendor",
        title: "Sell your catalogue on SuppAI.",
        subtitle:
          "Supply supplements, devices, diagnostics, and more. List your products, manage stock, and get paid on your settlement cycle. Apply in a few minutes.",
      }}
    />
  );
}
