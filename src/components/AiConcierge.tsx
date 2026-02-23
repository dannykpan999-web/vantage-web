import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useLocation } from "react-router-dom";

// ─── Config ─────────────────────────────────────────────────────────────────
// Proxy through backend to avoid Gemini geo-restrictions
const AI_URL = "/api/ai/chat";
const WA_NUMBER  = "16093585863"; // client's WhatsApp number

const GOLD        = "#C5A059";
const GOLD_BORDER = "rgba(197,160,89,0.35)";

// ─── Frustration keywords that trigger WhatsApp escalation ──────────────────
const ESCALATION_KEYWORDS = [
  "no funciona", "error", "fallo", "urgente", "cobro incorrecto",
  "pago fallido", "no puedo", "problema grave", "ayuda humana",
  "hablar con alguien", "soporte", "emergencia",
];

const SYSTEM_PROMPT = `Eres el Concierge de Vantage, el asistente de soporte de una plataforma premium de gestión de barberías de lujo. Ayudas a dueños de salón, barberos y clientes con:
- Configuración de servicios, precios y horarios de disponibilidad
- Gestión de citas y reservas
- Reportes de ingresos, comisiones y estadísticas
- Facturación, pagos y cobros con tarjeta
- Uso general de la plataforma (cómo hacer X en la app)
- Onboarding de nuevos barberos o salones

Reglas:
- Responde SIEMPRE en español, con tono sofisticado y elegante, acorde a una marca de lujo
- Respuestas cortas y directas (máximo 3-4 oraciones)
- Si el problema requiere acceso a datos específicos del usuario que no tienes, indícalo amablemente
- Si no puedes resolver el problema después de 2 intentos, sugiere contactar soporte VIP`;

type Message = { role: "user" | "assistant"; text: string };

function buildWaLink(userName: string, role: string, topic: string) {
  const name  = encodeURIComponent(userName || "Cliente");
  const r     = encodeURIComponent(role    || "usuario");
  const topic_ = encodeURIComponent(topic  || "consulta técnica");
  return `https://wa.me/${WA_NUMBER}?text=Hola%2C+soy+${name}+(${r})%2C+la+IA+no+pudo+resolver+mi+duda+sobre+${topic_}.+Solicito+asistencia+VIP.`;
}

