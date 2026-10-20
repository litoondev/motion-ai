export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  role: "user" | "admin";
  status: "active" | "blocked";
  email_verified_at: string | null;
  trial_used: boolean;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  created_at: string;
  licenses_count?: number;
  active_license?: License | null;
}

export interface Device {
  id: number;
  device_id: string;
  device_name: string | null;
  platform: string | null;
  ae_version: string | null;
  linked_at: string;
  last_seen_at: string;
  is_active: boolean;
}

export interface License {
  id: number;
  license_key: string;
  type: "trial" | "paid";
  status: "active" | "expired" | "suspended" | "revoked";
  purchased_at: string | null;
  expires_at: string | null;
  updated_until: string | null;
  seat_count: number;
  active_devices: number;
  max_devices: number;
  created_at: string;
  devices?: Device[];
}

export interface Payment {
  id: number;
  method: "bank_transfer" | "bkash" | "payoneer" | "wise";
  status: "pending" | "approved" | "rejected" | "refunded";
  /** Laravel returns decimals as strings ("49.00") */
  amount: string | number;
  currency: string;
  bank_tx_ref: string | null;
  has_slip: boolean;
  admin_note: string | null;
  reviewed_at: string | null;
  seat_count: number;
  year_count: number;
  created_at: string;
}

export interface Pricing {
  price_per_seat_year: number;
  team_price_per_seat_year: number;
  team_threshold: number;
  trial_days: number;
}

export interface DashboardData {
  user: User;
  licenses: License[];
  recent_payments: Payment[];
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  links?: { first: string | null; last: string | null; prev: string | null; next: string | null };
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface CardCheckoutResult {
  payment: Payment;
  checkout_url: string;
}

export interface CouponResult {
  code: string;
  discount_percent: number;
  discount_flat?: number;
  valid: boolean;
  message?: string;
}

export type FieldErrors = Record<string, string[]>;
