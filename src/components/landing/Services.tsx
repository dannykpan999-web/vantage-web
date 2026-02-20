import { useNavigate } from "react-router-dom";

const svcs = [
  {
    n: "Corte Clasico",
    d: "Precisión artesanal con técnicas tradicionales y tijeras de precisión.",
    p: "$45",
    t: "45 min",
    img: "/images/service-corte.jpg",
  },
  {
    n: "Afeitado con Navaja",
    d: "La experiencia definitiva del afeitado. Toalla caliente y aceites premium.",
    p: "$65",
    t: "60 min",
    img: "/images/service-afeitado.webp",
  },
  {
    n: "Experiencia Completa",
    d: "Corte, barba y tratamiento facial. El lujo absoluto en un solo servicio.",
    p: "$95",
    t: "90 min",
    img: "/images/service-completa.jpg",
  },
];

export default function Services() {
  const nav = useNavigate();

  return (
    <section id="servicios" style={{ padding: "var(--section-pad)", background: "#fff" }}>
      <style>{`
        .svc-img {
          width: 100%; aspect-ratio: 16/9; object-fit: cover; display: block;
          transition: transform 0.6s ease;
          filter: grayscale(10%);
        }
        .svc-card:hover .svc-img { transform: scale(1.04); filter: grayscale(0%); }
        .svc-card:hover { background: #f8f8f8 !important; }
      `}</style>

      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

        {/* Heading */}
        <div style={{ marginBottom: "clamp(48px,7vw,80px)" }}>
          <p style={{
            fontFamily: "Montserrat,sans-serif", fontSize: "10px",
            letterSpacing: "0.24em", textTransform: "uppercase",
            color: "#757575", marginBottom: "16px",
          }}>Nuestros Servicios</p>
          <h2 style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: "clamp(32px,5vw,56px)", fontWeight: 400, color: "#000",
          }}>Arte en Cada<br /><em>Detalle</em></h2>
        </div>

        {/* Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
          gap: "1px", background: "#e5e5e5", border: "1px solid #e5e5e5",
        }}>
          {svcs.map((s, i) => (
            <div
              key={i}
              className="svc-card"
              style={{ background: "#fff", transition: "background 0.3s ease" }}
            >
              {/* Image */}
              <div style={{ overflow: "hidden" }}>
                <img src={s.img} alt={s.n} className="svc-img" loading="lazy" />
              </div>

              {/* Content */}
              <div style={{ padding: "clamp(28px,4vw,48px)" }}>
                <div style={{
                  fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase",
                  color: "#757575", marginBottom: "16px",
                }}>{String(i + 1).padStart(2, "0")}</div>

                <h3 style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: "clamp(20px,2.5vw,28px)", fontWeight: 400,
                  color: "#000", marginBottom: "14px",
                }}>{s.n}</h3>

                <p style={{
                  fontFamily: "Montserrat,sans-serif",
                  fontSize: "13px", fontWeight: 300,
                  color: "#757575", lineHeight: 1.9, marginBottom: "28px",
                }}>{s.d}</p>

                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  marginBottom: "24px",
                }}>
                  <span style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: "28px", fontWeight: 400, color: "#000",
                  }}>{s.p}</span>
                  <span style={{
                    fontFamily: "Montserrat,sans-serif",
                    fontSize: "11px", fontWeight: 300, color: "#757575",
                  }}>{s.t}</span>
                </div>

                <button
                  onClick={() => nav("/booking")}
                  style={{
                    width: "100%", padding: "14px",
                    background: "#000", color: "#fff",
                    fontFamily: "Montserrat,sans-serif",
                    fontSize: "11px", fontWeight: 500,
                    letterSpacing: "0.18em", textTransform: "uppercase",
                    border: "none", cursor: "pointer",
                    transition: "opacity 0.2s ease",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  Reservar
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
