import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getPaymentStatus, sandboxComplete } from "../services/payment";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { SkeletonCard } from "../components/ui/Skeleton";

type Status = "pending" | "completed" | "failed" | "loading" | "simulating";

export default function Payment() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = params.get("booking_id");
  const paymentUrl = params.get("payment_url");
  const isSandbox = params.get("is_sandbox") === "true";

  const [status, setStatus] = useState<Status>("loading");
  const [pollCount, setPollCount] = useState(0);
  const [sandboxError, setSandboxError] = useState("");

  useEffect(() => {
    if (!bookingId) { setStatus("failed"); return; }

    // Sandbox mode: don't open Square window, don't poll — just show the simulate button
    if (isSandbox) {
      setStatus("pending");
      return;
    }

    // Real Square flow: open payment window + poll
    if (paymentUrl) {
      window.open(decodeURIComponent(paymentUrl), "_blank");
    }

    const interval = setInterval(async () => {
      try {
        const result = await getPaymentStatus(bookingId);
        if (result.status === "completed") {
          setStatus("completed");
          clearInterval(interval);
        } else if (result.status === "failed") {
          setStatus("failed");
          clearInterval(interval);
        } else {
          setStatus("pending");
          setPollCount((c) => c + 1);
        }
      } catch {
        // keep polling
      }
    }, 4000);

    setTimeout(() => clearInterval(interval), 300000);
    return () => clearInterval(interval);
  }, [bookingId, paymentUrl, isSandbox]);

  async function handleSandboxComplete() {
    if (!bookingId) return;
    setSandboxError("");
    setStatus("simulating");
    try {
      await sandboxComplete(bookingId);
      setStatus("completed");
    } catch {
      setSandboxError("Error al simular pago. Intenta de nuevo.");
      setStatus("pending");
    }
  }

  return (
    <>
      <Header />
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "8rem 1.5rem 4rem",
        }}
      >
        <div style={{ maxWidth: "480px", width: "100%", textAlign: "center" }}>
          {/* Logo mark */}
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.5rem",
              fontWeight: 700,
              letterSpacing: "0.15em",
              marginBottom: "3rem",
              color: "var(--black)",
            }}
          >
            VANTAGE
          </div>

          {status === "loading" && (
            <>
              <SkeletonCard />
              <p
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 300,
                  fontSize: "0.85rem",
                  color: "var(--gray-mid)",
                  marginTop: "1.5rem",
                }}
              >
                Iniciando pago...
              </p>
            </>
          )}

          {(status === "pending" || status === "simulating") && (
            <>
              {/* Pulsing ring */}
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  border: "2px solid var(--black)",
                  margin: "0 auto 2rem",
                  animation: "pulse 2s ease-in-out infinite",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: "var(--black)",
                  }}
                />
              </div>

              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  color: "var(--black)",
                  marginBottom: "1rem",
                }}
              >
                {isSandbox ? "Modo Prueba" : "Esperando Pago"}
              </h2>
              <p
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 300,
                  fontSize: "0.85rem",
                  color: "var(--gray-mid)",
                  lineHeight: 1.7,
                  marginBottom: "2rem",
                }}
              >
                {isSandbox
                  ? "Sistema de pagos en modo de prueba. Usa el boton de abajo para simular un pago completado."
                  : "Completa el pago en la ventana de Square.\nEsta pagina se actualizara automaticamente."}
              </p>

              {isSandbox && (
                <>
                  {sandboxError && (
                    <p
                      style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: "0.8rem",
                        color: "#c00",
                        marginBottom: "1rem",
                      }}
                    >
                      {sandboxError}
                    </p>
                  )}
                  <button
                    onClick={handleSandboxComplete}
                    disabled={status === "simulating"}
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontWeight: 500,
                      fontSize: "0.75rem",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      backgroundColor: "var(--black)",
                      color: "var(--white)",
                      border: "none",
                      padding: "1rem 2.5rem",
                      cursor: status === "simulating" ? "not-allowed" : "pointer",
                      opacity: status === "simulating" ? 0.6 : 1,
                    }}
                  >
                    {status === "simulating" ? "Procesando..." : "Simular Pago Completado"}
                  </button>
                </>
              )}

              {!isSandbox && (
                <p
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 300,
                    fontSize: "0.75rem",
                    color: "var(--gray-border)",
                    marginTop: "1rem",
                  }}
                >
                  Verificando pago automáticamente...
                </p>
              )}
            </>
          )}

          {status === "completed" && (
            <>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  backgroundColor: "var(--black)",
                  margin: "0 auto 2rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ color: "#fff", fontSize: "2rem" }}>✓</span>
              </div>

              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  color: "var(--black)",
                  marginBottom: "1rem",
                }}
              >
                Pago Confirmado
              </h2>
              <p
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 300,
                  fontSize: "0.85rem",
                  color: "var(--gray-mid)",
                  lineHeight: 1.7,
                  marginBottom: "2.5rem",
                }}
              >
                Tu reserva ha sido confirmada.
                <br />
                Nos vemos pronto en Vantage.
              </p>

              <button
                onClick={() => navigate("/booking")}
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 300,
                  fontSize: "0.75rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  backgroundColor: "var(--black)",
                  color: "var(--white)",
                  border: "none",
                  padding: "1rem 2.5rem",
                  cursor: "pointer",
                }}
              >
                Nueva Reserva
              </button>
            </>
          )}

          {status === "failed" && (
            <>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  border: "2px solid #c00",
                  margin: "0 auto 2rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ color: "#c00", fontSize: "2rem" }}>✕</span>
              </div>

              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  color: "var(--black)",
                  marginBottom: "1rem",
                }}
              >
                Pago No Completado
              </h2>
              <p
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 300,
                  fontSize: "0.85rem",
                  color: "var(--gray-mid)",
                  lineHeight: 1.7,
                  marginBottom: "2.5rem",
                }}
              >
                El pago no pudo procesarse.
                <br />
                Por favor intenta de nuevo.
              </p>

              <button
                onClick={() => navigate("/booking")}
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 300,
                  fontSize: "0.75rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  backgroundColor: "transparent",
                  color: "var(--black)",
                  border: "1px solid var(--black)",
                  padding: "1rem 2.5rem",
                  cursor: "pointer",
                }}
              >
                Volver a Reservar
              </button>
            </>
          )}
        </div>
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }
      `}</style>

      <Footer />
    </>
  );
}
