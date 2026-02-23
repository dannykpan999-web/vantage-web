import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Hero from "../components/landing/Hero";
import SocialProof from "../components/landing/SocialProof";
import HowItWorks from "../components/landing/HowItWorks";
import FeaturedProducts from "../components/landing/FeaturedProducts";
import Services from "../components/landing/Services";
import BarberTeam from "../components/landing/BarberTeam";
import Gallery from "../components/landing/Gallery";
import Testimonials from "../components/landing/Testimonials";
import FinalCTA from "../components/landing/FinalCTA";
import ContactSection from "../components/landing/ContactSection";

export default function Landing() {
  return (
    <>
      <Header />
      <main>
        <Hero />

        {/* Studio intro — description paragraph below hero */}
        <section style={{
          padding: "clamp(52px,7vw,96px) clamp(24px,12vw,200px)",
          backgroundColor: "#0a0a0a",
          textAlign: "center",
        }}>
          <p style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "clamp(13px,1.5vw,16px)", fontWeight: 300,
            color: "rgba(255,255,255,0.65)", lineHeight: 2.1,
            maxWidth: "780px", margin: "0 auto",
            letterSpacing: "0.02em",
          }}>
            Vantage es un estudio boutique de barbería de lujo. Descubre la maestría
            detrás de nuestros cortes de precisión, donde cada detalle es ejecutado
            con pasión y expertise. Deja que nuestros barberos especializados eleven
            tu imagen — ya sea con un fade impecable, un afeitado clásico con navaja
            o una barba perfectamente esculpida. Abraza tu individualidad y permite
            que creemos un look que refleje tu estándar.
          </p>
        </section>

        <SocialProof />
        <HowItWorks />
        <FeaturedProducts />
        <Services />
        <BarberTeam />
        <Gallery />
        <Testimonials />
        <FinalCTA />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
