import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { privacyContent } from "@/content/legal";

export const metadata: Metadata = {
  title: privacyContent.title,
  description: privacyContent.intro,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title={privacyContent.title}
      titleId={privacyContent.titleId}
      updatedAt={privacyContent.updatedAt}
      intro={privacyContent.intro}
      sections={privacyContent.sections}
    />
  );
}
