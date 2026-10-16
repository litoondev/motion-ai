export const endpoints = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    google: '/auth/google',
    logout: '/auth/logout',
    me: '/auth/me',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    resendVerification: '/auth/email/resend',
  },
  user: {
    dashboard: '/me/dashboard',
    profile: '/me',
  },
  trial: {
    activate: '/trial/activate',
  },
  licenses: '/licenses',
  devices: {
    list: '/devices',
    unlink: (id: number) => `/devices/${id}/unlink`,
  },
  checkout: '/checkout',
  payments: '/payments',
  download: '/download',
  pricing: '/pricing',
} as const;
