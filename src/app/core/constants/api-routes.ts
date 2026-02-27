export const API_ROUTES = {
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    STATS: '/admin/dashboard/stats',
  },
  USERS: {
    BASE: '/admin/users',
    BY_ID: (id: string) => `/admin/users/${id}` as const,
    TOGGLE_STATUS: (id: string) => `/admin/users/${id}/toggle-status` as const,
  },
  APPEALS: {
    BASE: '/admin/appeals',
    BY_ID: (id: string) => `/admin/appeals/${id}` as const,
  },
  FINANCE: {
    TRANSACTIONS: '/admin/finance/transactions',
    TRANSACTION_BY_ID: (id: string) => `/admin/finance/transactions/${id}` as const,
    SUMMARY: '/admin/finance/summary',
  },
  INFRACTIONS: {
    BASE: '/admin/ctb-infractions',
    BY_ID: (id: string) => `/admin/ctb-infractions/${id}` as const,
    IMPORT: '/admin/ctb-infractions/import',
  },
  SETTINGS: {
    BASE: '/admin/settings',
    BY_KEY: (key: string) => `/admin/settings/${key}` as const,
  },
  AUDIT_LOGS: {
    BASE: '/admin/audit-logs',
    BY_ID: (id: string) => `/admin/audit-logs/${id}` as const,
  },
  AI: {
    PROVIDERS: '/admin/ai/providers',
    PROVIDER_BY_ID: (id: string) => `/admin/ai/providers/${id}` as const,
    MODELS: '/admin/ai/models',
    MODEL_BY_ID: (id: string) => `/admin/ai/models/${id}` as const,
    PROMPTS: '/admin/ai/prompts',
    PROMPT_BY_ID: (id: string) => `/admin/ai/prompts/${id}` as const,
    GENERATIONS: '/admin/ai/generations',
  },
  AFFILIATES: {
    BASE: '/admin/affiliates',
    BY_ID: (id: string) => `/admin/affiliates/${id}` as const,
    WITHDRAWALS: '/admin/affiliates/withdrawals',
  },
  COUPONS: {
    BASE: '/admin/coupons',
    BY_ID: (id: string) => `/admin/coupons/${id}` as const,
  },
} as const;
