import { useNavigate } from "react-router-dom";

const products = [
  {
    id: 1,
    name: "Brocha de Afeitar",
    price: "$24",
    image: "/images/product-brush.jpg",
  },
  {
    id: 2,
    name: "Tijeras Profesionales",
    price: "$48",
    image: "/images/product-scissors.jpg",
  },
  {
    id: 3,
    name: "Aceite Capilar",
    price: "$32",
    image: "/images/product-hot-oil.jpg",
  },
  {
    id: 4,
    name: "Navaja de Afeitar",
    price: "$65",
    image: "/images/product-razor.jpg",
  },
];

export default function FeaturedProducts() {
  const navigate = useNavigate();

  return (
    <section
      id="shop"
      style={{
        position: "relative",
        padding: "clamp(80px,10vw,130px) clamp(24px,8vw,100px)",
        backgroundImage: "url('/images/shop-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Dark overlay — heavy so text reads cleanly over the BG photo */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to bottom, rgba(4,4,4,0.92) 0%, rgba(4,4,4,0.85) 60%, rgba(4,4,4,0.95) 100%)",
      }} />

      <style>{`
        .sp-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: clamp(20px,3vw,40px);
          margin-bottom: clamp(48px,7vw,80px);
        }
        @media (max-width: 768px) {
          .sp-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
        }
        .sp-card { text-align: center; cursor: pointer; }
        .sp-card:hover .sp-img {
          transform: scale(1.04);
          filter: brightness(1.12) grayscale(0%);
        }
        .sp-img {
          width: 100%;
          aspect-ratio: 3/4;
          object-fit: cover;
          display: block;
          transition: transform 0.5s ease, filter 0.5s ease;
          filter: grayscale(20%);
        }
        .sp-cta-btn:hover {
          background: #C9A96E !important;
          border-color: #C9A96E !important;
          color: #000 !important;
        }
      `}</style>

      <div style={{ position: "relative", zIndex: 1, maxWidth: "1300px", margin: "0 auto" }}>

        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: "clamp(48px,7vw,80px)" }}>
          <p style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "10px", fontWeight: 500,
            letterSpacing: "4px", textTransform: "uppercase",
            color: "#C9A96E", marginBottom: "18px",
          }}>
            SOLO USAMOS LO MEJOR
          </p>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(34px,5vw,64px)", fontWeight: 400,
            color: "#fff", lineHeight: 1.1, margin: 0,
          }}>
            Productos de Grooming
          </h2>
        </div>

        {/* Product grid */}
        <div className="sp-grid">
          {products.map(p => (
            <div key={p.id} className="sp-card">
              <div style={{ overflow: "hidden", marginBottom: "20px" }}>
                <img
                  src={p.image}
                  alt={p.name}
                  className="sp-img"
                  loading="lazy"
                />
              </div>
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(17px,2vw,22px)", fontWeight: 400,
                color: "#fff", marginBottom: "8px",
              }}>{p.name}</h3>
              <p style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: "11px", fontWeight: 500,
                letterSpacing: "2px", color: "#C9A96E",
              }}>{p.price}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center" }}>
          <button
            className="sp-cta-btn"
            onClick={() => navigate("/booking")}
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "11px", fontWeight: 500,
              letterSpacing: "3px", textTransform: "uppercase",
              background: "transparent", color: "#fff",
              border: "1px solid rgba(255,255,255,0.45)",
              padding: "16px 52px", cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            VER TODOS LOS PRODUCTOS
          </button>
        </div>

      </div>
    </section>
  );
}
