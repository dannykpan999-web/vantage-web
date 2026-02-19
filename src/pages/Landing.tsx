import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Hero from "../components/landing/Hero";
import SocialProof from "../components/landing/SocialProof";
import HowItWorks from "../components/landing/HowItWorks";
import Services from "../components/landing/Services";
import BarberTeam from "../components/landing/BarberTeam";
import Gallery from "../components/landing/Gallery";
import Testimonials from "../components/landing/Testimonials";
import FinalCTA from "../components/landing/FinalCTA";

export default function Landing() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <SocialProof />
        <HowItWorks />
        <Services />
        <BarberTeam />
        <Gallery />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
