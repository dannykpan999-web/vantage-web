import { useEffect, useState } from "react";
import { useInView } from "../../hooks/useInView";

const stats = [
  {
    count: 500, suffix: "+", label: "Citas Reservadas", decimals: 0,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    count: 4.9, suffix: "★", label: "Calificación", decimals: 1,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
  {
    count: 12, suffix: "+", label: "Barberos", decimals: 0,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0-3-3.85"/>
      </svg>
    ),
  },
  {
    count: 3, suffix: "", label: "Sucursales", decimals: 0,
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
  },
];

function StatItem({ count, suffix, label, icon, decimals, inView, delay }: {
  count: number; suffix: string; label: string; icon: React.ReactNode;
  decimals: number; inView: boolean; delay: number;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(parseFloat((count * eased).toFixed(decimals)));
      if (step >= steps) { setDisplay(count); clearInterval(timer); }
    }, interval);
    return () => clearInterval(timer);
  }, [inView, count, decimals]);

  return (
    <div
      style={{
        textAlign: "center",
        minWidth: "100px",
        opacity: 0,
        animation: inView ? `fadeInUp 0.7s ease-out ${delay}s forwards` : "none",
      }}
    >
      <div style={{ color: "#000", marginBottom: "12px", display: "flex", justifyContent: "center" }}>
        {icon}
      </div>
      <div style={{
        fontFamily: "'Playfair Display',serif",
        fontSize: "clamp(22px,3vw,34px)", fontWeight: 400,
        color: "#000", lineHeight: 1, marginBottom: "6px",
      }}>
        {decimals > 0 ? display.toFixed(decimals) : Math.floor(display)}{suffix}
      </div>
      <div style={{
        fontFamily: "Montserrat,sans-serif",
        fontSize: "10px", fontWeight: 500,
        letterSpacing: "2px", textTransform: "uppercase", color: "#757575",
      }}>{label}</div>
    </div>
  );
}

export default function SocialProof() {
  const [ref, inView] = useInView();

  return (
    <section style={{
      borderTop: "1px solid #e5e5e5", borderBottom: "1px solid #e5e5e5",
      padding: "40px clamp(24px,8vw,120px)",
    }}>
      <div
        ref={ref}
        style={{
          maxWidth: "1400px", margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "space-around",
          flexWrap: "wrap", gap: "32px",
        }}
      >
        {stats.map((s, i) => (
          <StatItem key={i} {...s} inView={inView} delay={i * 0.12} />
        ))}
      </div>
    </section>
  );
}
