import type { Pagination } from '../../../shared/models/pagination.model';

// ═══════ Provider ═══════

export type ProviderStatus = 'active' | 'inactive' | 'maintenance';

export interface AdminAiProviderListItem {
  id: string;
  name: string;
  slug: string;
  apiEndpoint: string | null;
  status: ProviderStatus;
  priority: number;
  modelsCount: number;
  hasApiKey: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAiProvidersListResponse {
  data: AdminAiProviderListItem[];
  pagination: Pagination;
}

export interface AdminAiProvidersListQuery {
  page: number;
  limit: number;
  status?: ProviderStatus;
}

export interface AdminAiProviderDetail {
  id: string;
  name: string;
  slug: string;
  apiEndpoint: string | null;
  status: ProviderStatus;
  priority: number;
  hasApiKey: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAiProviderCreateBody {
  name: string;
  slug: string;
  apiEndpoint?: string | null;
  status?: ProviderStatus;
  priority?: number;
}

export interface AdminAiProviderCreateResponse {
  id: string;
  name: string;
  slug: string;
  status: string;
  priority: number;
  createdAt: string;
}

export interface AdminAiProviderUpdateBody {
  name?: string;
  slug?: string;
  apiEndpoint?: string | null;
  status?: ProviderStatus;
  priority?: number;
}

export interface AdminAiProviderUpdateResponse {
  id: string;
  name: string;
  slug: string;
  status: string;
  priority: number;
  updatedAt: string;
}

export interface AdminAiProviderDeleteResponse {
  success: boolean;
  id: string;
}

export interface AdminAiProviderTestResponse {
  success: boolean;
  provider: string;
  latencyMs: number;
  error: string | null;
}

// ═══════ Model ═══════

export interface AdminAiModelListItem {
  id: string;
  providerId: string;
  providerName: string;
  providerSlug: string;
  name: string;
  slug: string;
  maxTokens: number;
  costPer1kInput: string | null;
  costPer1kOutput: string | null;
  priority: number;
  isActive: boolean;
  generationsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAiModelsListResponse {
  data: AdminAiModelListItem[];
  pagination: Pagination;
}

export interface AdminAiModelsListQuery {
  page: number;
  limit: number;
  providerId?: string;
  active?: string;
}

export interface AdminAiModelDetail {
  id: string;
  providerId: string;
  providerName: string;
  providerSlug: string;
  name: string;
  slug: string;
  maxTokens: number;
  costPer1kInput: string | null;
  costPer1kOutput: string | null;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAiModelCreateBody {
  providerId: string;
  name: string;
  slug: string;
  maxTokens?: number;
  costPer1kInput?: number | null;
  costPer1kOutput?: number | null;
  priority?: number;
  isActive?: boolean;
}

export interface AdminAiModelCreateResponse {
  id: string;
  name: string;
  slug: string;
  providerId: string;
  priority: number;
  isActive: boolean;
  createdAt: string;
}

export interface AdminAiModelUpdateBody {
  providerId?: string;
  name?: string;
  slug?: string;
  maxTokens?: number;
  costPer1kInput?: number | null;
  costPer1kOutput?: number | null;
  priority?: number;
  isActive?: boolean;
}

export interface AdminAiModelUpdateResponse {
  id: string;
  name: string;
  slug: string;
  priority: number;
  isActive: boolean;
  updatedAt: string;
}

export interface AdminAiModelDeleteResponse {
  success: boolean;
  id: string;
}

export interface AdminAiModelsReorderBody {
  models: { id: string; priority: number }[];
}

export interface AdminAiModelsReorderResponse {
  success: boolean;
  updated: number;
}

// ═══════ Display Helpers ═══════

export const PROVIDER_STATUS_LABELS: Record<ProviderStatus, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  maintenance: 'Manutenção',
};

export const PROVIDER_STATUS_COLORS: Record<ProviderStatus, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  maintenance: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
};
