import { api } from "./api";

export interface ShopSettings {
  work_start: string;   // "HH:MM"
  work_end: string;     // "HH:MM"
  slot_interval: number; // minutes
  show_tips: boolean;
}

export const getShopSettings = async (): Promise<ShopSettings> => {
  const r = await api.get("/settings");
  return r.data;
};

export const saveShopSettings = async (data: ShopSettings): Promise<ShopSettings> => {
  const r = await api.put("/settings", data);
  return r.data;
};
