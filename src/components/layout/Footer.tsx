import { useT } from "../../i18n";

export default function Footer() {
  const year = new Date().getFullYear();
  const t = useT();

  const links = [
    { key: "footer.nav.home"     as const, href: "/" },
    { key: "footer.nav.services" as const, href: "/#servicios" },
    { key: "footer.nav.team"     as const, href: "/#equipo" },
    { key: "footer.nav.gallery"  as const, href: "/#galeria" },
    { key: "footer.nav.contact"  as const, href: "/#contacto" },
  ];

  const socials = [
    {
      label: "Facebook",
      href: "#",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
        </svg>
      ),
    },
    {
      label: "Instagram",
      href: "#",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
          <circle cx="12" cy="12" r="4"/>
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
        </svg>
      ),
    },
    {
      label: "WhatsApp",
      href: "#",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.95-1.418A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
        </svg>
      ),
    },
    {
      label: "TikTok",
      href: "#",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.89a8.18 8.18 0 004.78 1.52V7a4.85 4.85 0 01-1.01-.31z"/>
        </svg>
      ),
    },
  ];

  return (
    <footer style={{ background: "#0a0a0a" }}>
      <style>{`
        .ft-col-title {
          font-family: Montserrat, sans-serif;
          font-size: 11px; font-weight: 600;
          letter-spacing: 3px; text-transform: uppercase;
          color: #fff; margin-bottom: 24px;
        }
        .ft-link {
          display: block;
          font-family: Montserrat, sans-serif;
          font-size: 12px; font-weight: 300;
          color: rgba(255,255,255,0.55);
          text-decoration: none; margin-bottom: 12px;
          transition: color 0.2s ease;
        }
        .ft-link:hover { color: #fff; }
        .ft-social-btn {
          width: 38px; height: 38px; border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.6);
          background: none; cursor: pointer;
          transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
          text-decoration: none;
        }
        .ft-social-btn:hover {
          border-color: #fff;
          color: #fff;
          background: rgba(255,255,255,0.08);
        }
        .ft-grid {
          display: grid;
          grid-template-columns: 2fr 1.2fr 1fr 1fr;
          gap: clamp(32px,5vw,80px);
          padding: clamp(48px,7vw,80px) clamp(24px,8vw,120px);
          max-width: 1400px; margin: 0 auto;
        }
        @media (max-width: 900px) {
          .ft-grid { grid-template-columns: 1fr 1fr; gap: 40px; }
        }
        @media (max-width: 540px) {
          .ft-grid { grid-template-columns: 1fr; gap: 32px; }
        }
      `}</style>

      {/* Main grid */}
      <div className="ft-grid">

        {/* Col 1 — Brand */}
        <div>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "22px", fontWeight: 400,
            color: "#fff", letterSpacing: "0.06em",
            display: "block", marginBottom: "20px",
          }}>VANTAGE</span>
          <p style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "12px", fontWeight: 300,
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.9, maxWidth: "280px",
          }}>
            {t("footer.tagline")}
          </p>
        </div>

        {/* Col 2 — Contact */}
        <div>
          <p className="ft-col-title">{t("footer.contact")}</p>
          {/* Email — formal archive only */}
          <a href="mailto:soporte@vantagestudioapp.com" className="ft-link">
            soporte@vantagestudioapp.com
          </a>
          <p style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "12px", fontWeight: 300,
            color: "rgba(255,255,255,0.55)", lineHeight: 1.8,
            marginBottom: "16px",
          }}>
            785 15h Street, Office 47<br />
            Nueva York, NY 10001
          </p>
          {/* WhatsApp VIP — luxury gold styling */}
          <a
            href="https://wa.me/16093585863?text=Hola%2C+solicito+asistencia+VIP+de+Vantage."
            target="_blank" rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: "7px",
              fontFamily: "Montserrat, sans-serif",
              fontSize: "9px", fontWeight: 500,
              letterSpacing: "2px", textTransform: "uppercase",
              color: "rgba(197,160,89,0.75)", textDecoration: "none",
              borderBottom: "1px solid rgba(197,160,89,0.25)",
              paddingBottom: "2px",
              transition: "color 0.2s ease, border-color 0.2s ease",
            }}>
            {/* Gold diamond accent instead of WhatsApp icon */}
            <svg width="7" height="7" viewBox="0 0 10 10" fill="currentColor">
              <polygon points="5,0 10,5 5,10 0,5"/>
            </svg>
            Soporte VIP
          </a>
        </div>

        {/* Col 3 — Links */}
        <div>
          <p className="ft-col-title">{t("footer.links")}</p>
          {links.map(l => (
            <a key={l.key} href={l.href} className="ft-link">{t(l.key)}</a>
          ))}
        </div>

        {/* Col 4 — Social */}
        <div>
          <p className="ft-col-title">{t("footer.social")}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {socials.map(s => (
              <a key={s.label} href={s.href} className="ft-social-btn" aria-label={s.label}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.08)",
        padding: "20px clamp(24px,8vw,120px)",
      }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <p style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: "10px", fontWeight: 300,
            color: "rgba(255,255,255,0.35)",
            letterSpacing: "0.5px",
          }}>
            © {year}. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
