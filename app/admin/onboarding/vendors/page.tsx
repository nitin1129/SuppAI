"use client";

import { OnboardingList } from "@/components/admin/onboarding/OnboardingList";
import { VENDOR_STEPS } from "@/lib/onboarding/schema.vendor";

export default function AdminVendorsOnboardingPage() {
  return (
    <OnboardingList
      kind="vendor"
      steps={VENDOR_STEPS}
      title="Vendor onboarding"
      subtitle="Review product vendor applications and issue portal access."
    />
  );
}
