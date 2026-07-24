// src/app/(admin)/admin/scholars/new/page.tsx
import type { Metadata } from "next";
import { ScholarForm } from "@features/admin/components/client/forms/ScholarForm";

export const metadata: Metadata = { title: "New Scholar" };

export default function NewScholarPage() {
  return <ScholarForm />;
}
