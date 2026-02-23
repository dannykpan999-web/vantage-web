import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/auth";
import { useAuthStore } from "../store/authStore";
import { useT } from "../i18n";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const t = useT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login({ email, password });
      setAuth(data.user, data.token);
      if (data.user.role === "owner") navigate("/owner-dashboard");
      else if (data.user.role === "barber") navigate("/barber-dashboard");
      else navigate("/booking");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : t("login.error");
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        /* ── Login layout ── */
        .login-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* Mobile top image banner */
        .login-mobile-banner {
          position: relative;
          height: 220px;
          overflow: hidden;
          flex-shrink: 0;
        }
        .login-mobile-banner img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 20%;
          filter: brightness(0.45) grayscale(100%);
        }
        .login-mobile-banner-text {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        /* Desktop side image panel (hidden on mobile) */
        .login-image-panel {
          display: none;
        }
        .login-image-panel img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 20%;
          filter: brightness(0.45) grayscale(100%);
        }
        .login-image-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 3rem;
        }

        /* Form panel */
        .login-form-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 1.5rem 3rem;
          background: #fff;
        }

        @media (min-width: 768px) {
          .login-root {
            flex-direction: row;
          }
          /* Hide mobile banner on desktop */
          .login-mobile-banner {
            display: none;
          }
          /* Show side panel on desktop */
          .login-image-panel {
            display: block;
            position: relative;
            flex: 0 0 45%;
            overflow: hidden;
          }
          .login-form-panel {
            flex: 1;
            padding: 3rem 2rem;
          }
        }
      `}</style>

      <div className="login-root">

        {/* ── Mobile top banner ── */}
        <div className="login-mobile-banner">
          <img
            src="/images/barber-1.webp"
            alt="Vantage"
            onError={(e) => {
              (e.currentTarget.parentElement!.style.background) = "#111";
            }}
          />
          <div className="login-mobile-banner-text">
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 700, color: "#fff", letterSpacing: "0.15em" }}>
              VANTAGE
            </span>
            <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", letterSpacing: "0.15em" }}>
              {t("login.tagline")}
            </span>
          </div>
        </div>

        {/* ── Desktop side image panel ── */}
        <div className="login-image-panel">
          <img
            src="/images/barber-1.webp"
            alt="Vantage"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="login-image-overlay">
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.2rem", fontWeight: 700, color: "#fff", letterSpacing: "0.15em", marginBottom: "0.5rem" }}>
              VANTAGE
            </h1>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", letterSpacing: "0.15em" }}>
              {t("login.tagline")}
            </p>
          </div>
        </div>

        {/* ── Form ── */}
        <div className="login-form-panel">
          <div style={{ width: "100%", maxWidth: "380px" }}>

            {/* Logo (desktop only since mobile banner shows it) */}
            <Link to="/" style={{ display: "block", textAlign: "center", textDecoration: "none", marginBottom: "2.5rem" }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", fontWeight: 700, color: "#000", letterSpacing: "0.15em" }}>
                VANTAGE
              </span>
            </Link>

            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.7rem", fontWeight: 700, color: "#000", marginBottom: "0.5rem" }}>
              {t("login.welcome")}
            </h2>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.85rem", color: "#757575", marginBottom: "2.5rem" }}>
              {t("login.subtitle")}
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "1.5rem" }}>
                <Input label={t("login.email")} type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              </div>
              <div style={{ marginBottom: "2rem" }}>
                <Input label={t("login.password")} type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
              </div>

              {error && (
                <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "0.8rem", color: "#c00", marginBottom: "1rem", textAlign: "center" }}>
                  {error}
                </p>
              )}

              <Button type="submit" variant="primary" fullWidth loading={loading}>
                {t("login.submit")}
              </Button>
            </form>

            <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.8rem", color: "#757575", textAlign: "center", marginTop: "2rem" }}>
              {t("login.noAccount")}{" "}
              <Link to="/register" style={{ color: "#000", textDecoration: "none", fontWeight: 600 }}>
                {t("login.register")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
