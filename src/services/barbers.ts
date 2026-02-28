import { api } from "./api";

export interface BarberProfile {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  specialty: string | null;
}

export interface Barber {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  specialty: string | null;
  commission_rate: number;
  services: { id: string; name: string; price: number; duration_minutes: number }[];
}

export const getBarbers = async (): Promise<Barber[]> => {
  const r = await api.get("/barbers");
  return r.data;
};

export const getMyProfile = async (): Promise<BarberProfile> => {
  const r = await api.get("/barbers/me/profile");
  return r.data;
};

export const updateProfile = async (data: { name?: string; specialty?: string }) => {
  const r = await api.put("/barbers/me/profile", data);
  return r.data;
};

export const uploadAvatar = async (imageData: string, filename: string) => {
  const r = await api.put("/barbers/me/avatar", { imageData, filename });
  return r.data as { avatar: string; user: { id: string; name: string; email: string; role: string; avatar: string } };
};
