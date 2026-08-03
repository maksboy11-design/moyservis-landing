/**
 * Landing page — IA order from PRD.
 */

import { Header } from "@/components/layout";
import { MotionProvider } from "@/components/motion";
import { AboutSection } from "@/sections/about";
import { AdvantagesSection } from "@/sections/advantages";
import { ContactsSection } from "@/sections/contacts";
import { FaqSection } from "@/sections/faq";
import { GuaranteesSection } from "@/sections/guarantees";
import { HeroSection } from "@/sections/hero";
import { MastersSection } from "@/sections/masters";
import { ProcessSection } from "@/sections/process";
import { ReviewsSection } from "@/sections/reviews";
import { ServicesSection } from "@/sections/services";

export default function HomePage() {
  return (
    <>
      <Header />

      <MotionProvider>
        <main
          id="main"
          tabIndex={-1}
          className="min-h-dvh bg-bg-page text-foreground outline-none"
        >
          <HeroSection />
          <ServicesSection />
          <AboutSection />
          <AdvantagesSection />
          <ProcessSection />
          <MastersSection />
          <GuaranteesSection />
          <ReviewsSection />
          <FaqSection />
          <ContactsSection />
        </main>
      </MotionProvider>
    </>
  );
}
