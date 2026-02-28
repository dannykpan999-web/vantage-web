import { api } from "./api";
import type { Barber, Booking, Slot } from "../types";

export const getBarbers = async (): Promise<Barber[]> => {
  const r = await api.get("/barbers");
  return r.data;
};

export const getSlots = async (
  barberId: string,
  date: string,
  serviceId?: string
): Promise<Slot[]> => {
  let url = `/barbers/${barberId}/slots?date=${date}`;
  if (serviceId) url += `&service_id=${serviceId}`;
  const r = await api.get(url);
  return r.data;
};

export const createBooking = async (data: {
  barber_id: string;
  service_id: string;
  date: string;
  start_time: string;
}): Promise<Booking> => {
  const r = await api.post("/bookings", data);
  return r.data;
};

export const getMyBookings = async (): Promise<Booking[]> => {
  const r = await api.get("/bookings/mine");
  return r.data;
};

// Legacy object export kept for any existing usage
export const bookingService = { getBarbers, getSlots, createBooking, getMyBookings };