export default function AiConcierge() {
  const [open,        setOpen]        = useState(false);
  const [messages,    setMessages]    = useState<Message[]>([]);
  const [input,       setInput]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [showWa,      setShowWa]      = useState(false);
  const [noSolve,     setNoSolve]     = useState(0); // count of "can't solve" responses
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);

  const { user }   = useAuthStore();
  const location   = useLocation();

  // Only show on authenticated pages (not landing)
  const isLanding  = location.pathname === "/";

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  // Early return must be AFTER all hooks (Rules of Hooks)
  if (isLanding) return null;

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const userMsg: Message = { role: "user", text };
    const history = [...messages, userMsg];
    setMessages(history);

    // Check frustration keywords in user message
    const hasFrustration = ESCALATION_KEYWORDS.some(k => text.toLowerCase().includes(k));
    if (hasFrustration) { setShowWa(true); }

    setLoading(true);
    try {
      // Build a single prompt string embedding system context + full conversation
      const prevTurns = messages.map(m =>
        `${m.role === "user" ? "Usuario" : "Concierge"}: ${m.text}`
      ).join("\n");

      const fullPrompt = messages.length === 0
        ? `${SYSTEM_PROMPT}\n\n---\nUsuario: ${text}\nConcierge:`
        : `${SYSTEM_PROMPT}\n\n---\nConversación previa:\n${prevTurns}\n\nUsuario: ${text}\nConcierge:`;

      const res = await fetch(AI_URL, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 300 },
        }),
      });

      const data  = await res.json();
      if (!res.ok) {
        console.error("Gemini API error:", JSON.stringify(data));
      }
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text
        ?? "Lo siento, no pude procesar tu consulta. Inténtalo de nuevo.";

      setMessages([...history, { role: "assistant", text: reply }]);

      // Track if AI signals it can't help
      const cantHelp = [
        "no tengo acceso", "no puedo", "soporte humano", "contactar",
        "no dispongo", "fuera de mi alcance",
      ].some(k => reply.toLowerCase().includes(k));
      if (cantHelp) {
        setNoSolve(n => {
          const next = n + 1;
          if (next >= 2) setShowWa(true);
          return next;
        });
      }
    } catch {
      setMessages([...history, {
        role: "assistant",
        text: "Hubo un error de conexión. Por favor, intenta nuevamente en unos segundos.",
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  const waLink  = buildWaLink(user?.name ?? "", user?.role ?? "", messages.at(-2)?.text ?? "");
  const roleLabel =
    user?.role === "owner"  ? "Propietario" :
    user?.role === "barber" ? "Barbero"     : "Cliente";

  return (
    <>
      <style>{`
        .ai-panel {
          position: fixed; bottom: 88px; right: 20px; z-index: 300;
          width: min(360px, calc(100vw - 32px));
          background: radial-gradient(ellipse at 50% 0%, #141414 0%, #070707 100%);
          border: 1px solid ${GOLD_BORDER};
          display: flex; flex-direction: column;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6);
          animation: ai-slide-up 0.3s ease forwards;
        }
        @keyframes ai-slide-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ai-msg-user {
          align-self: flex-end;
          background: rgba(197,160,89,0.15);
          border: 1px solid rgba(197,160,89,0.25);
          border-radius: 2px;
          padding: 10px 14px; max-width: 86%;
          font-family: Montserrat,sans-serif; font-size: 12px; font-weight: 300;
          color: #E0E0E0; line-height: 1.6;
        }
        .ai-msg-bot {
          align-self: flex-start;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 2px;
          padding: 10px 14px; max-width: 92%;
          font-family: Montserrat,sans-serif; font-size: 12px; font-weight: 300;
          color: #E0E0E0; line-height: 1.6;
        }
        .ai-input {
          background: transparent; border: none; outline: none; resize: none;
          font-family: Montserrat,sans-serif; font-size: 12px; font-weight: 300;
          color: #E0E0E0; line-height: 1.6; flex: 1;
          padding: 0;
        }
        .ai-input::placeholder { color: rgba(224,224,224,0.28); }
        .ai-send-btn {
          background: none; border: none; cursor: pointer;
          color: ${GOLD}; padding: 4px; transition: opacity 0.2s;
          display: flex; align-items: center;
        }
        .ai-send-btn:hover { opacity: 0.7; }
        .ai-wa-btn {
          display: flex; align-items: center; gap: 8px;
          background: none; border: 1px solid rgba(37,211,102,0.4);
          padding: 10px 16px; cursor: pointer;
          font-family: Montserrat,sans-serif; font-size: 10px; font-weight: 500;
          letter-spacing: 2px; text-transform: uppercase;
          color: #25D366; width: 100%; transition: background 0.2s ease;
          text-decoration: none;
        }
        .ai-wa-btn:hover { background: rgba(37,211,102,0.06); }
        .ai-float-btn {
          position: fixed; bottom: 20px; right: 20px; z-index: 300;
          width: 52px; height: 52px;
          background: radial-gradient(circle at 35% 35%, #1a1a1a, #080808);
          border: 1px solid ${GOLD_BORDER};
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: border-color 0.25s ease, box-shadow 0.25s ease;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        }
        .ai-float-btn:hover {
          border-color: ${GOLD};
          box-shadow: 0 4px 24px rgba(197,160,89,0.2);
        }
        .ai-typing-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: ${GOLD}; opacity: 0.6;
          animation: ai-blink 1.2s infinite;
        }
        .ai-typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .ai-typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes ai-blink {
          0%,80%,100% { opacity: 0.2; } 40% { opacity: 0.9; }
        }
      `}</style>

      {/* ── Floating button ─────────────────────────────────────────────── */}
      <button className="ai-float-btn" onClick={() => setOpen(o => !o)} aria-label="Concierge IA">
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke={GOLD} strokeWidth="1.8" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
          </svg>
        )}
      </button>

      {/* ── Chat panel ──────────────────────────────────────────────────── */}
      {open && (
        <div className="ai-panel">

          {/* Header */}
          <div style={{
            padding: "16px 20px 14px",
            borderBottom: `1px solid ${GOLD_BORDER}`,
            display: "flex", alignItems: "center", gap: "10px",
          }}>
            <div>
              <p style={{
                fontFamily: "Montserrat,sans-serif", fontSize: "10px", fontWeight: 600,
                letterSpacing: "2.5px", textTransform: "uppercase", color: GOLD, marginBottom: "2px",
              }}>Concierge Vantage</p>
              <p style={{
                fontFamily: "Montserrat,sans-serif", fontSize: "9px", fontWeight: 300,
                color: "rgba(224,224,224,0.4)", letterSpacing: "0.5px",
              }}>{user?.name ?? "Usuario"} · {roleLabel}</p>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "16px 16px 8px",
            display: "flex", flexDirection: "column", gap: "10px",
            maxHeight: "320px", minHeight: "160px",
          }}>
            {messages.length === 0 && (
              <p style={{
                fontFamily: "Montserrat,sans-serif", fontSize: "11px", fontWeight: 300,
                color: "rgba(224,224,224,0.35)", lineHeight: 1.7,
                textAlign: "center", padding: "24px 8px",
              }}>
                Hola, soy tu Concierge.<br />¿En qué puedo ayudarte hoy?
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "ai-msg-user" : "ai-msg-bot"}>
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="ai-msg-bot" style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                <div className="ai-typing-dot" />
                <div className="ai-typing-dot" />
                <div className="ai-typing-dot" />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* WhatsApp escalation */}
          {showWa && (
            <div style={{ padding: "0 12px 8px" }}>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="ai-wa-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.95-1.418A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
                </svg>
                Soporte VIP · WhatsApp
              </a>
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: "12px 16px",
            borderTop: `1px solid rgba(197,160,89,0.15)`,
            display: "flex", alignItems: "flex-end", gap: "10px",
          }}>
            <textarea
              ref={inputRef}
              className="ai-input"
              rows={1}
              placeholder="Escribe tu consulta..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              style={{ maxHeight: "80px" }}
            />
            <button className="ai-send-btn" onClick={sendMessage} disabled={loading}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>

          {/* Footer note */}
          <p style={{
            fontFamily: "Montserrat,sans-serif", fontSize: "8px", fontWeight: 300,
            letterSpacing: "1px", color: "rgba(224,224,224,0.2)",
            textAlign: "center", padding: "6px 16px 12px",
          }}>Concierge IA · Vantage Platform</p>

        </div>
      )}
    </>
  );
}
