import type { Pagination } from '../../../shared/models/pagination.model';

export type { Pagination } from '../../../shared/models/pagination.model';

export interface AdminAffiliateListItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  code: string;
  commissionRate: string;
  totalEarnings: string;
  pendingBalance: string;
  availableBalance: string;
  status: string;
  totalClicks: number;
  totalConversions: number;
  activatedAt: string | null;
  createdAt: string;
}

export interface AdminAffiliatesListResponse {
  data: AdminAffiliateListItem[];
  pagination: Pagination;
}

export interface AdminAffiliatesListQuery {
  page?: number;
  limit?: number;
  status?: AffiliateStatus;
  q?: string;
}

export interface AdminAffiliateDetail {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  code: string;
  commissionRate: string;
  pixKey: string | null;
  totalEarnings: string;
  pendingBalance: string;
  availableBalance: string;
  status: string;
  activatedAt: string | null;
  createdAt: string;
  updatedAt: string;
  metrics: AffiliateMetrics;
  recentConversions: AffiliateConversion[];
  recentWithdrawals: AffiliateWithdrawal[];
}

export interface AffiliateMetrics {
  totalClicks: number;
  totalConversions: number;
  conversionRate: string;
  totalWithdrawals: number;
  pendingWithdrawals: number;
}

export interface AffiliateConversion {
  id: string;
  commissionAmount: string;
  isPaid: boolean;
  createdAt: string;
}

export interface AffiliateWithdrawal {
  id: string;
  amount: string;
  pixKey: string;
  status: string;
  processedAt: string | null;
  createdAt: string;
}

export interface AdminAffiliateUpdateBody {
  status?: 'active' | 'suspended' | 'blocked';
  commissionRate?: number;
}

export interface AdminAffiliateUpdateResponse {
  id: string;
  status: string;
  commissionRate: string;
  updatedAt: string;
}

export interface AdminWithdrawalActionBody {
  action: 'approve' | 'reject';
}

export interface AdminWithdrawalActionResponse {
  id: string;
  status: string;
  processedAt: string | null;
}

export interface AdminPendingWithdrawalItem {
  id: string;
  affiliateId: string;
  affiliateName: string;
  affiliateEmail: string;
  affiliateCode: string;
  amount: string;
  pixKey: string;
  createdAt: string;
}

export interface AdminPendingWithdrawalsResponse {
  data: AdminPendingWithdrawalItem[];
  pagination: Pagination;
}

export interface AdminPendingWithdrawalsQuery {
  page?: number;
  limit?: number;
}

export type AffiliateStatus = 'pending' | 'active' | 'suspended' | 'blocked';
export type WithdrawalStatus = 'pending' | 'processing' | 'completed' | 'rejected';

export const AFFILIATE_STATUS_LABELS: Record<AffiliateStatus, string> = {
  pending: 'Pendente',
  active: 'Ativo',
  suspended: 'Suspenso',
  blocked: 'Bloqueado',
};

export const AFFILIATE_STATUS_COLORS: Record<AffiliateStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  active: 'bg-accent-100 text-accent-800 dark:bg-accent-900/30 dark:text-accent-300',
  suspended: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  blocked: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export const WITHDRAWAL_STATUS_LABELS: Record<WithdrawalStatus, string> = {
  pending: 'Pendente',
  processing: 'Processando',
  completed: 'Concluído',
  rejected: 'Rejeitado',
};

export const WITHDRAWAL_STATUS_COLORS: Record<WithdrawalStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  completed: 'bg-accent-100 text-accent-800 dark:bg-accent-900/30 dark:text-accent-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};
