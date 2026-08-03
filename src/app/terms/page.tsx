import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { termsContent } from "@/content/legal";

export const metadata: Metadata = {
  title: termsContent.title,
  description: termsContent.intro,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title={termsContent.title}
      titleId={termsContent.titleId}
      updatedAt={termsContent.updatedAt}
      intro={termsContent.intro}
      sections={termsContent.sections}
    />
  );
}
