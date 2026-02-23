import { useState } from "react";
import { useInView } from "../../hooks/useInView";

export default function ContactSection() {
  const [headingRef, headingInView] = useInView();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState({ name: false, email: false });
  const [sent, setSent] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (e.target.name === "name" || e.target.name === "email") {
      setErrors(er => ({ ...er, [e.target.name]: false }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors = { name: !form.name.trim(), email: !form.email.trim() };
    setErrors(newErrors);
    if (newErrors.name || newErrors.email) return;
    setSent(true);
  }

  return (
    <section style={{ display: "flex", minHeight: "600px", flexWrap: "wrap" }}>
      <style>{`
        .cs-input {
          width: 100%; padding: 14px 16px;
          border: 1px solid #d0d0d0; outline: none;
          fontFamily: Montserrat, sans-serif; fontSize: 13px; color: #111;
          background: #fff; transition: border-color 0.2s ease;
          boxSizing: border-box;
        }
        .cs-input:focus { border-color: #111; }
        .cs-input.error { border-color: #c0392b; }
        .cs-input::placeholder { color: #aaa; }
        .cs-send-btn {
          background: #111; color: #fff;
          fontFamily: Montserrat, sans-serif; fontSize: 11px;
          fontWeight: 500; letterSpacing: 2px; textTransform: uppercase;
          border: none; padding: 15px 36px; cursor: pointer;
          transition: opacity 0.2s ease;
        }
        .cs-send-btn:hover { opacity: 0.78; }
        @media (max-width: 768px) {
          .cs-map { min-height: 300px !important; width: 100% !important; flex: none !important; }
          .cs-form-panel { width: 100% !important; flex: none !important; }
        }
      `}</style>

      {/* Left: Google Map */}
      <div className="cs-map" style={{ flex: 1, minWidth: 0, minHeight: "500px" }}>
        <iframe
          title="Vantage Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.9663095343595!2d-74.00425878428698!3d40.71278937933116!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a19d4c6a78f%3A0x56e18d2fcba1dfb2!2sBarbershop!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
          width="100%"
          height="100%"
          style={{ border: 0, display: "block", minHeight: "inherit" }}
          loading="lazy"
          allowFullScreen
        />
      </div>

      {/* Right: Contact form */}
      <div
        className="cs-form-panel"
        style={{
          flex: 1, minWidth: 0,
          padding: "clamp(40px,6vw,80px) clamp(32px,5vw,64px)",
          backgroundColor: "#fff",
          display: "flex", flexDirection: "column", justifyContent: "center",
        }}
      >
        <div
          ref={headingRef}
          style={{
            opacity: 0,
            animation: headingInView ? "fadeInUp 0.7s ease-out forwards" : "none",
          }}
        >
          <p style={{
            fontFamily: "Montserrat,sans-serif", fontSize: "10px", fontWeight: 500,
            letterSpacing: "3px", textTransform: "uppercase", color: "#888",
            marginBottom: "14px",
          }}>Preguntas Frecuentes</p>

          <h2 style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: "clamp(26px,3.5vw,42px)", fontWeight: 700,
            color: "#111", lineHeight: 1.15, marginBottom: "36px",
            textTransform: "uppercase", letterSpacing: "0.01em",
          }}>
            ¿Tienes Preguntas?<br />¡Contáctanos!
          </h2>

          {sent ? (
            <div style={{
              padding: "24px", background: "#f8f8f8", border: "1px solid #e5e5e5",
              fontFamily: "Montserrat,sans-serif", fontSize: "13px", color: "#333",
              letterSpacing: "0.5px",
            }}>
              ✓ Mensaje enviado. Te contactaremos pronto.
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {/* Row: Name + Email */}
              <div style={{ display: "flex", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "140px" }}>
                  <label style={{
                    display: "block", fontFamily: "Montserrat,sans-serif",
                    fontSize: "10px", fontWeight: 500, letterSpacing: "2px",
                    textTransform: "uppercase", color: "#333", marginBottom: "8px",
                  }}>
                    Nombre <span style={{ color: "#c0392b" }}>*</span>
                  </label>
                  <input
                    name="name" value={form.name} onChange={handleChange}
                    placeholder="Tu nombre"
                    className={`cs-input${errors.name ? " error" : ""}`}
                  />
                  {errors.name && (
                    <p style={{ fontFamily: "Montserrat,sans-serif", fontSize: "10px", color: "#c0392b", marginTop: "5px" }}>
                      Este campo es requerido.
                    </p>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: "140px" }}>
                  <label style={{
                    display: "block", fontFamily: "Montserrat,sans-serif",
                    fontSize: "10px", fontWeight: 500, letterSpacing: "2px",
                    textTransform: "uppercase", color: "#333", marginBottom: "8px",
                  }}>
                    Email <span style={{ color: "#c0392b" }}>*</span>
                  </label>
                  <input
                    name="email" type="email" value={form.email} onChange={handleChange}
                    placeholder="Tu correo"
                    className={`cs-input${errors.email ? " error" : ""}`}
                  />
                  {errors.email && (
                    <p style={{ fontFamily: "Montserrat,sans-serif", fontSize: "10px", color: "#c0392b", marginTop: "5px" }}>
                      Este campo es requerido.
                    </p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  display: "block", fontFamily: "Montserrat,sans-serif",
                  fontSize: "10px", fontWeight: 500, letterSpacing: "2px",
                  textTransform: "uppercase", color: "#333", marginBottom: "8px",
                }}>Teléfono</label>
                <input
                  name="phone" value={form.phone} onChange={handleChange}
                  placeholder="Tu número"
                  className="cs-input"
                />
              </div>

              {/* Message */}
              <div style={{ marginBottom: "28px" }}>
                <label style={{
                  display: "block", fontFamily: "Montserrat,sans-serif",
                  fontSize: "10px", fontWeight: 500, letterSpacing: "2px",
                  textTransform: "uppercase", color: "#333", marginBottom: "8px",
                }}>Mensaje</label>
                <textarea
                  name="message" value={form.message}
                  onChange={handleChange}
                  placeholder="¿En qué podemos ayudarte?"
                  rows={4}
                  className="cs-input"
                  style={{ resize: "vertical", minHeight: "110px" }}
                />
              </div>

              <button type="submit" className="cs-send-btn">
                Enviar Mensaje
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
