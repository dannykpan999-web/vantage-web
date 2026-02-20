import { useNavigate } from "react-router-dom";

export default function Hero() {
  const nav = useNavigate();
  return (
    <section style={{ position: "relative", height: "100vh", minHeight: "700px", overflow: "hidden" }}>

      {/* Background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/images/hero.webp"
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover", objectPosition: "center",
          filter: "brightness(0.55)",
        }}
      >
        {/* Wide interior pan — most cinematic for a hero */}
        <source src="https://assets.mixkit.co/videos/43236/43236-1080.mp4" type="video/mp4" />
        {/* Close-up haircut fallback */}
        <source src="https://assets.mixkit.co/videos/43222/43222-1080.mp4" type="video/mp4" />
        {/* Static image fallback for browsers that can't play video */}
        <img src="/images/hero.webp" alt="Vantage Barbershop" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </video>

      {/* Gradient overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)",
      }} />

      {/* Content */}
      <div style={{
        position: "relative", zIndex: 1, height: "100%",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", textAlign: "center", padding: "0 24px",
      }}>
        {/* Monogram */}
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(56px, 9vw, 108px)", fontWeight: 400, color: "#fff",
          lineHeight: 1, marginBottom: "8px", opacity: 0,
          animation: "fadeIn 1s ease-out 0.2s forwards",
        }}>VA</div>

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
        }}>
          The Barbershop.<br /><em>Elevated.</em>
        </h1>

        {/* Subline */}
        <p style={{
          fontFamily: "Montserrat, sans-serif",
          fontSize: "clamp(13px, 1.8vw, 16px)", fontWeight: 300,
          color: "rgba(255,255,255,0.82)", letterSpacing: "0.06em",
          marginBottom: "clamp(40px, 6vw, 64px)", opacity: 0,
          animation: "fadeIn 1s ease-out 0.9s forwards",
        }}>
          Reserve su cita en menos de 3 pasos.
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
            Reservar Ahora
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
            Explorar
          </a>
        </div>

      </div>

      {/* Wavy bottom divider — white fill blends into section below */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 2, lineHeight: 0 }}>
        <svg
          viewBox="0 0 1440 110"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          style={{ width: "100%", height: "110px", display: "block" }}
        >
          <path
            d="M0,55 C180,110 360,0 540,55 C720,110 900,0 1080,55 C1260,110 1350,30 1440,55 L1440,110 L0,110 Z"
            fill="#ffffff"
          />
        </svg>
      </div>
    </section>
  );
}
