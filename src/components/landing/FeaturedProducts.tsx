import { useNavigate } from "react-router-dom";
import { useInView } from "../../hooks/useInView";

const products = [
  {
    id: 1,
    name: "Brocha de Afeitar",
    price: "$24",
    image: "/images/product-brush.webp",
  },
  {
    id: 2,
    name: "Tijeras Profesionales",
    price: "$48",
    image: "/images/product-scissors.webp",
  },
  {
    id: 3,
    name: "Aceite Capilar",
    price: "$32",
    image: "/images/product-hot-oil.webp",
  },
  {
    id: 4,
    name: "Navaja de Afeitar",
    price: "$65",
    image: "/images/product-razor.webp",
  },
];

export default function FeaturedProducts() {
  const navigate = useNavigate();
  const [headingRef, headingInView] = useInView();
  const [cardsRef, cardsInView] = useInView();

  return (
    <section
      id="shop"
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "clamp(60px,10vw,130px) clamp(20px,5vw,100px)",
        backgroundImage: "url('/images/shop-bg.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
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
          gap: clamp(16px,3vw,40px);
          margin-bottom: clamp(40px,7vw,80px);
        }
        @media (max-width: 900px) {
          .sp-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
        }
        @media (max-width: 480px) {
          .sp-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
        }
        .sp-card { text-align: center; cursor: pointer; }
        .sp-card:hover .sp-img {
          transform: scale(1.04);
          filter: brightness(1.12) grayscale(0%);
        }
        .sp-img {
          width: 100%;
          aspect-ratio: 1/1;
          object-fit: cover;
          display: block;
          transition: transform 0.5s ease, filter 0.5s ease;
          filter: grayscale(20%);
        }
        @media (min-width: 901px) {
          .sp-img { aspect-ratio: 3/4; }
        }
        .sp-card-img-wrap { overflow: hidden; margin-bottom: 12px; }
        @media (min-width: 901px) {
          .sp-card-img-wrap { margin-bottom: 20px; }
        }
        .sp-cta-btn {
          width: auto;
          padding: 16px 52px;
        }
        @media (max-width: 480px) {
          .sp-cta-btn { width: 100%; padding: 14px 20px; }
        }
        .sp-cta-btn:hover {
          background: #D4A020 !important;
          border-color: #D4A020 !important;
          color: #000 !important;
        }
      `}</style>

      <div style={{ position: "relative", zIndex: 1, maxWidth: "1300px", margin: "0 auto" }}>

        {/* Heading */}
        <div
          ref={headingRef}
          style={{
            textAlign: "center", marginBottom: "clamp(48px,7vw,80px)",
            opacity: 0,
            animation: headingInView ? "fadeInUp 0.7s ease-out forwards" : "none",
          }}
        >
          <p style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "10px", fontWeight: 500,
            letterSpacing: "4px", textTransform: "uppercase",
            color: "#D4A020", marginBottom: "18px",
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
        <div className="sp-grid" ref={cardsRef}>
          {products.map((p, i) => (
            <div
              key={p.id}
              className="sp-card"
              style={{
                opacity: 0,
                animation: cardsInView
                  ? `fadeInUp 0.7s ease-out ${i * 0.12}s forwards`
                  : "none",
              }}
            >
              <div className="sp-card-img-wrap">
                <img
                  src={p.image}
                  alt={p.name}
                  className="sp-img"
                  loading="lazy"
                />
              </div>
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(14px,2vw,22px)", fontWeight: 400,
                color: "#fff", marginBottom: "6px",
              }}>{p.name}</h3>
              <p style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: "11px", fontWeight: 500,
                letterSpacing: "2px", color: "#D4A020",
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
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            VER TODOS LOS PRODUCTOS
          </button>
        </div>

      </div>

      {/* Angular divider: dark shop → white services, V pointing UP */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 3, lineHeight: 0 }}>
        <svg
          viewBox="0 0 1440 90"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          style={{ width: "100%", height: "clamp(30px, 6.25vw, 90px)", display: "block" }}
        >
          <path d="M0,90 L720,0 L1440,90 Z" fill="#ffffff" />
        </svg>
      </div>
    </section>
  );
}
