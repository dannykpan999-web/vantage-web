import { useNavigate } from "react-router-dom";
import { useInView } from "../../hooks/useInView";

export default function FinalCTA() {
  const navigate = useNavigate();
  const [cardRef, cardInView] = useInView();

  return (
    <>
      <style>{`
        /* ── Desktop: overlapping absolute card ── */
        .fcta-section {
          position: relative;
          min-height: clamp(480px, 60vw, 640px);
          overflow: hidden;
        }
        .fcta-bg {
          position: absolute; inset: 0;
          background-image: url('/images/finalcta-bg.webp');
          background-size: cover; background-position: center;
          filter: grayscale(100%) brightness(0.45);
          z-index: 0;
        }
        .fcta-card {
          position: absolute;
          top: clamp(28px, 6%, 60px);
          right: clamp(28px, 4%, 60px);
          bottom: clamp(28px, 6%, 60px);
          width: clamp(300px, 38%, 500px);
          background: #fff;
          display: flex; flex-direction: column; justify-content: center;
          padding: clamp(36px,4vw,64px) clamp(28px,3.5vw,52px);
          z-index: 2;
        }

        /* ── Mobile: stack image above, card below ── */
        @media (max-width: 768px) {
          .fcta-section {
            display: flex;
            flex-direction: column;
            min-height: unset;
            overflow: visible;
          }
          .fcta-bg {
            position: relative;
            inset: auto;
            height: 240px;
            flex-shrink: 0;
            filter: grayscale(100%) brightness(0.5);
          }
          .fcta-card {
            position: relative;
            inset: auto;
            width: 100%;
            padding: 36px 28px;
          }
        }
      `}</style>

      <section className="fcta-section">
        {/* Background image */}
        <div className="fcta-bg" />

        {/* White panel card */}
        <div
          className="fcta-card"
          ref={cardRef}
          style={{
            opacity: 0,
            animation: cardInView ? "fadeInUp 0.7s ease-out forwards" : "none",
          }}
        >
          <h2 style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "clamp(22px,3vw,40px)", fontWeight: 800,
            color: "#111", lineHeight: 1.1,
            textTransform: "uppercase", letterSpacing: "0.02em",
            marginBottom: "20px",
          }}>
            Barbería Que<br />Define Tu<br />Estilo
          </h2>

          <div style={{ width: "40px", height: "2px", background: "#111", marginBottom: "20px" }} />

          <p style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "clamp(12px,1.2vw,14px)", fontWeight: 300,
            color: "#666", lineHeight: 1.85,
            marginBottom: "clamp(24px,4vw,48px)",
          }}>
            Nos encanta darte un look fresco que va con
            tu estilo y te hace sentir en tu mejor versión
            cada día.
          </p>

          <div style={{ width: "100%", height: "1px", background: "#e8e8e8", marginBottom: "clamp(18px,3vw,32px)" }} />

          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: "16px",
          }}>
            <p style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "clamp(9px,1vw,12px)", fontWeight: 700,
              letterSpacing: "2px", textTransform: "uppercase",
              color: "#111", margin: 0,
            }}>
              ¿Listo para reservar hoy?
            </p>
            <button
              onClick={() => navigate("/booking")}
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: "10px", fontWeight: 600,
                letterSpacing: "2px", textTransform: "uppercase",
                background: "#111", color: "#fff",
                border: "none", padding: "12px 24px",
                cursor: "pointer", transition: "opacity 0.2s ease",
                whiteSpace: "nowrap",
              }}
              onMouseOver={e => (e.currentTarget.style.opacity = "0.75")}
              onMouseOut={e => (e.currentTarget.style.opacity = "1")}
            >
              Reservar
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
