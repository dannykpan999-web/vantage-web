import { useAuthStore } from "../store/authStore";

// ── Types ────────────────────────────────────────────────────────────────────
export interface GalleryImage  { url: string; alt: string; }
export interface ProductItem   { name: string; description: string; price: string; image?: string; images?: string[]; }
export interface TeamMember    { name: string; title: string; image: string; }

export interface LandingContent {
  hero:         { headline_es: string; headline_en: string; subline_es: string; subline_en: string; bg_image: string; };
  gallery:      { images: GalleryImage[]; };
  services:     { title_es: string; title_en: string; subtitle_es: string; subtitle_en: string; };
  team:         { title_es: string; title_en: string; subtitle_es: string; subtitle_en: string; };
  contact:      { address: string; phone: string; email: string; };
  products:     { items: ProductItem[]; };
  team_members: { members: TeamMember[]; };
}

// ── API calls ────────────────────────────────────────────────────────────────
export async function getLandingContent(): Promise<LandingContent> {
  const res = await fetch("/api/landing");
  if (!res.ok) throw new Error("Error al obtener contenido");
  return res.json();
}

export async function saveLandingSection(section: string, data: object): Promise<void> {
  const token = useAuthStore.getState().token;
  const res = await fetch(`/api/landing/${section}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al guardar");
}

export async function uploadLandingImage(imageData: string, filename: string): Promise<string> {
  const token = useAuthStore.getState().token;
  const res = await fetch("/api/landing/upload-image", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ imageData, filename }),
  });
  if (!res.ok) throw new Error("Error al subir imagen");
  const data = await res.json();
  return data.url as string;
}

// ── Image resize (client-side Canvas, cover-fit to exact dimensions) ─────────
export function resizeImage(
  file: File,
  targetWidth: number,
  targetHeight: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement("canvas");
      canvas.width  = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d")!;

      // Cover fit: crop to fill the target dimensions exactly
      const imgRatio    = img.width / img.height;
      const targetRatio = targetWidth / targetHeight;
      let sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (imgRatio > targetRatio) {
        sw = img.height * targetRatio;
        sx = (img.width - sw) / 2;
      } else {
        sh = img.width / targetRatio;
        sy = (img.height - sh) / 2;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
      resolve(canvas.toDataURL("image/webp", 0.85));
    };
    img.onerror = reject;
    img.src = objectUrl;
  });
}
