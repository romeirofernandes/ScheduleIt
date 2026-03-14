import HeroSection from "@/components/HeroSection";
import ContentSection from "@/components/ContentSection";
import FeaturesSection from "@/components/FeaturesSection";
import LandingBackground from "@/components/LandingBackground";

export default function Home() {
  return (
    <>
      <LandingBackground />
      <HeroSection />
      <ContentSection />
      <FeaturesSection />
    </>
  );
}
