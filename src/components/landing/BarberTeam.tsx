import { useNavigate } from "react-router-dom";
import { useInView } from "../../hooks/useInView";
import { useT } from "../../i18n";

const barbers = [
  {
    id: 1,
    name: "Marcus Rivera",
    titleKey: "team.masterBarber" as const,
    experienceYears: 12,
    image: "/images/barber-1.webp",
    fallback: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&grayscale",
  },
  {
    id: 2,
    name: "James Carter",
    titleKey: "team.seniorStylist" as const,
    experienceYears: 8,
    image: "/images/barber-2.webp",
    fallback: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&q=80&grayscale",
  },
  {
    id: 3,
    name: "Diego Morales",
    titleKey: "team.creativeDirector" as const,
    experienceYears: 10,
    image: "/images/barber-3.webp",
    fallback: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80&grayscale",
  },
];

function BrushStroke({ name, title }: { name: string; title: string }) {
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 2, pointerEvents: "none" }}>
      {/* Organic brush-stroke shape */}
      <svg
        viewBox="0 0 400 140"
        preserveAspectRatio="none"
        style={{ width: "100%", display: "block", height: "clamp(100px,22%,150px)" }}
      >
        <path
          d="M-5,52 C15,34 55,20 110,28 C165,36 215,18 275,26 C325,32 370,20 405,32 L405,145 L-5,145 Z"
          fill="#111111"
          opacity="0.94"
        />
        <path
          d="M-5,58 C25,46 70,36 130,42 C190,48 240,32 300,38 C345,43 380,34 405,42 L405,145 L-5,145 Z"
          fill="#0a0a0a"
          opacity="0.6"
        />
      </svg>
      {/* Text on top of brush stroke */}
      <div style={{
        position: "absolute",
        bottom: "clamp(14px,3%,22px)",
        left: "clamp(16px,5%,24px)",
        right: "clamp(16px,5%,24px)",
      }}>
        <p style={{
          fontFamily: "Montserrat,sans-serif",
          fontSize: "clamp(8px,1.5vw,10px)", fontWeight: 500,
          letterSpacing: "3px", textTransform: "uppercase",
          color: "rgba(255,255,255,0.6)", marginBottom: "5px",
        }}>{title}</p>
        <p style={{
          fontFamily: "Montserrat,sans-serif",
          fontSize: "clamp(12px,2vw,16px)", fontWeight: 700,
          letterSpacing: "1.5px", textTransform: "uppercase",
          color: "#ffffff", lineHeight: 1.1,
        }}>{name}</p>
      </div>
    </div>
  );
}

export default function BarberTeam() {
  const navigate = useNavigate();
  const t = useT();
  const [headingRef, headingInView] = useInView();
  const [cardsRef, cardsInView] = useInView();

  return (
    <section id="equipo" style={{ position: "relative", padding: "var(--section-pad) 1.5rem" }}>
      <style>{`
        .bt-card {
          position: relative; overflow: hidden; cursor: pointer;
          background: #1a1a1a;
        }
        .bt-img {
          width: 100%; height: 100%; object-fit: cover;
          filter: grayscale(100%) brightness(0.9);
          transition: transform 0.6s ease, filter 0.6s ease;
          display: block;
        }
        .bt-card:hover .bt-img {
          transform: scale(1.06);
          filter: grayscale(0%) brightness(1.05);
        }
        .bt-badge {
          position: absolute; bottom: 1.4rem; right: 1.4rem;
          width: 44px; height: 44px; border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.5);
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(4px);
          transition: background 0.3s ease, border-color 0.3s ease, transform 0.3s ease;
          z-index: 3;
        }
        .bt-card:hover .bt-badge {
          background: rgba(255,255,255,0.22);
          border-color: rgba(255,255,255,0.9);
          transform: scale(1.1);
        }
      `}</style>

      <div style={{ maxWidth: "var(--max-width)", margin: "0 auto" }}>

        {/* Heading */}
        <div ref={headingRef} style={{
          textAlign: "center", marginBottom: "4rem",
          opacity: 0,
          animation: headingInView ? "fadeInUp 0.7s ease-out forwards" : "none",
        }}>
          <p style={{
            fontFamily: "Montserrat, sans-serif", fontWeight: 300,
            fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase",
            color: "var(--gray-mid)", marginBottom: "1rem",
          }}>Nuestro Equipo</p>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700,
            color: "var(--black)", lineHeight: 1.2,
          }}>Artesanos del Estilo</h2>
        </div>

        {/* Grid */}
        <div ref={cardsRef} style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "2rem",
        }}>
          {barbers.map((barber, i) => (
            <div
              key={barber.id}
              className="bt-card"
              style={{
                opacity: 0,
                animation: cardsInView ? `fadeInUp 0.7s ease-out ${i * 0.15}s forwards` : "none",
              }}
              onClick={() => navigate("/booking")}
            >
              <div style={{ position: "relative", aspectRatio: "3/4", overflow: "hidden" }}>
                <img
                  src={barber.image}
                  alt={barber.name}
                  className="bt-img"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).src = barber.fallback; }}
                />
                {/* Brush stroke name overlay */}
                <BrushStroke name={barber.name} title={t(barber.titleKey)} />
                {/* + badge */}
                <div className="bt-badge">
                  <span style={{ color: "#fff", fontSize: "1.2rem", lineHeight: 1, fontWeight: 200 }}>+</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: "3.5rem" }}>
          <button
            onClick={() => navigate("/booking")}
            style={{
              fontFamily: "Montserrat, sans-serif", fontWeight: 300,
              fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase",
              background: "transparent", border: "1px solid var(--black)",
              color: "var(--black)", padding: "1rem 3rem",
              cursor: "pointer", transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--black)";
              (e.currentTarget as HTMLButtonElement).style.color = "#fff";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--black)";
            }}
          >
            Reservar con un Experto
          </button>
        </div>

      </div>
    </section>
  );
}
