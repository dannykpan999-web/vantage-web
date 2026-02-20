import { useNavigate } from "react-router-dom";

const products = [
  {
    id: 1,
    name: "Pomada Artesanal",
    subtitle: "Fijación Media · Brillo Natural",
    price: "$28",
    image: "/images/product-pomada.jpg",
    fallback: "/images/gallery-4.webp",
  },
  {
    id: 2,
    name: "Aceite de Barba",
    subtitle: "Hidratación Profunda · 30ml",
    price: "$32",
    image: "/images/product-aceite.jpg",
    fallback: "/images/gallery-1.webp",
  },
  {
    id: 3,
    name: "Crema de Afeitar",
    subtitle: "Fórmula Premium · Sin Irritación",
    price: "$24",
    image: "/images/product-crema.jpg",
    fallback: "/images/gallery-2.webp",
  },
  {
    id: 4,
    name: "Kit Grooming",
    subtitle: "Set Completo · 5 Piezas",
    price: "$85",
    image: "/images/product-kit.jpg",
    fallback: "/images/gallery-3.webp",
  },
];

export default function FeaturedProducts() {
  const navigate = useNavigate();

  return (
    <section id="shop" style={{
      padding: "var(--section-pad) clamp(24px,6vw,80px)",
      backgroundColor: "#fff",
      borderTop: "1px solid #e5e5e5",
    }}>
      <style>{`
        .product-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: #e5e5e5;
          border: 1px solid #e5e5e5;
        }
        @media (max-width: 900px) {
          .product-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .product-grid { grid-template-columns: repeat(2, 1fr); gap: 1px; }
        }
        .product-card { background: #fff; overflow: hidden; cursor: pointer; }
        .product-card:hover .product-img { transform: scale(1.04); }
        .product-card:hover .product-cta { opacity: 1; }
        .product-img {
          width: 100%; aspect-ratio: 3/4; object-fit: cover;
          display: block; transition: transform 0.5s ease;
          filter: grayscale(15%);
        }
        .product-cta {
          opacity: 0; transition: opacity 0.3s ease;
        }
      `}</style>

      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

        {/* Heading */}
        <div style={{
          display: "flex", alignItems: "flex-end", justifyContent: "space-between",
          marginBottom: "clamp(40px,6vw,72px)", flexWrap: "wrap", gap: "1rem",
        }}>
          <div>
            <p style={{
              fontFamily: "Montserrat,sans-serif", fontSize: "10px", fontWeight: 500,
              letterSpacing: "2px", textTransform: "uppercase",
              color: "#757575", marginBottom: "16px",
            }}>Productos Destacados</p>
            <h2 style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: "clamp(28px,4vw,48px)", fontWeight: 400, color: "#000",
              lineHeight: 1.1,
            }}>
              El Estilo,<br /><em>En Tus Manos</em>
            </h2>
          </div>
          <button
            onClick={() => navigate("/booking")}
            style={{
              fontFamily: "Montserrat,sans-serif", fontSize: "11px", fontWeight: 500,
              letterSpacing: "2px", textTransform: "uppercase",
              background: "transparent", color: "#000",
              border: "1px solid #000", padding: "12px 28px",
              cursor: "pointer", whiteSpace: "nowrap",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "#000";
              (e.currentTarget as HTMLButtonElement).style.color = "#fff";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "#000";
            }}
          >
            Ver Todo
          </button>
        </div>

        {/* Product grid */}
        <div className="product-grid">
          {products.map(p => (
            <div key={p.id} className="product-card">
              {/* Image wrapper */}
              <div style={{ overflow: "hidden", position: "relative" }}>
                <img
                  src={p.image}
                  alt={p.name}
                  className="product-img"
                  onError={e => { (e.target as HTMLImageElement).src = p.fallback; }}
                  loading="lazy"
                />
                {/* Price badge */}
                <div style={{
                  position: "absolute", top: "1rem", right: "1rem",
                  backgroundColor: "#fff",
                  padding: "4px 10px",
                }}>
                  <span style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: "15px", fontWeight: 400, color: "#000",
                  }}>{p.price}</span>
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: "1.25rem 1.5rem 1.5rem" }}>
                <p style={{
                  fontFamily: "Montserrat,sans-serif", fontSize: "9px", fontWeight: 500,
                  letterSpacing: "2px", textTransform: "uppercase",
                  color: "#999", marginBottom: "6px",
                }}>{p.subtitle}</p>
                <h3 style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: "clamp(16px,2vw,20px)", fontWeight: 400,
                  color: "#000", marginBottom: "1rem",
                }}>{p.name}</h3>
                <button
                  className="product-cta"
                  style={{
                    fontFamily: "Montserrat,sans-serif", fontSize: "10px", fontWeight: 500,
                    letterSpacing: "2px", textTransform: "uppercase",
                    background: "#000", color: "#fff", border: "none",
                    padding: "10px 20px", cursor: "pointer", width: "100%",
                  }}
                >
                  Agregar
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
