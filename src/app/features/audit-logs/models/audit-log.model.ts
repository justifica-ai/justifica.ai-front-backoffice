import type { Pagination } from '../../../shared/models/pagination.model';

// ═══════ Audit Action Types ═══════

export type AuditAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'signup'
  | 'export'
  | 'admin_action';

// ═══════ List Item (no changes/userAgent/metadata) ═══════

export interface AuditLogListItem {
  readonly id: string;
  readonly userId: string | null;
  readonly action: string;
  readonly resourceType: string;
  readonly resourceId: string | null;
  readonly ipAddress: string | null;
  readonly createdAt: string;
}

export interface AdminAuditLogsListResponse {
  readonly data: readonly AuditLogListItem[];
  readonly pagination: Pagination;
}

export interface AdminAuditLogsListQuery {
  page?: number;
  limit?: number;
  action?: AuditAction;
  userId?: string;
  resourceType?: string;
  from?: string;
  to?: string;
}

// ═══════ Detail (full entry) ═══════

export interface AuditLogDetail {
  readonly id: string;
  readonly userId: string | null;
  readonly action: string;
  readonly resourceType: string;
  readonly resourceId: string | null;
  readonly changes: unknown | null;
  readonly ipAddress: string | null;
  readonly userAgent: string | null;
  readonly metadata: unknown | null;
  readonly createdAt: string;
}

// ═══════ Constants ═══════

export const AUDIT_ACTIONS: readonly AuditAction[] = [
  'create', 'read', 'update', 'delete',
  'login', 'logout', 'signup', 'export', 'admin_action',
];

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  create: 'Criar',
  read: 'Leitura',
  update: 'Atualizar',
  delete: 'Excluir',
  login: 'Login',
  logout: 'Logout',
  signup: 'Cadastro',
  export: 'Exportar',
  admin_action: 'Ação Admin',
};

export const AUDIT_ACTION_COLORS: Record<string, string> = {
  create: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  read: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  update: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  delete: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  login: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  logout: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  signup: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  export: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  admin_action: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};
