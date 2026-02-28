import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOwnerDashboard,
  approveWithdrawal,
  rejectWithdrawal,
} from "../services/payment";
import {
  getPendingPhotos, approvePhoto, rejectPhoto, SERVICE_TYPES, type GalleryPhoto,
} from "../services/gallery";
import { getShopSettings, saveShopSettings } from "../services/settings";
import {
  getAllProducts, createProduct, updateProduct, deleteProduct,
  uploadProductPhoto, deleteProductPhoto, type Product,
} from "../services/products";
import { getBarbers } from "../services/barbers";
import { api } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { SkeletonCard } from "../components/ui/Skeleton";
import Spinner from "../components/ui/Spinner";

export default function OwnerDashboard() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["owner-dashboard"],
    queryFn: getOwnerDashboard,
  });

  const approveMutation = useMutation({
    mutationFn: approveWithdrawal,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["owner-dashboard"] }),
  });

  const rejectMutation = useMutation({
    mutationFn: rejectWithdrawal,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["owner-dashboard"] }),
  });

  // Shop schedule settings
  const { data: shopSettings } = useQuery({
    queryKey: ["shop-settings"],
    queryFn: getShopSettings,
  });
  const [scheduleForm, setScheduleForm] = useState({ work_start: "", work_end: "", slot_interval: "", show_tips: true });
  const [scheduleSaved, setScheduleSaved] = useState(false);

  const settingsMutation = useMutation({
    mutationFn: saveShopSettings,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shop-settings"] });
      setScheduleSaved(true);
      setTimeout(() => setScheduleSaved(false), 3000);
    },
  });

  // Sync form when data loads
  const formStart    = scheduleForm.work_start    || shopSettings?.work_start    || "09:00";
  const formEnd      = scheduleForm.work_end      || shopSettings?.work_end      || "19:00";
  const formInterval = scheduleForm.slot_interval || String(shopSettings?.slot_interval ?? 15);
  const formShowTips = scheduleForm.show_tips !== undefined ? scheduleForm.show_tips : (shopSettings?.show_tips !== false);

  // Team management
  const { data: barbers, isLoading: barbersLoading } = useQuery({
    queryKey: ["barbers"],
    queryFn: getBarbers,
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", email: "", password: "", specialty: "" });
  const [addError, setAddError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const addBarberMutation = useMutation({
    mutationFn: (data: typeof addForm) => api.post("/barbers", data).then(r => r.data),
    onSuccess: (newBarber: any) => {
      const photo = addFormPhoto;
      qc.invalidateQueries({ queryKey: ["barbers"] });
      setAddForm({ name: "", email: "", password: "", specialty: "" });
      setAddFormPhoto(null);
      setAddFormPhotoPreview(null);
      setShowAddForm(false);
      setAddError("");
      if (photo && newBarber.barber_id) {
        uploadAvatarMutation.mutate({ barberId: newBarber.barber_id, ...photo });
      }
    },
    onError: (err: any) => {
      setAddError(err?.response?.data?.error || "Error al crear barbero");
    },
  });

  const deleteBarberMutation = useMutation({
    mutationFn: (barberId: string) => api.delete(`/barbers/${barberId}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["barbers"] });
      setDeleteConfirm(null);
    },
  });

  // Avatar upload for barbers
  const [uploadingAvatar, setUploadingAvatar] = useState<string | null>(null);

  // Photo for new barber creation form
  const [addFormPhoto, setAddFormPhoto] = useState<{ imageData: string; filename: string } | null>(null);
  const [addFormPhotoPreview, setAddFormPhotoPreview] = useState<string | null>(null);

  const uploadAvatarMutation = useMutation({
    mutationFn: ({ barberId, imageData, filename }: { barberId: string; imageData: string; filename: string }) =>
      api.put(`/barbers/${barberId}/avatar`, { imageData, filename }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["barbers"] });
      setUploadingAvatar(null);
    },
  });

  // Inline edit for barber profile
  const [editingBarber, setEditingBarber] = useState<string | null>(null);
  const [barberEditForm, setBarberEditForm] = useState<Record<string, { name: string; specialty: string; email: string; password: string }>>({});
  const [showBarberPassword, setShowBarberPassword] = useState<Record<string, boolean>>({});

  const updateBarberProfileMutation = useMutation({
    mutationFn: ({ barberId, name, specialty, email, password }: { barberId: string; name: string; specialty: string; email: string; password: string }) =>
      api.put(`/barbers/${barberId}/profile`, { name, specialty, ...(email ? { email } : {}), ...(password ? { password } : {}) }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["barbers"] });
      setEditingBarber(null);
    },
  });

  // Services management per barber
  const [expandedBarber, setExpandedBarber] = useState<string | null>(null);
  const [serviceEdits, setServiceEdits] = useState<Record<string, { name: string; price: string; duration_minutes: string }>>({});
  const [newServiceForm, setNewServiceForm] = useState<Record<string, { name: string; price: string; duration_minutes: string }>>({});

  const updateServiceMutation = useMutation({
    mutationFn: ({ serviceId, name, price, duration_minutes }: { serviceId: string; name: string; price: string; duration_minutes: string }) =>
      api.put(`/barbers/services/${serviceId}`, { name, price: parseFloat(price), duration_minutes: parseInt(duration_minutes) }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["barbers"] }),
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (serviceId: string) => api.delete(`/barbers/services/${serviceId}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["barbers"] }),
  });

  const addServiceMutation = useMutation({
    mutationFn: ({ barberId, name, price, duration_minutes }: { barberId: string; name: string; price: string; duration_minutes: string }) =>
      api.post(`/barbers/${barberId}/services`, { name, price: parseFloat(price), duration_minutes: parseInt(duration_minutes) }).then(r => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["barbers"] });
      setNewServiceForm(f => ({ ...f, [vars.barberId]: { name: "", price: "", duration_minutes: "" } }));
    },
  });

  const [syncMsg, setSyncMsg] = useState("");
  const syncServicesMutation = useMutation({
    mutationFn: () => api.post("/barbers/sync-services").then(r => r.data),
    onSuccess: (res: any) => {
      qc.invalidateQueries({ queryKey: ["barbers"] });
      setSyncMsg(res.message || "Sincronizado");
      setTimeout(() => setSyncMsg(""), 4000);
    },
  });

  // ── Slot management state ─────────────────────────────────────────────────
  const [slotMgrBarberId, setSlotMgrBarberId] = useState<string>("");
  const [slotMgrDate, setSlotMgrDate]         = useState<string>(() => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [customSlotTime, setCustomSlotTime]   = useState("");
  const [slotMgrMsg, setSlotMgrMsg]           = useState("");

  const { data: managedSlots, refetch: refetchSlots } = useQuery({
    queryKey: ["managed-slots", slotMgrBarberId, slotMgrDate],
    queryFn: () => api.get(`/barbers/${slotMgrBarberId}/slots/manage?date=${slotMgrDate}`).then(r => r.data),
    enabled: !!slotMgrBarberId && !!slotMgrDate,
  });

  const generateSlotsMutation = useMutation({
    mutationFn: () => api.post(`/barbers/${slotMgrBarberId}/slots/generate`, { date: slotMgrDate }).then(r => r.data),
    onSuccess: (r: any) => {
      refetchSlots();
      setSlotMgrMsg(`${r.inserted} horarios generados`);
      setTimeout(() => setSlotMgrMsg(""), 3000);
    },
  });

  const toggleSlotMutation = useMutation({
    mutationFn: (slotId: string) => api.put(`/barbers/slots/${slotId}/toggle`).then(r => r.data),
    onSuccess: () => refetchSlots(),
  });

  const addCustomSlotMutation = useMutation({
    mutationFn: () => api.post(`/barbers/${slotMgrBarberId}/slots/add`, { date: slotMgrDate, start_time: customSlotTime }).then(r => r.data),
    onSuccess: () => { refetchSlots(); setCustomSlotTime(""); },
  });

  const deleteSlotMutation = useMutation({
    mutationFn: (slotId: string) => api.delete(`/barbers/slots/${slotId}`).then(r => r.data),
    onSuccess: () => refetchSlots(),
  });

  // ── Gallery moderation ────────────────────────────────────────────────────
  const { data: pendingPhotos, isLoading: photosLoading, refetch: refetchPending } = useQuery({
    queryKey: ["gallery-pending"],
    queryFn: getPendingPhotos,
    refetchInterval: 30000,
  });

  const approvePhotoMutation = useMutation({
    mutationFn: approvePhoto,
    onSuccess: () => refetchPending(),
  });

  const rejectPhotoMutation = useMutation({
    mutationFn: rejectPhoto,
    onSuccess: () => refetchPending(),
  });

  // ── Products management ───────────────────────────────────────────────────
  const [prodForm, setProdForm]     = useState({ name: "", description: "", price: "", stock: "0", threshold: "5" });
  const [editingProd, setEditingProd] = useState<Product | null>(null);
  const [prodMsg, setProdMsg]       = useState("");
  const prodPhotoRef                = useRef<HTMLInputElement>(null);
  const [uploadingPhotoProdId, setUploadingPhotoProdId] = useState<string | null>(null);

  const { data: allProducts, isLoading: productsLoading, refetch: refetchProducts } = useQuery({
    queryKey: ["owner-products"],
    queryFn: getAllProducts,
  });

  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => { refetchProducts(); setProdForm({ name: "", description: "", price: "", stock: "0", threshold: "5" }); setProdMsg("Producto creado ✓"); setTimeout(() => setProdMsg(""), 3000); },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateProduct>[1] }) => updateProduct(id, data),
    onSuccess: () => { refetchProducts(); setEditingProd(null); setProdMsg("Producto actualizado ✓"); setTimeout(() => setProdMsg(""), 3000); },
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => refetchProducts(),
  });

  const uploadProdPhotoMutation = useMutation({
    mutationFn: ({ id, imageData, filename }: { id: string; imageData: string; filename: string }) =>
      uploadProductPhoto(id, imageData, filename),
    onSuccess: () => { refetchProducts(); setUploadingPhotoProdId(null); },
  });

  const deleteProdPhotoMutation = useMutation({
    mutationFn: ({ id, index }: { id: string; index: number }) => deleteProductPhoto(id, index),
    onSuccess: () => refetchProducts(),
  });

  function handleProdPhotoChange(e: React.ChangeEvent<HTMLInputElement>, productId: string) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhotoProdId(productId);
    const reader = new FileReader();
    reader.onload = ev => {
      const data = ev.target?.result as string;
      uploadProdPhotoMutation.mutate({ id: productId, imageData: data, filename: file.name });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function resizeAndUpload(dataUrl: string, filename: string, barberId: string) {
    const MAX = 900;
    const img = new Image();
    img.onload = () => {
      let { width: w, height: h } = img;
      if (w > MAX || h > MAX) {
        if (w >= h) { h = Math.round(h * MAX / w); w = MAX; }
        else        { w = Math.round(w * MAX / h); h = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      const resized = canvas.toDataURL("image/jpeg", 0.82);
      uploadAvatarMutation.mutate(
        { barberId, imageData: resized, filename: filename.replace(/\.[^.]+$/, ".jpg") },
        { onSettled: () => setUploadingAvatar(null) }
      );
    };
    img.src = dataUrl;
  }

  function handleAvatarFileSelect(e: React.ChangeEvent<HTMLInputElement>, barberId: string) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(barberId);
    const reader = new FileReader();
    reader.onload = () => resizeAndUpload(reader.result as string, file.name, barberId);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const topStats = [
    {
      label: "Ingresos Hoy",
      value: `$${(data?.revenue_today ?? 0).toFixed(2)}`,
    },
    {
      label: "Ingresos Mes",
      value: `$${(data?.revenue_month ?? 0).toFixed(2)}`,
    },
    {
      label: "Comision (15%)",
      value: `$${(data?.commission_month ?? 0).toFixed(2)}`,
    },
    {
      label: "Citas Mes",
      value: data?.bookings_month ?? 0,
    },
  ];

  return (
    <>
      <Header />
      <main
        style={{
          minHeight: "100vh",
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "8rem 1.5rem 4rem",
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "3rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
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
              Panel del Propietario
            </p>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                fontWeight: 700,
                color: "var(--black)",
              }}
            >
              Vantage Overview
            </h1>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <button
              onClick={() => navigate("/owner-landing")}
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 300,
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                backgroundColor: "var(--black)",
                color: "var(--white)",
                border: "1px solid var(--black)",
                padding: "0.75rem 1.5rem",
                cursor: "pointer",
              }}
            >
              Editar Landing
            </button>
            <button
              onClick={handleLogout}
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 300,
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                backgroundColor: "transparent",
                color: "var(--black)",
                border: "1px solid var(--gray-border)",
                padding: "0.75rem 1.5rem",
                cursor: "pointer",
              }}
            >
              Salir
            </button>
          </div>
        </div>

        {isLoading ? (
          <SkeletonCard />
        ) : (
          <>
            {/* Top stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "1px",
                backgroundColor: "var(--gray-border)",
                border: "1px solid var(--gray-border)",
                marginBottom: "3rem",
              }}
            >
              {topStats.map((s) => (
                <div
                  key={s.label}
                  style={{ backgroundColor: "var(--white)", padding: "2rem" }}
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
                    {s.label}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "2rem",
                      fontWeight: 700,
                      color: "var(--black)",
                    }}
                  >
                    {s.value}
                  </p>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "3rem",
                alignItems: "start",
              }}
            >
              {/* Barber performance */}
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
                  Rendimiento Barberos
                </h2>

                {(!data?.barber_stats || data.barber_stats.length === 0) && (
                  <p
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontWeight: 300,
                      fontSize: "0.85rem",
                      color: "var(--gray-mid)",
                    }}
                  >
                    Sin datos aun.
                  </p>
                )}

                {data?.barber_stats?.map((b) => (
                  <div
                    key={b.barber_id}
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
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          color: "var(--black)",
                        }}
                      >
                        {b.barber_name}
                      </p>
                      <p
                        style={{
                          fontFamily: "Montserrat, sans-serif",
                          fontWeight: 300,
                          fontSize: "0.75rem",
                          color: "var(--gray-mid)",
                        }}
                      >
                        {b.bookings_count} citas
                      </p>
                    </div>
                    <span
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        color: "var(--black)",
                      }}
                    >
                      ${Number(b.earnings).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Withdrawal requests */}
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
                  Solicitudes de Retiro
                </h2>

                {(!data?.pending_withdrawals ||
                  data.pending_withdrawals.length === 0) && (
                  <p
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontWeight: 300,
                      fontSize: "0.85rem",
                      color: "var(--gray-mid)",
                    }}
                  >
                    No hay solicitudes pendientes.
                  </p>
                )}

                {data?.pending_withdrawals?.map((w) => (
                  <div
                    key={w.id}
                    style={{
                      padding: "1.25rem 0",
                      borderBottom: "1px solid var(--gray-border)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "0.75rem",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontFamily: "Montserrat, sans-serif",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                            color: "var(--black)",
                          }}
                        >
                          {w.barber_name}
                        </p>
                        <p
                          style={{
                            fontFamily: "Montserrat, sans-serif",
                            fontWeight: 300,
                            fontSize: "0.75rem",
                            color: "var(--gray-mid)",
                          }}
                        >
                          {new Date(w.created_at).toLocaleDateString("es-MX")}
                        </p>
                      </div>
                      <span
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: "1.2rem",
                          fontWeight: 700,
                          color: "var(--black)",
                        }}
                      >
                        ${Number(w.amount).toFixed(2)}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => approveMutation.mutate(w.id)}
                        disabled={approveMutation.isPending}
                        style={{
                          flex: 1,
                          fontFamily: "Montserrat, sans-serif",
                          fontWeight: 300,
                          fontSize: "0.65rem",
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          backgroundColor: "var(--black)",
                          color: "var(--white)",
                          border: "none",
                          padding: "0.6rem",
                          cursor: "pointer",
                          opacity: approveMutation.isPending ? 0.5 : 1,
                        }}
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() => rejectMutation.mutate(w.id)}
                        disabled={rejectMutation.isPending}
                        style={{
                          flex: 1,
                          fontFamily: "Montserrat, sans-serif",
                          fontWeight: 300,
                          fontSize: "0.65rem",
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          backgroundColor: "transparent",
                          color: "var(--black)",
                          border: "1px solid var(--gray-border)",
                          padding: "0.6rem",
                          cursor: "pointer",
                          opacity: rejectMutation.isPending ? 0.5 : 1,
                        }}
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Shop Schedule Settings ── */}
        <div style={{
          marginTop: "3rem",
          border: "1px solid var(--gray-border)",
          background: "#fff",
        }}>
          <div style={{
            padding: "1.25rem 2rem",
            borderBottom: "1px solid var(--gray-border)",
          }}>
            <p style={{
              fontFamily: "Montserrat, sans-serif", fontWeight: 600,
              fontSize: "0.65rem", letterSpacing: "0.2em",
              textTransform: "uppercase", color: "#757575",
            }}>
              Horario de Atención — Configuración de Citas
            </p>
          </div>
          <div style={{ padding: "2rem" }}>
            <p style={{
              fontFamily: "Montserrat, sans-serif", fontWeight: 300,
              fontSize: "0.75rem", color: "#757575",
              marginBottom: "1.5rem", lineHeight: 1.7,
            }}>
              Define el horario de trabajo y el intervalo entre citas. Los cambios aplican inmediatamente para nuevas reservas.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
              {/* Start time */}
              <div>
                <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#757575", marginBottom: "0.4rem" }}>
                  Hora de apertura
                </p>
                <input
                  type="time"
                  value={formStart}
                  onChange={e => setScheduleForm(f => ({ ...f, work_start: e.target.value }))}
                  style={{
                    width: "100%", fontFamily: "Montserrat, sans-serif", fontWeight: 300,
                    fontSize: "0.9rem", color: "#000", background: "transparent",
                    border: "none", borderBottom: "1px solid #e5e5e5",
                    padding: "0.5rem 0", outline: "none",
                  }}
                />
              </div>
              {/* End time */}
              <div>
                <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#757575", marginBottom: "0.4rem" }}>
                  Hora de cierre
                </p>
                <input
                  type="time"
                  value={formEnd}
                  onChange={e => setScheduleForm(f => ({ ...f, work_end: e.target.value }))}
                  style={{
                    width: "100%", fontFamily: "Montserrat, sans-serif", fontWeight: 300,
                    fontSize: "0.9rem", color: "#000", background: "transparent",
                    border: "none", borderBottom: "1px solid #e5e5e5",
                    padding: "0.5rem 0", outline: "none",
                  }}
                />
              </div>
              {/* Interval */}
              <div>
                <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#757575", marginBottom: "0.4rem" }}>
                  Intervalo entre citas (min)
                </p>
                <select
                  value={formInterval}
                  onChange={e => setScheduleForm(f => ({ ...f, slot_interval: e.target.value }))}
                  style={{
                    width: "100%", fontFamily: "Montserrat, sans-serif", fontWeight: 300,
                    fontSize: "0.9rem", color: "#000", background: "transparent",
                    border: "none", borderBottom: "1px solid #e5e5e5",
                    padding: "0.5rem 0", outline: "none", cursor: "pointer",
                  }}
                >
                  <option value="15">Cada 15 minutos</option>
                  <option value="30">Cada 30 minutos</option>
                  <option value="45">Cada 45 minutos</option>
                  <option value="60">Cada 60 minutos</option>
                </select>
              </div>
            </div>
            {/* Show tips toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #f0f0f0" }}>
              <div
                onClick={() => setScheduleForm(f => ({ ...f, show_tips: !formShowTips }))}
                style={{
                  width: "44px", height: "24px", borderRadius: "12px",
                  background: formShowTips ? "#000" : "#ccc",
                  cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0,
                }}
              >
                <div style={{
                  width: "18px", height: "18px", borderRadius: "50%", background: "#fff",
                  position: "absolute", top: "3px",
                  left: formShowTips ? "23px" : "3px",
                  transition: "left 0.2s",
                }} />
              </div>
              <div>
                <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 500, fontSize: "0.75rem", margin: 0 }}>
                  Mostrar Propinas Sugeridas
                </p>
                <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.68rem", color: "#888", margin: "2px 0 0" }}>
                  {formShowTips ? "Los clientes verán opciones de 15%, 20%, 25%" : "La sección de propinas está oculta"}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <button
                onClick={() => settingsMutation.mutate({
                  work_start: formStart,
                  work_end: formEnd,
                  slot_interval: Number(formInterval),
                  show_tips: formShowTips,
                })}
                disabled={settingsMutation.isPending}
                style={{
                  fontFamily: "Montserrat, sans-serif", fontWeight: 500, fontSize: "0.7rem",
                  letterSpacing: "0.2em", textTransform: "uppercase",
                  background: "#000", color: "#fff", border: "none",
                  padding: "0.85rem 2rem",
                  cursor: settingsMutation.isPending ? "not-allowed" : "pointer",
                  opacity: settingsMutation.isPending ? 0.6 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                {settingsMutation.isPending ? "Guardando..." : "Guardar Horario"}
              </button>
              {scheduleSaved && (
                <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.75rem", color: "#2d7a2d" }}>
                  ✓ Horario actualizado
                </p>
              )}
              {settingsMutation.isError && (
                <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.75rem", color: "#c00" }}>
                  Error al guardar. Intenta de nuevo.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Gestión Dinámica de Disponibilidad ── */}
        <div style={{ marginTop: "3rem", border: "1px solid var(--gray-border)", background: "#fff" }}>
          <div style={{ padding: "1.25rem 2rem", borderBottom: "1px solid var(--gray-border)" }}>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#757575" }}>
              Gestión de Disponibilidad — Control Manual de Horarios
            </p>
          </div>
          <div style={{ padding: "2rem" }}>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.75rem", color: "#757575", marginBottom: "1.5rem", lineHeight: 1.7 }}>
              Selecciona un barbero y una fecha para gestionar manualmente los horarios disponibles. Genera el horario base y luego activa o desactiva los slots individualmente para controlar exactamente qué horas ven los clientes.
            </p>

            {/* Selector row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
              <div>
                <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#757575", marginBottom: "0.4rem" }}>Barbero</p>
                <select
                  value={slotMgrBarberId}
                  onChange={e => setSlotMgrBarberId(e.target.value)}
                  style={{ width: "100%", fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.85rem", color: "#000", background: "transparent", border: "none", borderBottom: "1px solid #e5e5e5", padding: "0.5rem 0", outline: "none", cursor: "pointer" }}
                >
                  <option value="">— Seleccionar —</option>
                  {(barbers ?? []).map((b: any) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#757575", marginBottom: "0.4rem" }}>Fecha</p>
                <input
                  type="date"
                  value={slotMgrDate}
                  onChange={e => setSlotMgrDate(e.target.value)}
                  style={{ width: "100%", fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.85rem", color: "#000", background: "transparent", border: "none", borderBottom: "1px solid #e5e5e5", padding: "0.5rem 0", outline: "none" }}
                />
              </div>
            </div>

            {/* Action buttons */}
            {slotMgrBarberId && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.5rem", alignItems: "center" }}>
                <button
                  onClick={() => generateSlotsMutation.mutate()}
                  disabled={generateSlotsMutation.isPending}
                  style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 500, fontSize: "0.68rem", letterSpacing: "0.15em", textTransform: "uppercase", background: "#000", color: "#fff", border: "none", padding: "0.7rem 1.5rem", cursor: "pointer", opacity: generateSlotsMutation.isPending ? 0.6 : 1 }}>
                  {generateSlotsMutation.isPending ? "Generando..." : "Generar Horario Base"}
                </button>
                {/* Custom slot add */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input
                    type="time"
                    value={customSlotTime}
                    onChange={e => setCustomSlotTime(e.target.value)}
                    style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.8rem", border: "none", borderBottom: "1px solid #e5e5e5", padding: "0.4rem 0", outline: "none", background: "transparent", width: "110px" }}
                  />
                  <button
                    onClick={() => customSlotTime && addCustomSlotMutation.mutate()}
                    disabled={!customSlotTime || addCustomSlotMutation.isPending}
                    style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", background: "transparent", color: "#000", border: "1px solid #000", padding: "0.5rem 1rem", cursor: "pointer", opacity: !customSlotTime ? 0.4 : 1 }}>
                    + Agregar
                  </button>
                </div>
                {slotMgrMsg && <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.75rem", color: "#2d7a2d", margin: 0 }}>✓ {slotMgrMsg}</p>}
              </div>
            )}

            {/* Slots grid with toggles */}
            {slotMgrBarberId && managedSlots && (managedSlots as any[]).length === 0 && (
              <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.78rem", color: "#aaa", textAlign: "center", padding: "1.5rem 0" }}>
                No hay horarios para esta fecha. Haz clic en "Generar Horario Base" para empezar.
              </p>
            )}
            {slotMgrBarberId && managedSlots && (managedSlots as any[]).length > 0 && (
              <>
                <style>{`
                  .slot-block { transition: opacity 0.2s; }
                  .slot-block:hover { opacity: 0.88; }
                `}</style>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "0.6rem" }}>
                  {(managedSlots as any[]).map((slot: any) => (
                    <div key={slot.id} className="slot-block" style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "0.5rem 0.75rem",
                      border: `1px solid ${slot.is_active ? (slot.is_booked ? "#c8e6c9" : "#000") : "#e0e0e0"}`,
                      background: slot.is_booked ? "#f9fff9" : slot.is_active ? "#000" : "#fafafa",
                      borderRadius: "4px",
                      boxSizing: "border-box",
                    }}>
                      <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: slot.is_active ? 500 : 300, fontSize: "0.78rem", color: slot.is_active && !slot.is_booked ? "#fff" : "#555" }}>
                        {String(slot.start_time).slice(0, 5)}
                        {slot.is_booked && <span style={{ fontSize: "0.6rem", marginLeft: "4px", color: "#888" }}>●</span>}
                      </span>
                      {!slot.is_booked ? (
                        <div style={{ display: "flex", gap: "4px" }}>
                          <div
                            onClick={() => toggleSlotMutation.mutate(slot.id)}
                            title={slot.is_active ? "Desactivar" : "Activar"}
                            style={{
                              width: "32px", height: "18px", borderRadius: "9px",
                              background: slot.is_active ? "#225C43" : "#333333",
                              cursor: "pointer", position: "relative", flexShrink: 0,
                              transition: "background 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            }}>
                            <div style={{
                              width: "12px", height: "12px", borderRadius: "50%",
                              background: "#fff",
                              position: "absolute", top: "3px",
                              left: slot.is_active ? "18px" : "2px",
                              transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.15)",
                            }} />
                          </div>
                          <button
                            onClick={() => deleteSlotMutation.mutate(slot.id)}
                            style={{ fontFamily: "Montserrat, sans-serif", fontSize: "0.6rem", background: "transparent", color: slot.is_active ? "#fff" : "#bbb", border: "none", cursor: "pointer", padding: "0 2px", lineHeight: 1 }}>
                            ✕
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "0.58rem", color: "#888", letterSpacing: "0.05em" }}>RESERVADO</span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Manage Team ── */}
        <div style={{ marginTop: "3rem", border: "1px solid var(--gray-border)", background: "#fff" }}>
          <div style={{
            padding: "1.25rem 2rem", borderBottom: "1px solid var(--gray-border)",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem",
          }}>
            <p style={{
              fontFamily: "Montserrat, sans-serif", fontWeight: 600,
              fontSize: "0.65rem", letterSpacing: "0.2em",
              textTransform: "uppercase", color: "#757575",
            }}>
              Gestionar Equipo
            </p>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
              {syncMsg && (
                <span style={{ fontFamily: "Montserrat, sans-serif", fontSize: "0.7rem",
                  color: "#2a7a2a", fontWeight: 500 }}>{syncMsg}</span>
              )}
              <button
                onClick={() => syncServicesMutation.mutate()}
                disabled={syncServicesMutation.isPending}
                style={{
                  fontFamily: "Montserrat, sans-serif", fontWeight: 500,
                  fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase",
                  background: "transparent", color: "#555",
                  border: "1px solid #aaa", padding: "0.5rem 1.25rem", cursor: "pointer",
                  transition: "all 0.2s", opacity: syncServicesMutation.isPending ? 0.6 : 1,
                }}>
                {syncServicesMutation.isPending ? "Sincronizando..." : "Sincronizar Servicios"}
              </button>
              <button
                onClick={() => { setShowAddForm(s => !s); setAddError(""); }}
                style={{
                  fontFamily: "Montserrat, sans-serif", fontWeight: 500,
                  fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase",
                  background: showAddForm ? "transparent" : "#000",
                  color: showAddForm ? "#000" : "#fff",
                  border: "1px solid #000", padding: "0.5rem 1.25rem", cursor: "pointer",
                  transition: "all 0.2s",
                }}>
                {showAddForm ? "Cancelar" : "+ Agregar Barbero"}
              </button>
            </div>
          </div>

          <div style={{ padding: "1.5rem 2rem" }}>

            {/* Add barber form */}
            {showAddForm && (
              <div style={{
                background: "#f9f9f9", border: "1px solid var(--gray-border)",
                padding: "1.5rem", marginBottom: "1.5rem",
              }}>
                <p style={{
                  fontFamily: "Montserrat, sans-serif", fontWeight: 600,
                  fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase",
                  color: "#555", marginBottom: "1.25rem",
                }}>Nuevo Barbero</p>

                {/* Photo picker for new barber */}
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                  <label style={{ cursor: "pointer", display: "block" }}>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          const MAX = 900;
                          const img = new Image();
                          img.onload = () => {
                            let { width: w, height: h } = img;
                            if (w > MAX || h > MAX) {
                              if (w >= h) { h = Math.round(h * MAX / w); w = MAX; }
                              else        { w = Math.round(w * MAX / h); h = MAX; }
                            }
                            const canvas = document.createElement("canvas");
                            canvas.width = w; canvas.height = h;
                            canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
                            const resized = canvas.toDataURL("image/jpeg", 0.82);
                            setAddFormPhoto({ imageData: resized, filename: file.name.replace(/\.[^.]+$/, ".jpg") });
                            setAddFormPhotoPreview(resized);
                          };
                          img.src = reader.result as string;
                        };
                        reader.readAsDataURL(file);
                        e.target.value = "";
                      }}
                    />
                    <div style={{ position: "relative", width: "72px", height: "72px" }}>
                      <div style={{
                        width: "72px", height: "72px", borderRadius: "50%",
                        overflow: "hidden", background: "#e5e5e5",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {addFormPhotoPreview ? (
                          <img src={addFormPhotoPreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                          </svg>
                        )}
                      </div>
                      <div style={{
                        position: "absolute", bottom: 0, right: 0,
                        width: "22px", height: "22px", borderRadius: "50%",
                        background: "#000", border: "2px solid #fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                          <circle cx="12" cy="13" r="4"/>
                        </svg>
                      </div>
                    </div>
                  </label>
                  <div>
                    <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 500, fontSize: "0.7rem", color: "#333" }}>
                      {addFormPhotoPreview ? "Foto seleccionada ✓" : "Agregar foto"}
                    </p>
                    <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.6rem", color: "#999", marginTop: "3px" }}>
                      Opcional · Toca el círculo para seleccionar
                    </p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
                  {(["name", "email", "password", "specialty"] as const).map(field => (
                    <div key={field}>
                      <p style={{
                        fontFamily: "Montserrat, sans-serif", fontWeight: 300,
                        fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase",
                        color: "#757575", marginBottom: "0.35rem",
                      }}>
                        {field === "name" ? "Nombre" : field === "email" ? "Email" : field === "password" ? "Contraseña" : "Especialidad"}
                      </p>
                      {field === "password" ? (
                        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                          <input
                            type={showPassword ? "text" : "password"}
                            value={addForm.password}
                            onChange={e => setAddForm(f => ({ ...f, password: e.target.value }))}
                            style={{
                              flex: 1, fontFamily: "Montserrat, sans-serif",
                              fontWeight: 300, fontSize: "0.85rem", color: "#000",
                              background: "transparent", border: "none",
                              borderBottom: "1px solid #e5e5e5",
                              padding: "0.4rem 0", outline: "none", paddingRight: "28px",
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(s => !s)}
                            style={{
                              position: "absolute", right: 0,
                              background: "none", border: "none", cursor: "pointer",
                              padding: "2px", color: "#aaa", display: "flex", alignItems: "center",
                            }}
                            title={showPassword ? "Ocultar" : "Mostrar"}
                          >
                            {showPassword ? (
                              /* eye-off */
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                <line x1="1" y1="1" x2="23" y2="23"/>
                              </svg>
                            ) : (
                              /* eye */
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                              </svg>
                            )}
                          </button>
                        </div>
                      ) : (
                        <input
                          type={field === "email" ? "email" : "text"}
                          value={addForm[field]}
                          placeholder={field === "specialty" ? "Ej: Fade & Barba" : ""}
                          onChange={e => setAddForm(f => ({ ...f, [field]: e.target.value }))}
                          style={{
                            width: "100%", fontFamily: "Montserrat, sans-serif",
                            fontWeight: 300, fontSize: "0.85rem", color: "#000",
                            background: "transparent", border: "none",
                            borderBottom: "1px solid #e5e5e5",
                            padding: "0.4rem 0", outline: "none", boxSizing: "border-box",
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
                {addError && (
                  <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "0.75rem", color: "#c00", marginBottom: "0.75rem" }}>
                    {addError}
                  </p>
                )}
                <button
                  onClick={() => addBarberMutation.mutate(addForm)}
                  disabled={addBarberMutation.isPending || !addForm.name || !addForm.email || !addForm.password}
                  style={{
                    fontFamily: "Montserrat, sans-serif", fontWeight: 500,
                    fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase",
                    background: "#000", color: "#fff", border: "none",
                    padding: "0.8rem 2rem", cursor: "pointer",
                    opacity: (addBarberMutation.isPending || !addForm.name || !addForm.email || !addForm.password) ? 0.5 : 1,
                    transition: "opacity 0.2s",
                  }}>
                  {addBarberMutation.isPending ? "Creando..." : "Crear Barbero"}
                </button>
              </div>
            )}

            {/* Barber list */}
            {barbersLoading && (
              <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "0.8rem", color: "#aaa" }}>Cargando...</p>
            )}
            {!barbersLoading && (!barbers || barbers.length === 0) && (
              <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.85rem", color: "var(--gray-mid)" }}>
                No hay barberos registrados.
              </p>
            )}
            {barbers?.map(b => (
              <div key={b.id} style={{
                padding: "1rem 0", borderBottom: "1px solid var(--gray-border)",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  {/* Avatar — label wraps input for reliable iOS file picker */}
                  <div style={{ position: "relative", flexShrink: 0, width: "52px" }}>
                    <label style={{ display: "block", cursor: "pointer" }} title="Subir foto">
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={e => handleAvatarFileSelect(e, b.id)}
                      />
                      <div style={{
                        width: "48px", height: "48px", borderRadius: "50%",
                        overflow: "hidden", background: "#f0f0f0", position: "relative",
                      }}>
                        {uploadingAvatar === b.id ? (
                          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                            display: "flex", alignItems: "center", justifyContent: "center", background: "#eee" }}>
                            <span style={{ fontSize: "10px", color: "#999" }}>...</span>
                          </div>
                        ) : (
                          <img
                            src={b.avatar ? `https://vantagestudioapp.com${b.avatar}` : "/images/barber-1.webp"}
                            alt={b.name}
                            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                              objectFit: "cover", display: "block" }}
                            onError={(e) => { (e.target as HTMLImageElement).src = "/images/barber-1.webp"; }}
                          />
                        )}
                      </div>
                      {/* Camera badge */}
                      <div style={{
                        position: "absolute", bottom: 0, right: 0,
                        width: "18px", height: "18px", borderRadius: "50%",
                        background: "#000", border: "2px solid #fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        pointerEvents: "none",
                      }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                          <circle cx="12" cy="13" r="4"/>
                        </svg>
                      </div>
                    </label>
                  </div>
                  <div>
                    <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: "0.85rem", color: "#000" }}>
                      {b.name}
                    </p>
                    <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.75rem", color: "#757575" }}>
                      {b.specialty || "General"}
                    </p>
                  </div>
                </div>

                  {/* Services toggle + Edit toggle + Delete */}
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                    <button
                      onClick={() => setExpandedBarber(expandedBarber === b.id ? null : b.id)}
                      style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", background: "transparent", color: "#000", border: "1px solid #e5e5e5", padding: "0.4rem 1rem", cursor: "pointer" }}>
                      {expandedBarber === b.id ? "Ocultar" : `Servicios (${b.services?.length ?? 0})`}
                    </button>
                    <button
                      onClick={() => {
                        if (editingBarber === b.id) {
                          setEditingBarber(null);
                          setBarberEditForm(f => { const n = { ...f }; delete n[b.id]; return n; });
                        } else {
                          setEditingBarber(b.id);
                          setBarberEditForm(f => ({ ...f, [b.id]: { name: b.name, specialty: b.specialty || "", email: b.email || "", password: "" } }));
                        }
                      }}
                      style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", background: editingBarber === b.id ? "#000" : "transparent", color: editingBarber === b.id ? "#fff" : "#000", border: "1px solid #000", padding: "0.4rem 1rem", cursor: "pointer" }}>
                      {editingBarber === b.id ? "Cerrar" : "Editar"}
                    </button>
                    {deleteConfirm === b.id ? (
                      <>
                        <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "0.7rem", color: "#c00" }}>¿Confirmar?</p>
                        <button onClick={() => deleteBarberMutation.mutate(b.id)} disabled={deleteBarberMutation.isPending}
                          style={{ fontFamily: "Montserrat, sans-serif", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", background: "#c00", color: "#fff", border: "none", padding: "0.4rem 0.9rem", cursor: "pointer", opacity: deleteBarberMutation.isPending ? 0.5 : 1 }}>
                          Eliminar
                        </button>
                        <button onClick={() => setDeleteConfirm(null)}
                          style={{ fontFamily: "Montserrat, sans-serif", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", background: "transparent", color: "#000", border: "1px solid var(--gray-border)", padding: "0.4rem 0.9rem", cursor: "pointer" }}>
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setDeleteConfirm(b.id)}
                        style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", background: "transparent", color: "#999", border: "1px solid #e5e5e5", padding: "0.4rem 1rem", cursor: "pointer", transition: "color 0.2s, border-color 0.2s" }}
                        onMouseEnter={e => { e.currentTarget.style.color = "#c00"; e.currentTarget.style.borderColor = "#c00"; }}
                        onMouseLeave={e => { e.currentTarget.style.color = "#999"; e.currentTarget.style.borderColor = "#e5e5e5"; }}>
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>

                {/* ── Edit panel ── */}
                {editingBarber === b.id && (
                  <div style={{ marginTop: "1rem", background: "#f9f9f9", border: "1px solid #eee", padding: "1rem 1.25rem" }}>
                    <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#757575", marginBottom: "0.75rem" }}>
                      Editar Barbero
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
                      <div>
                        <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#757575", marginBottom: "0.35rem" }}>Nombre</p>
                        <input
                          value={barberEditForm[b.id]?.name ?? b.name}
                          onChange={e => setBarberEditForm(f => ({ ...f, [b.id]: { ...(f[b.id] ?? { name: b.name, specialty: b.specialty || "", email: b.email || "", password: "" }), name: e.target.value } }))}
                          style={{ width: "100%", fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.85rem", color: "#000", background: "transparent", border: "none", borderBottom: "1px solid #e5e5e5", padding: "0.4rem 0", outline: "none", boxSizing: "border-box" }}
                        />
                      </div>
                      <div>
                        <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#757575", marginBottom: "0.35rem" }}>Especialidad</p>
                        <input
                          value={barberEditForm[b.id]?.specialty ?? (b.specialty || "")}
                          placeholder="Ej: Fade & Barba"
                          onChange={e => setBarberEditForm(f => ({ ...f, [b.id]: { ...(f[b.id] ?? { name: b.name, specialty: b.specialty || "", email: b.email || "", password: "" }), specialty: e.target.value } }))}
                          style={{ width: "100%", fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.85rem", color: "#000", background: "transparent", border: "none", borderBottom: "1px solid #e5e5e5", padding: "0.4rem 0", outline: "none", boxSizing: "border-box" }}
                        />
                      </div>
                      <div>
                        <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#757575", marginBottom: "0.35rem" }}>Email</p>
                        <input
                          type="email"
                          value={barberEditForm[b.id]?.email ?? (b.email || "")}
                          onChange={e => setBarberEditForm(f => ({ ...f, [b.id]: { ...(f[b.id] ?? { name: b.name, specialty: b.specialty || "", email: b.email || "", password: "" }), email: e.target.value } }))}
                          style={{ width: "100%", fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.85rem", color: "#000", background: "transparent", border: "none", borderBottom: "1px solid #e5e5e5", padding: "0.4rem 0", outline: "none", boxSizing: "border-box" }}
                        />
                      </div>
                      <div>
                        <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#757575", marginBottom: "0.35rem" }}>Nueva Contraseña</p>
                        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                          <input
                            type={showBarberPassword[b.id] ? "text" : "password"}
                            value={barberEditForm[b.id]?.password ?? ""}
                            placeholder="Dejar vacío para no cambiar"
                            onChange={e => setBarberEditForm(f => ({ ...f, [b.id]: { ...(f[b.id] ?? { name: b.name, specialty: b.specialty || "", email: b.email || "", password: "" }), password: e.target.value } }))}
                            style={{ flex: 1, fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.85rem", color: "#000", background: "transparent", border: "none", borderBottom: "1px solid #e5e5e5", padding: "0.4rem 0", outline: "none", paddingRight: "28px" }}
                          />
                          <button type="button"
                            onClick={() => setShowBarberPassword(s => ({ ...s, [b.id]: !s[b.id] }))}
                            style={{ position: "absolute", right: 0, background: "none", border: "none", cursor: "pointer", padding: "2px", color: "#aaa", display: "flex", alignItems: "center" }}>
                            {showBarberPassword[b.id] ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                              </svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                      <button
                        onClick={() => {
                          const form = barberEditForm[b.id] ?? { name: b.name, specialty: b.specialty || "", email: b.email || "", password: "" };
                          updateBarberProfileMutation.mutate({ barberId: b.id, name: form.name, specialty: form.specialty, email: form.email, password: form.password });
                        }}
                        disabled={updateBarberProfileMutation.isPending}
                        style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 500, fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", background: "#000", color: "#fff", border: "none", padding: "0.7rem 1.75rem", cursor: "pointer", opacity: updateBarberProfileMutation.isPending ? 0.5 : 1, transition: "opacity 0.2s" }}>
                        {updateBarberProfileMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                      </button>
                      <button
                        onClick={() => { setEditingBarber(null); setBarberEditForm(f => { const n = { ...f }; delete n[b.id]; return n; }); }}
                        style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", background: "transparent", color: "#757575", border: "none", padding: "0.7rem 0", cursor: "pointer" }}>
                        Cancelar
                      </button>
                      {updateBarberProfileMutation.isError && (
                        <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: "0.7rem", color: "#c00" }}>Error al guardar.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Services panel ── */}
                {expandedBarber === b.id && (
                  <div style={{ marginTop: "1rem", background: "#f9f9f9", border: "1px solid #eee", padding: "1rem 1.25rem", boxSizing: "border-box", width: "100%", overflowX: "hidden" }}>
                    <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#757575", marginBottom: "0.75rem" }}>
                      Servicios
                    </p>
                    {(b.services ?? []).map((svc: any) => {
                      const key = svc.id;
                      const edit = serviceEdits[key] ?? { name: svc.name, price: String(svc.price), duration_minutes: String(svc.duration_minutes) };
                      return (
                        <div key={key} style={{ display: "flex", flexDirection: "column", gap: "0.35rem", marginBottom: "0.75rem", width: "100%", boxSizing: "border-box" }}>
                          {/* Row 1: service name — always full width */}
                          <input value={edit.name} onChange={e => setServiceEdits(s => ({ ...s, [key]: { ...edit, name: e.target.value } }))}
                            style={{ fontFamily: "Montserrat, sans-serif", fontSize: "0.8rem", border: "none", borderBottom: "1px solid #ddd", padding: "0.25rem 0", outline: "none", background: "transparent", width: "100%", boxSizing: "border-box" }} />
                          {/* Row 2: price | duration | Save | ✕ — all aligned to the right */}
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px" }}>
                            <input value={edit.price} onChange={e => setServiceEdits(s => ({ ...s, [key]: { ...edit, price: e.target.value } }))}
                              placeholder="$" style={{ fontFamily: "Montserrat, sans-serif", fontSize: "0.8rem", border: "none", borderBottom: "1px solid #ddd", padding: "0.25rem 0", outline: "none", background: "transparent", width: "45px", textAlign: "right", boxSizing: "border-box" }} />
                            <span style={{ color: "#ccc", fontSize: "0.7rem" }}>|</span>
                            <input value={edit.duration_minutes} onChange={e => setServiceEdits(s => ({ ...s, [key]: { ...edit, duration_minutes: e.target.value } }))}
                              placeholder="min" style={{ fontFamily: "Montserrat, sans-serif", fontSize: "0.8rem", border: "none", borderBottom: "1px solid #ddd", padding: "0.25rem 0", outline: "none", background: "transparent", width: "40px", textAlign: "right", boxSizing: "border-box" }} />
                            <button onClick={() => updateServiceMutation.mutate({ serviceId: key, ...edit })}
                              style={{ fontFamily: "Montserrat, sans-serif", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", background: "#000", color: "#fff", border: "none", padding: "0.3rem 0.8rem", cursor: "pointer", whiteSpace: "nowrap" }}>
                              Guardar
                            </button>
                            <button onClick={() => deleteServiceMutation.mutate(key)}
                              style={{ fontFamily: "Montserrat, sans-serif", fontSize: "0.7rem", background: "transparent", color: "#aaa", border: "1px solid #ddd", padding: "0.25rem 0.55rem", cursor: "pointer" }}>
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Add new service row */}
                    {(() => {
                      const nf = newServiceForm[b.id] ?? { name: "", price: "", duration_minutes: "" };
                      return (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid #eee", width: "100%", boxSizing: "border-box" }}>
                          {/* Row 1: new service name — full width */}
                          <input value={nf.name} placeholder="Nombre del servicio"
                            onChange={e => setNewServiceForm(s => ({ ...s, [b.id]: { ...nf, name: e.target.value } }))}
                            style={{ fontFamily: "Montserrat, sans-serif", fontSize: "0.8rem", border: "none", borderBottom: "1px solid #ddd", padding: "0.25rem 0", outline: "none", background: "transparent", width: "100%", boxSizing: "border-box" }} />
                          {/* Row 2: price | duration | + Agregar */}
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px" }}>
                            <input value={nf.price} placeholder="Precio"
                              onChange={e => setNewServiceForm(s => ({ ...s, [b.id]: { ...nf, price: e.target.value } }))}
                              style={{ fontFamily: "Montserrat, sans-serif", fontSize: "0.8rem", border: "none", borderBottom: "1px solid #ddd", padding: "0.25rem 0", outline: "none", background: "transparent", width: "45px", textAlign: "right", boxSizing: "border-box" }} />
                            <span style={{ color: "#ccc", fontSize: "0.7rem" }}>|</span>
                            <input value={nf.duration_minutes} placeholder="min"
                              onChange={e => setNewServiceForm(s => ({ ...s, [b.id]: { ...nf, duration_minutes: e.target.value } }))}
                              style={{ fontFamily: "Montserrat, sans-serif", fontSize: "0.8rem", border: "none", borderBottom: "1px solid #ddd", padding: "0.25rem 0", outline: "none", background: "transparent", width: "40px", textAlign: "right", boxSizing: "border-box" }} />
                            <button
                              onClick={() => nf.name && nf.price && addServiceMutation.mutate({ barberId: b.id, ...nf })}
                              disabled={!nf.name || !nf.price}
                              style={{ fontFamily: "Montserrat, sans-serif", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", background: "#000", color: "#fff", border: "none", padding: "0.3rem 0.8rem", cursor: "pointer", opacity: (!nf.name || !nf.price) ? 0.4 : 1, whiteSpace: "nowrap" }}>
                              + Agregar
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Gallery Moderation ──────────────────────────────────────────── */}
        <div style={{ marginTop: "3rem", padding: "2rem", border: "1px solid var(--gray-border)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <div>
              <p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 300, fontSize: "0.65rem",
                letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--gray-mid)", marginBottom: "0.3rem" }}>
                Estudio
              </p>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.2rem",
                fontWeight: 700, color: "var(--black)", margin: 0 }}>
                Moderación de Galería
              </h3>
            </div>
            {pendingPhotos && pendingPhotos.length > 0 && (
              <span style={{
                background: "#000", color: "#fff",
                fontFamily: "Montserrat,sans-serif", fontSize: "10px",
                fontWeight: 600, letterSpacing: "0.1em",
                padding: "4px 12px",
              }}>
                {pendingPhotos.length} PENDIENTE{pendingPhotos.length > 1 ? "S" : ""}
              </span>
            )}
          </div>

          {photosLoading ? (
            <div style={{ padding: "2rem 0" }}>
              <Spinner size={22} theme="dark" label="Cargando fotos pendientes…" />
            </div>
          ) : !pendingPhotos || pendingPhotos.length === 0 ? (
            <p style={{ fontFamily: "Montserrat,sans-serif", fontSize: "13px",
              color: "var(--gray-mid)", fontStyle: "italic" }}>
              No hay fotos pendientes de revisión.
            </p>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "1rem",
            }}>
              {pendingPhotos.map((photo: GalleryPhoto) => (
                <div key={photo.id} style={{ border: "1px solid var(--gray-border)", overflow: "hidden" }}>
                  <div style={{ position: "relative", aspectRatio: "1", background: "#f0f0f0" }}>
                    <img
                      src={`https://vantagestudioapp.com${photo.url}`}
                      alt="Pendiente"
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  </div>
                  <div style={{ padding: "0.65rem" }}>
                    <p style={{ fontFamily: "Montserrat,sans-serif", fontSize: "11px", fontWeight: 600,
                      letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--black)",
                      marginBottom: "2px" }}>
                      {photo.barber_name}
                    </p>
                    <p style={{ fontFamily: "Montserrat,sans-serif", fontSize: "10px",
                      color: "var(--gray-mid)", letterSpacing: "0.05em", marginBottom: "0.65rem" }}>
                      {SERVICE_TYPES.find(s => s.value === photo.service_type)?.label || photo.service_type}
                    </p>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <button
                        onClick={() => approvePhotoMutation.mutate(photo.id)}
                        disabled={approvePhotoMutation.isPending}
                        style={{
                          flex: 1, fontFamily: "Montserrat,sans-serif", fontSize: "9px",
                          fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
                          background: "#000", color: "#fff", border: "none",
                          padding: "0.45rem 0", cursor: "pointer",
                        }}
                      >
                        ✓ Aprobar
                      </button>
                      <button
                        onClick={() => rejectPhotoMutation.mutate(photo.id)}
                        disabled={rejectPhotoMutation.isPending}
                        style={{
                          flex: 1, fontFamily: "Montserrat,sans-serif", fontSize: "9px",
                          fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
                          background: "transparent", color: "#c0392b",
                          border: "1px solid #c0392b", padding: "0.45rem 0", cursor: "pointer",
                        }}
                      >
                        ✕ Rechazar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Gestión de Productos ─────────────────────────────────────────── */}
        <div style={{ marginTop: "3rem", border: "1px solid var(--gray-border)", background: "#fff" }}>
          <div style={{ padding: "1.25rem 2rem", borderBottom: "1px solid var(--gray-border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
            <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#757575" }}>
              Tienda
            </p>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.2rem", fontWeight: 700, color: "var(--black)", margin: 0 }}>
              Gestión de Productos
            </h3>
            {allProducts && allProducts.filter(p => p.stock_quantity <= p.low_stock_threshold && p.stock_quantity > 0).length > 0 && (
              <span style={{ background: "#e67e22", color: "#fff", fontFamily: "Montserrat,sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", padding: "4px 12px" }}>
                ⚠ {allProducts.filter(p => p.stock_quantity <= p.low_stock_threshold && p.stock_quantity > 0).length} STOCK BAJO
              </span>
            )}
          </div>

          <div style={{ padding: "1.5rem 2rem" }}>

            {/* ── Add / Edit product form ── */}
            <p style={{ fontFamily: "Montserrat,sans-serif", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#999", marginBottom: "1rem" }}>
              {editingProd ? "Editar Producto" : "Nuevo Producto"}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.75rem", marginBottom: "0.75rem" }}>
              {[
                { label: "Nombre", key: "name", type: "text", placeholder: "Ej: Aceite Capilar" },
                { label: "Precio ($)", key: "price", type: "number", placeholder: "0.00" },
                { label: "Stock", key: "stock", type: "number", placeholder: "0" },
                { label: "Alerta stock bajo (<)", key: "threshold", type: "number", placeholder: "5" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontFamily: "Montserrat,sans-serif", fontSize: "9px", fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", color: "#999", display: "block", marginBottom: "5px" }}>{f.label}</label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={(editingProd ? { name: editingProd.name, price: String(editingProd.price), stock: String(editingProd.stock_quantity), threshold: String(editingProd.low_stock_threshold), description: editingProd.description } : prodForm)[f.key as keyof typeof prodForm]}
                    onChange={e => {
                      if (editingProd) setEditingProd({ ...editingProd, [f.key === "stock" ? "stock_quantity" : f.key === "threshold" ? "low_stock_threshold" : f.key]: f.type === "number" ? Number(e.target.value) : e.target.value });
                      else setProdForm(prev => ({ ...prev, [f.key]: e.target.value }));
                    }}
                    style={{ width: "100%", padding: "0.55rem 0.75rem", fontFamily: "Montserrat,sans-serif", fontSize: "0.78rem", border: "1px solid var(--gray-border)", background: "#fafafa", boxSizing: "border-box" as const, outline: "none" }}
                  />
                </div>
              ))}
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontFamily: "Montserrat,sans-serif", fontSize: "9px", fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", color: "#999", display: "block", marginBottom: "5px" }}>Descripción</label>
              <textarea
                placeholder="Descripción del producto..."
                rows={2}
                value={editingProd ? editingProd.description : prodForm.description}
                onChange={e => { if (editingProd) setEditingProd({ ...editingProd, description: e.target.value }); else setProdForm(prev => ({ ...prev, description: e.target.value })); }}
                style={{ width: "100%", padding: "0.55rem 0.75rem", fontFamily: "Montserrat,sans-serif", fontSize: "0.78rem", border: "1px solid var(--gray-border)", background: "#fafafa", boxSizing: "border-box" as const, outline: "none", resize: "vertical" as const }}
              />
            </div>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <button
                onClick={() => {
                  if (editingProd) {
                    updateProductMutation.mutate({ id: editingProd.id, data: { name: editingProd.name, description: editingProd.description, price: editingProd.price, stock_quantity: editingProd.stock_quantity, low_stock_threshold: editingProd.low_stock_threshold } });
                  } else {
                    if (!prodForm.name || !prodForm.price) return;
                    createProductMutation.mutate({ name: prodForm.name, description: prodForm.description, price: Number(prodForm.price), stock_quantity: Number(prodForm.stock), low_stock_threshold: Number(prodForm.threshold) });
                  }
                }}
                disabled={createProductMutation.isPending || updateProductMutation.isPending}
                style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", padding: "0.65rem 1.5rem", background: "var(--black)", color: "#fff", border: "none", cursor: "pointer" }}
              >
                {editingProd ? "Guardar Cambios" : "+ Crear Producto"}
              </button>
              {editingProd && (
                <button onClick={() => setEditingProd(null)} style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 300, fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", padding: "0.65rem 1.5rem", background: "transparent", color: "#888", border: "1px solid #ddd", cursor: "pointer" }}>
                  Cancelar
                </button>
              )}
            </div>
            {prodMsg && <p style={{ fontFamily: "Montserrat,sans-serif", fontSize: "12px", color: "#27ae60", marginTop: "0.75rem" }}>✓ {prodMsg}</p>}

            {/* ── Product list ── */}
            <div style={{ marginTop: "2rem" }}>
              {productsLoading ? (
                <Spinner size={20} theme="dark" label="Cargando productos…" />
              ) : !allProducts || allProducts.length === 0 ? (
                <p style={{ fontFamily: "Montserrat,sans-serif", fontSize: "13px", color: "var(--gray-mid)", fontStyle: "italic" }}>No hay productos. Crea el primero arriba.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {allProducts.map(prod => {
                    const isLow = prod.stock_quantity > 0 && prod.stock_quantity <= prod.low_stock_threshold;
                    const isOut = prod.stock_quantity === 0;
                    return (
                      <div key={prod.id} style={{ border: `1px solid ${isOut ? "#e74c3c" : isLow ? "#e67e22" : "var(--gray-border)"}`, padding: "1rem", background: "#fafafa" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                          <div style={{ flex: 1, minWidth: "200px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "4px" }}>
                              <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "1rem", fontWeight: 700, color: "var(--black)", margin: 0 }}>{prod.name}</p>
                              {isOut && <span style={{ background: "#e74c3c", color: "#fff", fontFamily: "Montserrat,sans-serif", fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", padding: "2px 8px" }}>AGOTADO</span>}
                              {isLow && <span style={{ background: "#e67e22", color: "#fff", fontFamily: "Montserrat,sans-serif", fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", padding: "2px 8px" }}>STOCK BAJO</span>}
                              {!prod.is_active && <span style={{ background: "#999", color: "#fff", fontFamily: "Montserrat,sans-serif", fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", padding: "2px 8px" }}>OCULTO</span>}
                            </div>
                            <p style={{ fontFamily: "Montserrat,sans-serif", fontSize: "11px", color: "#888", margin: "0 0 6px" }}>{prod.description}</p>
                            <div style={{ display: "flex", gap: "1.5rem" }}>
                              <span style={{ fontFamily: "Montserrat,sans-serif", fontSize: "12px", fontWeight: 600, color: "#C5A059" }}>${Number(prod.price).toFixed(2)}</span>
                              <span style={{ fontFamily: "Montserrat,sans-serif", fontSize: "12px", color: isOut ? "#e74c3c" : isLow ? "#e67e22" : "#555" }}>Stock: {prod.stock_quantity} (alerta &lt;{prod.low_stock_threshold})</span>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0, flexWrap: "wrap" }}>
                            <button onClick={() => setEditingProd(prod)} style={{ fontFamily: "Montserrat,sans-serif", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", padding: "5px 12px", background: "transparent", color: "#555", border: "1px solid #ddd", cursor: "pointer" }}>Editar</button>
                            <button onClick={() => updateProductMutation.mutate({ id: prod.id, data: { is_active: !prod.is_active } })} style={{ fontFamily: "Montserrat,sans-serif", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", padding: "5px 12px", background: "transparent", color: prod.is_active ? "#888" : "#27ae60", border: "1px solid #ddd", cursor: "pointer" }}>{prod.is_active ? "Ocultar" : "Mostrar"}</button>
                            <button onClick={() => { if (confirm(`¿Eliminar "${prod.name}"?`)) deleteProductMutation.mutate(prod.id); }} style={{ fontFamily: "Montserrat,sans-serif", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", padding: "5px 12px", background: "transparent", color: "#c0392b", border: "1px solid #ecc", cursor: "pointer" }}>Eliminar</button>
                          </div>
                        </div>

                        {/* Photo gallery */}
                        <div style={{ marginTop: "0.75rem" }}>
                          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                            {(prod.images || []).map((url, idx) => (
                              <div key={idx} style={{ position: "relative", width: "64px", height: "64px" }}>
                                <img src={url.startsWith("/uploads/") ? `https://vantagestudioapp.com${url}` : url} alt={`foto ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                                <button onClick={() => deleteProdPhotoMutation.mutate({ id: prod.id, index: idx })} style={{ position: "absolute", top: "2px", right: "2px", width: "18px", height: "18px", background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", cursor: "pointer", fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                              </div>
                            ))}
                            <label style={{ width: "64px", height: "64px", border: "1px dashed #ccc", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontFamily: "Montserrat,sans-serif", fontSize: "20px", color: "#bbb" }}>
                              {uploadingPhotoProdId === prod.id ? <Spinner size={16} theme="dark" /> : "+"}
                              <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleProdPhotoChange(e, prod.id)} />
                            </label>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}
