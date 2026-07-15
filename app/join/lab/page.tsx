"use client";

import { ApplyWizard } from "@/components/onboarding/ApplyWizard";
import { LAB_STEPS, labSummary } from "@/lib/onboarding/schema.lab";

export default function JoinLabPage() {
  return (
    <ApplyWizard
      kind="lab"
      steps={LAB_STEPS}
      summarize={labSummary}
      intro={{
        eyebrow: "Diagnostic partner",
        title: "Bring your lab to SuppAI.",
        subtitle:
          "Reach more patients with doorstep collection and digital reports. Complete your KYC and our team takes it from there.",
      }}
    />
  );
}
