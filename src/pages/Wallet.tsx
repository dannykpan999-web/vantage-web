import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getWallet,
  getTransactions,
  requestWithdrawal,
} from "../services/payment";
import { useAuthStore } from "../store/authStore";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { SkeletonCard } from "../components/ui/Skeleton";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function Wallet() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [wdError, setWdError] = useState("");
  const [wdSuccess, setWdSuccess] = useState(false);

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ["wallet"],
    queryFn: getWallet,
  });

  const { data: transactions, isLoading: txLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: getTransactions,
  });

  const withdrawMutation = useMutation({
    mutationFn: () => requestWithdrawal(parseFloat(withdrawAmount)),
    onSuccess: () => {
      setWdSuccess(true);
      setWithdrawAmount("");
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (err: Error) => {
      setWdError(err.message || "Error al solicitar retiro");
    },
  });

  function handleWithdraw(e: React.FormEvent) {
    e.preventDefault();
    setWdError("");
    setWdSuccess(false);
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0) {
      setWdError("Ingresa un monto valido");
      return;
    }
    if (wallet && amt > Number(wallet.available_balance)) {
      setWdError("Saldo insuficiente");
      return;
    }
    withdrawMutation.mutate();
  }

  return (
    <>
      <Header />
      <main
        style={{
          minHeight: "100vh",
          maxWidth: "900px",
          margin: "0 auto",
          padding: "8rem 1.5rem 4rem",
        }}
      >
        {/* Page title */}
        <div style={{ marginBottom: "3rem" }}>
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
            Mi Billetera
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

        {/* Balance cards */}
        {walletLoading ? (
          <SkeletonCard />
        ) : wallet ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1px",
              backgroundColor: "var(--gray-border)",
              border: "1px solid var(--gray-border)",
              marginBottom: "3rem",
            }}
          >
            {[
              {
                label: "Saldo Disponible",
                value: `$${Number(wallet.available_balance).toFixed(2)}`,
              },
              {
                label: "Saldo Pendiente",
                value: `$${Number(wallet.pending_balance).toFixed(2)}`,
              },
              {
                label: "Total Ganado",
                value: `$${Number(wallet.total_earned).toFixed(2)}`,
              },
            ].map((card) => (
              <div
                key={card.label}
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
                  {card.label}
                </p>
                <p
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "2rem",
                    fontWeight: 700,
                    color: "var(--black)",
                  }}
                >
                  {card.value}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "3rem",
            alignItems: "start",
          }}
        >
          {/* Withdrawal form */}
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
              Solicitar Retiro
            </h2>

            <form onSubmit={handleWithdraw}>
              <div style={{ marginBottom: "1.5rem" }}>
                <Input
                  label="Monto a retirar (USD)"
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  required
                />
              </div>

              {wdError && (
                <p
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: "0.8rem",
                    color: "#c00",
                    marginBottom: "1rem",
                  }}
                >
                  {wdError}
                </p>
              )}
              {wdSuccess && (
                <p
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: "0.8rem",
                    color: "green",
                    marginBottom: "1rem",
                  }}
                >
                  Solicitud enviada. El dueno la revisara pronto.
                </p>
              )}

              <Button
                type="submit"
                variant="primary"
                loading={withdrawMutation.isPending}
              >
                Solicitar Retiro
              </Button>
            </form>
          </div>

          {/* Transaction list */}
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
              Historial
            </h2>

            {txLoading && <SkeletonCard />}
            {transactions && transactions.length === 0 && (
              <p
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 300,
                  fontSize: "0.85rem",
                  color: "var(--gray-mid)",
                }}
              >
                Sin transacciones aun.
              </p>
            )}
            {transactions &&
              transactions.map((tx) => (
                <div
                  key={tx.id}
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
                        fontWeight: 300,
                        fontSize: "0.8rem",
                        color: "var(--black)",
                        textTransform: "capitalize",
                      }}
                    >
                      {tx.type.replace("_", " ")}
                    </p>
                    <p
                      style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontWeight: 300,
                        fontSize: "0.7rem",
                        color: "var(--gray-mid)",
                        marginTop: "0.2rem",
                      }}
                    >
                      {new Date(tx.created_at).toLocaleDateString("es-MX")}
                    </p>
                  </div>
                  <span
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: tx.type === "debit" ? "#c00" : "var(--black)",
                    }}
                  >
                    {tx.type === "debit" ? "-" : "+"}$
                    {Number(tx.amount).toFixed(2)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
