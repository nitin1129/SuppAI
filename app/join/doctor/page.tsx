"use client";

import { ApplyWizard } from "@/components/onboarding/ApplyWizard";
import { DOCTOR_STEPS, doctorSummary } from "@/lib/onboarding/schema.doctor";

export default function JoinDoctorPage() {
  return (
    <ApplyWizard
      kind="doctor"
      steps={DOCTOR_STEPS}
      summarize={doctorSummary}
      intro={{
        eyebrow: "Clinician partner",
        title: "Practice with SuppAI.",
        subtitle:
          "See patients over video or in clinic, manage your own schedule, and let us handle the rest. Apply in a few minutes.",
      }}
    />
  );
}
