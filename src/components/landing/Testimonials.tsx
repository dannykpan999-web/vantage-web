import { useState, useEffect } from "react";

const testimonials = [
  {
    name: "Carlos M.",
    role: "Cliente Regular",
    text: "La experiencia en Vantage es incomparable. Desde la reserva hasta el corte final, todo es perfecto. Mi barbero Marcus siempre sabe exactamente lo que necesito.",
    rating: 5,
    since: "Cliente desde 2022",
  },
  {
    name: "Roberto S.",
    role: "Ejecutivo",
    text: "Por fin una barberia que respeta mi tiempo. Reservo en 30 segundos, llego y me atienden de inmediato. El nivel de detalle en cada servicio es extraordinario.",
    rating: 5,
    since: "Cliente desde 2023",
  },
  {
    name: "Alejandro P.",
    role: "Profesional Creativo",
    text: "Diego entiende perfectamente lo que busco. Llevaba anos buscando un barbero que pudiera materializar mis ideas. Vantage es mi lugar.",
    rating: 5,
    since: "Cliente desde 2022",
  },
  {
    name: "Miguel F.",
    role: "Empresario",
    text: "El sistema de pago digital hace todo mucho mas comodo. Puedo gestionar mis citas y pagos desde el movil. La calidad del servicio habla por si sola.",
    rating: 5,
    since: "Cliente desde 2023",
  },
];

export default function Testimonials() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const t = testimonials[active];

  return (
    <section
      style={{
        padding: "var(--section-pad) 1.5rem",
        maxWidth: "var(--max-width)",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      {/* Label */}
      <p
        style={{
          fontFamily: "Montserrat, sans-serif",
          fontWeight: 300,
          fontSize: "0.7rem",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "var(--gray-mid)",
          marginBottom: "1rem",
        }}
      >
        Testimonios
      </p>

      {/* Stars */}
      <div style={{ marginBottom: "2rem" }}>
        {Array.from({ length: t.rating }).map((_, i) => (
          <span
            key={i}
            style={{
              color: "var(--black)",
              fontSize: "0.9rem",
              marginRight: "0.2rem",
            }}
          >
            ★
          </span>
        ))}
      </div>

      {/* Quote */}
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto 2.5rem",
          minHeight: "120px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <blockquote
          key={active}
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)",
            fontWeight: 400,
            fontStyle: "italic",
            color: "var(--black)",
            lineHeight: 1.6,
            animation: "fadeIn 0.5s ease forwards",
            margin: 0,
          }}
        >
          &ldquo;{t.text}&rdquo;
        </blockquote>
      </div>

      {/* Author */}
      <div style={{ marginBottom: "3rem" }}>
        <p
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 600,
            fontSize: "0.85rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--black)",
            marginBottom: "0.3rem",
          }}
        >
          {t.name}
        </p>
        <p
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 300,
            fontSize: "0.75rem",
            letterSpacing: "0.08em",
            color: "var(--gray-mid)",
          }}
        >
          {t.role} &mdash; {t.since}
        </p>
      </div>

      {/* Dot indicators */}
      <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            style={{
              width: i === active ? "2rem" : "0.5rem",
              height: "2px",
              border: "none",
              backgroundColor: i === active ? "var(--black)" : "var(--gray-border)",
              cursor: "pointer",
              padding: 0,
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>
    </section>
  );
}
