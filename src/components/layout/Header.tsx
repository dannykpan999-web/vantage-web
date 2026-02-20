import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

// Desktop nav (Shop handled separately in overlay for highlight)
const LANDING_NAV = [
  { label: "Studio",  id: "servicios" },
  { label: "Equipo",  id: "equipo"    },
  { label: "Galería", id: "galeria"   },
  { label: "Shop",    id: "shop"      },
];

// Mobile overlay nav — split around Shop (rendered highlighted between Studio and Equipo)
const MOBILE_NAV_TOP = [
  { label: "Inicio",  id: "" },
  { label: "Studio",  id: "servicios" },
];
const MOBILE_NAV_BOT = [
  { label: "Equipo",  id: "equipo"    },
  { label: "Galería", id: "galeria"   },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate  = useNavigate();
  const location  = useLocation();
  const isLanding = location.pathname === "/";

  useEffect(() => {
    setScrolled(window.scrollY > 40);
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, [location.pathname]);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const handleLogout = () => { logout(); navigate("/"); };

  const dashPath =
    user?.role === "owner"  ? "/owner-dashboard"  :
    user?.role === "barber" ? "/barber-dashboard" :
    "/booking";

  const transparent = isLanding && !scrolled;
  const bg        = transparent ? "transparent"                : "rgba(255,255,255,0.97)";
  const blur      = transparent ? "none"                       : "blur(12px)";
  const border    = transparent ? "none"                       : "1px solid #e5e5e5";
  const textColor = transparent ? "#fff"                       : "#000";
  const shadow    = transparent ? "0 1px 8px rgba(0,0,0,0.3)" : "none";

  function handleNavClick(sectionId: string) {
    setMenuOpen(false);
    if (!sectionId) {
      // "Inicio" — scroll to top
      if (isLanding) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        navigate("/");
      }
      return;
    }
    if (isLanding) {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = "/#" + sectionId;
    }
  }

  const navStyle: React.CSSProperties = {
    fontFamily: "Montserrat,sans-serif",
    fontSize: "12px", fontWeight: 500,
    letterSpacing: "2px", textTransform: "uppercase",
    color: textColor, textDecoration: "none",
    background: "none", border: "none",
    cursor: "pointer", padding: 0,
    textShadow: shadow, transition: "opacity 0.2s",
  };

  return (
    <>
      <style>{`
        .v-desktop-nav { display: flex; align-items: center; gap: 36px; }
        .v-mobile-right { display: none; align-items: center; gap: 10px; }
        .v-hamburger { display: flex; flex-direction: column; gap: 5px;
          background: none; border: none; cursor: pointer; padding: 8px; }
        .v-nav-item:hover { opacity: 0.5; }
        @media (max-width: 768px) {
          .v-desktop-nav { display: none; }
          .v-mobile-right { display: flex; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>

      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: bg, backdropFilter: blur, borderBottom: border,
        transition: "all 0.4s ease-in-out",
        padding: "0 clamp(24px,6vw,80px)",
      }}>
        <nav style={{
          maxWidth: "1400px", margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: "72px",
        }}>
          <Link to="/" style={{
            fontFamily: "'Playfair Display',serif", fontSize: "22px", fontWeight: 400,
            color: textColor, letterSpacing: "0.06em", textDecoration: "none",
            transition: "color 0.4s ease-in-out", textShadow: shadow,
          }}>VANTAGE</Link>

          {/* Desktop nav */}
          <div className="v-desktop-nav">
            {!isAuthenticated && (
              <>
                {LANDING_NAV.map(item => (
                  <button key={item.id} className="v-nav-item"
                    onClick={() => handleNavClick(item.id)} style={navStyle}>
                    {item.label}
                  </button>
                ))}
                <Link to="/login" className="v-nav-item" style={navStyle}>Ingresar</Link>
                <Link to="/booking" style={{
                  background: transparent ? "rgba(255,255,255,0.95)" : "#000",
                  color: transparent ? "#000" : "#fff",
                  padding: "10px 24px",
                  fontFamily: "Montserrat,sans-serif", fontSize: "11px", fontWeight: 500,
                  letterSpacing: "2px", textTransform: "uppercase",
                  borderRadius: "1px", textDecoration: "none",
                  transition: "all 0.3s ease-in-out",
                }}>Reservar</Link>
              </>
            )}
            {isAuthenticated && (
              <>
                {user?.role === "customer" && (
                  <Link to="/booking" className="v-nav-item" style={navStyle}>Reservar</Link>
                )}
                {user?.role === "barber" && (
                  <Link to="/wallet" className="v-nav-item" style={navStyle}>Billetera</Link>
                )}
                <Link to={dashPath} className="v-nav-item" style={{ ...navStyle, fontWeight: 600 }}>Panel</Link>
                <button onClick={handleLogout} className="v-nav-item"
                  style={{ ...navStyle, fontWeight: 600, color: textColor }}>Salir</button>
              </>
            )}
          </div>

          {/* Mobile right: sticky RESERVAR + hamburger */}
          <div className="v-mobile-right">
            {/* Sticky RESERVAR — always visible on mobile */}
            {!isAuthenticated && (
              <Link to="/booking" style={{
                fontFamily: "Montserrat,sans-serif", fontSize: "10px", fontWeight: 600,
                letterSpacing: "1.5px", textTransform: "uppercase",
                background: transparent ? "rgba(255,255,255,0.92)" : "#000",
                color: transparent ? "#000" : "#fff",
                padding: "8px 14px",
                textDecoration: "none",
                whiteSpace: "nowrap",
                transition: "all 0.4s ease-in-out",
              }}>Reservar</Link>
            )}

            {/* Hamburger icon */}
            <button className="v-hamburger" onClick={() => setMenuOpen(true)} aria-label="Abrir menu">
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  display: "block", width: "22px", height: "1.5px",
                  backgroundColor: textColor, transition: "background 0.4s",
                }} />
              ))}
            </button>
          </div>
        </nav>
      </header>

      {/* Full-screen mobile overlay — slides in from right */}
      {menuOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          backgroundColor: "#060606",
          display: "flex", flexDirection: "column",
          padding: "0 clamp(32px,8vw,64px)",
          animation: "slideInRight 0.38s cubic-bezier(0.25,0.46,0.45,0.94) forwards",
        }}>
          {/* Top bar inside overlay */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            height: "72px", flexShrink: 0,
          }}>
            <span style={{
              fontFamily: "'Playfair Display',serif", fontSize: "22px",
              fontWeight: 400, color: "#fff", letterSpacing: "0.06em",
            }}>VANTAGE</span>
            <button onClick={() => setMenuOpen(false)} aria-label="Cerrar menu" style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#fff", fontSize: "32px", fontWeight: 200, lineHeight: 1,
              padding: "12px 16px", margin: "-12px -16px",
              minWidth: "56px", minHeight: "56px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>×</button>
          </div>
          <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.08)" }} />

          {/* Nav items */}
          <nav style={{
            flex: 1, display: "flex", flexDirection: "column",
            justifyContent: "center", gap: "clamp(16px,3vh,32px)",
          }}>
            {!isAuthenticated && (
              <>
                {/* Inicio + Studio */}
                {MOBILE_NAV_TOP.map((item, i) => (
                  <button key={item.label} onClick={() => handleNavClick(item.id)}
                    style={{
                      fontFamily: "'Playfair Display',serif",
                      fontSize: "clamp(26px,7vw,48px)", fontWeight: 400,
                      color: "#fff", background: "none", border: "none",
                      cursor: "pointer", textAlign: "left", padding: 0,
                      letterSpacing: "0.03em", opacity: 0,
                      animation: `fadeIn 0.4s ease ${0.04 + i * 0.07}s forwards`,
                    }}>
                    {item.label}
                  </button>
                ))}

                {/* SHOP — highlighted with gold color + bag icon (position 3, after Studio) */}
                <button onClick={() => handleNavClick("shop")}
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: "clamp(26px,7vw,48px)", fontWeight: 700,
                    color: "#D4A020", background: "none", border: "none",
                    cursor: "pointer", textAlign: "left", padding: 0,
                    letterSpacing: "0.03em", opacity: 0,
                    animation: "fadeIn 0.4s ease 0.18s forwards",
                    display: "flex", alignItems: "center", gap: "14px",
                  }}>
                  <svg width="clamp(22px,4.5vw,32px)" height="clamp(22px,4.5vw,32px)"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 01-8 0"/>
                  </svg>
                  Shop
                </button>

                {/* Equipo + Galería */}
                {MOBILE_NAV_BOT.map((item, i) => (
                  <button key={item.label} onClick={() => handleNavClick(item.id)}
                    style={{
                      fontFamily: "'Playfair Display',serif",
                      fontSize: "clamp(26px,7vw,48px)", fontWeight: 400,
                      color: "#fff", background: "none", border: "none",
                      cursor: "pointer", textAlign: "left", padding: 0,
                      letterSpacing: "0.03em", opacity: 0,
                      animation: `fadeIn 0.4s ease ${0.25 + i * 0.07}s forwards`,
                    }}>
                    {item.label}
                  </button>
                ))}

                <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.1)", margin: "4px 0" }} />

                <button onClick={() => { setMenuOpen(false); navigate("/login"); }}
                  style={{
                    fontFamily: "Montserrat,sans-serif", fontSize: "13px", fontWeight: 500,
                    letterSpacing: "2px", textTransform: "uppercase",
                    color: "rgba(255,255,255,0.75)", background: "none", border: "none",
                    cursor: "pointer", textAlign: "left", padding: 0, opacity: 0,
                    animation: "fadeIn 0.4s ease 0.44s forwards",
                  }}>Iniciar Sesión</button>

                <button onClick={() => { setMenuOpen(false); navigate("/booking"); }}
                  style={{
                    fontFamily: "Montserrat,sans-serif", fontSize: "11px", fontWeight: 500,
                    letterSpacing: "2px", textTransform: "uppercase",
                    color: "#000", backgroundColor: "#fff", border: "none",
                    cursor: "pointer", padding: "20px 0",
                    alignSelf: "stretch", textAlign: "center", opacity: 0,
                    animation: "fadeIn 0.4s ease 0.52s forwards",
                  }}>Reservar Ahora</button>
              </>
            )}

            {isAuthenticated && (
              <>
                {user?.role === "customer" && (
                  <button onClick={() => { setMenuOpen(false); navigate("/booking"); }}
                    style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(26px,7vw,48px)", fontWeight: 400, color: "#fff", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0, opacity: 0, animation: "fadeIn 0.4s ease 0.04s forwards" }}>
                    Reservar
                  </button>
                )}
                {user?.role === "barber" && (
                  <button onClick={() => { setMenuOpen(false); navigate("/wallet"); }}
                    style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(26px,7vw,48px)", fontWeight: 400, color: "#fff", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0, opacity: 0, animation: "fadeIn 0.4s ease 0.04s forwards" }}>
                    Billetera
                  </button>
                )}
                <button onClick={() => { setMenuOpen(false); navigate(dashPath); }}
                  style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(26px,7vw,48px)", fontWeight: 400, color: "#fff", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0, opacity: 0, animation: "fadeIn 0.4s ease 0.1s forwards" }}>
                  Panel
                </button>
                <button onClick={() => { setMenuOpen(false); handleLogout(); }}
                  style={{ fontFamily: "Montserrat,sans-serif", fontSize: "11px", fontWeight: 500, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0, opacity: 0, animation: "fadeIn 0.4s ease 0.18s forwards" }}>
                  Salir
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
