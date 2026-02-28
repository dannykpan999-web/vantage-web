import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getLandingContent, saveLandingSection,
  uploadLandingImage,
  type LandingContent, type GalleryImage, type ProductItem, type TeamMember,
} from "../services/landing";
import Header from "../components/layout/Header";
import ImageCropModal from "../components/ImageCropModal";

// ── Image dimensions per section ─────────────────────────────────────────────
const IMG_SIZES = {
  hero_bg:  { w: 1920, h: 1080, label: "1920 × 1080 px" },
  gallery:  { w: 800,  h: 600,  label: "800 × 600 px" },
  product:  { w: 600,  h: 800,  label: "600 × 800 px (3:4)" },
  barber:   { w: 600,  h: 800,  label: "600 × 800 px (3:4)" },
};

// ── Reusable sub-components ───────────────────────────────────────────────────
function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e5e5", marginBottom: "2rem" }}>
      <div style={{ padding: "1.25rem 2rem", borderBottom: "1px solid #e5e5e5" }}>
        <p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 600, fontSize: "0.65rem",
          letterSpacing: "0.2em", textTransform: "uppercase", color: "#757575" }}>
          {title}
        </p>
      </div>
      <div style={{ padding: "2rem" }}>{children}</div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 300, fontSize: "0.65rem",
      letterSpacing: "0.15em", textTransform: "uppercase", color: "#757575",
      marginBottom: "0.4rem" }}>
      {children}
    </p>
  );
}

function TextInput({ label, value, onChange, multiline = false }: {
  label: string; value: string;
  onChange: (v: string) => void; multiline?: boolean;
}) {
  const shared: React.CSSProperties = {
    width: "100%", fontFamily: "Montserrat,sans-serif", fontWeight: 300,
    fontSize: "0.9rem", color: "#000", background: "transparent",
    border: "none", borderBottom: "1px solid #e5e5e5",
    padding: "0.5rem 0", outline: "none", resize: "vertical",
  };
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <FieldLabel>{label}</FieldLabel>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)}
            rows={3} style={shared} />
        : <input type="text" value={value} onChange={e => onChange(e.target.value)}
            style={shared} />
      }
    </div>
  );
}

function SaveBtn({ loading, success, onClick }: {
  loading: boolean; success: boolean; onClick: () => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "1rem" }}>
      <button onClick={onClick} disabled={loading} style={{
        fontFamily: "Montserrat,sans-serif", fontWeight: 500, fontSize: "0.7rem",
        letterSpacing: "0.2em", textTransform: "uppercase",
        background: "#000", color: "#fff", border: "none",
        padding: "0.85rem 2rem", cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.6 : 1, transition: "opacity 0.2s",
      }}>
        {loading ? "Guardando..." : "Guardar"}
      </button>
      {success && (
        <p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 300,
          fontSize: "0.75rem", color: "#2d7a2d" }}>
          ✓ Guardado correctamente
        </p>
      )}
    </div>
  );
}

