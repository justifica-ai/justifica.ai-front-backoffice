export const APP_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  ADMIN: {
    DASHBOARD: '/dashboard',
    USERS: '/users',
    USER_DETAIL: (id: string) => `/users/${id}` as const,
    APPEALS: '/appeals',
    APPEAL_DETAIL: (id: string) => `/appeals/${id}` as const,
    FINANCE: '/finance',
    INFRACTIONS: '/infractions',
    INFRACTION_DETAIL: (id: string) => `/infractions/${id}` as const,
    SETTINGS: '/settings',
    AUDIT_LOGS: '/audit-logs',
    AUDIT_LOG_DETAIL: (id: string) => `/audit-logs/${id}` as const,
    AI: '/ai',
    AFFILIATES: '/affiliates',
    COUPONS: '/coupons',
  },
  EXTERNAL: {
    LANDING: 'https://justifica.ai',
    APP: 'https://app.justifica.ai',
  },
} as const;
