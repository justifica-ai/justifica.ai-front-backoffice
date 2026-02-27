export interface DashboardQuery {
  period?: '7d' | '30d' | '90d' | 'custom';
  from?: string;
  to?: string;
}

export interface PeriodInfo {
  from: string;
  to: string;
  type: string;
}

export interface RevenueMetrics {
  totalGross: string;
  totalNet: string;
  averageTicket: string;
  totalTransactions: number;
  paidTransactions: number;
  previousPeriod: {
    totalGross: string;
    totalNet: string;
    totalTransactions: number;
  };
  variation: {
    grossPercent: number;
    netPercent: number;
    transactionsPercent: number;
  };
}

export interface UsersMetrics {
  total: number;
  newInPeriod: number;
  activeInPeriod: number;
  conversionRate: number;
  previousPeriod: {
    newInPeriod: number;
  };
  variation: {
    newPercent: number;
  };
}

export interface AppealsMetrics {
  total: number;
  inPeriod: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  previousPeriod: {
    inPeriod: number;
  };
  variation: {
    percent: number;
  };
}

export interface AiMetrics {
  totalGenerations: number;
  totalTokens: number;
  estimatedCost: string;
  averageDurationMs: number;
  fallbackRate: number;
  successRate: number;
  previousPeriod: {
    totalGenerations: number;
    estimatedCost: string;
  };
  variation: {
    generationsPercent: number;
    costPercent: number;
  };
}

export interface AffiliatesMetrics {
  total: number;
  active: number;
  pendingCommissions: string;
  totalCommissions: string;
}

export interface DashboardResponse {
  period: PeriodInfo;
  revenue: RevenueMetrics;
  users: UsersMetrics;
  appeals: AppealsMetrics;
  ai: AiMetrics;
  affiliates: AffiliatesMetrics;
}
