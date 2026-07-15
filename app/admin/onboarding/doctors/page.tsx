"use client";

import { OnboardingList } from "@/components/admin/onboarding/OnboardingList";
import { DOCTOR_STEPS } from "@/lib/onboarding/schema.doctor";

export default function AdminDoctorsOnboardingPage() {
  return (
    <OnboardingList
      kind="doctor"
      steps={DOCTOR_STEPS}
      title="Doctor onboarding"
      subtitle="Review clinician applications and issue access."
    />
  );
}