// ── ImageUpload: shows preview + button that triggers crop modal ──────────────
function ImageUpload({ label, currentUrl, sizeLabel, onFileSelected, uploading }: {
  label: string; currentUrl: string;
  sizeLabel: string;
  onFileSelected: (file: File) => void;
  uploading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <FieldLabel>{label} — se recortará a {sizeLabel}</FieldLabel>
      {currentUrl && (
        <img src={currentUrl} alt="preview"
          style={{ display: "block", width: "100%", maxWidth: "320px",
            height: "180px", objectFit: "cover", marginBottom: "0.75rem",
            border: "1px solid #e5e5e5" }} />
      )}
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
        onChange={e => { const f = e.target.files?.[0]; if (f) onFileSelected(f); e.target.value = ""; }} />
      <button onClick={() => inputRef.current?.click()} disabled={uploading}
        style={{
          fontFamily: "Montserrat,sans-serif", fontWeight: 300, fontSize: "0.65rem",
          letterSpacing: "0.15em", textTransform: "uppercase",
          background: "transparent", color: "#000",
          border: "1px solid #e5e5e5", padding: "0.6rem 1.25rem",
          cursor: uploading ? "not-allowed" : "pointer",
          opacity: uploading ? 0.5 : 1,
        }}>
        {uploading ? "Subiendo..." : currentUrl ? "Cambiar imagen" : "Subir imagen"}
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LandingEditor() {
  const navigate = useNavigate();
  const [content, setContent]     = useState<LandingContent | null>(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState<string | null>(null);
  const [success, setSuccess]     = useState<string | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  type CropRequest = {
    file: File; targetW: number; targetH: number; label: string;
    onCropped: (dataUrl: string) => void;
  };
  const [cropRequest, setCropRequest] = useState<CropRequest | null>(null);

  function openCrop(file: File, sizeKey: keyof typeof IMG_SIZES, onCropped: (dataUrl: string) => void) {
    const sz = IMG_SIZES[sizeKey];
    setCropRequest({ file, targetW: sz.w, targetH: sz.h, label: sz.label, onCropped });
  }

  useEffect(() => {
    getLandingContent().then(c => { setContent(c); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function set<S extends keyof LandingContent>(section: S, key: string, value: unknown) {
    setContent(prev => prev ? {
      ...prev,
      [section]: { ...prev[section], [key]: value },
    } : prev);
  }

  async function save(section: keyof LandingContent) {
    if (!content) return;
    setSaving(section); setError(null);
    try {
      await saveLandingSection(section, content[section]);
      setSuccess(section);
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Error al guardar. Intenta de nuevo.");
    } finally {
      setSaving(null);
    }
  }

  // Gallery helpers
  function updateGalleryImage(i: number, key: keyof GalleryImage, value: string) {
    if (!content) return;
    const images = [...content.gallery.images];
    images[i] = { ...images[i], [key]: value };
    set("gallery", "images", images);
  }
  function addGalleryImage() {
    if (!content) return;
    set("gallery", "images", [...content.gallery.images, { url: "", alt: "" }]);
  }
  function removeGalleryImage(i: number) {
    if (!content) return;
    set("gallery", "images", content.gallery.images.filter((_, idx) => idx !== i));
  }
  function uploadGalleryImage(i: number, file: File) {
    openCrop(file, "gallery", async (dataUrl) => {
      setCropRequest(null);
      setUploading(true);
      try {
        const url = await uploadLandingImage(dataUrl, `gallery-${Date.now()}-${i}.webp`);
        updateGalleryImage(i, "url", url);
      } catch { /* silent */ } finally { setUploading(false); }
    });
  }

  // Products helpers
  function updateProduct(i: number, key: keyof ProductItem, value: string) {
    if (!content) return;
    const items = [...content.products.items];
    items[i] = { ...items[i], [key]: value };
    set("products", "items", items);
  }
  function addProduct() {
    if (!content) return;
    set("products", "items", [...content.products.items, { name: "", description: "", price: "", images: [] }]);
  }
  function removeProduct(i: number) {
    if (!content) return;
    set("products", "items", content.products.items.filter((_, idx) => idx !== i));
  }
  // Get normalized images array for a product (supports old `image` string + new `images` array)
  function getProductImages(p: ProductItem): string[] {
    const imgs = (p as any).images as string[] | undefined;
    if (imgs && imgs.length > 0) return imgs;
    return p.image ? [p.image] : [];
  }
  function setProductImages(i: number, imgs: string[]) {
    if (!content) return;
    const items = [...content.products.items];
    items[i] = { ...items[i], images: imgs, image: imgs[0] || "" };
    set("products", "items", items);
  }
  function addProductImages(i: number, files: FileList) {
    Array.from(files).forEach(file => {
      openCrop(file, "product", async (dataUrl) => {
        setCropRequest(null);
        setUploading(true);
        try {
          const url = await uploadLandingImage(dataUrl, `product-${Date.now()}-${i}.webp`);
          if (!content) return;
          const current = getProductImages(content.products.items[i]);
          setProductImages(i, [...current, url]);
        } catch { /* silent */ } finally { setUploading(false); }
      });
    });
  }
  function removeProductImage(productIdx: number, imgIdx: number) {
    if (!content) return;
    const current = getProductImages(content.products.items[productIdx]);
    setProductImages(productIdx, current.filter((_, j) => j !== imgIdx));
  }

  // Team members helpers
  function updateMember(i: number, key: keyof TeamMember, value: string) {
    if (!content) return;
    const members = [...content.team_members.members];
    members[i] = { ...members[i], [key]: value };
    set("team_members", "members", members);
  }
  function addMember() {
    if (!content) return;
    set("team_members", "members", [...content.team_members.members, { name: "", title: "", image: "" }]);
  }
  function removeMember(i: number) {
    if (!content) return;
    set("team_members", "members", content.team_members.members.filter((_, idx) => idx !== i));
  }
  function uploadMemberImage(i: number, file: File) {
    openCrop(file, "barber", async (dataUrl) => {
      setCropRequest(null);
      setUploading(true);
      try {
        const url = await uploadLandingImage(dataUrl, `barber-${Date.now()}-${i}.webp`);
        updateMember(i, "image", url);
      } catch { /* silent */ } finally { setUploading(false); }
    });
  }

  if (loading) return (
    <><Header />
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", padding: "8rem 1.5rem" }}>
        <p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 300,
          fontSize: "0.85rem", color: "#757575" }}>Cargando contenido...</p>
      </main>
    </>
  );
  if (!content) return null;

  return (
    <>
      <Header />
      <main style={{ minHeight: "100vh", maxWidth: "860px", margin: "0 auto",
        padding: "8rem 1.5rem 6rem" }}>

        {/* Page header */}
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "flex-end", marginBottom: "3rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 300,
              fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase",
              color: "#757575", marginBottom: "0.5rem" }}>
              Panel del Propietario
            </p>
            <h1 style={{ fontFamily: "'Playfair Display',serif",
              fontSize: "clamp(1.8rem,4vw,2.5rem)", fontWeight: 700, color: "#000" }}>
              Editor de Landing Page
            </h1>
          </div>
          <button onClick={() => navigate("/owner-dashboard")} style={{
            fontFamily: "Montserrat,sans-serif", fontWeight: 300, fontSize: "0.7rem",
            letterSpacing: "0.15em", textTransform: "uppercase",
            background: "transparent", color: "#000",
            border: "1px solid #e5e5e5", padding: "0.75rem 1.5rem", cursor: "pointer",
          }}>← Volver al Panel</button>
        </div>

        {error && (
          <p style={{ fontFamily: "Montserrat,sans-serif", fontSize: "0.8rem",
            color: "#c00", marginBottom: "1.5rem" }}>{error}</p>
        )}

        {/* ── HERO ── */}
        <SectionCard title="Hero — Portada principal">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <TextInput label="Titular (Español)" value={content.hero.headline_es}
              onChange={v => set("hero", "headline_es", v)} />
            <TextInput label="Titular (English)" value={content.hero.headline_en}
              onChange={v => set("hero", "headline_en", v)} />
            <TextInput label="Subtítulo (Español)" value={content.hero.subline_es}
              onChange={v => set("hero", "subline_es", v)} />
            <TextInput label="Subtitle (English)" value={content.hero.subline_en}
              onChange={v => set("hero", "subline_en", v)} />
          </div>
          <ImageUpload label="Imagen de fondo" currentUrl={content.hero.bg_image || "/images/hero.webp"}
            sizeLabel={IMG_SIZES.hero_bg.label}
            onFileSelected={file => openCrop(file, "hero_bg", async (dataUrl) => {
              setCropRequest(null);
              setUploading(true);
              try {
                const url = await uploadLandingImage(dataUrl, `landing-hero_bg-${Date.now()}.webp`);
                set("hero", "bg_image", url);
              } catch { /* silent */ } finally { setUploading(false); }
            })}
            uploading={uploading} />
          {content.hero.bg_image && content.hero.bg_image !== "/images/hero.webp" && (
            <button
              onClick={() => set("hero", "bg_image", "/images/hero.webp")}
              style={{
                fontFamily: "Montserrat,sans-serif", fontWeight: 300, fontSize: "0.65rem",
                letterSpacing: "0.15em", textTransform: "uppercase",
                background: "transparent", color: "#757575",
                border: "1px solid #e5e5e5", padding: "0.5rem 1rem",
                cursor: "pointer", marginBottom: "1rem", display: "block",
              }}>
              ↩ Restaurar imagen original
            </button>
          )}
          <p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 300,
            fontSize: "0.7rem", color: "#757575", marginBottom: "1rem" }}>
            Tip: puedes usar {"<em>"} para texto en cursiva en el titular. Ej: El Arte del {"<em>"}Corte Perfecto{"</em>"}
          </p>
          <SaveBtn loading={saving === "hero"} success={success === "hero"}
            onClick={() => save("hero")} />
        </SectionCard>

        {/* ── GALLERY ── */}
        <SectionCard title="Galería — Imágenes del Studio">
          <p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 300,
            fontSize: "0.75rem", color: "#757575", marginBottom: "1.5rem", lineHeight: 1.7 }}>
            Las imágenes se redimensionan automáticamente a {IMG_SIZES.gallery.label} (landscape).
            Haz hover sobre una imagen en la landing para ver el efecto color.
          </p>
          {content.gallery.images.map((img, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "120px 1fr auto",
              gap: "1rem", alignItems: "start", padding: "1rem 0",
              borderBottom: "1px solid #f2f2f2" }}>
              {/* Preview */}
              <div style={{ position: "relative" }}>
                {img.url
                  ? <img src={img.url} alt={img.alt}
                      style={{ width: "120px", height: "90px", objectFit: "cover",
                        border: "1px solid #e5e5e5", display: "block" }} />
                  : <div style={{ width: "120px", height: "90px",
                      background: "#f5f5f5", border: "1px solid #e5e5e5",
                      display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontFamily: "Montserrat,sans-serif", fontSize: "0.6rem",
                        color: "#bbb", textAlign: "center", padding: "0.5rem" }}>Sin imagen</span>
                    </div>
                }
                <label style={{ display: "block", marginTop: "0.4rem",
                  fontFamily: "Montserrat,sans-serif", fontSize: "0.6rem",
                  color: "#757575", cursor: "pointer", textDecoration: "underline" }}>
                  Cambiar
                  <input type="file" accept="image/*" style={{ display: "none" }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) uploadGalleryImage(i, f); }} />
                </label>
              </div>
              {/* Alt text */}
              <div>
                <FieldLabel>Descripción / Alt text</FieldLabel>
                <input type="text" value={img.alt}
                  onChange={e => updateGalleryImage(i, "alt", e.target.value)}
                  placeholder="Ej: Precision fade"
                  style={{ width: "100%", fontFamily: "Montserrat,sans-serif", fontWeight: 300,
                    fontSize: "0.85rem", color: "#000", background: "transparent",
                    border: "none", borderBottom: "1px solid #e5e5e5",
                    padding: "0.5rem 0", outline: "none" }} />
              </div>
              {/* Remove */}
              <button onClick={() => removeGalleryImage(i)} style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#bbb", fontSize: "1.2rem", padding: "0.25rem",
                marginTop: "1.2rem", transition: "color 0.2s",
              }} onMouseOver={e => (e.currentTarget.style.color = "#c00")}
                onMouseOut={e => (e.currentTarget.style.color = "#bbb")}>×</button>
            </div>
          ))}
          <button onClick={addGalleryImage} style={{
            fontFamily: "Montserrat,sans-serif", fontWeight: 300, fontSize: "0.65rem",
            letterSpacing: "0.15em", textTransform: "uppercase",
            background: "transparent", color: "#000",
            border: "1px dashed #ccc", padding: "0.7rem 1.5rem",
            cursor: "pointer", marginTop: "1rem", width: "100%",
          }}>+ Agregar imagen</button>
          <SaveBtn loading={saving === "gallery"} success={success === "gallery"}
            onClick={() => save("gallery")} />
        </SectionCard>

        {/* ── SERVICES text ── */}
        <SectionCard title="Servicios — Títulos de sección">
          <p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 300,
            fontSize: "0.75rem", color: "#757575", marginBottom: "1.5rem", lineHeight: 1.7 }}>
            Los servicios individuales (nombre, precio, duración) se editan desde el panel de cada barbero.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <TextInput label="Título sección (ES)" value={content.services.title_es}
              onChange={v => set("services", "title_es", v)} />
            <TextInput label="Section title (EN)" value={content.services.title_en}
              onChange={v => set("services", "title_en", v)} />
            <TextInput label="Subtítulo (ES)" value={content.services.subtitle_es}
              onChange={v => set("services", "subtitle_es", v)} />
            <TextInput label="Subtitle (EN)" value={content.services.subtitle_en}
              onChange={v => set("services", "subtitle_en", v)} />
          </div>
          <SaveBtn loading={saving === "services"} success={success === "services"}
            onClick={() => save("services")} />
        </SectionCard>

        {/* ── TEAM text ── */}
        <SectionCard title="Equipo — Títulos de sección">
          <p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 300,
            fontSize: "0.75rem", color: "#757575", marginBottom: "1.5rem", lineHeight: 1.7 }}>
            Los perfiles de barberos (nombre, especialidad) se actualizan automáticamente al registrar un nuevo barbero.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <TextInput label="Título sección (ES)" value={content.team.title_es}
              onChange={v => set("team", "title_es", v)} />
            <TextInput label="Section title (EN)" value={content.team.title_en}
              onChange={v => set("team", "title_en", v)} />
            <TextInput label="Subtítulo (ES)" value={content.team.subtitle_es}
              onChange={v => set("team", "subtitle_es", v)} />
            <TextInput label="Subtitle (EN)" value={content.team.subtitle_en}
              onChange={v => set("team", "subtitle_en", v)} />
          </div>
          <SaveBtn loading={saving === "team"} success={success === "team"}
            onClick={() => save("team")} />
        </SectionCard>

        {/* ── CONTACT ── */}
        <SectionCard title="Contacto — Información">
          <TextInput label="Dirección" value={content.contact.address}
            onChange={v => set("contact", "address", v)} multiline />
          <TextInput label="Teléfono" value={content.contact.phone}
            onChange={v => set("contact", "phone", v)} />
          <TextInput label="Email" value={content.contact.email}
            onChange={v => set("contact", "email", v)} />
          <SaveBtn loading={saving === "contact"} success={success === "contact"}
            onClick={() => save("contact")} />
        </SectionCard>

        {/* ── PRODUCTS ── */}
        <SectionCard title="Productos de Grooming — Artículos destacados">
          <p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 300,
            fontSize: "0.75rem", color: "#757575", marginBottom: "1.5rem", lineHeight: 1.7 }}>
            Cada producto puede tener varias fotos (se deslizan en la tienda). Imágenes redimensionadas a {IMG_SIZES.product.label} (3:4). Puedes agregar, reordenar o eliminar fotos por producto.
          </p>
          {content.products.items.map((p, i) => {
            const productImgs = getProductImages(p);
            return (
              <div key={i} style={{ padding: "1.25rem 0", borderBottom: "1px solid #f2f2f2" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.75rem", alignItems: "start", marginBottom: "1rem" }}>
                  {/* Fields */}
                  <div>
                    <FieldLabel>Nombre del producto</FieldLabel>
                    <input type="text" value={p.name}
                      onChange={e => updateProduct(i, "name", e.target.value)}
                      placeholder="Ej: Brocha De Afeitar"
                      style={{ width: "100%", fontFamily: "Montserrat,sans-serif", fontWeight: 300,
                        fontSize: "0.85rem", color: "#000", background: "transparent",
                        border: "none", borderBottom: "1px solid #e5e5e5",
                        padding: "0.5rem 0", outline: "none", marginBottom: "1rem" }} />
                    <FieldLabel>Descripción breve</FieldLabel>
                    <input type="text" value={p.description ?? ""}
                      onChange={e => updateProduct(i, "description", e.target.value)}
                      placeholder="Ej: Cerdas naturales para una espuma perfecta."
                      style={{ width: "100%", fontFamily: "Montserrat,sans-serif", fontWeight: 300,
                        fontSize: "0.85rem", color: "#000", background: "transparent",
                        border: "none", borderBottom: "1px solid #e5e5e5",
                        padding: "0.5rem 0", outline: "none", marginBottom: "1rem" }} />
                    <FieldLabel>Precio</FieldLabel>
                    <input type="text" value={p.price}
                      onChange={e => updateProduct(i, "price", e.target.value)}
                      placeholder="Ej: $24"
                      style={{ width: "100%", fontFamily: "Montserrat,sans-serif", fontWeight: 300,
                        fontSize: "0.85rem", color: "#000", background: "transparent",
                        border: "none", borderBottom: "1px solid #e5e5e5",
                        padding: "0.5rem 0", outline: "none" }} />
                  </div>
                  {/* Remove product */}
                  <button onClick={() => removeProduct(i)} style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "#bbb", fontSize: "1.2rem", padding: "0.25rem", transition: "color 0.2s",
                  }} onMouseOver={e => (e.currentTarget.style.color = "#c00")}
                    onMouseOut={e => (e.currentTarget.style.color = "#bbb")}>×</button>
                </div>

                {/* Multi-photo strip */}
                <div>
                  <FieldLabel>Fotos del producto ({productImgs.length})</FieldLabel>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.4rem", marginBottom: "0.75rem" }}>
                    {productImgs.map((url, j) => (
                      <div key={j} style={{ position: "relative" }}>
                        <img src={url} alt={`foto ${j + 1}`}
                          style={{ width: "72px", height: "96px", objectFit: "cover", border: j === 0 ? "2px solid #000" : "1px solid #e5e5e5", display: "block" }} />
                        {j === 0 && (
                          <span style={{ position: "absolute", bottom: 0, left: 0, right: 0,
                            fontFamily: "Montserrat,sans-serif", fontSize: "0.5rem", background: "#000",
                            color: "#fff", textAlign: "center", padding: "2px 0" }}>Principal</span>
                        )}
                        <button onClick={() => removeProductImage(i, j)}
                          style={{ position: "absolute", top: "2px", right: "2px", background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", borderRadius: "50%", width: "18px", height: "18px", fontSize: "11px", cursor: "pointer", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                      </div>
                    ))}
                    {/* Add photos button */}
                    <label style={{ width: "72px", height: "96px", border: "1px dashed #ccc", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: "4px" }}>
                      <span style={{ fontSize: "20px", color: "#bbb", lineHeight: 1 }}>+</span>
                      <span style={{ fontFamily: "Montserrat,sans-serif", fontSize: "0.55rem", color: "#bbb", textAlign: "center", letterSpacing: "0.05em" }}>Agregar</span>
                      <input type="file" accept="image/*" multiple style={{ display: "none" }}
                        onChange={e => { if (e.target.files) addProductImages(i, e.target.files); }} />
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
          <button onClick={addProduct} style={{
            fontFamily: "Montserrat,sans-serif", fontWeight: 300, fontSize: "0.65rem",
            letterSpacing: "0.15em", textTransform: "uppercase",
            background: "transparent", color: "#000",
            border: "1px dashed #ccc", padding: "0.7rem 1.5rem",
            cursor: "pointer", marginTop: "1rem", width: "100%",
          }}>+ Agregar producto</button>
          <SaveBtn loading={saving === "products"} success={success === "products"}
            onClick={() => save("products")} />
        </SectionCard>

        {/* ── TEAM MEMBERS ── */}
        <SectionCard title="Artesanos del Estilo — Miembros del equipo">
          <p style={{ fontFamily: "Montserrat,sans-serif", fontWeight: 300,
            fontSize: "0.75rem", color: "#757575", marginBottom: "1.5rem", lineHeight: 1.7 }}>
            Las fotos se redimensionan a {IMG_SIZES.barber.label} (retrato). El nombre y título aparecen sobre la foto.
          </p>
          {content.team_members.members.map((m, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "120px 1fr auto",
              gap: "1rem", alignItems: "start", padding: "1rem 0",
              borderBottom: "1px solid #f2f2f2" }}>
              {/* Preview */}
              <div>
                {m.image
                  ? <img src={m.image} alt={m.name}
                      style={{ width: "120px", height: "160px", objectFit: "cover",
                        objectPosition: "top", border: "1px solid #e5e5e5", display: "block" }} />
                  : <div style={{ width: "120px", height: "160px", background: "#f5f5f5",
                      border: "1px solid #e5e5e5", display: "flex", alignItems: "center",
                      justifyContent: "center" }}>
                      <span style={{ fontFamily: "Montserrat,sans-serif", fontSize: "0.6rem",
                        color: "#bbb", textAlign: "center", padding: "0.5rem" }}>Sin foto</span>
                    </div>
                }
                <label style={{ display: "block", marginTop: "0.4rem",
                  fontFamily: "Montserrat,sans-serif", fontSize: "0.6rem",
                  color: "#757575", cursor: "pointer", textDecoration: "underline" }}>
                  Cambiar
                  <input type="file" accept="image/*" style={{ display: "none" }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) uploadMemberImage(i, f); }} />
                </label>
              </div>
              {/* Fields */}
              <div>
                <FieldLabel>Nombre</FieldLabel>
                <input type="text" value={m.name}
                  onChange={e => updateMember(i, "name", e.target.value)}
                  placeholder="Ej: Marcus Rivera"
                  style={{ width: "100%", fontFamily: "Montserrat,sans-serif", fontWeight: 300,
                    fontSize: "0.85rem", color: "#000", background: "transparent",
                    border: "none", borderBottom: "1px solid #e5e5e5",
                    padding: "0.5rem 0", outline: "none", marginBottom: "1rem" }} />
                <FieldLabel>Título / Especialidad</FieldLabel>
                <input type="text" value={m.title}
                  onChange={e => updateMember(i, "title", e.target.value)}
                  placeholder="Ej: Maestro Barbero"
                  style={{ width: "100%", fontFamily: "Montserrat,sans-serif", fontWeight: 300,
                    fontSize: "0.85rem", color: "#000", background: "transparent",
                    border: "none", borderBottom: "1px solid #e5e5e5",
                    padding: "0.5rem 0", outline: "none" }} />
              </div>
              {/* Remove */}
              <button onClick={() => removeMember(i)} style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#bbb", fontSize: "1.2rem", padding: "0.25rem",
                marginTop: "1.2rem", transition: "color 0.2s",
              }} onMouseOver={e => (e.currentTarget.style.color = "#c00")}
                onMouseOut={e => (e.currentTarget.style.color = "#bbb")}>×</button>
            </div>
          ))}
          <button onClick={addMember} style={{
            fontFamily: "Montserrat,sans-serif", fontWeight: 300, fontSize: "0.65rem",
            letterSpacing: "0.15em", textTransform: "uppercase",
            background: "transparent", color: "#000",
            border: "1px dashed #ccc", padding: "0.7rem 1.5rem",
            cursor: "pointer", marginTop: "1rem", width: "100%",
          }}>+ Agregar miembro</button>
          <SaveBtn loading={saving === "team_members"} success={success === "team_members"}
            onClick={() => save("team_members")} />
        </SectionCard>

        {/* Preview link */}
        <div style={{ textAlign: "center", padding: "2rem 0" }}>
          <a href="/" target="_blank" rel="noopener noreferrer" style={{
            fontFamily: "Montserrat,sans-serif", fontWeight: 300, fontSize: "0.7rem",
            letterSpacing: "0.2em", textTransform: "uppercase",
            color: "#757575", textDecoration: "none",
            borderBottom: "1px solid #e5e5e5", paddingBottom: "2px",
          }}>Ver Landing Page →</a>
        </div>

      </main>

      {/* Crop modal — rendered on top of everything */}
      {cropRequest && (
        <ImageCropModal
          file={cropRequest.file}
          targetW={cropRequest.targetW}
          targetH={cropRequest.targetH}
          label={cropRequest.label}
          onConfirm={cropRequest.onCropped}
          onCancel={() => setCropRequest(null)}
        />
      )}
    </>
  );
}
