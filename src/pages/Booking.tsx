import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getBarbers, getSlots, createBooking } from "../services/booking";
import { createPaymentLink } from "../services/payment";
import type { Barber, Service, Slot } from "../types";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { SkeletonCard } from "../components/ui/Skeleton";
import Button from "../components/ui/Button";

type Step = 1 | 2 | 3 | 4;
const STEPS = ["Barbero", "Servicio", "Fecha y Hora", "Confirmar"];

function StepIndicator({ current }: { current: Step }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "3rem" }}>
      {STEPS.map((label, i) => {
        const step = (i + 1) as Step;
        const done = current > step;
        const active = current === step;
        return (
          <div key={step} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%",
                border: done || active ? "1px solid var(--black)" : "1px solid var(--gray-border)",
                backgroundColor: done ? "var(--black)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 0.4rem",
              }}>
                {done
                  ? <span style={{ color: "#fff", fontSize: "0.8rem" }}>&#10003;</span>
                  : <span style={{ fontFamily: "Montserrat,sans-serif", fontWeight: active ? 600 : 300, fontSize: "0.75rem", color: active ? "var(--black)" : "var(--gray-mid)" }}>{step}</span>
                }
              </div>
              <span style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 300, fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: active ? "var(--black)" : "var(--gray-mid)", display: "block" }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ width: "60px", height: "1px", backgroundColor: done ? "var(--black)" : "var(--gray-border)", margin: "0 0.5rem 1.5rem" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Booking() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const { data: barbers, isLoading: barbersLoading } = useQuery({
    queryKey: ["barbers"],
    queryFn: getBarbers,
  });

  const { data: slots, isLoading: slotsLoading } = useQuery({
    queryKey: ["slots", selectedBarber?.id, selectedDate],
    queryFn: () => getSlots(selectedBarber!.id, selectedDate),
    enabled: !!selectedBarber && !!selectedDate,
  });

  const bookMutation = useMutation({
    mutationFn: () => createBooking({
      barber_id: selectedBarber!.id,
      service_id: selectedService!.id,
      slot_id: selectedSlot!.id,
    }),
  });

  async function handleConfirm() {
    try {
      const booking = await bookMutation.mutateAsync();
      const { payment_url, is_sandbox } = await createPaymentLink(booking.id);
      if (is_sandbox) {
        navigate("/payment?booking_id=" + booking.id + "&is_sandbox=true");
      } else {
        navigate("/payment?booking_id=" + booking.id + "&payment_url=" + encodeURIComponent(payment_url!));
      }
    } catch {
      // mutation error state handles display
    }
  }

  const today = new Date().toISOString().split("T")[0];

  const backBtn: React.CSSProperties = {
    fontFamily: "Montserrat,sans-serif", fontWeight: 300, fontSize: "0.75rem",
    letterSpacing: "0.15em", textTransform: "uppercase", background: "transparent",
    border: "none", color: "var(--gray-mid)", cursor: "pointer", textDecoration: "underline",
    marginTop: "1.5rem", display: "block",
  };

  return (
    <>
      <Header />
      <main style={{ minHeight: "100vh", maxWidth: "800px", margin: "0 auto", padding: "8rem 1.5rem 4rem" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 300, fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--gray-mid)", marginBottom: "0.5rem" }}>
            Reserva tu Cita
          </p>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.8rem,4vw,2.5rem)", fontWeight: 700, color: "var(--black)" }}>
            Vantage Barbershop
          </h1>
        </div>
        <StepIndicator current={step} />

        {/* STEP 1 - Choose barber */}
        {step === 1 && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.5rem", fontWeight: 700, color: "var(--black)", marginBottom: "1.5rem", textAlign: "center" }}>
              Elige tu Barbero
            </h2>
            {barbersLoading && <SkeletonCard />}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "1.5rem" }}>
              {barbers?.map(barber => (
                <div key={barber.id} onClick={() => { setSelectedBarber(barber); setStep(2); }}
                  style={{ border: selectedBarber?.id === barber.id ? "1px solid var(--black)" : "1px solid var(--gray-border)", padding: "1.5rem", cursor: "pointer" }}>
                  <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.1rem", fontWeight: 700, color: "var(--black)", marginBottom: "0.3rem" }}>{barber.name}</h3>
                  <p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 300, fontSize: "0.8rem", color: "var(--gray-mid)" }}>{barber.specialty}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2 - Choose service */}
        {step === 2 && selectedBarber && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.5rem", fontWeight: 700, color: "var(--black)", marginBottom: "0.5rem", textAlign: "center" }}>
              Selecciona un Servicio
            </h2>
            <p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 300, fontSize: "0.8rem", color: "var(--gray-mid)", textAlign: "center", marginBottom: "2rem" }}>
              con {selectedBarber.name}
            </p>
            {selectedBarber.services?.map(service => (
              <div key={service.id} onClick={() => { setSelectedService(service); setStep(3); }}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 0", borderBottom: "1px solid var(--gray-border)", cursor: "pointer" }}>
                <div>
                  <p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 600, fontSize: "0.9rem", color: "var(--black)", marginBottom: "0.25rem" }}>{service.name}</p>
                  <p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 300, fontSize: "0.75rem", color: "var(--gray-mid)" }}>{service.duration_minutes} min</p>
                </div>
                <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.2rem", fontWeight: 700, color: "var(--black)" }}>${service.price}</span>
              </div>
            ))}
            <button style={backBtn} onClick={() => setStep(1)}>Cambiar Barbero</button>
          </div>
        )}

        {/* STEP 3 - Date & slot */}
        {step === 3 && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.5rem", fontWeight: 700, color: "var(--black)", marginBottom: "2rem", textAlign: "center" }}>
              Fecha y Horario
            </h2>
            <div style={{ marginBottom: "2rem" }}>
              <label style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 300, fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--gray-mid)", display: "block", marginBottom: "0.5rem" }}>
                Selecciona Fecha
              </label>
              <input type="date" min={today} value={selectedDate}
                onChange={e => { setSelectedDate(e.target.value); setSelectedSlot(null); }}
                style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 300, fontSize: "0.9rem", color: "var(--black)", border: "none", borderBottom: "1px solid var(--gray-border)", padding: "0.5rem 0", width: "100%", maxWidth: "300px", outline: "none", backgroundColor: "transparent" }} />
            </div>
            {selectedDate && (
              <>
                {slotsLoading && <SkeletonCard />}
                {slots && slots.length === 0 && (
                  <p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 300, fontSize: "0.85rem", color: "var(--gray-mid)" }}>No hay horarios para esta fecha.</p>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(100px,1fr))", gap: "0.75rem", marginBottom: "2rem" }}>
                  {slots?.filter(s => !s.is_booked).map(slot => (
                    <button key={slot.id} onClick={() => setSelectedSlot(slot)}
                      style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 300, fontSize: "0.8rem", padding: "0.75rem", border: selectedSlot?.id === slot.id ? "1px solid var(--black)" : "1px solid var(--gray-border)", backgroundColor: selectedSlot?.id === slot.id ? "var(--black)" : "transparent", color: selectedSlot?.id === slot.id ? "var(--white)" : "var(--black)", cursor: "pointer" }}>
                      {slot.start_time.slice(0, 5)}
                    </button>
                  ))}
                </div>
                {selectedSlot && <Button variant="primary" onClick={() => setStep(4)}>Continuar</Button>}
              </>
            )}
            <button style={backBtn} onClick={() => setStep(2)}>Cambiar Servicio</button>
          </div>
        )}

        {/* STEP 4 - Confirm */}
        {step === 4 && selectedBarber && selectedService && selectedSlot && (
          <div style={{ maxWidth: "480px", margin: "0 auto" }}>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.5rem", fontWeight: 700, color: "var(--black)", marginBottom: "2rem", textAlign: "center" }}>
              Confirmar Reserva
            </h2>
            <div style={{ border: "1px solid var(--gray-border)", padding: "2rem", marginBottom: "2rem" }}>
              {[
                { label: "Barbero", value: selectedBarber.name },
                { label: "Servicio", value: selectedService.name },
                { label: "Fecha", value: new Date(selectedDate + "T12:00:00").toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) },
                { label: "Horario", value: selectedSlot.start_time.slice(0, 5) },
                { label: "Duracion", value: selectedService.duration_minutes + " min" },
                { label: "Total", value: "$" + selectedService.price, bold: true },
              ].map(({ label, value, bold }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0", borderBottom: "1px solid var(--gray-border)" }}>
                  <span style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 300, fontSize: "0.8rem", color: "var(--gray-mid)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
                  <span style={{ fontFamily: bold ? "'Playfair Display',serif" : "Montserrat,sans-serif", fontWeight: bold ? 700 : 400, fontSize: bold ? "1.2rem" : "0.85rem", color: "var(--black)" }}>{value}</span>
                </div>
              ))}
            </div>
            {bookMutation.isError && (
              <p style={{ fontFamily: "Montserrat,sans-serif", fontSize: "0.8rem", color: "#c00", marginBottom: "1rem", textAlign: "center" }}>
                Error al crear la reserva. Intenta de nuevo.
              </p>
            )}
            <Button variant="primary" fullWidth loading={bookMutation.isPending} onClick={handleConfirm}>
              Confirmar y Pagar
            </Button>
            <button style={backBtn} onClick={() => setStep(3)}>Cambiar Horario</button>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
