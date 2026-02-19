import { useQuery } from "@tanstack/react-query";
import { getBarberDashboard } from "../services/payment";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { SkeletonCard } from "../components/ui/Skeleton";

export default function BarberDashboard() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["barber-dashboard"],
    queryFn: getBarberDashboard,
  });

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const stats = [
    {
      label: "Citas Hoy",
      value: data?.bookings_today ?? 0,
    },
    {
      label: "Citas Este Mes",
      value: data?.bookings_month ?? 0,
    },
    {
      label: "Ganancias Hoy",
      value: `$${(data?.earnings_today ?? 0).toFixed(2)}`,
    },
    {
      label: "Ganancias Mes",
      value: `$${(data?.earnings_month ?? 0).toFixed(2)}`,
    },
  ];

  return (
    <>
      <Header />
      <main
        style={{
          minHeight: "100vh",
          maxWidth: "960px",
          margin: "0 auto",
          padding: "8rem 1.5rem 4rem",
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "3rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 300,
                fontSize: "0.7rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "var(--gray-mid)",
                marginBottom: "0.5rem",
              }}
            >
              Panel de Barbero
            </p>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                fontWeight: 700,
                color: "var(--black)",
              }}
            >
              {user?.name || "Barbero"}
            </h1>
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={() => navigate("/wallet")}
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 300,
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                backgroundColor: "var(--black)",
                color: "var(--white)",
                border: "none",
                padding: "0.75rem 1.5rem",
                cursor: "pointer",
              }}
            >
              Mi Billetera
            </button>
            <button
              onClick={handleLogout}
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 300,
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                backgroundColor: "transparent",
                color: "var(--black)",
                border: "1px solid var(--gray-border)",
                padding: "0.75rem 1.5rem",
                cursor: "pointer",
              }}
            >
              Salir
            </button>
          </div>
        </div>

        {isLoading ? (
          <SkeletonCard />
        ) : (
          <>
            {/* Stats grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "1px",
                backgroundColor: "var(--gray-border)",
                border: "1px solid var(--gray-border)",
                marginBottom: "3rem",
              }}
            >
              {stats.map((s) => (
                <div
                  key={s.label}
                  style={{
                    backgroundColor: "var(--white)",
                    padding: "2rem",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontWeight: 300,
                      fontSize: "0.65rem",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "var(--gray-mid)",
                      marginBottom: "0.75rem",
                    }}
                  >
                    {s.label}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "2rem",
                      fontWeight: 700,
                      color: "var(--black)",
                    }}
                  >
                    {s.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Upcoming bookings */}
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "var(--black)",
                marginBottom: "1.5rem",
              }}
            >
              Proximas Citas
            </h2>

            {(!data?.upcoming_bookings ||
              data.upcoming_bookings.length === 0) && (
              <p
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 300,
                  fontSize: "0.85rem",
                  color: "var(--gray-mid)",
                }}
              >
                No hay citas programadas proximamente.
              </p>
            )}

            {data?.upcoming_bookings?.map((b) => (
              <div
                key={b.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr auto",
                  gap: "1rem",
                  padding: "1.25rem 0",
                  borderBottom: "1px solid var(--gray-border)",
                  alignItems: "center",
                }}
              >
                <div>
                  <p
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      color: "var(--black)",
                    }}
                  >
                    {b.client_name}
                  </p>
                  <p
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontWeight: 300,
                      fontSize: "0.75rem",
                      color: "var(--gray-mid)",
                    }}
                  >
                    {b.service_name}
                  </p>
                </div>
                <p
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 300,
                    fontSize: "0.85rem",
                    color: "var(--black)",
                  }}
                >
                  {new Date(b.slot_start).toLocaleDateString("es-MX", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 300,
                    fontSize: "0.85rem",
                    color: "var(--black)",
                  }}
                >
                  {new Date(b.slot_start).toLocaleTimeString("es-MX", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <span
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 300,
                    fontSize: "0.65rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color:
                      b.payment_status === "completed"
                        ? "green"
                        : "var(--gray-mid)",
                    backgroundColor:
                      b.payment_status === "completed"
                        ? "rgba(0,128,0,0.07)"
                        : "var(--gray-border)",
                    padding: "0.3rem 0.6rem",
                  }}
                >
                  {b.payment_status === "completed" ? "Pagado" : "Pendiente"}
                </span>
              </div>
            ))}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
