import type { Pagination } from '../../../shared/models/pagination.model';

export type { Pagination } from '../../../shared/models/pagination.model';

export interface AdminUserListItem {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  appealsCount: number;
  transactionsCount: number;
}

export interface AdminUsersListResponse {
  data: AdminUserListItem[];
  pagination: Pagination;
}

export interface AdminUsersListQuery {
  page?: number;
  limit?: number;
  q?: string;
  status?: 'pending_verification' | 'active' | 'suspended' | 'pending_deletion' | 'deleted';
  role?: 'user' | 'affiliate' | 'admin' | 'super_admin';
}

export interface AdminUserDetail {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  status: string;
  isActive: boolean;
  onboardingCompleted: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  appeals: {
    total: number;
    byStatus: Record<string, number>;
  };
  transactions: {
    total: number;
    totalGross: string;
    byStatus: Record<string, number>;
  };
  sessions: {
    active: number;
    total: number;
  };
}

export interface AdminUserUpdateBody {
  status?: 'active' | 'suspended';
  role?: 'user' | 'affiliate' | 'admin' | 'super_admin';
}

export interface AdminUserUpdateResponse {
  id: string;
  status: string;
  role: string;
  isActive: boolean;
  updatedAt: string;
}

export interface AdminUserDeleteResponse {
  id: string;
  message: string;
}

export type UserStatus = 'pending_verification' | 'active' | 'suspended' | 'pending_deletion' | 'deleted';
export type UserRole = 'user' | 'affiliate' | 'admin' | 'super_admin';

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  pending_verification: 'Pendente',
  active: 'Ativo',
  suspended: 'Suspenso',
  pending_deletion: 'Exclusão Pendente',
  deleted: 'Excluído',
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  user: 'Usuário',
  affiliate: 'Afiliado',
  admin: 'Admin',
  super_admin: 'Super Admin',
};

export const USER_STATUS_COLORS: Record<UserStatus, string> = {
  pending_verification: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  active: 'bg-accent-100 text-accent-800 dark:bg-accent-900/30 dark:text-accent-300',
  suspended: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  pending_deletion: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  deleted: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
};

export const USER_ROLE_COLORS: Record<UserRole, string> = {
  user: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  affiliate: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  admin: 'bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300',
  super_admin: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};
