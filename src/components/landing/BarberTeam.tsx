import { useNavigate } from "react-router-dom";

const barbers = [
  {
    id: 1,
    name: "Marcus Rivera",
    title: "Master Barber",
    experience: "12 years",
    specialty: "Precision Fades & Classic Cuts",
    image: "/images/barber-1.webp",
    fallback:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&grayscale",
  },
  {
    id: 2,
    name: "James Carter",
    title: "Senior Stylist",
    experience: "8 years",
    specialty: "Beard Design & Grooming",
    image: "/images/barber-2.webp",
    fallback:
      "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&q=80&grayscale",
  },
  {
    id: 3,
    name: "Diego Morales",
    title: "Creative Director",
    experience: "10 years",
    specialty: "Artistic Designs & Textures",
    image: "/images/barber-3.webp",
    fallback:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80&grayscale",
  },
];

export default function BarberTeam() {
  const navigate = useNavigate();

  return (
    <section
      id="team"
      style={{
        padding: "var(--section-pad) 1.5rem",
        maxWidth: "var(--max-width)",
        margin: "0 auto",
      }}
    >
      {/* Heading */}
      <div style={{ textAlign: "center", marginBottom: "4rem" }}>
        <p
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 300,
            fontSize: "0.7rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "var(--gray-mid)",
            marginBottom: "1rem",
          }}
        >
          Nuestro Equipo
        </p>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 700,
            color: "var(--black)",
            lineHeight: 1.2,
          }}
        >
          Artesanos del Estilo
        </h2>
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "2rem",
        }}
      >
        {barbers.map((barber, i) => (
          <div
            key={barber.id}
            style={{
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
              animation: `fadeIn 0.6s ease forwards`,
              animationDelay: `${i * 0.15}s`,
              opacity: 0,
            }}
            onClick={() => navigate("/booking")}
          >
            {/* Image container */}
            <div
              style={{
                position: "relative",
                aspectRatio: "3 / 4",
                overflow: "hidden",
                backgroundColor: "#f0f0f0",
              }}
            >
              <img
                src={barber.image}
                alt={barber.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = barber.fallback;
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: "grayscale(100%)",
                  transition: "transform 0.6s ease",
                }}
                onMouseOver={(e) => {
                  (e.target as HTMLImageElement).style.transform = "scale(1.05)";
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLImageElement).style.transform = "scale(1)";
                }}
              />
              {/* Overlay on hover */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)",
                  opacity: 1,
                }}
              />
              {/* Book badge */}
              <div
                style={{
                  position: "absolute",
                  bottom: "1.5rem",
                  right: "1.5rem",
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(4px)",
                }}
              >
                <span style={{ color: "#fff", fontSize: "1.1rem" }}>+</span>
              </div>
            </div>

            {/* Info */}
            <div style={{ padding: "1.5rem 0 0.5rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "0.4rem",
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "1.3rem",
                    fontWeight: 700,
                    color: "var(--black)",
                  }}
                >
                  {barber.name}
                </h3>
                <span
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 300,
                    fontSize: "0.65rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "var(--gray-mid)",
                    marginTop: "0.3rem",
                  }}
                >
                  {barber.experience}
                </span>
              </div>
              <p
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 300,
                  fontSize: "0.7rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--gray-mid)",
                  marginBottom: "0.5rem",
                }}
              >
                {barber.title}
              </p>
              <p
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 300,
                  fontSize: "0.9rem",
                  color: "#444",
                  lineHeight: 1.5,
                }}
              >
                {barber.specialty}
              </p>
            </div>

            {/* Bottom border line */}
            <div
              style={{
                height: "1px",
                backgroundColor: "var(--gray-border)",
                marginTop: "1rem",
              }}
            />
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center", marginTop: "3.5rem" }}>
        <button
          onClick={() => navigate("/booking")}
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 300,
            fontSize: "0.75rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            background: "transparent",
            border: "1px solid var(--black)",
            color: "var(--black)",
            padding: "1rem 3rem",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "var(--black)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--white)";
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--black)";
          }}
        >
          Reservar con un Experto
        </button>
      </div>
    </section>
  );
}
