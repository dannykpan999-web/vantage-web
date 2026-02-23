import { useNavigate } from "react-router-dom";
import { useInView } from "../../hooks/useInView";

const svcs = [
  {
    n: "Corte Clásico",
    d: "Precisión artesanal con técnicas tradicionales y tijeras de precisión.",
    p: "$45",
    t: "45 min",
    img: "/images/service-corte.webp",
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
    img: "/images/service-completa.webp",
  },
  {
    n: "Diseño de Barba",
    d: "Perfilado, relleno y esculpido de barba con acabado de navaja.",
    p: "$35",
    t: "30 min",
    img: "/images/barber-1.webp",
  },
];

export default function Services() {
  const nav = useNavigate();
  const [ref, inView] = useInView();

  return (
    <section id="servicios" style={{ padding: "clamp(80px,10vw,140px) clamp(20px,6vw,120px)", background: "#fff" }}>
      <style>{`
        .svc-row {
          display: flex; align-items: center; gap: 14px;
          padding: 20px 0;
          border-bottom: 1px solid #ececec;
          cursor: pointer;
          transition: background 0.2s ease, padding-left 0.2s ease;
        }
        .svc-row:first-child { border-top: 1px solid #ececec; }
        .svc-row:hover { background: #fafafa; padding-left: 6px; }
        .svc-thumb {
          width: 48px; height: 48px; border-radius: 50%;
          object-fit: cover; flex-shrink: 0;
          filter: grayscale(100%);
          transition: filter 0.3s ease, transform 0.3s ease;
        }
        .svc-row:hover .svc-thumb { filter: grayscale(0%); transform: scale(1.06); }
        .svc-name {
          font-family: 'Playfair Display',serif;
          font-size: clamp(14px,1.6vw,19px); font-weight: 400;
          color: #111; transition: color 0.2s ease;
        }
        .svc-row:hover .svc-name { color: #000; }
        .svc-price {
          font-family: 'Playfair Display',serif;
          font-size: clamp(15px,1.8vw,22px); font-weight: 400;
          color: #111; white-space: nowrap; flex-shrink: 0;
        }
        .svc-duration {
          font-family: Montserrat,sans-serif; font-size: 10px;
          font-weight: 300; color: #bbb; flex-shrink: 0;
        }
        /* Right side photos */
        .svc-photos {
          position: relative;
          width: 100%; padding-bottom: 115%;
          flex-shrink: 0;
        }
        .svc-photo-1 {
          position: absolute;
          top: 0; left: 0;
          width: 78%; aspect-ratio: 4/5;
          object-fit: cover;
          filter: grayscale(100%);
        }
        .svc-photo-2 {
          position: absolute;
          bottom: 0; right: 0;
          width: 58%; aspect-ratio: 4/5;
          object-fit: cover;
          border: 6px solid #fff;
          filter: grayscale(100%);
        }
        @media (max-width: 860px) {
          .svc-layout { flex-direction: column !important; }
          .svc-right { display: none !important; }
        }
        @media (max-width: 480px) {
          .svc-duration { display: none; }
        }
      `}</style>

      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div className="svc-layout" style={{ display: "flex", gap: "clamp(40px,6vw,100px)", alignItems: "flex-start" }}>

          {/* LEFT — Pricing list */}
          <div ref={ref} style={{
            flex: "1 1 52%", minWidth: 0,
            opacity: 0,
            animation: inView ? "fadeInUp 0.7s ease-out forwards" : "none",
          }}>
            {/* Label */}
            <p style={{
              fontFamily: "Montserrat,sans-serif", fontSize: "10px", fontWeight: 600,
              letterSpacing: "3px", textTransform: "uppercase",
              color: "#999", marginBottom: "14px",
            }}>Precios</p>

            {/* Heading */}
            <h2 style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: "clamp(32px,4vw,52px)", fontWeight: 400,
              color: "#000", marginBottom: "clamp(28px,4vw,48px)",
            }}>
              Arte en Cada<br /><em>Detalle</em>
            </h2>

            {/* Service rows */}
            <div>
              {svcs.map((s, i) => (
                <div
                  key={i}
                  className="svc-row"
                  onClick={() => nav("/booking")}
                  style={{
                    opacity: 0,
                    animation: inView ? `fadeInUp 0.6s ease-out ${0.1 + i * 0.1}s forwards` : "none",
                  }}
                >
                  {/* Circular thumb */}
                  <img src={s.img} alt={s.n} className="svc-thumb" loading="lazy" />

                  {/* Name + description */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="svc-name">{s.n}</p>
                    <p style={{
                      fontFamily: "Montserrat,sans-serif", fontSize: "11px",
                      fontWeight: 300, color: "#999", marginTop: "4px",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>{s.d}</p>
                  </div>

                  {/* Duration */}
                  <span className="svc-duration">{s.t}</span>

                  {/* Price */}
                  <span className="svc-price">{s.p}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => nav("/booking")}
              style={{
                marginTop: "36px",
                fontFamily: "Montserrat,sans-serif", fontSize: "11px",
                fontWeight: 500, letterSpacing: "2px", textTransform: "uppercase",
                background: "#111", color: "#fff", border: "none",
                padding: "14px 36px", cursor: "pointer",
                transition: "opacity 0.2s ease",
                opacity: 0,
                animation: inView ? "fadeInUp 0.6s ease-out 0.55s forwards" : "none",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              Ver todos los servicios
            </button>
          </div>

          {/* RIGHT — Two overlapping photos */}
          <div className="svc-right" style={{
            flex: "0 0 38%", position: "relative",
            opacity: 0,
            animation: inView ? "fadeInUp 0.8s ease-out 0.2s forwards" : "none",
          }}>
            <div className="svc-photos">
              <img src="/images/image1.webp" alt="Barbershop" className="svc-photo-1" loading="lazy" />
              <img src="/images/image2.webp" alt="Barbershop service" className="svc-photo-2" loading="lazy" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
