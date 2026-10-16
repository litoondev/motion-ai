export interface User {
  id: number;
  name: string | null;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'blocked';
  trialUsed: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  licensesCount?: number;
  devicesCount?: number;
}

export interface License {
  id: number;
  userId: number;
  licenseKey: string;
  type: 'trial' | 'paid';
  status: 'active' | 'suspended' | 'revoked' | 'expired';
  seatCount: number;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: Pick<User, 'id' | 'email' | 'name'>;
  devicesCount?: number;
}

export interface Device {
  id: number;
  userId: number;
  licenseId: number;
  deviceId: string;
  deviceName: string;
  platform: string;
  aeVersion: string;
  isActive: boolean;
  lastSeenAt: string;
  createdAt: string;
  updatedAt: string;
  user?: Pick<User, 'id' | 'email' | 'name'>;
  license?: Pick<License, 'id' | 'licenseKey' | 'type'>;
}

export interface Payment {
  id: number;
  userId: number;
  method: 'bank_transfer' | 'stripe' | 'paypal';
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'refunded';
  seatCount: number;
  yearCount: number;
  bankTxRef: string | null;
  slipUrl: string | null;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
  user?: Pick<User, 'id' | 'email' | 'name'>;
}

export interface Setting {
  id: number;
  key: string;
  value: string;
  updatedAt: string;
}

export interface AuditLog {
  id: number;
  adminId: number;
  action: string;
  target: string;
  ip: string;
  createdAt: string;
  admin?: Pick<User, 'id' | 'email' | 'name'>;
}

export interface Stats {
  totalUsers: number;
  activeUsers: number;
  activeLicenses: number;
  pendingPayments: number;
  activeDevices: number;
  recentSignups: number;
  revenue: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
}
