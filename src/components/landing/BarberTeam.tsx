import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useInView } from "../../hooks/useInView";
import { useQuery } from "@tanstack/react-query";
import { getBarbers } from "../../services/barbers";
import { getLandingContent } from "../../services/landing";
import { useLanguageStore } from "../../store/languageStore";

const FALLBACK_IMAGES = [
  "/images/barber-1.webp",
  "/images/barber-2.webp",
  "/images/barber-3.webp",
];

export default function BarberTeam() {
  const navigate    = useNavigate();
  const [headingRef, headingInView] = useInView();
  const [active, setActive]   = useState(0);
  const [paused, setPaused]   = useState(false);
  const touchX      = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const lang = useLanguageStore(s => s.lang);

  const { data: apiBarbers } = useQuery({
    queryKey: ["barbers"],
    queryFn: getBarbers,
    staleTime: 1000 * 60 * 5,
  });

  const { data: landingContent } = useQuery({
    queryKey: ["landing"],
    queryFn: getLandingContent,
    staleTime: 1000 * 60 * 5,
  });

  const teamTitle = lang === "es"
    ? (landingContent?.team?.title_es    || "Nuestro Equipo")
    : (landingContent?.team?.title_en    || "Our Team");
  const teamSubtitle = lang === "es"
    ? (landingContent?.team?.subtitle_es || "Artesanos del Estilo")
    : (landingContent?.team?.subtitle_en || "Style Artisans");

  const barbers = (apiBarbers && apiBarbers.length > 0 ? apiBarbers : []).map((b, i) => ({
    id:       b.id,
    name:     b.name,
    title:    b.specialty || "Barbero",
    image:    b.avatar ? `https://vantagestudioapp.com${b.avatar}` : FALLBACK_IMAGES[i % FALLBACK_IMAGES.length],
    fallback: FALLBACK_IMAGES[i % FALLBACK_IMAGES.length],
  }));

  const total = barbers.length;

  const goTo = (i: number) => setActive(((i % total) + total) % total);
  const next = () => goTo(active + 1);
  const prev = () => goTo(active - 1);

  /* ── Autoplay ── */
  function startAutoplay() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (total < 2) return;
    intervalRef.current = setInterval(() => {
      setActive(a => (a + 1) % total);
    }, 5500);
  }

  useEffect(() => {
    if (!paused) startAutoplay();
    else if (intervalRef.current) clearInterval(intervalRef.current);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, total]);

  function handleManualNav(fn: () => void) {
    fn();
    startAutoplay();
  }

  /* ── Touch swipe ── */
  function onTouchStart(e: React.TouchEvent) { touchX.current = e.touches[0].clientX; }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchX.current === null) return;
    const dx = touchX.current - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 35) handleManualNav(dx > 0 ? next : prev);
    touchX.current = null;
  }

  if (total === 0) return null;

  return (
    <section
      id="equipo"
      style={{ height: "100vh", position: "relative", overflow: "hidden" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <style>{`
        @keyframes kenBurns {
          from { transform: scale(1.0); }
          to   { transform: scale(1.09); }
        }
        .bt-slide {
          position: absolute; inset: 0;
          pointer-events: none;
        }
        .bt-slide.bt-active {
          pointer-events: auto;
        }
        .bt-img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          filter: brightness(0.48);
          will-change: transform;
        }
        .bt-slide.bt-active .bt-img {
          animation: kenBurns 10s ease-out forwards;
        }
        .bt-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            135deg,
            rgba(0,0,0,0.72) 0%,
            rgba(0,0,0,0.15) 55%,
            rgba(0,0,0,0.55) 100%
          );
          pointer-events: none;
        }
        /* Editorial text block */
        .bt-text {
          position: absolute;
          bottom: clamp(90px,13vh,150px);
          left: clamp(32px,7vw,100px);
          max-width: 500px;
          transform: translateY(28px);
          opacity: 0;
          transition:
            transform 0.9s cubic-bezier(0.22,1,0.36,1) 0.15s,
            opacity 0.9s ease 0.15s;
          pointer-events: none;
        }
        .bt-slide.bt-active .bt-text {
          transform: translateY(0);
          opacity: 1;
          pointer-events: auto;
        }
        /* Side progress dots */
        .bt-dot {
          display: block;
          width: 3px; border-radius: 2px; border: none; padding: 0;
          cursor: pointer;
          background: rgba(255,255,255,0.22);
          transition: height 0.4s ease, background 0.3s ease;
          margin-bottom: 7px;
        }
        .bt-dot.bt-dot-on { background: rgba(255,255,255,0.88); }
        /* Glass arrow buttons */
        .bt-arrow {
          width: 52px; height: 52px; border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.22);
          background: rgba(255,255,255,0.07);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          color: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: background 0.25s, border-color 0.25s, transform 0.18s;
          flex-shrink: 0;
        }
        .bt-arrow:hover {
          background: rgba(255,255,255,0.16);
          border-color: rgba(255,255,255,0.48);
        }
        .bt-arrow:active { transform: scale(0.92); }
        /* Portfolio ghost button */
        .bt-portfolio-btn {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: Montserrat,sans-serif; font-weight: 400;
          font-size: clamp(9px,0.7vw,10px); letter-spacing: 0.26em;
          text-transform: uppercase;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.42);
          color: rgba(255,255,255,0.82);
          padding: 0.85rem 2rem;
          cursor: pointer;
          transition: background 0.22s, border-color 0.22s, color 0.22s;
        }
        .bt-portfolio-btn:hover {
          background: rgba(255,255,255,0.14);
          border-color: rgba(255,255,255,0.75);
          color: #fff;
        }
        @media (max-width: 600px) {
          .bt-arrows-wrap { display: none !important; }
          .bt-dots-wrap   { display: none !important; }
        }
      `}</style>

      {/* ── Slides (stacked, crossfade) ── */}
      {barbers.map((b, i) => {
        const isActive = i === active;
        return (
          <div
            key={b.id}
            className={`bt-slide${isActive ? " bt-active" : ""}`}
            style={{
              opacity: isActive ? 1 : 0,
              transition: "opacity 1.1s ease",
              zIndex: isActive ? 2 : 1,
            }}
          >
            <img
              src={b.image}
              alt={b.name}
              className="bt-img"
              loading={i === 0 ? "eager" : "lazy"}
              onError={e => { (e.target as HTMLImageElement).src = b.fallback; }}
            />
            <div className="bt-overlay" />

            {/* Editorial info */}
            <div className="bt-text">
              <p style={{
                fontFamily: "Montserrat,sans-serif", fontWeight: 300,
                fontSize: "clamp(9px,0.68vw,11px)", letterSpacing: "0.38em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.52)", marginBottom: "0.8rem",
              }}>
                {b.title}
              </p>
              <h2 style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "clamp(2.2rem,5.5vw,4.2rem)", fontWeight: 400,
                color: "#fff", lineHeight: 1.02, marginBottom: "1.6rem",
                letterSpacing: "-0.01em",
              }}>
                {b.name}
              </h2>
              <button
                className="bt-portfolio-btn"
                onClick={() => navigate(`/barber/${b.id}`)}
              >
                Ver Portafolio
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        );
      })}

      {/* ── Section heading (top overlay) ── */}
      <div
        ref={headingRef}
        style={{
          position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
          padding: "clamp(72px,9vh,110px) clamp(32px,7vw,100px) 0",
          opacity: 0,
          animation: headingInView ? "fadeInUp 0.8s ease-out forwards" : "none",
          pointerEvents: "none",
        }}
      >
        <p style={{
          fontFamily: "Montserrat,sans-serif", fontWeight: 300,
          fontSize: "0.62rem", letterSpacing: "0.32em", textTransform: "uppercase",
          color: "rgba(255,255,255,0.4)", marginBottom: "0.45rem",
        }}>{teamTitle}</p>
        <h2 style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: "clamp(1.3rem,2.2vw,1.9rem)", fontWeight: 400,
          color: "rgba(255,255,255,0.78)", lineHeight: 1.2,
        }}>{teamSubtitle}</h2>
      </div>

      {/* ── Side dots (right edge) ── */}
      <div
        className="bt-dots-wrap"
        style={{
          position: "absolute", right: "clamp(18px,2vw,36px)", top: "50%",
          transform: "translateY(-50%)", zIndex: 10,
          display: "flex", flexDirection: "column", alignItems: "center",
        }}
      >
        {barbers.map((_, i) => (
          <button
            key={i}
            className={`bt-dot${i === active ? " bt-dot-on" : ""}`}
            style={{ height: i === active ? "30px" : "8px" }}
            onClick={() => handleManualNav(() => goTo(i))}
            aria-label={`Barbero ${i + 1}`}
          />
        ))}
      </div>

      {/* ── Bottom right: counter + arrows ── */}
      <div style={{
        position: "absolute",
        bottom: "clamp(28px,4.5vh,56px)",
        right: "clamp(28px,5vw,72px)",
        zIndex: 10,
        display: "flex", alignItems: "center", gap: "16px",
      }}>
        <p style={{
          fontFamily: "Montserrat,sans-serif", fontWeight: 300,
          fontSize: "0.62rem", letterSpacing: "0.18em",
          color: "rgba(255,255,255,0.38)",
        }}>
          <span style={{ color: "rgba(255,255,255,0.82)", fontWeight: 500 }}>
            {String(active + 1).padStart(2, "0")}
          </span>
          {" / "}{String(total).padStart(2, "0")}
        </p>
        <div className="bt-arrows-wrap" style={{ display: "flex", gap: "10px" }}>
          <button className="bt-arrow" onClick={() => handleManualNav(prev)} aria-label="Anterior">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </button>
          <button className="bt-arrow" onClick={() => handleManualNav(next)} aria-label="Siguiente">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Bottom left: main CTA ── */}
      <div style={{
        position: "absolute",
        bottom: "clamp(28px,4.5vh,56px)",
        left: "clamp(32px,7vw,100px)",
        zIndex: 10,
      }}>
        <button
          onClick={() => navigate("/booking")}
          style={{
            fontFamily: "Montserrat,sans-serif", fontWeight: 400,
            fontSize: "0.72rem", letterSpacing: "0.22em", textTransform: "uppercase",
            background: "#fff", color: "#000", border: "none",
            padding: "1rem 3rem", cursor: "pointer",
            transition: "opacity 0.2s, transform 0.15s",
          }}
          onMouseOver={e => { e.currentTarget.style.opacity = "0.85"; }}
          onMouseOut={e => { e.currentTarget.style.opacity = "1"; }}
          onMouseDown={e => { e.currentTarget.style.transform = "scale(0.97)"; }}
          onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          Reservar con un Experto
        </button>
      </div>

    </section>
  );
}
