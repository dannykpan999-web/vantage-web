import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOwnerDashboard,
  approveWithdrawal,
  rejectWithdrawal,
} from "../services/payment";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { SkeletonCard } from "../components/ui/Skeleton";

export default function OwnerDashboard() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["owner-dashboard"],
    queryFn: getOwnerDashboard,
  });

  const approveMutation = useMutation({
    mutationFn: approveWithdrawal,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["owner-dashboard"] }),
  });

  const rejectMutation = useMutation({
    mutationFn: rejectWithdrawal,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["owner-dashboard"] }),
  });

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const topStats = [
    {
      label: "Ingresos Hoy",
      value: `$${(data?.revenue_today ?? 0).toFixed(2)}`,
    },
    {
      label: "Ingresos Mes",
      value: `$${(data?.revenue_month ?? 0).toFixed(2)}`,
    },
    {
      label: "Comision (15%)",
      value: `$${(data?.commission_month ?? 0).toFixed(2)}`,
    },
    {
      label: "Citas Mes",
      value: data?.bookings_month ?? 0,
    },
  ];

  return (
    <>
      <Header />
      <main
        style={{
          minHeight: "100vh",
          maxWidth: "1100px",
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
              Panel del Propietario
            </p>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                fontWeight: 700,
                color: "var(--black)",
              }}
            >
              Vantage Overview
            </h1>
          </div>

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

        {isLoading ? (
          <SkeletonCard />
        ) : (
          <>
            {/* Top stats */}
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
              {topStats.map((s) => (
                <div
                  key={s.label}
                  style={{ backgroundColor: "var(--white)", padding: "2rem" }}
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

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "3rem",
                alignItems: "start",
              }}
            >
              {/* Barber performance */}
              <div>
                <h2
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    color: "var(--black)",
                    marginBottom: "1.5rem",
                  }}
                >
                  Rendimiento Barberos
                </h2>

                {(!data?.barber_stats || data.barber_stats.length === 0) && (
                  <p
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontWeight: 300,
                      fontSize: "0.85rem",
                      color: "var(--gray-mid)",
                    }}
                  >
                    Sin datos aun.
                  </p>
                )}

                {data?.barber_stats?.map((b) => (
                  <div
                    key={b.barber_id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "1rem 0",
                      borderBottom: "1px solid var(--gray-border)",
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
                        {b.barber_name}
                      </p>
                      <p
                        style={{
                          fontFamily: "Montserrat, sans-serif",
                          fontWeight: 300,
                          fontSize: "0.75rem",
                          color: "var(--gray-mid)",
                        }}
                      >
                        {b.bookings_count} citas
                      </p>
                    </div>
                    <span
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        color: "var(--black)",
                      }}
                    >
                      ${Number(b.earnings).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Withdrawal requests */}
              <div>
                <h2
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    color: "var(--black)",
                    marginBottom: "1.5rem",
                  }}
                >
                  Solicitudes de Retiro
                </h2>

                {(!data?.pending_withdrawals ||
                  data.pending_withdrawals.length === 0) && (
                  <p
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontWeight: 300,
                      fontSize: "0.85rem",
                      color: "var(--gray-mid)",
                    }}
                  >
                    No hay solicitudes pendientes.
                  </p>
                )}

                {data?.pending_withdrawals?.map((w) => (
                  <div
                    key={w.id}
                    style={{
                      padding: "1.25rem 0",
                      borderBottom: "1px solid var(--gray-border)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "0.75rem",
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
                          {w.barber_name}
                        </p>
                        <p
                          style={{
                            fontFamily: "Montserrat, sans-serif",
                            fontWeight: 300,
                            fontSize: "0.75rem",
                            color: "var(--gray-mid)",
                          }}
                        >
                          {new Date(w.created_at).toLocaleDateString("es-MX")}
                        </p>
                      </div>
                      <span
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: "1.2rem",
                          fontWeight: 700,
                          color: "var(--black)",
                        }}
                      >
                        ${Number(w.amount).toFixed(2)}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => approveMutation.mutate(w.id)}
                        disabled={approveMutation.isPending}
                        style={{
                          flex: 1,
                          fontFamily: "Montserrat, sans-serif",
                          fontWeight: 300,
                          fontSize: "0.65rem",
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          backgroundColor: "var(--black)",
                          color: "var(--white)",
                          border: "none",
                          padding: "0.6rem",
                          cursor: "pointer",
                          opacity: approveMutation.isPending ? 0.5 : 1,
                        }}
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() => rejectMutation.mutate(w.id)}
                        disabled={rejectMutation.isPending}
                        style={{
                          flex: 1,
                          fontFamily: "Montserrat, sans-serif",
                          fontWeight: 300,
                          fontSize: "0.65rem",
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          backgroundColor: "transparent",
                          color: "var(--black)",
                          border: "1px solid var(--gray-border)",
                          padding: "0.6rem",
                          cursor: "pointer",
                          opacity: rejectMutation.isPending ? 0.5 : 1,
                        }}
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
