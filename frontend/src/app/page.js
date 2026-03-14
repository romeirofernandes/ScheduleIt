import HeroSection from "@/components/HeroSection";
import ContentSection from "@/components/ContentSection";
import FeaturesSection from "@/components/FeaturesSection";
import TeamSection from "@/components/TeamSection";
import CallToAction from "@/components/CallToAction";
import MinimalFooter from "@/components/MinimalFooter";
import LandingBackground from "@/components/LandingBackground";

export default function Home() {
  return (
    <>
      <LandingBackground />
      <HeroSection />
      <ContentSection />
      <FeaturesSection />
      <TeamSection />
      <CallToAction />
      <MinimalFooter />
    </>
  );
}
