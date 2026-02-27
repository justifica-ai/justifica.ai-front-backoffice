import type { Pagination } from '../../../shared/models/pagination.model';

// ═══════ Transaction List ═══════

export interface TransactionListItem {
  readonly id: string;
  readonly txid: string | null;
  readonly userId: string;
  readonly userName: string;
  readonly userEmail: string;
  readonly appealId: string;
  readonly amountGross: string;
  readonly discountCoupon: string;
  readonly discountVolume: string;
  readonly amountNet: string;
  readonly pspFee: string;
  readonly status: string;
  readonly confirmedAt: string | null;
  readonly createdAt: string;
}

export interface AdminTransactionsListResponse {
  readonly data: readonly TransactionListItem[];
  readonly pagination: Pagination;
}

export interface AdminTransactionsListQuery {
  page?: number;
  limit?: number;
  status?: TransactionStatus;
  from?: string;
  to?: string;
  q?: string;
}

// ═══════ Transaction Detail ═══════

export interface PixInfo {
  readonly id: string;
  readonly txid: string;
  readonly status: string;
  readonly amount: string;
  readonly expiresAt: string;
  readonly paidAt: string | null;
}

export interface TransactionDetail {
  readonly id: string;
  readonly txid: string | null;
  readonly endToEndId: string | null;
  readonly userId: string;
  readonly userName: string;
  readonly userEmail: string;
  readonly appealId: string;
  readonly appealStatus: string;
  readonly appealType: string;
  readonly amountGross: string;
  readonly discountCoupon: string;
  readonly discountVolume: string;
  readonly amountNet: string;
  readonly pspFee: string;
  readonly amountReceived: string | null;
  readonly couponId: string | null;
  readonly affiliateId: string | null;
  readonly status: string;
  readonly confirmedAt: string | null;
  readonly refundedAt: string | null;
  readonly refundReason: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly pix: PixInfo | null;
}

// ═══════ Financial Report ═══════

export interface FinancialReportSummary {
  readonly totalGross: string;
  readonly totalDiscountCoupon: string;
  readonly totalDiscountVolume: string;
  readonly totalPspFees: string;
  readonly totalNet: string;
  readonly totalRefunded: string;
  readonly totalAffiliateCommissions: string;
  readonly transactionCount: number;
  readonly paidCount: number;
  readonly refundedCount: number;
  readonly averageTicket: string;
}

export interface FinancialReportDaily {
  readonly date: string;
  readonly gross: string;
  readonly net: string;
  readonly count: number;
}

export interface FinancialReportByStatus {
  readonly status: string;
  readonly count: number;
  readonly amount: string;
}

export interface FinancialReportResponse {
  readonly period: {
    readonly from: string;
    readonly to: string;
  };
  readonly summary: FinancialReportSummary;
  readonly daily: readonly FinancialReportDaily[];
  readonly byStatus: readonly FinancialReportByStatus[];
}

export interface AdminFinancialReportQuery {
  from: string;
  to: string;
  format?: 'json' | 'csv';
}

// ═══════ Constants ═══════

export type TransactionStatus =
  | 'pending'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'expired'
  | 'cancelled';

export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  pending: 'Pendente',
  processing: 'Processando',
  paid: 'Pago',
  failed: 'Falha',
  refunded: 'Reembolsado',
  expired: 'Expirado',
  cancelled: 'Cancelado',
};

export const TRANSACTION_STATUS_COLORS: Record<TransactionStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  refunded: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  expired: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  cancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400',
};
