const images = [
  {
    src: "/images/gallery-1.webp",
    fallback:
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&q=80&grayscale",
    alt: "Precision fade",
    span: "tall",
  },
  {
    src: "/images/gallery-2.webp",
    fallback:
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80&grayscale",
    alt: "Classic cut",
    span: "wide",
  },
  {
    src: "/images/gallery-3.webp",
    fallback:
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&q=80&grayscale",
    alt: "Beard styling",
    span: "normal",
  },
  {
    src: "/images/gallery-4.webp",
    fallback:
      "https://images.unsplash.com/photo-1622296089863-eb7fc530daa8?w=600&q=80&grayscale",
    alt: "Modern design",
    span: "normal",
  },
  {
    src: "/images/hero-2.webp",
    fallback:
      "https://images.unsplash.com/photo-1560869713-7d0a29430803?w=600&q=80&grayscale",
    alt: "Luxury experience",
    span: "tall",
  },
];

export default function Gallery() {
  return (
    <section
      style={{
        backgroundColor: "#050505",
        padding: "var(--section-pad) 1.5rem",
      }}
    >
      {/* Heading */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "3.5rem",
          maxWidth: "var(--max-width)",
          margin: "0 auto 3.5rem",
        }}
      >
        <p
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 300,
            fontSize: "0.7rem",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "#666",
            marginBottom: "1rem",
          }}
        >
          Nuestra Galeria
        </p>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.2,
          }}
        >
          El Arte en Cada Corte
        </h2>
      </div>

      {/* Masonry grid */}
      <div
        style={{
          maxWidth: "var(--max-width)",
          margin: "0 auto",
          columns: "2 300px",
          columnGap: "1rem",
        }}
      >
        {images.map((img, i) => (
          <div
            key={i}
            style={{
              breakInside: "avoid",
              marginBottom: "1rem",
              overflow: "hidden",
              position: "relative",
              animation: `fadeIn 0.8s ease forwards`,
              animationDelay: `${i * 0.1}s`,
              opacity: 0,
            }}
          >
            <img
              src={img.src}
              alt={img.alt}
              onError={(e) => {
                (e.target as HTMLImageElement).src = img.fallback;
              }}
              loading="lazy"
              style={{
                width: "100%",
                display: "block",
                filter: "grayscale(100%) brightness(0.85)",
                transition: "filter 0.4s ease, transform 0.4s ease",
                aspectRatio: i % 2 === 0 ? "3/4" : "4/3",
                objectFit: "cover",
              }}
              onMouseOver={(e) => {
                const el = e.target as HTMLImageElement;
                el.style.filter = "grayscale(0%) brightness(1)";
                el.style.transform = "scale(1.03)";
              }}
              onMouseOut={(e) => {
                const el = e.target as HTMLImageElement;
                el.style.filter = "grayscale(100%) brightness(0.85)";
                el.style.transform = "scale(1)";
              }}
            />
            {/* Caption overlay */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "1rem",
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
              }}
            >
              <span
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 300,
                  fontSize: "0.65rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                {img.alt}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
