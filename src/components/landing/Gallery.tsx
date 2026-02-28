import { useNavigate } from "react-router-dom";
import { useInView } from "../../hooks/useInView";
import { useQuery } from "@tanstack/react-query";
import { getPublicGallery, SERVICE_TYPES, type GalleryPhoto } from "../../services/gallery";
import Spinner from "../ui/Spinner";

// Static fallback images shown when no approved photos exist yet
const STATIC_FALLBACK = [
  { url: "/images/gallery-1.webp", alt: "Precision fade",    barber_id: null, service_type: "fade"    },
  { url: "/images/gallery-2.webp", alt: "Classic cut",       barber_id: null, service_type: "clasico" },
  { url: "/images/gallery-3.webp", alt: "Beard styling",     barber_id: null, service_type: "barba"   },
  { url: "/images/gallery-4.webp", alt: "Modern design",     barber_id: null, service_type: "diseno"  },
  { url: "/images/hero-2.webp",    alt: "Luxury experience", barber_id: null, service_type: "clasico" },
];

export default function Gallery() {
  const navigate = useNavigate();
  const [headingRef, headingInView] = useInView();
  const [gridRef, gridInView]       = useInView();

  const { data: approvedPhotos, isLoading: galleryLoading } = useQuery({
    queryKey: ["public-gallery"],
    queryFn: getPublicGallery,
    staleTime: 1000 * 60 * 2,
  });

  // Use approved DB photos if any, otherwise fallback
  const items: { url: string; alt: string; barber_id: string | null; service_type: string }[] =
    approvedPhotos && approvedPhotos.length > 0
      ? approvedPhotos.map((p: GalleryPhoto) => ({
          url:          `https://vantagestudioapp.com${p.url}`,
          alt:          SERVICE_TYPES.find(s => s.value === p.service_type)?.label || p.service_type,
          barber_id:    p.barber_id,
          service_type: p.service_type,
        }))
      : STATIC_FALLBACK;

  const galleryTitle = "El Arte en Cada Corte";

  function handlePhotoClick(barber_id: string | null) {
    if (barber_id) {
      navigate(`/booking?barber=${barber_id}`);
    } else {
      navigate("/booking");
    }
  }

  return (
    <section
      id="galeria"
      style={{
        position: "relative",
        backgroundColor: "#050505",
        padding: "var(--section-pad) 1.5rem",
      }}
    >
      <style>{`
        .gallery-item { cursor: pointer; position: relative; overflow: hidden; break-inside: avoid; margin-bottom: 1rem; }
        .gallery-item img { transition: filter 0.4s ease, transform 0.4s ease; }
        .gallery-item:hover img { filter: grayscale(0%) brightness(1) !important; transform: scale(1.03); }
        .gallery-item .overlay-cta {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: flex-end;
          padding: 1.2rem;
          background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%);
          opacity: 0; transition: opacity 0.35s ease;
        }
        .gallery-item:hover .overlay-cta { opacity: 1; }
        .gallery-item .cta-book {
          font-family: 'Montserrat', sans-serif; font-size: 9px; font-weight: 600;
          letter-spacing: 0.2em; text-transform: uppercase; color: #fff;
          background: #000; border: none; padding: 7px 18px; cursor: pointer;
          transition: opacity 0.2s;
        }
        .gallery-item .cta-book:hover { opacity: 0.85; }
      `}</style>

      {/* Heading */}
      <div
        ref={headingRef}
        style={{
          textAlign: "center",
          maxWidth: "var(--max-width)",
          margin: "0 auto 3.5rem",
          opacity: 0,
          animation: headingInView ? "fadeInUp 0.7s ease-out forwards" : "none",
        }}
      >
        <p style={{
          fontFamily: "Montserrat, sans-serif", fontWeight: 300,
          fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase",
          color: "#666", marginBottom: "1rem",
        }}>
          Nuestra Galería
        </p>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 700,
          color: "#fff", lineHeight: 1.2,
        }}>
          {galleryTitle}
        </h2>
      </div>

      {/* Loading state */}
      {galleryLoading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem 0" }}>
          <Spinner size={28} theme="light" label="Cargando galería…" />
        </div>
      )}

      {/* Masonry grid */}
      <div
        ref={gridRef}
        style={{
          maxWidth: "var(--max-width)",
          margin: "0 auto",
          columns: "2 300px",
          columnGap: "1rem",
        }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="gallery-item"
            onClick={() => handlePhotoClick(item.barber_id)}
            style={{
              breakInside: "avoid",
              marginBottom: "1rem",
              overflow: "hidden",
              position: "relative",
              opacity: 0,
              animation: gridInView
                ? `fadeInUp 0.7s ease-out ${i * 0.1}s forwards`
                : "none",
            }}
          >
            <img
              src={item.url}
              alt={item.alt}
              loading="lazy"
              style={{
                width: "100%",
                display: "block",
                filter: "grayscale(100%) brightness(0.85)",
                transition: "filter 0.4s ease, transform 0.4s ease",
                aspectRatio: i % 2 === 0 ? "3/4" : "4/3",
                objectFit: "cover",
              }}
            />

            {/* Overlay — service type label + book CTA */}
            <div className="overlay-cta">
              <p style={{
                fontFamily: "Montserrat, sans-serif", fontWeight: 300,
                fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.65)", marginBottom: "0.5rem",
              }}>
                {item.alt}
              </p>
              {item.barber_id && (
                <button className="cta-book" onClick={e => { e.stopPropagation(); handlePhotoClick(item.barber_id); }}>
                  Reservar este estilo
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
