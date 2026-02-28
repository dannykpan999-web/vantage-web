import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getBarbers } from "../services/barbers";
import { getPublicGallery, SERVICE_TYPES, type GalleryPhoto } from "../services/gallery";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

export default function BarberPortfolioPage() {
  const { id }       = useParams<{ id: string }>();
  const navigate     = useNavigate();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const lbTouchX     = useRef<number | null>(null);

  const { data: barbers, isLoading: barbersLoading } = useQuery({
    queryKey: ["barbers"],
    queryFn: getBarbers,
    staleTime: 1000 * 60 * 5,
  });

  const { data: allPhotos, isLoading: photosLoading } = useQuery({
    queryKey: ["public-gallery"],
    queryFn: getPublicGallery,
    staleTime: 1000 * 60 * 2,
  });

  const barber  = barbers?.find(b => b.id === id);
  const photos: GalleryPhoto[] = (allPhotos ?? []).filter(
    (p: GalleryPhoto) => p.barber_id === id
  );

  const isLoading = barbersLoading || photosLoading;

  if (!isLoading && barbers && !barber) {
    navigate("/", { replace: true });
    return null;
  }

  const avatarSrc = barber?.avatar
    ? `https://vantagestudioapp.com${barber.avatar}`
    : null;

  /* ── Lightbox helpers ── */
  const closeLightbox = () => setLightboxIndex(null);
  const lbPrev = () =>
    setLightboxIndex(i => i !== null ? (i - 1 + photos.length) % photos.length : null);
  const lbNext = () =>
    setLightboxIndex(i => i !== null ? (i + 1) % photos.length : null);

  function lbTouchStart(e: React.TouchEvent) { lbTouchX.current = e.touches[0].clientX; }
  function lbTouchEnd(e: React.TouchEvent) {
    if (lbTouchX.current === null) return;
    const dx = lbTouchX.current - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) dx > 0 ? lbNext() : lbPrev();
    lbTouchX.current = null;
  }

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape")      closeLightbox();
      if (e.key === "ArrowLeft")   lbPrev();
      if (e.key === "ArrowRight")  lbNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxIndex, photos.length]);

  /* ── Bento grid helpers ── */
  const isHero      = (i: number) => i % 3 === 0;
  const getAspect   = (i: number) => isHero(i) ? "16/9" : (i % 3 === 1 ? "4/5" : "4/3");

  return (
    <>
      <Header />
      <main style={{ minHeight: "100vh", background: "#050505" }}>
        <style>{`
          @keyframes skeletonPulse {
            0%, 100% { opacity: 0.06; }
            50%       { opacity: 0.12; }
          }
          .skel {
            background: #fff;
            animation: skeletonPulse 1.6s ease-in-out infinite;
          }

          /* ── Bento item ── */
          .bento-item {
            overflow: hidden;
            border-radius: 16px;
            cursor: pointer;
            position: relative;
            background: #111;
          }
          .bento-img {
            width: 100%; height: 100%; object-fit: cover; display: block;
            filter: brightness(0.84);
            transition: transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94),
                        filter 0.4s ease;
          }
          .bento-item:hover .bento-img {
            transform: scale(1.05);
            filter: brightness(1);
          }
          .bento-label {
            position: absolute; bottom: 10px; left: 10px;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
            font-family: Montserrat,sans-serif; font-size: 8px;
            font-weight: 500; letter-spacing: 0.15em; text-transform: uppercase;
            color: rgba(255,255,255,0.8); padding: 4px 10px;
            border-radius: 100px;
            pointer-events: none;
          }

          /* ── Lightbox ── */
          .lb-overlay {
            position: fixed; inset: 0; z-index: 999;
            background: rgba(0,0,0,0.88);
            backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
            display: flex; align-items: center; justify-content: center;
            animation: lbFadeIn 0.22s ease;
          }
          @keyframes lbFadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          .lb-img {
            max-width: min(90vw, 900px);
            max-height: 82vh;
            object-fit: contain;
            border-radius: 8px;
            display: block;
            user-select: none;
          }
          .lb-close {
            position: fixed; top: 20px; right: 20px;
            width: 44px; height: 44px; border-radius: 50%;
            border: 1px solid rgba(255,255,255,0.2);
            background: rgba(255,255,255,0.08);
            backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
            color: #fff; font-size: 18px;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; transition: background 0.2s;
          }
          .lb-close:hover { background: rgba(255,255,255,0.18); }
          .lb-nav {
            position: fixed; top: 50%; transform: translateY(-50%);
            width: 48px; height: 48px; border-radius: 50%;
            border: 1px solid rgba(255,255,255,0.2);
            background: rgba(255,255,255,0.07);
            backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; transition: background 0.2s;
          }
          .lb-nav:hover { background: rgba(255,255,255,0.18); }

          /* ── FAB ── */
          .portfolio-fab {
            position: fixed; bottom: 2rem; right: 2rem; z-index: 90;
            display: flex; align-items: center; gap: 8px;
            background: #fff; color: #000;
            border: none; border-radius: 100px;
            padding: 1rem 1.75rem;
            font-family: Montserrat,sans-serif; font-size: 0.68rem;
            font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase;
            cursor: pointer;
            box-shadow: 0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.2);
            transition: transform 0.2s, box-shadow 0.2s;
            animation: fabIn 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.3s both;
          }
          @keyframes fabIn {
            from { transform: translateY(80px); opacity: 0; }
            to   { transform: translateY(0); opacity: 1; }
          }
          .portfolio-fab:hover {
            transform: translateY(-2px);
            box-shadow: 0 14px 44px rgba(0,0,0,0.5);
          }
          .portfolio-fab:active { transform: translateY(0) scale(0.97); }
        `}</style>

        {/* ── Hero ── */}
        <div style={{
          paddingTop:    "clamp(96px,14vw,160px)",
          paddingBottom: "clamp(48px,6vw,80px)",
          paddingLeft:   "clamp(24px,6vw,80px)",
          paddingRight:  "clamp(24px,6vw,80px)",
          maxWidth:      "1100px",
          margin:        "0 auto",
          display:       "flex",
          flexDirection: "column",
          alignItems:    "center",
          textAlign:     "center",
        }}>
          {isLoading ? (
            /* Skeleton hero */
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "18px" }}>
              <div className="skel" style={{ width: 140, height: 140, borderRadius: "50%" }} />
              <div className="skel" style={{ width: 110, height: 11, borderRadius: 6 }} />
              <div className="skel" style={{ width: 250, height: 34, borderRadius: 8 }} />
            </div>
          ) : barber ? (
            <>
              {/* Avatar */}
              <div style={{
                width: "clamp(100px,18vw,150px)", height: "clamp(100px,18vw,150px)",
                borderRadius: "50%", overflow: "hidden",
                background: "#1a1a1a", border: "2px solid rgba(255,255,255,0.12)",
                marginBottom: "1.75rem", flexShrink: 0,
              }}>
                {avatarSrc ? (
                  <img
                    src={avatarSrc} alt={barber.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <div style={{
                    width: "100%", height: "100%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Playfair Display',serif",
                    fontSize: "clamp(2rem,6vw,3.5rem)", fontWeight: 700,
                    color: "rgba(255,255,255,0.2)",
                  }}>
                    {barber.name[0].toUpperCase()}
                  </div>
                )}
              </div>

              <p style={{
                fontFamily: "Montserrat,sans-serif", fontWeight: 300,
                fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.4)", marginBottom: "0.6rem",
              }}>
                {barber.specialty || "Barbero"}
              </p>

              <h1 style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: 700,
                color: "#fff", lineHeight: 1.15, marginBottom: "0",
              }}>
                {barber.name}
              </h1>
            </>
          ) : null}
        </div>

        {/* Divider */}
        <div style={{
          height: "1px", background: "rgba(255,255,255,0.07)",
          maxWidth: "1100px", margin: "0 auto clamp(40px,6vw,72px)",
        }} />

        {/* ── Bento Grid ── */}
        <div style={{
          maxWidth: "1100px", margin: "0 auto",
          paddingLeft:   "clamp(16px,4vw,60px)",
          paddingRight:  "clamp(16px,4vw,60px)",
          paddingBottom: "clamp(100px,12vw,160px)",
        }}>
          {isLoading ? (
            /* Skeleton grid */
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
              {[0,1,2,3,4].map(i => (
                <div
                  key={i} className="skel"
                  style={{
                    gridColumn: i % 3 === 0 ? "span 2" : undefined,
                    aspectRatio: i % 3 === 0 ? "16/9" : "4/5",
                    borderRadius: 16,
                  }}
                />
              ))}
            </div>
          ) : photos.length === 0 ? (
            <p style={{
              fontFamily: "Montserrat,sans-serif", fontSize: "0.75rem", fontWeight: 300,
              letterSpacing: "0.15em", color: "rgba(255,255,255,0.25)",
              textAlign: "center", padding: "3rem 0",
            }}>
              Portafolio próximamente
            </p>
          ) : (
            <>
              <p style={{
                fontFamily: "Montserrat,sans-serif", fontWeight: 300,
                fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.35)", marginBottom: "2rem", textAlign: "center",
              }}>
                Trabajos recientes · {photos.length} {photos.length === 1 ? "foto" : "fotos"}
              </p>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "10px",
              }}>
                {photos.map((photo, i) => (
                  <div
                    key={photo.id}
                    className="bento-item"
                    style={{ gridColumn: isHero(i) ? "span 2" : undefined }}
                    onClick={() => setLightboxIndex(i)}
                  >
                    <img
                      src={`https://vantagestudioapp.com${photo.url}`}
                      alt={SERVICE_TYPES.find(s => s.value === photo.service_type)?.label || photo.service_type}
                      loading="lazy"
                      className="bento-img"
                      style={{ aspectRatio: getAspect(i) }}
                    />
                    <div className="bento-label">
                      {SERVICE_TYPES.find(s => s.value === photo.service_type)?.label || photo.service_type}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Lightbox ── */}
        {lightboxIndex !== null && (
          <div
            className="lb-overlay"
            onClick={e => { if (e.target === e.currentTarget) closeLightbox(); }}
            onTouchStart={lbTouchStart}
            onTouchEnd={lbTouchEnd}
          >
            {/* Close */}
            <button className="lb-close" onClick={closeLightbox} aria-label="Cerrar">✕</button>

            {/* Prev / Next */}
            {photos.length > 1 && (
              <>
                <button
                  className="lb-nav" style={{ left: "clamp(8px,2vw,20px)" }}
                  onClick={e => { e.stopPropagation(); lbPrev(); }}
                  aria-label="Anterior"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="#fff" strokeWidth="2" strokeLinecap="round">
                    <path d="M19 12H5M12 5l-7 7 7 7"/>
                  </svg>
                </button>
                <button
                  className="lb-nav" style={{ right: "clamp(8px,2vw,20px)" }}
                  onClick={e => { e.stopPropagation(); lbNext(); }}
                  aria-label="Siguiente"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="#fff" strokeWidth="2" strokeLinecap="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </>
            )}

            {/* Image */}
            <img
              src={`https://vantagestudioapp.com${photos[lightboxIndex].url}`}
              alt={SERVICE_TYPES.find(s => s.value === photos[lightboxIndex].service_type)?.label || ""}
              className="lb-img"
            />

            {/* Caption */}
            <div style={{
              position: "fixed", bottom: "1.75rem", left: "50%", transform: "translateX(-50%)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
              pointerEvents: "none",
            }}>
              <p style={{
                fontFamily: "Montserrat,sans-serif", fontSize: "0.62rem", fontWeight: 300,
                letterSpacing: "0.22em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.48)",
              }}>
                {SERVICE_TYPES.find(s => s.value === photos[lightboxIndex].service_type)?.label
                  || photos[lightboxIndex].service_type}
              </p>
              <p style={{
                fontFamily: "Montserrat,sans-serif", fontSize: "0.58rem", fontWeight: 300,
                letterSpacing: "0.15em", color: "rgba(255,255,255,0.28)",
              }}>
                {lightboxIndex + 1} / {photos.length}
              </p>
            </div>
          </div>
        )}

      </main>

      {/* ── FAB ── */}
      {barber && !isLoading && (
        <button
          className="portfolio-fab"
          onClick={() => navigate(`/booking?barber=${barber.id}`)}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Reservar
        </button>
      )}

      <Footer />
    </>
  );
}
