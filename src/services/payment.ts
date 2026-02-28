import { api } from "./api";
import type {
  Wallet,
  WalletTransaction,
  DashboardOwner,
  DashboardBarber,
} from "../types";

export interface CartProduct {
  id: string;
  quantity: number;
}

export const createPaymentLink = async (
  bookingId: string,
  depositAmount?: number,
  products?: CartProduct[]
): Promise<{ payment_url: string | null; qr_code: string | null; is_sandbox: boolean }> => {
  const body: Record<string, unknown> = { booking_id: bookingId };
  if (depositAmount !== undefined) body.deposit_amount = depositAmount;
  if (products && products.length > 0) body.products = products;
  const r = await api.post("/payments/create-link", body);
  return r.data;
};

export const sandboxComplete = async (bookingId: string): Promise<void> => {
  await api.post(`/payments/sandbox-complete/${bookingId}`);
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
  sandboxComplete,
  getPaymentStatus,
  getWallet,
  getTransactions,
  requestWithdrawal,
  getOwnerDashboard,
  getBarberDashboard,
  approveWithdrawal,
  rejectWithdrawal,
};
