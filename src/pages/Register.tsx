import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/auth";
import { useAuthStore } from "../store/authStore";
import { useT } from "../i18n";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import type { UserRole } from "../types";

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const t = useT();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("customer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError(t("register.minPassword"));
      return;
    }
    setLoading(true);
    try {
      const data = await register({ name, email, password, role });
      setAuth(data.user, data.token);
      if (data.user.role === "owner") navigate("/owner-dashboard");
      else if (data.user.role === "barber") navigate("/barber-dashboard");
      else navigate("/booking");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : t("register.error");
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        .register-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .register-mobile-banner {
          position: relative;
          height: 200px;
          overflow: hidden;
          flex-shrink: 0;
        }
        .register-mobile-banner img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 30%;
          filter: brightness(0.4) grayscale(100%);
        }
        .register-mobile-banner-text {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .register-image-panel {
          display: none;
        }
        .register-image-panel img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 30%;
          filter: brightness(0.4) grayscale(100%);
        }
        .register-image-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 3rem;
        }
        .register-form-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 1.5rem 3rem;
          background: #fff;
        }
        .role-btn {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #e0e0e0;
          background: transparent;
          color: #000;
          font-family: Montserrat, sans-serif;
          font-weight: 300;
          font-size: 0.75rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .role-btn.active {
          background: #000;
          color: #fff;
          border-color: #000;
        }
        @media (min-width: 768px) {
          .register-root { flex-direction: row; }
          .register-mobile-banner { display: none; }
          .register-image-panel {
            display: block;
            position: relative;
            flex: 0 0 45%;
            overflow: hidden;
          }
          .register-form-panel {
            flex: 1;
            padding: 3rem 2rem;
          }
        }
      `}</style>

      <div className="register-root">

        {/* Mobile top banner */}
        <div className="register-mobile-banner">
          <img
            src="/images/gallery-2.webp"
            alt="Vantage"
            onError={(e) => {
              (e.currentTarget.parentElement as HTMLElement).style.background = "#111";
            }}
          />
          <div className="register-mobile-banner-text">
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 700, color: "#fff", letterSpacing: "0.15em" }}>
              VANTAGE
            </span>
            <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", letterSpacing: "0.15em" }}>
              {t("register.tagline")}
            </span>
          </div>
        </div>

        {/* Desktop side image panel */}
        <div className="register-image-panel">
          <img
            src="/images/gallery-2.webp"
            alt="Vantage"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="register-image-overlay">
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.2rem", fontWeight: 700, color: "#fff", letterSpacing: "0.15em", marginBottom: "0.5rem" }}>
              VANTAGE
            </h1>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", letterSpacing: "0.15em" }}>
              {t("register.tagline")}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="register-form-panel">
          <div style={{ width: "100%", maxWidth: "420px" }}>

            <Link to="/" style={{ display: "block", textAlign: "center", textDecoration: "none", marginBottom: "2rem" }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", fontWeight: 700, color: "#000", letterSpacing: "0.15em" }}>
                VANTAGE
              </span>
            </Link>

            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.7rem", fontWeight: 700, color: "#000", marginBottom: "0.5rem" }}>
              {t("register.title")}
            </h2>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.85rem", color: "#757575", marginBottom: "1.75rem" }}>
              {t("register.subtitle")}
            </p>

            {/* Role selector */}
            <div style={{ marginBottom: "1.75rem" }}>
              <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#757575", marginBottom: "0.75rem" }}>
                {t("register.accountType")}
              </p>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                {(["customer", "barber"] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`role-btn${role === r ? " active" : ""}`}
                  >
                    {r === "customer" ? t("register.customer") : t("register.barber")}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "1.25rem" }}>
                <Input label={t("register.fullName")} type="text" value={name}
                  onChange={(e) => setName(e.target.value)} required autoComplete="name" />
              </div>
              <div style={{ marginBottom: "1.25rem" }}>
                <Input label={t("register.email")} type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              </div>
              <div style={{ marginBottom: "1.75rem" }}>
                <Input label={t("register.password")} type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" showToggle />
              </div>

              {error && (
                <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "0.8rem", color: "#c00", marginBottom: "1rem", textAlign: "center" }}>
                  {error}
                </p>
              )}

              <Button type="submit" variant="primary" fullWidth loading={loading}>
                {t("register.submit")}
              </Button>
            </form>

            <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.8rem", color: "#757575", textAlign: "center", marginTop: "2rem" }}>
              {t("register.hasAccount")}{" "}
              <Link to="/login" style={{ color: "#000", textDecoration: "none", fontWeight: 600 }}>
                {t("register.login")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
