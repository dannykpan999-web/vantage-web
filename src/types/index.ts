export type UserRole = "owner" | "barber" | "customer";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
}

export interface Service {
  id: string;
  barber_id: string;
  name: string;
  price: number;
  duration_minutes: number;
}

export interface Barber {
  id: string;
  user_id: string;
  name: string;
  specialty: string;
  commission_rate: number;
  avatar?: string;
  services: Service[];
}

export interface Slot {
  id: string;
  barber_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

export interface Booking {
  id: string;
  customer_id: string;
  barber_id: string;
  service_id: string;
  slot_id: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  created_at: string;
  barber?: Barber;
  service?: Service;
  slot?: Slot;
}

export interface Payment {
  id: string;
  booking_id: string;
  square_payment_id?: string;
  total_amount: number;
  barber_amount: number;
  owner_amount: number;
  status: "pending" | "completed" | "failed";
  created_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  type: "credit" | "debit" | "withdrawal";
  amount: number;
  reference_id?: string;
  description: string;
  created_at: string;
}

export interface Wallet {
  id: string;
  barber_id: string;
  available_balance: number;
  pending_balance: number;
  total_earned: number;
}

export interface WithdrawalRequest {
  id: string;
  barber_id: string;
  barber_name: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface BarberStat {
  barber_id: string;
  barber_name: string;
  bookings_count: number;
  earnings: number;
}

export interface UpcomingBooking {
  id: string;
  client_name: string;
  service_name: string;
  slot_start: string;
  payment_status: "pending" | "completed" | "failed";
}

export interface DashboardOwner {
  revenue_today: number;
  revenue_month: number;
  commission_month: number;
  bookings_month: number;
  barber_stats: BarberStat[];
  pending_withdrawals: WithdrawalRequest[];
}

export interface DashboardBarber {
  bookings_today: number;
  bookings_month: number;
  earnings_today: number;
  earnings_month: number;
  upcoming_bookings: UpcomingBooking[];
}

export interface AuthResponse {
  token: string;
  user: User;
}
