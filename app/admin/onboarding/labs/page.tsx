"use client";

import { OnboardingList } from "@/components/admin/onboarding/OnboardingList";
import { LAB_STEPS } from "@/lib/onboarding/schema.lab";

export default function AdminLabsOnboardingPage() {
  return (
    <OnboardingList
      kind="lab"
      steps={LAB_STEPS}
      title="Lab onboarding"
      subtitle="Review diagnostic partner KYC applications and issue access."
    />
  );
}
