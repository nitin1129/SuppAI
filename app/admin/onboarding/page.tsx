"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OnboardingIndexRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/onboarding/labs");
  }, [router]);
  return <div className="min-h-screen bg-[#fbfdfb]" />;
}
