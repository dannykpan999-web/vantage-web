import { useNavigate } from "react-router-dom";
import { useT } from "../../i18n";
import { useQuery } from "@tanstack/react-query";
import { getLandingContent } from "../../services/landing";
import { useLanguageStore } from "../../store/languageStore";

/* ── Phone app mockup ──────────────────────────────────────────────────────── */
function AppMockup() {
  const gold = "#C5A059";
  return (
    <div style={{
      position: "relative",
      width: "clamp(200px, 22vw, 290px)",
      flexShrink: 0,
      opacity: 0,
      animation: "fadeIn 1.2s ease-out 1.3s forwards",
    }}>
      <style>{`
        @keyframes mockupFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        .app-mockup-phone {
          animation: mockupFloat 5s ease-in-out infinite;
        }
      `}</style>

      {/* Phone shell */}
      <div className="app-mockup-phone" style={{
        background: "linear-gradient(145deg, #1c1c1e 0%, #0a0a0a 100%)",
        borderRadius: "clamp(28px, 4vw, 44px)",
        padding: "clamp(12px, 1.5vw, 18px) clamp(8px, 1vw, 12px)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.1)",
        position: "relative",
      }}>

        {/* Notch */}
        <div style={{
          width: "clamp(60px, 8vw, 90px)", height: "clamp(18px, 2.2vw, 26px)",
          background: "#0a0a0a",
          borderRadius: "0 0 16px 16px",
          margin: "0 auto clamp(8px, 1.2vw, 14px)",
          position: "relative", zIndex: 1,
        }} />

        {/* Screen content */}
        <div style={{
          background: "linear-gradient(160deg, #111 0%, #0d0d0d 100%)",
          borderRadius: "clamp(16px, 2.5vw, 26px)",
          padding: "clamp(12px, 2vw, 20px) clamp(10px, 1.5vw, 16px)",
          minHeight: "clamp(180px, 24vw, 300px)",
          overflow: "hidden",
        }}>

          {/* App header */}
          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(11px, 1.4vw, 16px)", fontWeight: 600,
            letterSpacing: "0.3em", textTransform: "uppercase",
            color: "#fff", textAlign: "center",
            marginBottom: "clamp(10px, 1.5vw, 18px)",
          }}>VANTAGE</p>

          {/* Appointment card */}
          <div style={{
            border: `1px solid rgba(197,160,89,0.45)`,
            borderRadius: "10px",
            padding: "clamp(10px, 1.5vw, 16px)",
            background: "rgba(197,160,89,0.04)",
            marginBottom: "clamp(8px, 1vw, 12px)",
          }}>
            <p style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "clamp(7px, 0.8vw, 9px)", fontWeight: 500,
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: gold, marginBottom: "clamp(4px, 0.6vw, 8px)",
            }}>MI PRÓXIMA CITA</p>

            <p style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(10px, 1.2vw, 14px)", fontWeight: 400,
              color: "#fff", marginBottom: "clamp(4px, 0.5vw, 6px)",
              lineHeight: 1.3,
            }}>Corte de Cabello con Andrés</p>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: "clamp(7px, 0.75vw, 9px)", fontWeight: 300,
                color: "rgba(255,255,255,0.5)",
              }}>Sábado, 27 de Julio · 10:00 AM</p>
              {/* Clock icon */}
              <svg width="clamp(9px,1.1vw,12px)" height="clamp(9px,1.1vw,12px)" viewBox="0 0 24 24"
                fill="none" stroke="rgba(197,160,89,0.7)" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
          </div>

          {/* Second mini card (faded) */}
          <div style={{
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "8px",
            padding: "clamp(7px, 1vw, 10px) clamp(10px, 1.2vw, 14px)",
            background: "rgba(255,255,255,0.02)",
          }}>
            <p style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "clamp(6px, 0.7vw, 8px)", fontWeight: 400,
              letterSpacing: "0.15em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.22)", marginBottom: "4px",
            }}>RESERVAR NUEVA CITA</p>
            <p style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(9px, 1vw, 12px)", fontWeight: 300,
              color: "rgba(255,255,255,0.18)",
            }}>Elige tu barbero →</p>
          </div>
        </div>

        {/* Home bar */}
        <div style={{
          width: "clamp(40px, 5vw, 60px)", height: "3px",
          background: "rgba(255,255,255,0.25)", borderRadius: "2px",
          margin: "clamp(8px, 1vw, 12px) auto 0",
        }} />
      </div>

      {/* Glow */}
      <div style={{
        position: "absolute", bottom: "-20px", left: "50%",
        transform: "translateX(-50%)",
        width: "70%", height: "60px",
        background: "rgba(197,160,89,0.18)",
        filter: "blur(24px)",
        borderRadius: "50%",
        pointerEvents: "none",
      }} />
    </div>
  );
}

