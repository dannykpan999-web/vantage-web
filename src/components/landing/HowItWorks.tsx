import { useInView } from "../../hooks/useInView";

const steps = [
  {
    n: "01",
    t: "Elige tu Barbero",
    d: "Explora nuestros especialistas, sus técnicas y disponibilidad en tiempo real.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3a3 3 0 0 1 3 3c0 1.5-1 2.5-1 4l-3 9"/>
        <path d="M18 3a3 3 0 0 0-3 3c0 1.5 1 2.5 1 4l3 9"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
        <path d="M5 19h14"/>
      </svg>
    ),
  },
  {
    n: "02",
    t: "Selecciona tu Horario",
    d: "Escoge el día y la hora que mejor se adapte a tu agenda. Sin llamadas, sin esperas.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
        <circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    n: "03",
    t: "Paga con Square",
    d: "Pago seguro en línea. Apple Pay disponible. Confirmación instantánea por correo.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"/>
        <line x1="2" y1="10" x2="22" y2="10"/>
        <line x1="6" y1="15" x2="10" y2="15"/>
        <line x1="13" y1="15" x2="17" y2="15"/>
      </svg>
    ),
  },
];

export default function HowItWorks() {
  const [headingRef, headingInView] = useInView();
  const [cardsRef, cardsInView] = useInView();

  return (
    <section style={{
      padding: "var(--section-pad) clamp(24px,8vw,120px)",
      background: "#fafafa", borderTop: "1px solid #e5e5e5",
    }}>
      <style>{`
        /* Card wrapper — clips the rising fill */
        .hiw-card {
          position: relative; overflow: hidden;
          background: #fff;
          border: 1px solid #e8e8e8;
          padding: clamp(32px,4vw,52px) clamp(24px,3vw,36px);
          display: flex; flex-direction: column; align-items: center;
          text-align: center; cursor: default;
          transition: border-color 0.55s ease, transform 0.35s ease, box-shadow 0.35s ease;
        }
        .hiw-card:hover {
          border-color: #0a0a0a;
          transform: translateY(-6px);
          box-shadow: 0 20px 48px rgba(0,0,0,0.22);
        }

        /* Fill layer — rises from bottom to top */
        .hiw-fill {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 0;
          background: #0a0a0a;
          transition: height 0.55s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 0;
        }
        .hiw-card:hover .hiw-fill { height: 100%; }

        /* All content sits above the fill layer */
        .hiw-icon-ring, .hiw-num, .hiw-title, .hiw-desc {
          position: relative; z-index: 1;
        }

        .hiw-icon-ring {
          width: 88px; height: 88px; border-radius: 50%;
          background: #f4f4f4;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 28px;
          transition: background 0.55s ease, color 0.55s ease;
          color: #111;
        }
        .hiw-card:hover .hiw-icon-ring { background: #fff; color: #0a0a0a; }

        .hiw-num {
          font-family: 'Playfair Display',serif;
          font-size: clamp(11px,1.2vw,13px); font-weight: 400;
          letter-spacing: 3px; color: #aaa;
          margin-bottom: 14px;
          transition: color 0.55s ease;
        }
        .hiw-card:hover .hiw-num { color: rgba(255,255,255,0.45); }

        .hiw-title {
          font-family: 'Playfair Display',serif;
          font-size: clamp(18px,2vw,22px); font-weight: 400;
          color: #111; margin-bottom: 16px; line-height: 1.3;
          transition: color 0.55s ease;
        }
        .hiw-card:hover .hiw-title { color: #fff; }

        .hiw-desc {
          font-family: Montserrat,sans-serif;
          font-size: 13px; font-weight: 300;
          color: #757575; line-height: 1.9;
          transition: color 0.55s ease;
        }
        .hiw-card:hover .hiw-desc { color: rgba(255,255,255,0.65); }
      `}</style>

      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

        {/* Heading */}
        <div ref={headingRef} style={{
          textAlign: "center", marginBottom: "clamp(48px,7vw,80px)",
          opacity: 0,
          animation: headingInView ? "fadeInUp 0.7s ease-out forwards" : "none",
        }}>
          <p style={{
            fontFamily: "Montserrat,sans-serif", fontSize: "10px", fontWeight: 500,
            letterSpacing: "2px", textTransform: "uppercase",
            color: "#757575", marginBottom: "16px",
          }}>El Proceso</p>
          <h2 style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: "clamp(32px,5vw,56px)", fontWeight: 400, color: "#000",
          }}>Tres Pasos, <em>Un Estándar</em></h2>
        </div>

        {/* Cards grid */}
        <div
          ref={cardsRef}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "clamp(20px,3vw,32px)",
          }}
        >
          {steps.map((s, i) => (
            <div
              key={i}
              className="hiw-card"
              style={{
                opacity: 0,
                animation: cardsInView ? `fadeInUp 0.7s ease-out ${i * 0.15}s forwards` : "none",
              }}
            >
              {/* Bottom-to-top fill layer */}
              <div className="hiw-fill" />

              {/* Circular icon */}
              <div className="hiw-icon-ring">
                {s.icon}
              </div>

              {/* Step number */}
              <p className="hiw-num">{s.n}</p>

              {/* Title */}
              <h3 className="hiw-title">{s.t}</h3>

              {/* Description */}
              <p className="hiw-desc">{s.d}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
