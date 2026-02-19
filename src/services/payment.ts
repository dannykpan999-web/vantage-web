import { api } from "./api";
import type {
  Wallet,
  WalletTransaction,
  DashboardOwner,
  DashboardBarber,
} from "../types";

export const createPaymentLink = async (
  bookingId: string
): Promise<{ payment_url: string; qr_code: string }> => {
  const r = await api.post("/payments/create-link", { booking_id: bookingId });
  return r.data;
};

export const getPaymentStatus = async (
  bookingId: string
): Promise<{ status: "pending" | "completed" | "failed" }> => {
  const r = await api.get(`/payments/status/${bookingId}`);
  return r.data;
};

export const getWallet = async (): Promise<Wallet> => {
  const r = await api.get("/wallet");
  return r.data;
};

export const getTransactions = async (
  page = 1
): Promise<WalletTransaction[]> => {
  const r = await api.get(`/wallet/transactions?page=${page}`);
  return r.data;
};

export const requestWithdrawal = async (amount: number) => {
  const r = await api.post("/wallet/withdraw", { amount });
  return r.data;
};

export const getOwnerDashboard = async (): Promise<DashboardOwner> => {
  const r = await api.get("/dashboard/owner");
  return r.data;
};

export const getBarberDashboard = async (): Promise<DashboardBarber> => {
  const r = await api.get("/dashboard/barber");
  return r.data;
};

export const approveWithdrawal = async (id: string) => {
  const r = await api.patch(`/wallet/withdraw/${id}/approve`);
  return r.data;
};

export const rejectWithdrawal = async (id: string) => {
  const r = await api.patch(`/wallet/withdraw/${id}/reject`);
  return r.data;
};

// Legacy object export
export const paymentService = {
  createPaymentLink,
  getPaymentStatus,
  getWallet,
  getTransactions,
  requestWithdrawal,
  getOwnerDashboard,
  getBarberDashboard,
  approveWithdrawal,
  rejectWithdrawal,
};
