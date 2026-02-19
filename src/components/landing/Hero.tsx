import { useNavigate } from "react-router-dom";

export default function Hero() {
  const nav = useNavigate();
  return (
    <section style={{ position: "relative", height: "100vh", minHeight: "700px", overflow: "hidden" }}>
      {/* BG image */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "url(/images/hero.webp)",
        backgroundSize: "cover", backgroundPosition: "center top",
        filter: "brightness(0.5)",
      }} />
      {/* Gradient overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)",
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

        {/* Scroll indicator */}
        <div style={{
          position: "absolute", bottom: "2.5rem", left: "50%",
          transform: "translateX(-50%)", display: "flex", flexDirection: "column",
          alignItems: "center", gap: "8px",
        }}>
          <div style={{ width: "1px", height: "50px", backgroundColor: "rgba(255,255,255,0.4)" }} />
        </div>
      </div>
    </section>
  );
}
