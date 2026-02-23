import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useLanguageStore } from "../../store/languageStore";
import { useT } from "../../i18n";

// ─── Gold accent token (client spec: #C5A059) ───────────────────────────────
const GOLD = "#C5A059";
const GOLD_BORDER = "rgba(197,160,89,0.35)"; // 35% opacity per client
const TEXT_MAIN   = "#E0E0E0";               // soft silver (client spec)
const GOLD_GRADIENT = "linear-gradient(135deg, #6B4410 0%, #C5A059 50%, #D4BE80 100%)";

const LANDING_NAV = [
  { key: "nav.services" as const, id: "servicios" },
  { key: "nav.team"     as const, id: "equipo"    },
  { key: "nav.studio"   as const, id: "galeria"   },
  { key: "nav.shop"     as const, id: "shop"      },
];

const MOBILE_NAV = [
  { key: "nav.services" as const, id: "servicios" },
  { key: "nav.team"     as const, id: "equipo"    },
  { key: "nav.studio"   as const, id: "galeria"   },
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const days   = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
  const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  return `${days[d.getDay()]}, ${d.getDate()} de ${months[d.getMonth()]}`;
}

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour  = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export default function Header() {
  const [scrolled,     setScrolled]     = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [nextBooking,  setNextBooking]  = useState<{
    service: string; barber: string; date: string; time: string;
  } | null>(null);

  const { isAuthenticated, user, token, logout } = useAuthStore();
  const { lang, toggleLang } = useLanguageStore();
  const t = useT();
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

  // Fetch next upcoming booking for authenticated customer
  useEffect(() => {
    if (!menuOpen || !isAuthenticated || user?.role !== "customer" || !token) return;
    fetch("/api/bookings/mine", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then((bookings: any[]) => {
        const today = new Date().toISOString().split("T")[0];
        const upcoming = bookings
          .filter(b => b.status === "confirmed" && b.slot?.date >= today)
          .sort((a, b) => a.slot.date !== b.slot.date
            ? a.slot.date.localeCompare(b.slot.date)
            : a.slot.start_time.localeCompare(b.slot.start_time));
        if (upcoming.length > 0) {
          const n = upcoming[0];
          setNextBooking({
            service: n.service?.name ?? "Servicio",
            barber:  n.barber?.name  ?? "Barbero",
            date:    formatDate(n.slot.date),
            time:    formatTime(n.slot.start_time),
          });
        } else {
          setNextBooking(null);
        }
      })
      .catch(() => {});
  }, [menuOpen, isAuthenticated, user?.role, token]);

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
      if (isLanding) { window.scrollTo({ top: 0, behavior: "smooth" }); }
      else { navigate("/"); }
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
        .v-hamburger    { display: flex; flex-direction: column; gap: 5px;
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
        /* Mobile nav hover/touch feedback */
        .vm-nav-btn { transition: color 0.25s ease, opacity 0.22s ease !important; }
        .vm-nav-btn:active { opacity: 0.45 !important; }
        .vm-reservar:hover { opacity: 0.88; }
        .vm-reservar:active { opacity: 0.7; }
      `}</style>

      {/* ─── Fixed header bar ─────────────────────────────────────────────── */}
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
                    {t(item.key)}
                  </button>
                ))}
                <Link to="/login" className="v-nav-item" style={navStyle}>{t("nav.signin")}</Link>
                <Link to="/booking" style={{
                  background: transparent ? "rgba(255,255,255,0.95)" : "#000",
                  color: transparent ? "#000" : "#fff",
                  padding: "10px 24px",
                  fontFamily: "Montserrat,sans-serif", fontSize: "11px", fontWeight: 500,
                  letterSpacing: "2px", textTransform: "uppercase",
                  borderRadius: "1px", textDecoration: "none",
                  transition: "all 0.3s ease-in-out",
                }}>{t("nav.book")}</Link>
              </>
            )}
            {isAuthenticated && (
              <>
                {user?.role === "customer" && (
                  <Link to="/booking" className="v-nav-item" style={navStyle}>{t("nav.book")}</Link>
                )}
                {user?.role === "barber" && (
                  <Link to="/wallet" className="v-nav-item" style={navStyle}>{t("nav.wallet")}</Link>
                )}
                <Link to={dashPath} className="v-nav-item" style={{ ...navStyle, fontWeight: 600 }}>{t("nav.dashboard")}</Link>
                <button onClick={handleLogout} className="v-nav-item"
                  style={{ ...navStyle, fontWeight: 600, color: textColor }}>{t("nav.logout")}</button>
              </>
            )}
            {/* Language toggle */}
            <button onClick={toggleLang} style={{
              ...navStyle, fontSize: "10px", letterSpacing: "1.5px",
              opacity: 0.55, borderBottom: `1px solid ${textColor}`,
              paddingBottom: "1px",
            }}>{lang === "es" ? "EN" : "ES"}</button>
          </div>

          {/* Mobile right: RESERVAR + hamburger */}
          <div className="v-mobile-right">
            {!isAuthenticated && (
              <Link to="/booking" style={{
                fontFamily: "Montserrat,sans-serif", fontSize: "10px", fontWeight: 600,
                letterSpacing: "1.5px", textTransform: "uppercase",
                background: transparent ? "rgba(255,255,255,0.92)" : "#000",
                color: transparent ? "#000" : "#fff",
                padding: "8px 14px", textDecoration: "none", whiteSpace: "nowrap",
                transition: "all 0.4s ease-in-out",
              }}>{t("nav.book")}</Link>
            )}
            <button className="v-hamburger" onClick={() => setMenuOpen(true)} aria-label="Abrir menu">
              {[0,1,2].map(i => (
                <span key={i} style={{
                  display: "block", width: "22px", height: "1.5px",
                  backgroundColor: textColor, transition: "background 0.4s",
                }} />
              ))}
            </button>
          </div>
        </nav>
      </header>

      {/* ─── Mobile overlay — left-aligned luxury (client spec) ───────────── */}
      {menuOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "radial-gradient(ellipse at 50% 35%, #131313 0%, #080808 60%, #050505 100%)",
          display: "flex", flexDirection: "column",
          paddingTop: "env(safe-area-inset-top, 0px)",
          animation: "slideInRight 0.35s cubic-bezier(0.25,0.46,0.45,0.94) forwards",
        }}>

          {/* Top bar — VANTAGE CENTERED, × absolute right, luxury height */}
          <div style={{
            position: "relative", display: "flex", alignItems: "center",
            justifyContent: "center",
            height: "80px", flexShrink: 0,
            padding: "0 clamp(32px,8vw,64px)",
          }}>
            <span style={{
              fontFamily: "'Playfair Display',serif", fontSize: "18px",
              fontWeight: 400, color: TEXT_MAIN, letterSpacing: "0.12em",
            }}>VANTAGE</span>
            <button onClick={() => setMenuOpen(false)} aria-label="Cerrar" style={{
              position: "absolute", right: "clamp(20px,5vw,40px)",
              background: "none", border: "none", cursor: "pointer",
              color: "rgba(224,224,224,0.4)", fontSize: "26px", fontWeight: 200, lineHeight: 1,
              padding: "12px", minWidth: "44px", minHeight: "44px",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "color 0.25s ease",
            }}>×</button>
          </div>
          <div style={{ height: "1px", backgroundColor: GOLD_BORDER, flexShrink: 0 }} />

          {/* Main content — LEFT-ALIGNED items, generous breathing room */}
          <div style={{
            flex: 1, overflowY: "auto",
            display: "flex", flexDirection: "column",
            alignItems: "flex-start",
            padding: "clamp(36px,5vh,56px) clamp(32px,8vw,64px) clamp(24px,3vh,36px)",
          }}>

            {/* ── YOUR BOOKING — dynamic, only if nextBooking exists ───────── */}
            {isAuthenticated && user?.role === "customer" && nextBooking && (
              <>
                {/* Top gold line */}
                <div style={{
                  width: "100%", height: "1px",
                  backgroundColor: "rgba(197,160,89,0.25)",
                  marginBottom: "clamp(16px,2.5vh,24px)",
                  opacity: 0, animation: "fadeIn 0.4s ease 0.04s forwards",
                }} />

                <p style={{
                  fontFamily: "Montserrat,sans-serif", fontSize: "9px", fontWeight: 500,
                  letterSpacing: "0.2rem", textTransform: "uppercase",
                  color: GOLD, marginBottom: "10px",
                  opacity: 0, animation: "fadeIn 0.4s ease 0.06s forwards",
                }}>{t("menu.yourBooking")}</p>

                <p style={{
                  fontFamily: "'Playfair Display',serif", fontSize: "15px", fontWeight: 400,
                  color: TEXT_MAIN, marginBottom: "5px",
                  opacity: 0, animation: "fadeIn 0.4s ease 0.09s forwards",
                }}>{nextBooking.service} {t("menu.with")} {nextBooking.barber}</p>

                <div style={{
                  display: "flex", alignItems: "center", gap: "7px",
                  marginBottom: "clamp(16px,2.5vh,24px)",
                  opacity: 0, animation: "fadeIn 0.4s ease 0.11s forwards",
                }}>
                  <span style={{
                    fontFamily: "Montserrat,sans-serif", fontSize: "10px", fontWeight: 300,
                    letterSpacing: "0.5px", color: "rgba(224,224,224,0.45)",
                  }}>{nextBooking.date} · {nextBooking.time}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="rgba(197,160,89,0.65)" strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>

                {/* Bottom gold line + spacer before nav */}
                <div style={{
                  width: "100%", height: "1px",
                  backgroundColor: "rgba(197,160,89,0.25)",
                  marginBottom: "clamp(32px,4.5vh,48px)",
                  opacity: 0, animation: "fadeIn 0.4s ease 0.13s forwards",
                }} />
              </>
            )}

            {/* ── Navigation items — LEFT-ALIGNED, generous spacing ─────────── */}
            <nav style={{
              display: "flex", flexDirection: "column", alignItems: "flex-start",
              width: "100%", marginBottom: "clamp(48px,7vh,72px)",
            }}>
              {!isAuthenticated && (
                <>
                  {MOBILE_NAV.map((item, i) => (
                    <button key={item.id} className="vm-nav-btn"
                      onClick={() => handleNavClick(item.id)}
                      style={{
                        fontFamily: "Montserrat,sans-serif",
                        fontSize: "clamp(14px,3.5vw,18px)", fontWeight: 300,
                        color: TEXT_MAIN, background: "none", border: "none",
                        cursor: "pointer", textAlign: "left",
                        padding: "clamp(18px,2.8vh,26px) 0",
                        letterSpacing: "4px", textTransform: "uppercase",
                        width: "100%", display: "block",
                        borderBottom: "1px solid rgba(197,160,89,0.1)",
                        opacity: 0,
                        animation: `fadeIn 0.4s ease ${0.08 + i * 0.08}s forwards`,
                      }}>
                      {t(item.key)}
                    </button>
                  ))}
                  <button className="vm-nav-btn" onClick={() => handleNavClick("shop")}
                    style={{
                      fontFamily: "Montserrat,sans-serif",
                      fontSize: "clamp(14px,3.5vw,18px)", fontWeight: 300,
                      color: GOLD, background: "none", border: "none",
                      cursor: "pointer", textAlign: "left",
                      padding: "clamp(18px,2.8vh,26px) 0",
                      letterSpacing: "4px", textTransform: "uppercase",
                      width: "100%", display: "block",
                      opacity: 0, animation: "fadeIn 0.4s ease 0.32s forwards",
                    }}>
                    {t("nav.shop")}
                  </button>
                </>
              )}

              {isAuthenticated && (
                <>
                  {user?.role === "customer" && (
                    <button className="vm-nav-btn"
                      onClick={() => { setMenuOpen(false); navigate("/booking"); }}
                      style={{
                        fontFamily: "Montserrat,sans-serif", fontSize: "clamp(13px,3.5vw,17px)", fontWeight: 300,
                        color: TEXT_MAIN, background: "none", border: "none", cursor: "pointer",
                        textAlign: "left", padding: "clamp(12px,1.8vh,17px) 0",
                        letterSpacing: "4px", textTransform: "uppercase", width: "100%",
                        borderBottom: "1px solid rgba(197,160,89,0.1)",
                        opacity: 0, animation: "fadeIn 0.4s ease 0.08s forwards",
                      }}>Reservar</button>
                  )}
                  {user?.role === "barber" && (
                    <button className="vm-nav-btn"
                      onClick={() => { setMenuOpen(false); navigate("/wallet"); }}
                      style={{
                        fontFamily: "Montserrat,sans-serif", fontSize: "clamp(13px,3.5vw,17px)", fontWeight: 300,
                        color: TEXT_MAIN, background: "none", border: "none", cursor: "pointer",
                        textAlign: "left", padding: "clamp(12px,1.8vh,17px) 0",
                        letterSpacing: "4px", textTransform: "uppercase", width: "100%",
                        borderBottom: "1px solid rgba(197,160,89,0.1)",
                        opacity: 0, animation: "fadeIn 0.4s ease 0.08s forwards",
                      }}>Billetera</button>
                  )}
                  <button className="vm-nav-btn"
                    onClick={() => { setMenuOpen(false); navigate(dashPath); }}
                    style={{
                      fontFamily: "Montserrat,sans-serif", fontSize: "clamp(13px,3.5vw,17px)", fontWeight: 300,
                      color: TEXT_MAIN, background: "none", border: "none", cursor: "pointer",
                      textAlign: "left", padding: "clamp(12px,1.8vh,17px) 0",
                      letterSpacing: "4px", textTransform: "uppercase", width: "100%",
                      opacity: 0, animation: "fadeIn 0.4s ease 0.16s forwards",
                    }}>Panel</button>
                </>
              )}
            </nav>

            {/* ── RESERVAR — full width gradient metal button ───────────────── */}
            {!isAuthenticated && (
              <button className="vm-reservar"
                onClick={() => { setMenuOpen(false); navigate("/booking"); }}
                style={{
                  width: "100%", padding: "20px 0",
                  fontFamily: "Montserrat,sans-serif", fontSize: "12px", fontWeight: 500,
                  letterSpacing: "4px", textTransform: "uppercase",
                  color: "#fff", background: GOLD_GRADIENT,
                  border: "none", cursor: "pointer",
                  marginBottom: "clamp(24px,3.5vh,36px)",
                  transition: "opacity 0.25s ease",
                  opacity: 0, animation: "fadeIn 0.4s ease 0.4s forwards",
                }}>
                {t("menu.bookNow")}
              </button>
            )}

            {/* ── Secondary link ────────────────────────────────────────────── */}
            {!isAuthenticated ? (
              <button className="vm-nav-btn"
                onClick={() => { setMenuOpen(false); navigate("/login"); }}
                style={{
                  fontFamily: "Montserrat,sans-serif", fontSize: "11px", fontWeight: 300,
                  letterSpacing: "3px", textTransform: "uppercase",
                  color: "rgba(224,224,224,0.45)", background: "none", border: "none",
                  cursor: "pointer", padding: "14px 0", textAlign: "center",
                  width: "100%",
                  opacity: 0, animation: "fadeIn 0.4s ease 0.47s forwards",
                }}>
                {t("menu.signin")}
              </button>
            ) : (
              <button className="vm-nav-btn"
                onClick={() => { setMenuOpen(false); navigate(dashPath); }}
                style={{
                  fontFamily: "Montserrat,sans-serif", fontSize: "11px", fontWeight: 300,
                  letterSpacing: "3px", textTransform: "uppercase",
                  color: "rgba(224,224,224,0.45)", background: "none", border: "none",
                  cursor: "pointer", padding: "14px 0", textAlign: "center",
                  width: "100%",
                  opacity: 0, animation: "fadeIn 0.4s ease 0.24s forwards",
                }}>
                {t("menu.myProfile")}
              </button>
            )}

          </div>

          {/* Bottom bar ──────────────────────────────────────────────────── */}
          {/* Fix 1: safe-area + extra 32px so content clears iPhone home bar
              Fix 3: same horizontal padding as main content (clamp(28px,8vw,64px)) */}
          <div style={{
            padding: "14px clamp(28px,8vw,64px)",
            paddingBottom: "calc(32px + env(safe-area-inset-bottom, 20px))",
            borderTop: `1px solid ${GOLD_BORDER}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexShrink: 0,
          }}>
            {/* Location */}
            {/* Fix 2: opacity raised to 85% */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="rgba(197,160,89,0.85)" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span style={{
                fontFamily: "Montserrat,sans-serif", fontSize: "9px", fontWeight: 300,
                letterSpacing: "1.5px", textTransform: "uppercase",
                color: "rgba(224,224,224,0.85)",
              }}>{t("menu.location")}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
              {/* Instagram — thin outlined, 85% opacity */}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="rgba(224,224,224,0.85)" strokeWidth="1.4"
                strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
              {/* X/Twitter — 85% opacity */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(224,224,224,0.85)">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              {/* Cerrar Sesión — 85% opacity */}
              {/* Language toggle */}
              <button onClick={toggleLang} style={{
                fontFamily: "Montserrat,sans-serif", fontSize: "9px", fontWeight: 300,
                letterSpacing: "1.5px", textTransform: "uppercase",
                color: "rgba(224,224,224,0.85)", background: "none", border: "none",
                cursor: "pointer", padding: 0,
                borderBottom: "1px solid rgba(224,224,224,0.3)",
              }}>{lang === "es" ? "EN" : "ES"}</button>
              {isAuthenticated && (
                <button onClick={() => { setMenuOpen(false); handleLogout(); }}
                  style={{
                    fontFamily: "Montserrat,sans-serif", fontSize: "9px", fontWeight: 300,
                    letterSpacing: "1.5px", textTransform: "uppercase",
                    color: "rgba(224,224,224,0.85)", background: "none", border: "none",
                    cursor: "pointer", padding: 0, transition: "color 0.25s ease",
                  }}>
                  {t("menu.logout")}
                </button>
              )}
            </div>
          </div>

        </div>
      )}
    </>
  );
}