export default function Hero() {
  const nav = useNavigate();
  const t = useT();
  const lang = useLanguageStore((s) => s.lang);

  const { data: landingContent } = useQuery({
    queryKey: ["landing"],
    queryFn: getLandingContent,
    staleTime: 1000 * 60 * 5,
  });

  const hero = landingContent?.hero;
  const headline = (lang === "es" ? hero?.headline_es : hero?.headline_en) || t("hero.headline");
  const subline  = (lang === "es" ? hero?.subline_es  : hero?.subline_en)  || t("hero.subline");

  return (
    <section style={{ position: "relative", height: "100vh", minHeight: "700px", overflow: "hidden" }}>

      <style>{`
        @media (max-width: 860px) { .hero-phone-col { display: none !important; } }
      `}</style>

      {/* Background video */}
      <video
        autoPlay muted loop playsInline
        poster="/images/hero.webp"
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover", objectPosition: "center",
          filter: "brightness(0.55)",
        }}
      >
        <source src="https://assets.mixkit.co/videos/43236/43236-1080.mp4" type="video/mp4" />
        <source src="https://assets.mixkit.co/videos/43222/43222-1080.mp4" type="video/mp4" />
        <img src="/images/hero.webp" alt="Vantage Barbershop" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </video>

      {/* Owner hero image */}
      <img
        src={hero?.bg_image || "/images/hero.webp"}
        alt="Hero background"
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover", objectPosition: "center",
          filter: "brightness(0.55)",
        }}
      />

      {/* Gradient overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)",
      }} />

      {/* Content — centered text with absolute phone on desktop */}
      <div style={{
        position: "relative", zIndex: 1, height: "100%",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "0 clamp(24px, 6vw, 80px)",
      }}>

        {/* Center: text */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          textAlign: "center", width: "100%",
        }}>
          {/* Monogram */}
          <div style={{
            display: "inline-flex", alignItems: "center",
            lineHeight: 1, marginBottom: "8px", opacity: 0,
            animation: "fadeIn 1s ease-out 0.2s forwards",
          }}>
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(56px, 9vw, 108px)", fontWeight: 400, color: "#fff",
              lineHeight: 1, marginRight: "-0.1em",
              position: "relative", top: "-0.12em",
            }}>V</span>
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(56px, 9vw, 108px)", fontWeight: 400, color: "#fff",
              marginLeft: "-0.2em", lineHeight: 1,
              position: "relative", top: "0.12em",
            }}>A</span>
          </div>

          {/* Brand name */}
          <div style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "clamp(10px, 1.4vw, 13px)", fontWeight: 400, color: "#fff",
            letterSpacing: "0.55em", textTransform: "uppercase",
            marginBottom: "clamp(32px, 6vw, 64px)", opacity: 0,
            animation: "fadeIn 1s ease-out 0.5s forwards",
          }}>VANTAGE</div>

          {/* Headline */}
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(36px, 6vw, 82px)", fontWeight: 400, color: "#fff",
            lineHeight: 1.1, maxWidth: "820px", marginBottom: "24px", opacity: 0,
            animation: "fadeIn 1s ease-out 0.7s forwards",
          }}
            dangerouslySetInnerHTML={{ __html: headline }}
          />

          {/* Subline */}
          <p style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "clamp(13px, 1.8vw, 16px)", fontWeight: 300,
            color: "rgba(255,255,255,0.82)", letterSpacing: "0.06em",
            marginBottom: "clamp(40px, 6vw, 64px)", opacity: 0,
            animation: "fadeIn 1s ease-out 0.9s forwards",
          }}>
            {subline}
          </p>

          {/* CTA buttons */}
          <div style={{
            display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center",
            opacity: 0, animation: "fadeIn 1s ease-out 1.1s forwards",
          }}>
            <button
              onClick={() => nav("/booking")}
              style={{
                padding: "18px 52px", background: "#fff", color: "#000",
                fontFamily: "Montserrat, sans-serif", fontSize: "12px", fontWeight: 500,
                letterSpacing: "0.18em", textTransform: "uppercase",
                border: "none", borderRadius: "1px", cursor: "pointer",
                transition: "opacity 0.3s ease-in-out",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              {t("hero.cta1")}
            </button>
            <a
              href="#servicios"
              style={{
                padding: "18px 52px", background: "transparent", color: "#fff",
                fontFamily: "Montserrat, sans-serif", fontSize: "12px", fontWeight: 400,
                letterSpacing: "0.18em", textTransform: "uppercase",
                border: "1px solid rgba(255,255,255,0.6)", borderRadius: "1px",
                textDecoration: "none", display: "inline-flex", alignItems: "center",
              }}
            >
              {t("hero.cta2")}
            </a>
          </div>
        </div>

        {/* Right: phone mockup — absolute so text stays centered, hidden on mobile */}
        <div className="hero-phone-col" style={{
          position: "absolute", right: "clamp(24px, 5vw, 80px)",
          top: "50%", transform: "translateY(-50%)",
          display: "flex", alignItems: "center",
        }}>
          <AppMockup />
        </div>

      </div>
    </section>
  );
}
