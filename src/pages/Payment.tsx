import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getPaymentStatus, sandboxComplete } from "../services/payment";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { SkeletonCard } from "../components/ui/Skeleton";

type Status = "pending" | "completed" | "failed" | "loading" | "simulating";

interface BookingCtx {
  barberName: string;
  date: string;
  time: string;
  serviceName: string;
  servicePrice: number;
  balanceMethod: "local" | "online";
  selectedTip: 15 | 20 | 25 | null;
  cartItems?: { name: string; price: number; quantity: number }[];
  productTotal?: number;
}

function readCtx(): BookingCtx | null {
  try {
    const raw = sessionStorage.getItem("vantage_booking_ctx");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export default function Payment() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = params.get("booking_id");
  const paymentUrl = params.get("payment_url");
  const isSandbox = params.get("is_sandbox") === "true";

  const [status, setStatus] = useState<Status>("loading");
  const [pollCount, setPollCount] = useState(0);
  const [sandboxError, setSandboxError] = useState("");
  const [bookingCtx] = useState<BookingCtx | null>(readCtx);

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
              {/* Animated check circle */}
              <div
                style={{
                  width: "88px",
                  height: "88px",
                  borderRadius: "50%",
                  backgroundColor: "var(--black)",
                  margin: "0 auto 2rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: "scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
                }}
              >
                <span style={{ color: "#fff", fontSize: "2.2rem", lineHeight: 1 }}>✓</span>
              </div>

              <p
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 300,
                  fontSize: "0.68rem",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: "var(--gray-mid)",
                  marginBottom: "0.75rem",
                }}
              >
                Depósito recibido
              </p>

              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1.6rem",
                  fontWeight: 700,
                  color: "var(--black)",
                  marginBottom: "0.5rem",
                  lineHeight: 1.3,
                }}
              >
                {bookingCtx
                  ? <>Tu silla con {bookingCtx.barberName}</>
                  : "Reserva Garantizada"}
              </h2>

              {bookingCtx && (
                <p
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 300,
                    fontSize: "0.85rem",
                    color: "var(--gray-mid)",
                    lineHeight: 1.7,
                    marginBottom: "0.25rem",
                  }}
                >
                  está garantizada para el{" "}
                  <strong style={{ fontWeight: 600, color: "var(--black)" }}>
                    {new Date(bookingCtx.date + "T12:00:00").toLocaleDateString("es-MX", {
                      weekday: "long", day: "numeric", month: "long",
                    })}
                  </strong>{" "}
                  a las{" "}
                  <strong style={{ fontWeight: 600, color: "var(--black)" }}>
                    {bookingCtx.time}
                  </strong>.
                </p>
              )}

              {/* Balance summary card */}
              {bookingCtx && (
                <div
                  style={{
                    border: "1px solid var(--gray-border)",
                    padding: "1.5rem",
                    marginTop: "2rem",
                    marginBottom: "2rem",
                    textAlign: "left",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontWeight: 300,
                      fontSize: "0.65rem",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "#aaa",
                      marginBottom: "1rem",
                    }}
                  >
                    Resumen de Pago
                  </p>
                  {/* Product items */}
                  {bookingCtx.cartItems && bookingCtx.cartItems.length > 0 && (
                    <>
                      <p
                        style={{
                          fontFamily: "Montserrat, sans-serif",
                          fontWeight: 300,
                          fontSize: "0.62rem",
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          color: "#bbb",
                          marginBottom: "0.4rem",
                          marginTop: "0.25rem",
                        }}
                      >
                        Productos pagados
                      </p>
                      {bookingCtx.cartItems.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "0.4rem 0",
                            borderBottom: "1px solid #f8f8f8",
                          }}
                        >
                          <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.75rem", color: "var(--gray-mid)" }}>
                            {item.name} × {item.quantity}
                          </span>
                          <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 500, fontSize: "0.78rem", color: "var(--black)" }}>
                            ${(item.price * item.quantity).toFixed(2)} ✅
                          </span>
                        </div>
                      ))}
                    </>
                  )}

                  {/* Standard summary rows */}
                  {[
                    {
                      label: bookingCtx.productTotal && bookingCtx.productTotal > 0
                        ? `Depósito de reserva pagado ✅`
                        : "Depósito pagado (online) ✅",
                      value: `$${(10 + (bookingCtx.productTotal || 0)).toFixed(2)}`,
                    },
                    {
                      label: "Balance del servicio",
                      value: `$${(bookingCtx.servicePrice - 10).toFixed(2)}`,
                    },
                    {
                      label: "Método de balance",
                      value: bookingCtx.balanceMethod === "local"
                        ? "En el local (efectivo o tarjeta)"
                        : "Pago online",
                    },
                    ...(bookingCtx.selectedTip
                      ? [{
                          label: "Propina sugerida",
                          value: `$${((bookingCtx.servicePrice * bookingCtx.selectedTip) / 100).toFixed(2)} (${bookingCtx.selectedTip}%)`,
                        }]
                      : []),
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "0.5rem 0",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Montserrat, sans-serif",
                          fontWeight: 300,
                          fontSize: "0.75rem",
                          color: "var(--gray-mid)",
                        }}
                      >
                        {label}
                      </span>
                      <span
                        style={{
                          fontFamily: "Montserrat, sans-serif",
                          fontWeight: 500,
                          fontSize: "0.82rem",
                          color: "var(--black)",
                        }}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <button
                  onClick={() => navigate("/booking")}
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
                    cursor: "pointer",
                  }}
                >
                  Nueva Reserva
                </button>
                <button
                  onClick={() => navigate("/mis-reservas")}
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 300,
                    fontSize: "0.72rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    backgroundColor: "transparent",
                    color: "var(--black)",
                    border: "1px solid var(--gray-border)",
                    padding: "0.85rem 2.5rem",
                    cursor: "pointer",
                  }}
                >
                  Ver mis Reservas
                </button>
              </div>
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
        @keyframes scaleIn {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <Footer />
    </>
  );
}
