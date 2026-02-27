import type { Pagination } from '../../../shared/models/pagination.model';

// ═══════ List ═══════

export interface AdminCouponListItem {
  id: string;
  code: string;
  type: CouponType;
  value: string;
  validFrom: string | null;
  validUntil: string | null;
  maxUses: number | null;
  currentUses: number;
  maxUsesPerUser: number;
  minAmount: string | null;
  firstPurchaseOnly: boolean;
  status: CouponStatus;
  createdAt: string;
}

export interface AdminCouponsListResponse {
  data: AdminCouponListItem[];
  pagination: Pagination;
}

export interface AdminCouponsListQuery {
  page: number;
  limit: number;
  status?: CouponStatus;
  type?: CouponType;
  q?: string;
}

// ═══════ Detail ═══════

export interface CouponMetrics {
  totalUsages: number;
  uniqueUsers: number;
  totalDiscountGranted: string;
}

export interface CouponUsage {
  id: string;
  userId: string;
  discountAmount: string;
  usedAt: string;
}

export interface AdminCouponDetail {
  id: string;
  code: string;
  type: CouponType;
  value: string;
  validFrom: string | null;
  validUntil: string | null;
  maxUses: number | null;
  currentUses: number;
  maxUsesPerUser: number;
  minAmount: string | null;
  firstPurchaseOnly: boolean;
  allowedResourceTypes: string[] | null;
  allowedChannels: string[] | null;
  description: string | null;
  utmCampaign: string | null;
  status: CouponStatus;
  isActive: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  metrics: CouponMetrics;
  recentUsages: CouponUsage[];
}

// ═══════ Create / Update ═══════

export interface AdminCouponCreateBody {
  code: string;
  type: CouponType;
  value: number;
  validFrom: string;
  validUntil: string;
  maxUses?: number | null;
  maxUsesPerUser?: number;
  minAmount?: number | null;
  firstPurchaseOnly?: boolean;
  allowedResourceTypes?: string[] | null;
  allowedChannels?: string[] | null;
  description?: string | null;
  utmCampaign?: string | null;
}

export interface AdminCouponCreateResponse {
  id: string;
  code: string;
  type: string;
  value: string;
  status: string;
  createdAt: string;
}

export interface AdminCouponUpdateBody {
  status?: 'active' | 'inactive';
  validUntil?: string;
  maxUses?: number | null;
  maxUsesPerUser?: number;
  code?: string;
  type?: CouponType;
  value?: number;
  validFrom?: string;
  minAmount?: number | null;
  firstPurchaseOnly?: boolean;
  allowedResourceTypes?: string[] | null;
  allowedChannels?: string[] | null;
  description?: string | null;
  utmCampaign?: string | null;
}

export interface AdminCouponUpdateResponse {
  id: string;
  code: string;
  status: string;
  updatedAt: string;
}

// ═══════ Enums & Display Helpers ═══════

export type CouponStatus = 'active' | 'inactive' | 'expired' | 'depleted';
export type CouponType = 'percentage' | 'fixed_value';

export const COUPON_STATUS_LABELS: Record<CouponStatus, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  expired: 'Expirado',
  depleted: 'Esgotado',
};

export const COUPON_STATUS_COLORS: Record<CouponStatus, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  expired: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  depleted: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export const COUPON_TYPE_LABELS: Record<CouponType, string> = {
  percentage: 'Percentual',
  fixed_value: 'Valor Fixo',
};
