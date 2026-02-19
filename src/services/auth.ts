import { api } from "./api";
import type { AuthResponse, UserRole } from "../types";

export const register = async (data: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
}): Promise<AuthResponse> => {
  const r = await api.post("/auth/register", data);
  return r.data;
};

export const login = async (data: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const r = await api.post("/auth/login", data);
  return r.data;
};

export const me = async (): Promise<AuthResponse["user"]> => {
  const r = await api.get("/auth/me");
  return r.data;
};

// Legacy object export
export const authService = { register, login, me };
