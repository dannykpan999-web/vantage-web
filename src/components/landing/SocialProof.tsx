import { useEffect, useState } from "react";
import { useInView } from "../../hooks/useInView";

export default function SocialProof() {
  const [ref, inView] = useInView();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    const steps = 60;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const eased = 1 - Math.pow(1 - step / steps, 3);
      setCount(Math.floor(500 * eased));
      if (step >= steps) { setCount(500); clearInterval(timer); }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView]);

  return (
    <section style={{ backgroundColor: "#0a0a0a", overflow: "hidden" }}>
      <style>{`
        .sp-inner { display: flex; align-items: stretch; min-height: 580px; }
        .sp-photo-col { flex: 0 0 50%; position: relative; overflow: hidden; }
        .sp-photo-col img { width: 100%; height: 100%; object-fit: cover; object-position: center top; display: block; filter: grayscale(100%) brightness(0.75); }
        .sp-content { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: clamp(48px,6vw,80px) clamp(36px,5vw,80px); }
        @media (max-width: 860px) {
          .sp-inner { flex-direction: column; min-height: auto; }
          .sp-photo-col { flex: none; height: 300px; }
          .sp-content { padding: 48px 24px; }
        }
      `}</style>

      <div className="sp-inner">

        {/* Left: full-height photo */}
        <div className="sp-photo-col" style={{
          opacity: 0,
          animation: inView ? "fadeInUp 0.8s ease-out 0.1s forwards" : "none",
        }}>
          <img src="/images/image1.webp" alt="Vantage Barbershop" loading="lazy" />
        </div>

        {/* Right: content */}
        <div ref={ref} className="sp-content" style={{
          opacity: 0,
          animation: inView ? "fadeInUp 0.8s ease-out 0.25s forwards" : "none",
        }}>

          {/* Label */}
          <p style={{
            fontFamily: "Montserrat,sans-serif", fontSize: "10px", fontWeight: 600,
            letterSpacing: "3px", textTransform: "uppercase",
            color: "#D4AF37", marginBottom: "28px",
          }}>Excelencia Reconocida</p>

          {/* Big rating */}
          <div style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: "clamp(72px,9vw,110px)", fontWeight: 400,
            color: "#fff", lineHeight: 1, marginBottom: "12px",
          }}>4.9</div>

          {/* Stars */}
          <div style={{
            color: "#D4AF37", fontSize: "clamp(16px,1.8vw,20px)",
            letterSpacing: "6px", marginBottom: "16px",
          }}>★ ★ ★ ★ ★</div>

          {/* Sub label */}
          <p style={{
            fontFamily: "Montserrat,sans-serif", fontSize: "clamp(10px,1vw,11px)", fontWeight: 300,
            letterSpacing: "2px", textTransform: "uppercase",
            color: "rgba(255,255,255,0.4)", marginBottom: "48px",
          }}>Por más de 1,250 clientes exclusivos</p>

          {/* Thin divider */}
          <div style={{
            width: "48px", height: "1px",
            backgroundColor: "rgba(255,255,255,0.12)", marginBottom: "48px",
          }} />

          {/* Mini stats */}
          <div style={{ display: "flex", gap: "clamp(24px,4vw,48px)", flexWrap: "wrap" }}>
            {[
              { val: `${count}+`, label: "Citas" },
              { val: "12+",       label: "Barberos Elite" },
              { val: "3",         label: "Sucursales" },
            ].map((s, i) => (
              <div key={i}>
                <div style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: "clamp(22px,2.5vw,30px)", fontWeight: 400,
                  color: "#fff", lineHeight: 1,
                }}>{s.val}</div>
                <div style={{
                  fontFamily: "Montserrat,sans-serif", fontSize: "10px", fontWeight: 400,
                  letterSpacing: "2px", textTransform: "uppercase",
                  color: "rgba(255,255,255,0.32)", marginTop: "8px",
                }}>{s.label}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
