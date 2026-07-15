"use client";

import { notFound } from "next/navigation";

import { SectionView } from "@/components/dashboard/SectionView";
import { getSection } from "@/lib/dashboard-data";

export default function Page() {
  const section = getSection("get-healthy");
  if (!section) notFound();
  return <SectionView section={section} />;
}
