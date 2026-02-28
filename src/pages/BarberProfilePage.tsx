import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/ui/Spinner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyProfile, updateProfile, uploadAvatar } from "../services/barbers";
import {
  getMyGalleryPhotos, uploadGalleryPhoto, deleteGalleryPhoto,
  SERVICE_TYPES, type GalleryPhoto,
} from "../services/gallery";
import { useAuthStore } from "../store/authStore";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

export default function BarberProfilePage() {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const updateUser  = useAuthStore((s) => s.updateUser);
  const storeUser   = useAuthStore((s) => s.user);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview]     = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<{ data: string; name: string } | null>(null);
  const [name, setName]           = useState("");
  const [specialty, setSpecialty] = useState("");
  const [saved, setSaved]         = useState(false);
  const [error, setError]         = useState("");

  // ── Studio (gallery photos) ───────────────────────────────────────────────
  const studioInputRef                   = useRef<HTMLInputElement>(null);
  const [studioServiceType, setStudioServiceType] = useState("fade");
  const [studioUploadMsg, setStudioUploadMsg]     = useState("");
  const [studioError, setStudioError]             = useState("");
  const [studioProgress, setStudioProgress]       = useState<{ current: number; total: number } | null>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: getMyProfile,
    onSuccess: (d) => {
      setName(d.name || "");
      setSpecialty(d.specialty || "");
    },
  } as any);

  const avatarMutation = useMutation({
    mutationFn: ({ data, filename }: { data: string; filename: string }) =>
      uploadAvatar(data, filename),
    onSuccess: (res) => {
      updateUser({ avatar: res.avatar, name: res.user.name });
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      queryClient.invalidateQueries({ queryKey: ["barbers"] });
    },
  });

  const profileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (res) => {
      updateUser({ name: res.user.name });
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      queryClient.invalidateQueries({ queryKey: ["barbers"] });
    },
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = ev.target?.result as string;
      setPreview(data);
      setPendingFile({ data, name: file.name });
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setError("");
    setSaved(false);
    try {
      if (pendingFile) {
        await avatarMutation.mutateAsync({ data: pendingFile.data, filename: pendingFile.name });
        setPendingFile(null);
      }
      if (name || specialty) {
        await profileMutation.mutateAsync({ name: name || undefined, specialty: specialty || undefined });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Error al guardar. Intenta de nuevo.");
    }
  }

  const { data: myPhotos, refetch: refetchPhotos } = useQuery({
    queryKey: ["my-gallery"],
    queryFn: getMyGalleryPhotos,
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: ({ imageData, filename, service_type }: { imageData: string; filename: string; service_type: string }) =>
      uploadGalleryPhoto(imageData, filename, service_type),
    onSuccess: () => {
      refetchPhotos();
      setStudioUploadMsg("Foto enviada para revisión");
      setTimeout(() => setStudioUploadMsg(""), 3000);
    },
    onError: () => setStudioError("Error al subir la foto"),
  });

  const deletePhotoMutation = useMutation({
    mutationFn: deleteGalleryPhoto,
    onSuccess: () => refetchPhotos(),
  });

  // iOS fix: canvas decode handles HEIC + resizes large files to max 1200px JPEG
  function resizeForStudio(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const MAX = 1200;
        let w = img.naturalWidth, h = img.naturalHeight;
        if (w > MAX || h > MAX) {
          if (w >= h) { h = Math.round(h * MAX / w); w = MAX; }
          else        { w = Math.round(w * MAX / h); h = MAX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width  = w;
        canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  async function handleStudioFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setStudioError("");
    const arr = Array.from(files);
    e.target.value = "";
    setStudioProgress({ current: 0, total: arr.length });
    for (let i = 0; i < arr.length; i++) {
      try {
        setStudioProgress({ current: i + 1, total: arr.length });
        const resized = await resizeForStudio(arr[i]);
        await uploadPhotoMutation.mutateAsync({
          imageData: resized,
          filename:  arr[i].name.replace(/\.[^.]+$/, ".jpg"),
          service_type: studioServiceType,
        });
      } catch {
        setStudioError("Error al subir una o más fotos");
      }
    }
    setStudioProgress(null);
    setStudioUploadMsg("Fotos enviadas para revisión");
    setTimeout(() => setStudioUploadMsg(""), 3000);
  }

  const currentAvatar = preview || profile?.avatar || storeUser?.avatar || null;
  const isBusy = avatarMutation.isPending || profileMutation.isPending;

  const btnBase: React.CSSProperties = {
    fontFamily: "Montserrat, sans-serif", fontWeight: 300,
    fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase",
    padding: "0.75rem 1.5rem", cursor: "pointer", border: "none",
  };

  return (
    <>
      <Header />
      <main style={{ minHeight: "100vh", maxWidth: "640px", margin: "0 auto", padding: "8rem 1.5rem 4rem" }}>

        {/* Back */}
        <button onClick={() => navigate(-1)} style={{
          ...btnBase, background: "transparent", color: "var(--gray-mid)",
          border: "1px solid var(--gray-border)", marginBottom: "2.5rem",
        }}>← Volver</button>

        {/* Title */}
        <p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 300, fontSize: "0.7rem",
          letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--gray-mid)", marginBottom: "0.5rem" }}>
          Mi Cuenta
        </p>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.8rem,4vw,2.5rem)",
          fontWeight: 700, color: "var(--black)", marginBottom: "3rem" }}>
          Editar Perfil
        </h1>

        {isLoading ? (
          <p style={{ fontFamily: "Montserrat,sans-serif", color: "var(--gray-mid)" }}>Cargando...</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>

            {/* ── Avatar ── */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.2rem" }}>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: "140px", height: "140px", borderRadius: "50%",
                  overflow: "hidden", background: "#f0f0f0",
                  border: "2px solid var(--gray-border)", cursor: "pointer",
                  position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                {currentAvatar ? (
                  <img src={currentAvatar} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "3rem",
                    fontWeight: 700, color: "#ccc" }}>
                    {(name || storeUser?.name || "?")[0].toUpperCase()}
                  </span>
                )}
                {/* Overlay */}
                <div style={{
                  position: "absolute", inset: 0, borderRadius: "50%",
                  background: "rgba(0,0,0,0.38)", display: "flex",
                  alignItems: "center", justifyContent: "center", opacity: 0,
                  transition: "opacity 0.2s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "0")}
                >
                  <span style={{ color: "#fff", fontFamily: "Montserrat,sans-serif",
                    fontSize: "10px", fontWeight: 500, letterSpacing: "2px",
                    textTransform: "uppercase" }}>Cambiar</span>
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*"
                style={{ display: "none" }} onChange={handleFileChange} />
              <p style={{ fontFamily: "Montserrat,sans-serif", fontSize: "11px",
                color: "var(--gray-mid)", letterSpacing: "0.05em" }}>
                Haz clic en la foto para cambiarla
              </p>
            </div>

            {/* ── Fields ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

              <div>
                <label style={{ fontFamily: "Montserrat,sans-serif", fontSize: "10px",
                  fontWeight: 500, letterSpacing: "2px", textTransform: "uppercase",
                  color: "var(--gray-mid)", display: "block", marginBottom: "8px" }}>
                  Nombre
                </label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={profile?.name || "Tu nombre"}
                  style={{
                    width: "100%", padding: "0.85rem 1rem",
                    fontFamily: "Montserrat,sans-serif", fontSize: "0.85rem", fontWeight: 300,
                    border: "1px solid var(--gray-border)", outline: "none",
                    background: "#fafafa", color: "var(--black)", boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ fontFamily: "Montserrat,sans-serif", fontSize: "10px",
                  fontWeight: 500, letterSpacing: "2px", textTransform: "uppercase",
                  color: "var(--gray-mid)", display: "block", marginBottom: "8px" }}>
                  Especialidad
                </label>
                <input
                  value={specialty}
                  onChange={e => setSpecialty(e.target.value)}
                  placeholder={profile?.specialty || "Ej: Maestro Barbero, Estilista..."}
                  style={{
                    width: "100%", padding: "0.85rem 1rem",
                    fontFamily: "Montserrat,sans-serif", fontSize: "0.85rem", fontWeight: 300,
                    border: "1px solid var(--gray-border)", outline: "none",
                    background: "#fafafa", color: "var(--black)", boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {/* ── Feedback ── */}
            {error && (
              <p style={{ fontFamily: "Montserrat,sans-serif", fontSize: "12px",
                color: "#c0392b", letterSpacing: "0.05em" }}>{error}</p>
            )}
            {saved && (
              <p style={{ fontFamily: "Montserrat,sans-serif", fontSize: "12px",
                color: "#27ae60", letterSpacing: "0.05em" }}>✓ Perfil actualizado correctamente</p>
            )}

            {/* ── Actions ── */}
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <button
                onClick={handleSave}
                disabled={isBusy}
                style={{
                  ...btnBase,
                  background: isBusy ? "#888" : "var(--black)",
                  color: "#fff",
                  flex: 1, minWidth: "160px",
                  opacity: isBusy ? 0.7 : 1,
                }}
              >
                {isBusy ? "Guardando..." : "Guardar Cambios"}
              </button>
              <button
                onClick={() => navigate(-1)}
                style={{
                  ...btnBase,
                  background: "transparent", color: "var(--black)",
                  border: "1px solid var(--gray-border)",
                }}
              >
                Cancelar
              </button>
            </div>

          </div>
        )}
        {/* ── Mi Estudio ─────────────────────────────────────────────────────── */}
        <div style={{ marginTop: "4rem", paddingTop: "3rem", borderTop: "1px solid var(--gray-border)" }}>
          <p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 300, fontSize: "0.7rem",
            letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--gray-mid)", marginBottom: "0.5rem" }}>
            Portafolio
          </p>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.4rem,3vw,1.8rem)",
            fontWeight: 700, color: "var(--black)", marginBottom: "0.6rem" }}>
            Mi Estudio
          </h2>
          <p style={{ fontFamily: "Montserrat,sans-serif", fontSize: "12px", color: "var(--gray-mid)",
            lineHeight: 1.7, marginBottom: "2rem" }}>
            Sube fotos de tus cortes terminados. Cada foto pasa por revisión antes de aparecer en la galería pública.
          </p>

          {/* Upload controls */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center", marginBottom: "1.5rem" }}>
            <select
              value={studioServiceType}
              onChange={e => setStudioServiceType(e.target.value)}
              style={{
                fontFamily: "Montserrat,sans-serif", fontSize: "0.75rem", fontWeight: 300,
                letterSpacing: "0.05em", padding: "0.65rem 1rem",
                border: "1px solid var(--gray-border)", background: "#fafafa",
                color: "var(--black)", outline: "none", cursor: "pointer",
              }}
            >
              {SERVICE_TYPES.map(st => (
                <option key={st.value} value={st.value}>{st.label}</option>
              ))}
            </select>

            <button
              onClick={() => studioInputRef.current?.click()}
              disabled={!!studioProgress}
              style={{
                ...btnBase,
                background: studioProgress ? "#888" : "var(--black)",
                color: "#fff",
                opacity: studioProgress ? 0.7 : 1,
                display: "inline-flex", alignItems: "center", gap: "0.6rem",
              }}
            >
              {studioProgress ? (
                <>
                  <Spinner size={14} theme="light" />
                  <span>{studioProgress.current}/{studioProgress.total}</span>
                </>
              ) : "+ Subir Foto"}
            </button>
            <input
              ref={studioInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={handleStudioFileChange}
            />
          </div>

          {studioUploadMsg && (
            <p style={{ fontFamily: "Montserrat,sans-serif", fontSize: "12px", color: "#27ae60",
              letterSpacing: "0.05em", marginBottom: "1rem" }}>✓ {studioUploadMsg}</p>
          )}
          {studioError && (
            <p style={{ fontFamily: "Montserrat,sans-serif", fontSize: "12px", color: "#c0392b",
              letterSpacing: "0.05em", marginBottom: "1rem" }}>{studioError}</p>
          )}

          {/* Progress label when uploading */}
          {studioProgress && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <Spinner size={16} theme="dark" label={`Subiendo ${studioProgress.current} de ${studioProgress.total}…`} />
            </div>
          )}

          {/* Photos grid */}
          {myPhotos && myPhotos.length > 0 ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: "0.75rem",
            }}>
              {myPhotos.map((photo: GalleryPhoto) => {
                const statusColor = photo.status === "approved" ? "#27ae60"
                  : photo.status === "rejected" ? "#c0392b" : "#888";
                const statusLabel = photo.status === "approved" ? "Aprobada"
                  : photo.status === "rejected" ? "Rechazada" : "Pendiente";
                return (
                  <div key={photo.id} style={{ position: "relative" }}>
                    <div style={{
                      position: "relative", overflow: "hidden",
                      aspectRatio: "1", background: "#f0f0f0",
                    }}>
                      <img
                        src={`https://vantagestudioapp.com${photo.url}`}
                        alt={photo.service_type}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                      {/* Status badge */}
                      <div style={{
                        position: "absolute", top: "6px", left: "6px",
                        background: statusColor, color: "#fff",
                        fontFamily: "Montserrat,sans-serif", fontSize: "9px",
                        fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
                        padding: "2px 7px",
                      }}>
                        {statusLabel}
                      </div>
                      {/* Delete button */}
                      <button
                        onClick={() => deletePhotoMutation.mutate(photo.id)}
                        style={{
                          position: "absolute", top: "6px", right: "6px",
                          width: "24px", height: "24px",
                          background: "rgba(0,0,0,0.6)", color: "#fff",
                          border: "none", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "12px",
                        }}
                      >✕</button>
                    </div>
                    <p style={{
                      fontFamily: "Montserrat,sans-serif", fontSize: "10px", fontWeight: 500,
                      letterSpacing: "0.1em", textTransform: "uppercase",
                      color: "var(--gray-mid)", marginTop: "5px",
                    }}>
                      {SERVICE_TYPES.find(s => s.value === photo.service_type)?.label || photo.service_type}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ fontFamily: "Montserrat,sans-serif", fontSize: "13px",
              color: "var(--gray-mid)", fontStyle: "italic" }}>
              Aún no has subido fotos al estudio.
            </p>
          )}
        </div>

      </main>
      <Footer />
    </>
  );
}
