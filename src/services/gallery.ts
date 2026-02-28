import { api } from "./api";

export const SERVICE_TYPES = [
  { value: "fade",    label: "Fade" },
  { value: "barba",   label: "Barba" },
  { value: "clasico", label: "Clásico" },
  { value: "diseno",  label: "Diseño" },
  { value: "cejas",   label: "Cejas" },
  { value: "otro",    label: "Otro" },
];

export interface GalleryPhoto {
  id: string;
  url: string;
  service_type: string;
  barber_id: string;
  barber_name?: string;
  status?: "pending" | "approved" | "rejected";
  created_at: string;
}

// Public — approved photos shuffled
export const getPublicGallery = async (): Promise<GalleryPhoto[]> => {
  const r = await api.get("/gallery");
  return r.data;
};

// Barber — own photos with status
export const getMyGalleryPhotos = async (): Promise<GalleryPhoto[]> => {
  const r = await api.get("/gallery/mine");
  return r.data;
};

// Owner — pending photos for moderation
export const getPendingPhotos = async (): Promise<GalleryPhoto[]> => {
  const r = await api.get("/gallery/pending");
  return r.data;
};

// Barber — upload a cut photo
export const uploadGalleryPhoto = async (
  imageData: string,
  filename: string,
  service_type: string
): Promise<GalleryPhoto> => {
  const r = await api.post("/gallery/upload", { imageData, filename, service_type });
  return r.data;
};

// Owner — approve
export const approvePhoto = async (id: string): Promise<GalleryPhoto> => {
  const r = await api.put(`/gallery/${id}/approve`);
  return r.data;
};

// Owner — reject
export const rejectPhoto = async (id: string): Promise<GalleryPhoto> => {
  const r = await api.put(`/gallery/${id}/reject`);
  return r.data;
};

// Barber or owner — delete
export const deleteGalleryPhoto = async (id: string): Promise<void> => {
  await api.delete(`/gallery/${id}`);
};
