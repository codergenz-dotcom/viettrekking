import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturedTrips } from "@/components/landing/FeaturedTrips";
import { WhyChooseUs } from "@/components/landing/WhyChooseUs";
import { PopularDestinations } from "@/components/landing/PopularDestinations";
import { Testimonials } from "@/components/landing/Testimonials";
import { Newsletter } from "@/components/landing/Newsletter";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <main>
        <HeroSection />
        <FeaturedTrips />
        <WhyChooseUs />
        <PopularDestinations />
        <Testimonials />
        <Newsletter />
      </main>
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
