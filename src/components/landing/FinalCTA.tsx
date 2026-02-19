import { useNavigate } from "react-router-dom";

export default function FinalCTA() {
  const navigate = useNavigate();

  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "500px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Background image */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/images/hero-2.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.3) grayscale(100%)",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          padding: "5rem 1.5rem",
          maxWidth: "700px",
          margin: "0 auto",
        }}
      >
        {/* Thin decorative line */}
        <div
          style={{
            width: "1px",
            height: "60px",
            backgroundColor: "rgba(255,255,255,0.4)",
            margin: "0 auto 2.5rem",
          }}
        />

        <p
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 300,
            fontSize: "0.7rem",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.6)",
            marginBottom: "1.5rem",
          }}
        >
          Vantage Barbershop
        </p>

        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.2,
            marginBottom: "1.5rem",
          }}
        >
          Tu Proximo Nivel
          <br />
          Empieza Aqui
        </h2>

        <p
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 300,
            fontSize: "1rem",
            color: "rgba(255,255,255,0.7)",
            marginBottom: "3rem",
            lineHeight: 1.7,
          }}
        >
          Reserva ahora y descubre por que miles de hombres
          <br />
          confian en Vantage para su imagen.
        </p>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => navigate("/register")}
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 300,
              fontSize: "0.75rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              backgroundColor: "#fff",
              color: "#000",
              border: "none",
              padding: "1rem 2.5rem",
              cursor: "pointer",
              transition: "opacity 0.3s ease",
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "0.85";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "1";
            }}
          >
            Crear Cuenta
          </button>

          <button
            onClick={() => navigate("/booking")}
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 300,
              fontSize: "0.75rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              backgroundColor: "transparent",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.5)",
              padding: "1rem 2.5rem",
              cursor: "pointer",
              transition: "border-color 0.3s ease",
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#fff";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "rgba(255,255,255,0.5)";
            }}
          >
            Reservar Cita
          </button>
        </div>

        {/* Thin decorative line bottom */}
        <div
          style={{
            width: "1px",
            height: "60px",
            backgroundColor: "rgba(255,255,255,0.4)",
            margin: "3rem auto 0",
          }}
        />
      </div>
    </section>
  );
}
