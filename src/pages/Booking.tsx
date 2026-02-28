import { useState, useRef, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getBarbers, getSlots, createBooking } from "../services/booking";
import { createPaymentLink } from "../services/payment";
import { getShopSettings } from "../services/settings";
import { getProducts } from "../services/products";
import type { Barber, Service, Slot } from "../types";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { SkeletonCard } from "../components/ui/Skeleton";
import Button from "../components/ui/Button";

type Step = 1 | 2 | 3 | 4 | 5 | 6;
const STEPS = ["Barbero", "Servicio", "Fecha", "Hora", "Extras", "Pago"];
const DEPOSIT_AMOUNT = 10;

const DAYS_ES  = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function toYMD(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function addDays(d: Date, n: number) {
  const r = new Date(d); r.setDate(r.getDate() + n); return r;
}
// "HH:MM" or "HH:MM:SS" → "H:MM AM/PM"
function to12h(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${period}`;
}
const TIME_SECTIONS = [
  { key: "morning", label: "Mañana",   from: 0,   to: 720  }, // until 11:59
  { key: "midday",  label: "Mediodía", from: 720, to: 900  }, // 12:00–14:59
  { key: "evening", label: "Tarde",    from: 900, to: 1440 }, // 15:00+
] as const;

/* ── Step indicator ──────────────────────────────────────────────────────── */
function StepIndicator({ current }: { current: Step }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"3rem", overflowX:"auto", paddingBottom:"4px" }}>
      {STEPS.map((label, i) => {
        const step = (i + 1) as Step;
        const done = current > step; const active = current === step;
        return (
          <div key={step} style={{ display:"flex", alignItems:"center", flexShrink:0 }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ width:"26px", height:"26px", borderRadius:"50%",
                border: done||active ? "1px solid var(--black)" : "1px solid var(--gray-border)",
                backgroundColor: done ? "var(--black)" : "transparent",
                display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 0.35rem" }}>
                {done
                  ? <span style={{ color:"#fff", fontSize:"0.65rem" }}>✓</span>
                  : <span style={{ fontFamily:"Montserrat,sans-serif", fontWeight: active?600:300,
                      fontSize:"0.65rem", color: active?"var(--black)":"var(--gray-mid)" }}>{step}</span>}
              </div>
              <span style={{ fontFamily:"Montserrat,sans-serif", fontWeight: active?700:500, fontSize:"0.52rem",
                letterSpacing:"0.1em", textTransform:"uppercase",
                color: active?"var(--black)":"#999", display:"block" }}>{label}</span>
            </div>
            {i < STEPS.length-1 && (
              <div style={{ width:"20px", height:"1px",
                backgroundColor: done?"var(--black)":"var(--gray-border)", margin:"0 0.2rem 1.4rem", flexShrink:0 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Boutique Calendar (Step 3) ──────────────────────────────────────────── */
function BoutiqueCalendar({
  selectedDate, onSelect,
}: { selectedDate: string; onSelect: (ymd: string) => void }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayYMD = toYMD(today);

  const [view, setView]           = useState<"week"|"month">("week");
  const [weekStart, setWeekStart] = useState(() => { const d = new Date(today); return d; });
  const [monthDate, setMonthDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const stripRef = useRef<HTMLDivElement>(null);

  /* ── Week strip helpers ── */
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  function prevWeek() { setWeekStart(addDays(weekStart, -7)); }
  function nextWeek() { setWeekStart(addDays(weekStart,  7)); }

  /* ── Month grid helpers ── */
  const monthYear = `${MONTHS_ES[monthDate.getMonth()]} ${monthDate.getFullYear()}`;
  const firstDay  = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth()+1, 0).getDate();
  const cells: (Date|null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(monthDate.getFullYear(), monthDate.getMonth(), i+1)),
  ];
  function prevMonth() { setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth()-1, 1)); }
  function nextMonth() { setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth()+1, 1)); }

  function handleDayClick(d: Date) {
    if (d < today) return;
    const ymd = toYMD(d);
    onSelect(ymd);
    if (view === "month") {
      // Switch to week view centered on that week
      const dayOfWeek = d.getDay();
      setWeekStart(addDays(d, -dayOfWeek));
      setView("week");
    }
  }

  const btnBase: React.CSSProperties = {
    fontFamily:"Montserrat,sans-serif", fontWeight:400, fontSize:"10px",
    letterSpacing:"0.2em", textTransform:"uppercase",
    border:"1px solid #e0e0e0", background:"transparent", cursor:"pointer",
    padding:"8px 20px", transition:"all 0.2s ease",
  };

  return (
    <div>
      <style>{`
        .cal-view-btn { transition: background 0.2s, color 0.2s, border-color 0.2s; }
        .cal-view-btn:hover { border-color: #000 !important; color: #000 !important; }
        .cal-day-card { transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.15s; }
        .cal-day-card:hover:not(.past):not(.selected) { border-color: #000 !important; transform: translateY(-2px); }
        .cal-month-cell { transition: background 0.2s, color 0.2s; cursor: pointer; }
        .cal-month-cell:hover:not(.past):not(.selected) { background: #f5f5f5 !important; }
        .strip-arrow { transition: color 0.2s; background:none; border:none; cursor:pointer; font-size:1.1rem; color:#aaa; padding:6px 10px; }
        .strip-arrow:hover { color:#000; }
        @media (max-width: 480px) {
          .cal-day-card { padding: 10px 4px !important; }
          .cal-day-num  { font-size: 1.1rem !important; }
        }
      `}</style>

      {/* ── View toggle ── */}
      <div style={{ display:"flex", justifyContent:"center", gap:"0", marginBottom:"28px" }}>
        {(["week","month"] as const).map(v => (
          <button key={v} className="cal-view-btn" onClick={() => setView(v)}
            style={{ ...btnBase,
              background: view===v ? "#000" : "transparent",
              color: view===v ? "#fff" : "#888",
              borderColor: view===v ? "#000" : "#e0e0e0",
            }}>
            {v === "week" ? "Semana" : "Mes"}
          </button>
        ))}
      </div>

      {/* ══ WEEK VIEW ══ */}
      {view === "week" && (
        <div>
          {/* Nav row */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px" }}>
            <button className="strip-arrow" onClick={prevWeek}>‹</button>
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem", fontWeight:600, color:"#111" }}>
              {MONTHS_ES[weekStart.getMonth()]} {weekStart.getFullYear()}
            </span>
            <button className="strip-arrow" onClick={nextWeek}>›</button>
          </div>

          {/* 7-day strip */}
          <div ref={stripRef} style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"8px" }}>
            {weekDays.map(d => {
              const ymd     = toYMD(d);
              const isPast  = d < today;
              const isSel   = ymd === selectedDate;
              const isToday = ymd === todayYMD;
              return (
                <button key={ymd}
                  className={`cal-day-card ${isPast?"past":""} ${isSel?"selected":""}`}
                  disabled={isPast}
                  onClick={() => handleDayClick(d)}
                  style={{
                    display:"flex", flexDirection:"column", alignItems:"center",
                    padding:"8px 2px",
                    border:"none", background:"transparent",
                    cursor: isPast ? "not-allowed" : "pointer",
                    borderRadius:"4px",
                    opacity: isPast ? 0.4 : 1,
                  }}>
                  <span style={{ fontFamily:"Montserrat,sans-serif", fontSize:"9px",
                    letterSpacing:"0.12em", textTransform:"uppercase",
                    color: isSel ? "#000" : "#888", fontWeight: isSel ? 600 : 400,
                    marginBottom:"6px" }}>
                    {DAYS_ES[d.getDay()]}
                  </span>
                  <div style={{
                    width:"36px", height:"36px", borderRadius:"50%",
                    background: isSel ? "#000" : "transparent",
                    border: isToday && !isSel ? "1px solid #aaa" : "none",
                    display:"flex", alignItems:"center", justifyContent:"center",
                  }}>
                    <span className="cal-day-num"
                      style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.2rem",
                        fontWeight: isSel||isToday ? 700 : 400, lineHeight:1,
                        color: isSel ? "#fff" : isPast ? "#ccc" : "#111" }}>
                      {d.getDate()}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ MONTH VIEW ══ */}
      {view === "month" && (
        <div>
          {/* Nav row */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px" }}>
            <button className="strip-arrow" onClick={prevMonth}>‹</button>
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.15rem", fontWeight:700, color:"#111" }}>
              {monthYear}
            </span>
            <button className="strip-arrow" onClick={nextMonth}>›</button>
          </div>

          {/* Day-of-week header */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:"8px" }}>
            {DAYS_ES.map(d => (
              <div key={d} style={{ textAlign:"center", fontFamily:"'Playfair Display',serif",
                fontSize:"11px", fontWeight:700, color:"#888",
                letterSpacing:"0.08em", padding:"6px 0" }}>
                {d}
              </div>
            ))}
          </div>

          {/* Grid cells */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"4px" }}>
            {cells.map((d, idx) => {
              if (!d) return <div key={`e-${idx}`} />;
              const ymd    = toYMD(d);
              const isPast = d < today;
              const isSel  = ymd === selectedDate;
              const isToday = ymd === todayYMD;
              return (
                <button key={ymd}
                  className={`cal-month-cell ${isPast?"past":""} ${isSel?"selected":""}`}
                  disabled={isPast}
                  onClick={() => handleDayClick(d)}
                  style={{
                    height:"44px", display:"flex", flexDirection:"column",
                    alignItems:"center", justifyContent:"center",
                    border:"none", background:"transparent",
                    cursor: isPast ? "not-allowed" : "pointer",
                    borderRadius:"2px",
                    opacity: isPast ? 0.4 : 1,
                  }}>
                  <div style={{
                    width:"32px", height:"32px", borderRadius:"50%",
                    background: isSel ? "#000" : "transparent",
                    border: isToday && !isSel ? "1px solid #aaa" : "none",
                    display:"flex", alignItems:"center", justifyContent:"center",
                  }}>
                    <span style={{ fontFamily:"'Playfair Display',serif",
                      fontSize:"0.9rem", fontWeight: isToday||isSel ? 700 : 400,
                      color: isSel ? "#fff" : isPast ? "#ccc" : "#111" }}>
                      {d.getDate()}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────────────── */
export default function Booking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep]                   = useState<Step>(1);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate]   = useState("");
  const [selectedSlot, setSelectedSlot]   = useState<Slot | null>(null);
  const [selectedTip, setSelectedTip]     = useState<15|20|25|null>(null);
  const [balanceMethod, setBalanceMethod] = useState<"local"|"online">("local");
  const [cart, setCart]                   = useState<Record<string, number>>({});

  const { data: barbers, isLoading: barbersLoading, isError: barbersError } = useQuery({
    queryKey: ["barbers"], queryFn: getBarbers,
  });

  // Pre-select barber from gallery click (?barber=UUID)
  useEffect(() => {
    const barberId = searchParams.get("barber");
    if (barberId && barbers && !selectedBarber) {
      const match = barbers.find(b => b.id === barberId);
      if (match) { setSelectedBarber(match); setStep(2); }
    }
  }, [barbers, searchParams, selectedBarber]);

  const { data: slots, isLoading: slotsLoading } = useQuery({
    queryKey: ["slots", selectedBarber?.id, selectedDate, selectedService?.id],
    queryFn: () => getSlots(selectedBarber!.id, selectedDate, selectedService?.id),
    enabled: !!selectedBarber && !!selectedDate && step === 4,
  });

  const { data: shopSettings } = useQuery({
    queryKey: ["shop-settings"],
    queryFn: getShopSettings,
  });
  const showTips = shopSettings?.show_tips !== false;

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["products-booking"],
    queryFn: getProducts,
    enabled: step >= 5,
  });

  // Products available to add (active + in stock)
  const activeProducts = useMemo(
    () => (products || []).filter(p => p.is_active && p.stock_quantity > 0),
    [products]
  );

  // Cart totals
  const cartTotal = useMemo(() => {
    if (!products) return 0;
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const p = products.find(pr => pr.id === id);
      return sum + (p ? Number(p.price) * qty : 0);
    }, 0);
  }, [cart, products]);

  const cartCount = useMemo(
    () => Object.values(cart).reduce((s, q) => s + q, 0),
    [cart]
  );

  // Fallback: all unique services from the shop (used if selected barber has none)
  const shopServices = useMemo(() => {
    const all = barbers?.flatMap(b => b.services || []) ?? [];
    const seen = new Set<string>();
    return all.filter(s => {
      const key = s.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [barbers]);

  const displayServices = useMemo(() => {
    if (!selectedBarber) return shopServices;
    return selectedBarber.services?.length > 0 ? selectedBarber.services : shopServices;
  }, [selectedBarber, shopServices]);

  const bookMutation = useMutation({
    mutationFn: () => createBooking({
      barber_id: selectedBarber!.id,
      service_id: selectedService!.id,
      date: selectedDate,
      start_time: selectedSlot!.start_time,
    }),
  });

  async function handleConfirm() {
    try {
      const booking = await bookMutation.mutateAsync();

      // Build cart snapshot for the receipt page
      const cartItems = (products || [])
        .filter(p => (cart[p.id] || 0) > 0)
        .map(p => ({ name: p.name, price: Number(p.price), quantity: cart[p.id] }));

      // Save context for the success screen
      sessionStorage.setItem("vantage_booking_ctx", JSON.stringify({
        barberName: selectedBarber!.name,
        date: selectedDate,
        time: selectedSlot!.start_time.slice(0, 5),
        serviceName: selectedService!.name,
        servicePrice: selectedService!.price,
        balanceMethod,
        selectedTip,
        cartItems,
        productTotal: cartTotal,
      }));

      // Build products array for payment link
      const cartProducts = Object.entries(cart)
        .filter(([, qty]) => qty > 0)
        .map(([id, quantity]) => ({ id, quantity }));

      const { payment_url, is_sandbox } = await createPaymentLink(booking.id, DEPOSIT_AMOUNT, cartProducts);
      if (is_sandbox) {
        navigate("/payment?booking_id=" + booking.id + "&is_sandbox=true");
      } else {
        navigate("/payment?booking_id=" + booking.id + "&payment_url=" + encodeURIComponent(payment_url!));
      }
    } catch { /* handled by mutation error state */ }
  }

  const backBtn: React.CSSProperties = {
    fontFamily:"Montserrat,sans-serif", fontWeight:300, fontSize:"0.75rem",
    letterSpacing:"0.15em", textTransform:"uppercase", background:"transparent",
    border:"none", color:"var(--gray-mid)", cursor:"pointer", textDecoration:"underline",
    marginTop:"1.5rem", display:"block",
  };

  return (
    <>
      <Header />
      <main style={{ minHeight:"100vh", maxWidth:"800px", margin:"0 auto", padding:"8rem 1.5rem 4rem" }}>

        <div style={{ textAlign:"center", marginBottom:"3rem" }}>
          <p style={{ fontFamily:"Montserrat,sans-serif", fontWeight:300, fontSize:"0.7rem",
            letterSpacing:"0.25em", textTransform:"uppercase", color:"var(--gray-mid)", marginBottom:"0.5rem" }}>
            Reserva tu Cita
          </p>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.8rem,4vw,2.5rem)", fontWeight:700, color:"var(--black)" }}>
            Vantage Barbershop
          </h1>
        </div>

        <StepIndicator current={step} />

        {/* ── STEP 1: Barber ── */}
        {step === 1 && (
          <div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.5rem", fontWeight:700,
              color:"var(--black)", marginBottom:"1.5rem", textAlign:"center" }}>
              Elige tu Barbero
            </h2>
            {barbersLoading && <SkeletonCard />}
            {barbersError && (
              <p style={{ fontFamily:"Montserrat,sans-serif", fontWeight:300, fontSize:"0.85rem",
                color:"#c00", textAlign:"center", padding:"2rem 0" }}>
                Error al cargar barberos. Por favor recarga la página.
              </p>
            )}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:"1.5rem" }}>
              {barbers?.map(barber => (
                <div key={barber.id} onClick={() => { setSelectedBarber(barber); setStep(2); }}
                  style={{ border: selectedBarber?.id===barber.id ? "1px solid var(--black)" : "1px solid var(--gray-border)",
                    padding:"1.5rem", cursor:"pointer", textAlign:"center" }}>
                  <div style={{ width:"80px", height:"80px", borderRadius:"50%", overflow:"hidden",
                    margin:"0 auto 1rem", background:"#f0f0f0", position:"relative" }}>
                    {barber.avatar
                      ? <img src={`https://vantagestudioapp.com${barber.avatar}`} alt={barber.name}
                          style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%",
                            objectFit:"cover", display:"block" }} />
                      : <div style={{ width:"100%", height:"100%", display:"flex",
                          alignItems:"center", justifyContent:"center" }}>
                          <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.5rem",
                            fontWeight:700, color:"#aaa" }}>{barber.name.charAt(0).toUpperCase()}</span>
                        </div>
                    }
                  </div>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.1rem", fontWeight:700,
                    color:"var(--black)", marginBottom:"0.3rem" }}>{barber.name}</h3>
                  <p style={{ fontFamily:"Montserrat,sans-serif", fontWeight:300, fontSize:"0.8rem",
                    color:"var(--gray-mid)" }}>{barber.specialty}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 2: Service ── */}
        {step === 2 && selectedBarber && (
          <div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.5rem", fontWeight:700,
              color:"var(--black)", marginBottom:"0.5rem", textAlign:"center" }}>
              Selecciona un Servicio
            </h2>
            <p style={{ fontFamily:"Montserrat,sans-serif", fontWeight:300, fontSize:"0.8rem",
              color:"var(--gray-mid)", textAlign:"center", marginBottom:"2rem" }}>
              con {selectedBarber.name}
            </p>
            {displayServices.length === 0 && (
              <p style={{ fontFamily:"Montserrat,sans-serif", fontWeight:300, fontSize:"0.85rem",
                color:"var(--gray-mid)", textAlign:"center", padding:"2rem 0" }}>
                No hay servicios disponibles. Contacta al salón.
              </p>
            )}
            {displayServices.map(service => (
              <div key={service.id}
                onClick={() => { setSelectedService(service); setStep(3); }}
                style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                  padding:"1.25rem 0", borderBottom:"1px solid var(--gray-border)", cursor:"pointer" }}>
                <div>
                  <p style={{ fontFamily:"Montserrat,sans-serif", fontWeight:600, fontSize:"0.9rem",
                    color:"var(--black)", marginBottom:"0.25rem" }}>{service.name}</p>
                  <p style={{ fontFamily:"Montserrat,sans-serif", fontWeight:300, fontSize:"0.75rem",
                    color:"var(--gray-mid)" }}>{service.duration_minutes} min</p>
                </div>
                <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.2rem",
                  fontWeight:700, color:"var(--black)" }}>${service.price}</span>
              </div>
            ))}
            <button style={backBtn} onClick={() => setStep(1)}>Cambiar Barbero</button>
          </div>
        )}

        {/* ── STEP 3: Date ── */}
        {step === 3 && (
          <div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.5rem", fontWeight:700,
              color:"var(--black)", marginBottom:"2rem", textAlign:"center" }}>
              Selecciona una Fecha
            </h2>

            <BoutiqueCalendar
              selectedDate={selectedDate}
              onSelect={ymd => { setSelectedDate(ymd); setSelectedSlot(null); }}
            />

            {selectedDate && (
              <div style={{ marginTop:"2rem" }}>
                <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:400,
                  fontSize:"1rem", color:"#444", textAlign:"center", marginBottom:"1.5rem" }}>
                  {new Date(selectedDate + "T12:00:00").toLocaleDateString("es-MX", {
                    weekday:"long", day:"numeric", month:"long", year:"numeric"
                  })}
                </p>
                <Button variant="primary" onClick={() => setStep(4)}>
                  Continuar
                </Button>
              </div>
            )}

            <button style={backBtn} onClick={() => setStep(2)}>Cambiar Servicio</button>
          </div>
        )}

        {/* ── STEP 4: Time slot ── */}
        {step === 4 && (
          <div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.5rem", fontWeight:700,
              color:"var(--black)", marginBottom:"0.5rem", textAlign:"center" }}>
              Selecciona un Horario
            </h2>
            <p style={{ fontFamily:"Montserrat,sans-serif", fontWeight:300, fontSize:"0.8rem",
              color:"var(--gray-mid)", textAlign:"center", marginBottom:"2rem" }}>
              {new Date(selectedDate + "T12:00:00").toLocaleDateString("es-MX", {
                weekday:"long", day:"numeric", month:"long"
              })}
            </p>

            {slotsLoading && (
              <div style={{ textAlign:"center", padding:"20px 0" }}>
                <SkeletonCard />
              </div>
            )}

            {slots && slots.filter(s => !s.is_booked).length === 0 && !slotsLoading && (
              <div style={{ textAlign:"center", padding:"2rem 0" }}>
                <p style={{ fontFamily:"Montserrat,sans-serif", fontWeight:300,
                  fontSize:"0.85rem", color:"var(--gray-mid)", marginBottom:"0.5rem" }}>
                  No hay horarios disponibles para esta fecha.
                </p>
                <p style={{ fontFamily:"Montserrat,sans-serif", fontWeight:300,
                  fontSize:"0.75rem", color:"#bbb" }}>
                  Por favor selecciona otro día.
                </p>
              </div>
            )}

            {slots && slots.filter(s => !s.is_booked).length > 0 && (
              <>
                {TIME_SECTIONS.map(section => {
                  const available = slots.filter(s => !s.is_booked).filter(s => {
                    const [h, m] = s.start_time.split(":").map(Number);
                    const mins = h * 60 + m;
                    return mins >= section.from && mins < section.to;
                  });
                  if (available.length === 0) return null;
                  return (
                    <div key={section.key} style={{ marginBottom:"1.75rem" }}>
                      <p style={{ fontFamily:"Montserrat,sans-serif", fontWeight:500,
                        fontSize:"10px", letterSpacing:"0.2em", textTransform:"uppercase",
                        color:"#aaa", marginBottom:"14px" }}>
                        {section.label}
                      </p>
                      <div style={{
                        display:"grid",
                        gridTemplateColumns:"repeat(auto-fill, minmax(140px, 1fr))",
                        gap:"10px",
                      }}>
                        {available.map(slot => {
                          const isSlotSel = selectedSlot?.start_time === slot.start_time;
                          const startLabel = to12h(slot.start_time.slice(0, 5));
                          const endLabel   = slot.end_time ? to12h(slot.end_time.slice(0, 5)) : null;
                          return (
                            <button key={slot.start_time}
                              onClick={() => {
                                setSelectedSlot(slot);
                                setTimeout(() => { setCart({}); setStep(5); }, 260);
                              }}
                              style={{
                                fontFamily:"Montserrat,sans-serif", fontWeight: isSlotSel ? 600 : 300,
                                fontSize:"0.78rem", letterSpacing:"0.03em",
                                padding:"13px 6px", minHeight:"52px",
                                border: isSlotSel ? "2px solid #000" : "1px solid #e0e0e0",
                                backgroundColor: isSlotSel ? "#000" : "transparent",
                                color: isSlotSel ? "#fff" : "#111",
                                cursor:"pointer", transition:"all 0.2s ease", borderRadius:"2px",
                                lineHeight:1.4,
                              }}>
                              {endLabel ? `${startLabel} – ${endLabel}` : startLabel}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            <button style={backBtn} onClick={() => { setStep(3); setSelectedSlot(null); }}>Cambiar Fecha</button>
          </div>
        )}

        {/* ── STEP 5: Products / Extras ── */}
        {step === 5 && (
          <div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.5rem", fontWeight:700,
              color:"var(--black)", marginBottom:"0.4rem", textAlign:"center" }}>
              Agrega Productos
            </h2>
            <p style={{ fontFamily:"Montserrat,sans-serif", fontWeight:300, fontSize:"0.75rem",
              color:"var(--gray-mid)", textAlign:"center", marginBottom:"2.5rem" }}>
              Opcional — complementa tu cita con productos del salón
            </p>

            {productsLoading && <SkeletonCard />}

            {!productsLoading && activeProducts.length === 0 && (
              <p style={{ fontFamily:"Montserrat,sans-serif", fontWeight:300, fontSize:"0.85rem",
                color:"var(--gray-mid)", textAlign:"center", padding:"2rem 0" }}>
                No hay productos disponibles en este momento.
              </p>
            )}

            {activeProducts.map(product => {
              const qty = cart[product.id] || 0;
              const imgSrc = product.images?.[0]
                ? `https://vantagestudioapp.com${product.images[0]}`
                : null;
              return (
                <div key={product.id} style={{ display:"flex", alignItems:"center", gap:"1rem",
                  padding:"1rem 0", borderBottom:"1px solid #f0f0f0" }}>
                  {/* Thumbnail */}
                  <div style={{ width:"56px", height:"56px", flexShrink:0, background:"#f5f5f5",
                    borderRadius:"2px", overflow:"hidden" }}>
                    {imgSrc
                      ? <img src={imgSrc} alt={product.name}
                          style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                      : <div style={{ width:"100%", height:"100%", display:"flex",
                          alignItems:"center", justifyContent:"center" }}>
                          <span style={{ fontSize:"1.4rem", opacity:0.4 }}>✦</span>
                        </div>
                    }
                  </div>
                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontFamily:"Montserrat,sans-serif", fontWeight:600, fontSize:"0.85rem",
                      color:"var(--black)", marginBottom:"0.2rem",
                      whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                      {product.name}
                    </p>
                    <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700,
                      fontSize:"1rem", color:"var(--black)" }}>
                      ${Number(product.price).toFixed(2)}
                    </p>
                  </div>
                  {/* Qty controls */}
                  <div style={{ display:"flex", alignItems:"center", gap:"0.4rem", flexShrink:0 }}>
                    {qty > 0 && (
                      <>
                        <button
                          onClick={() => setCart(prev => {
                            const next = { ...prev };
                            if (next[product.id] <= 1) delete next[product.id];
                            else next[product.id]--;
                            return next;
                          })}
                          style={{ width:"32px", height:"32px", border:"1px solid #e0e0e0",
                            background:"transparent", cursor:"pointer", fontSize:"1.1rem",
                            borderRadius:"2px", display:"flex", alignItems:"center", justifyContent:"center",
                            lineHeight:1 }}>
                          −
                        </button>
                        <span style={{ fontFamily:"Montserrat,sans-serif", fontWeight:600,
                          fontSize:"0.9rem", minWidth:"20px", textAlign:"center" }}>{qty}</span>
                      </>
                    )}
                    <button
                      disabled={qty >= product.stock_quantity}
                      onClick={() => setCart(prev => ({ ...prev, [product.id]: (prev[product.id] || 0) + 1 }))}
                      style={{ width:"32px", height:"32px",
                        border: qty > 0 ? "2px solid var(--black)" : "1px solid #e0e0e0",
                        background: qty > 0 ? "var(--black)" : "transparent",
                        color: qty > 0 ? "#fff" : "var(--black)",
                        cursor: qty >= product.stock_quantity ? "not-allowed" : "pointer",
                        fontSize:"1.1rem", borderRadius:"2px",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        opacity: qty >= product.stock_quantity ? 0.3 : 1,
                        lineHeight:1 }}>
                      +
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Cart subtotal */}
            {cartCount > 0 && (
              <div style={{ display:"flex", justifyContent:"space-between",
                padding:"1rem 0", borderBottom:"1px solid #f0f0f0", marginBottom:"0.5rem" }}>
                <span style={{ fontFamily:"Montserrat,sans-serif", fontWeight:300, fontSize:"0.72rem",
                  color:"var(--gray-mid)", textTransform:"uppercase", letterSpacing:"0.1em" }}>
                  Subtotal Productos ({cartCount} {cartCount === 1 ? "artículo" : "artículos"})
                </span>
                <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:700,
                  fontSize:"1.05rem", color:"var(--black)" }}>
                  ${cartTotal.toFixed(2)}
                </span>
              </div>
            )}

            <div style={{ marginTop:"1.5rem" }}>
              <Button variant="primary" onClick={() => setStep(6)}>
                {cartCount > 0
                  ? `Continuar · ${cartCount} ${cartCount === 1 ? "producto" : "productos"}`
                  : "Continuar sin productos"}
              </Button>
            </div>
            <button style={backBtn} onClick={() => setStep(4)}>Cambiar Horario</button>
          </div>
        )}

        {/* ── STEP 6: Deposit + Confirm ── */}
        {step === 6 && selectedBarber && selectedService && selectedSlot && (
          <div style={{ maxWidth:"480px", margin:"0 auto" }}>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.5rem", fontWeight:700,
              color:"var(--black)", marginBottom:"0.4rem", textAlign:"center" }}>
              Tu Reserva
            </h2>
            <p style={{ fontFamily:"Montserrat,sans-serif", fontWeight:300, fontSize:"0.7rem",
              letterSpacing:"0.18em", textTransform:"uppercase", color:"var(--gray-mid)",
              textAlign:"center", marginBottom:"2.5rem" }}>
              Garantiza tu espacio con un depósito
            </p>

            {/* ── Luxury Ticket ── */}
            <div style={{ border:"1px solid var(--gray-border)", padding:"2rem", marginBottom:"1.5rem" }}>

              {/* Appointment details */}
              {[
                { label:"Barbero",  value: selectedBarber.name },
                { label:"Servicio", value: selectedService.name },
                { label:"Fecha",    value: new Date(selectedDate+"T12:00:00").toLocaleDateString("es-MX", { weekday:"long", day:"numeric", month:"long" }) },
                { label:"Horario",  value: selectedSlot.start_time.slice(0,5) },
              ].map(({ label, value }) => (
                <div key={label} style={{ display:"flex", justifyContent:"space-between",
                  padding:"0.55rem 0", borderBottom:"1px solid #f0f0f0" }}>
                  <span style={{ fontFamily:"Montserrat,sans-serif", fontWeight:300, fontSize:"0.72rem",
                    color:"var(--gray-mid)", textTransform:"uppercase", letterSpacing:"0.1em" }}>{label}</span>
                  <span style={{ fontFamily:"Montserrat,sans-serif", fontWeight:500, fontSize:"0.82rem",
                    color:"var(--black)" }}>{value}</span>
                </div>
              ))}

              {/* Price breakdown */}
              <div style={{ borderTop:"1px solid var(--gray-border)", marginTop:"1.25rem", paddingTop:"1.25rem" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.7rem" }}>
                  <span style={{ fontFamily:"Montserrat,sans-serif", fontWeight:300, fontSize:"0.72rem",
                    color:"var(--gray-mid)", textTransform:"uppercase", letterSpacing:"0.1em" }}>
                    Total del Servicio
                  </span>
                  <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:700,
                    fontSize:"1.05rem", color:"var(--black)" }}>
                    ${selectedService.price.toFixed(2)}
                  </span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.7rem" }}>
                  <span style={{ fontFamily:"Montserrat,sans-serif", fontWeight:300, fontSize:"0.72rem",
                    color:"#555", textTransform:"uppercase", letterSpacing:"0.1em" }}>
                    Depósito de Reserva &nbsp;✅
                  </span>
                  <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:700,
                    fontSize:"1.05rem", color:"#111" }}>
                    -${DEPOSIT_AMOUNT.toFixed(2)}
                  </span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between",
                  borderTop:"1px solid #f0f0f0", paddingTop:"0.7rem",
                  marginBottom: cartCount > 0 ? "0.7rem" : 0 }}>
                  <span style={{ fontFamily:"Montserrat,sans-serif", fontWeight:600, fontSize:"0.76rem",
                    color:"var(--black)", textTransform:"uppercase", letterSpacing:"0.1em" }}>
                    Balance en Local
                  </span>
                  <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:700,
                    fontSize:"1.2rem", color:"var(--black)" }}>
                    ${(selectedService.price - DEPOSIT_AMOUNT).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Products added to order */}
              {cartCount > 0 && (
                <div style={{ borderTop:"1px solid var(--gray-border)", marginTop:"0.5rem", paddingTop:"1rem" }}>
                  <p style={{ fontFamily:"Montserrat,sans-serif", fontWeight:300, fontSize:"0.65rem",
                    letterSpacing:"0.15em", textTransform:"uppercase", color:"#aaa", marginBottom:"0.6rem" }}>
                    Productos del pedido
                  </p>
                  {(products || []).filter(p => (cart[p.id] || 0) > 0).map(p => (
                    <div key={p.id} style={{ display:"flex", justifyContent:"space-between",
                      padding:"0.4rem 0", borderBottom:"1px solid #f8f8f8" }}>
                      <span style={{ fontFamily:"Montserrat,sans-serif", fontWeight:400, fontSize:"0.78rem",
                        color:"var(--black)" }}>
                        {p.name} × {cart[p.id]}
                      </span>
                      <span style={{ fontFamily:"Montserrat,sans-serif", fontWeight:500, fontSize:"0.78rem",
                        color:"var(--black)" }}>
                        ${(Number(p.price) * cart[p.id]).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div style={{ display:"flex", justifyContent:"space-between",
                    paddingTop:"0.6rem", borderTop:"1px solid #f0f0f0" }}>
                    <span style={{ fontFamily:"Montserrat,sans-serif", fontWeight:600, fontSize:"0.72rem",
                      color:"var(--gray-mid)", textTransform:"uppercase", letterSpacing:"0.1em" }}>
                      Total a pagar ahora
                    </span>
                    <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:700,
                      fontSize:"1.15rem", color:"var(--black)" }}>
                      ${(DEPOSIT_AMOUNT + cartTotal).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Tip selector — conditionally shown based on owner setting */}
              {showTips && (
                <div style={{ borderTop:"1px solid #f0f0f0", marginTop:"1.25rem", paddingTop:"1.25rem" }}>
                  <p style={{ fontFamily:"Montserrat,sans-serif", fontWeight:300, fontSize:"0.68rem",
                    letterSpacing:"0.15em", textTransform:"uppercase", color:"#aaa",
                    marginBottom:"0.75rem" }}>
                    Propina Sugerida
                  </p>
                  <div style={{ display:"flex", gap:"8px" }}>
                    {([15, 20, 25] as const).map(pct => {
                      const tipAmt = (selectedService.price * pct) / 100;
                      const isActive = selectedTip === pct;
                      return (
                        <button key={pct}
                          onClick={() => setSelectedTip(isActive ? null : pct)}
                          style={{
                            flex:1, fontFamily:"Montserrat,sans-serif",
                            fontWeight: isActive ? 600 : 300,
                            fontSize:"0.72rem", padding:"10px 4px", textAlign:"center",
                            border: isActive ? "2px solid #000" : "1px solid #e0e0e0",
                            background: isActive ? "#000" : "transparent",
                            color: isActive ? "#fff" : "#555",
                            cursor:"pointer", transition:"all 0.2s", borderRadius:"2px",
                            lineHeight:1.4,
                          }}>
                          {pct}%<br />
                          <span style={{ fontSize:"0.8rem", fontWeight: isActive?600:400 }}>
                            ${tipAmt.toFixed(2)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Value message */}
            <p style={{ fontFamily:"Montserrat,sans-serif", fontWeight:300, fontSize:"0.76rem",
              lineHeight:1.85, color:"#777", textAlign:"center", marginBottom:"1.75rem",
              fontStyle:"italic", padding:"0 0.5rem" }}>
              "Para garantizar la exclusividad de tu espacio, requerimos un depósito de reserva de ${DEPOSIT_AMOUNT.toFixed(2)}."
            </p>

            {/* Balance method toggle */}
            <div style={{ marginBottom:"2rem" }}>
              <p style={{ fontFamily:"Montserrat,sans-serif", fontWeight:300, fontSize:"0.68rem",
                letterSpacing:"0.15em", textTransform:"uppercase", color:"#aaa",
                textAlign:"center", marginBottom:"0.75rem" }}>
                ¿Cómo prefieres pagar el balance?
              </p>
              <div style={{ display:"flex" }}>
                {(["local","online"] as const).map(m => (
                  <button key={m}
                    onClick={() => setBalanceMethod(m)}
                    style={{
                      flex:1, fontFamily:"Montserrat,sans-serif",
                      fontWeight: balanceMethod === m ? 600 : 300,
                      fontSize:"0.72rem", letterSpacing:"0.1em", textTransform:"uppercase",
                      padding:"14px 8px", textAlign:"center",
                      border: balanceMethod === m ? "2px solid #000" : "1px solid #e0e0e0",
                      background: balanceMethod === m ? "#000" : "transparent",
                      color: balanceMethod === m ? "#fff" : "#888",
                      cursor:"pointer", transition:"all 0.2s",
                    }}>
                    {m === "local" ? "Pagar en Local" : "Pagar Online"}
                  </button>
                ))}
              </div>
            </div>

            {bookMutation.isError && (
              <p style={{ fontFamily:"Montserrat,sans-serif", fontSize:"0.8rem", color:"#c00",
                marginBottom:"1rem", textAlign:"center" }}>
                Error al crear la reserva. Intenta de nuevo.
              </p>
            )}

            <Button variant="primary" fullWidth loading={bookMutation.isPending} onClick={handleConfirm}>
              {cartCount > 0
                ? `Pagar Ahora · $${(DEPOSIT_AMOUNT + cartTotal).toFixed(2)}`
                : `Pagar Depósito · $${DEPOSIT_AMOUNT.toFixed(2)}`}
            </Button>
            <button style={backBtn} onClick={() => setStep(5)}>
              {cartCount > 0 ? "Cambiar Productos" : "Agregar Productos"}
            </button>
          </div>
        )}

      </main>
      <Footer />
    </>
  );
}
