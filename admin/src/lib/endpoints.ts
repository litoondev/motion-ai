export const endpoints = {
  auth: {
    login: '/auth/login',
    google: '/auth/google',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  admin: {
    stats: '/admin/stats',
    users: {
      list: '/admin/users',
      show: (id: number) => `/admin/users/${id}`,
      block: (id: number) => `/admin/users/${id}/block`,
      unblock: (id: number) => `/admin/users/${id}/unblock`,
      changeRole: (id: number) => `/admin/users/${id}/role`,
    },
    licenses: {
      list: '/admin/licenses',
      show: (id: number) => `/admin/licenses/${id}`,
      generate: '/admin/licenses',
      suspend: (id: number) => `/admin/licenses/${id}/suspend`,
      revoke: (id: number) => `/admin/licenses/${id}/revoke`,
      reactivate: (id: number) => `/admin/licenses/${id}/reactivate`,
      extend: (id: number) => `/admin/licenses/${id}/extend`,
      changeSeats: (id: number) => `/admin/licenses/${id}/seats`,
    },
    devices: {
      list: '/admin/devices',
      forceUnlink: (id: number) => `/admin/devices/${id}/unlink`,
    },
    payments: {
      list: '/admin/payments',
      show: (id: number) => `/admin/payments/${id}`,
      slip: (id: number) => `/admin/payments/${id}/slip`,
      approve: (id: number) => `/admin/payments/${id}/approve`,
      reject: (id: number) => `/admin/payments/${id}/reject`,
      refund: (id: number) => `/admin/payments/${id}/refund`,
    },
    settings: {
      get: '/admin/settings',
      update: '/admin/settings',
      uploadPlugin: '/admin/settings/plugin',
    },
    auditLogs: '/admin/audit-logs',
  },
} as const;
