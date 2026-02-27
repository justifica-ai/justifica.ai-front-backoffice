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

// ═══════ Prompt ═══════

export type PromptType = 'defesa_previa' | 'recurso_1a_instancia' | 'recurso_2a_instancia';
export type PromptStatus = 'draft' | 'active' | 'inactive' | 'archived';

export interface AdminAiPromptListItem {
  id: string;
  name: string;
  slug: string;
  type: PromptType;
  status: PromptStatus;
  version: string;
  description: string | null;
  isActive: boolean;
  generationsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAiPromptsListResponse {
  data: AdminAiPromptListItem[];
  pagination: Pagination;
}

export interface AdminAiPromptsListQuery {
  page: number;
  limit: number;
  type?: PromptType;
  status?: PromptStatus;
}

export interface AdminAiPromptDetail {
  id: string;
  name: string;
  slug: string;
  type: PromptType;
  status: PromptStatus;
  version: string;
  systemPrompt: string;
  userPromptTemplate: string;
  description: string | null;
  motiveCodes: string[];
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAiPromptCreateBody {
  name: string;
  slug: string;
  type: PromptType;
  version?: string;
  systemPrompt: string;
  userPromptTemplate: string;
  description?: string | null;
  motiveCodes?: string[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface AdminAiPromptCreateResponse {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: string;
  version: string;
  createdAt: string;
}

export interface AdminAiPromptUpdateBody {
  name?: string;
  slug?: string;
  type?: PromptType;
  version?: string;
  systemPrompt?: string;
  userPromptTemplate?: string;
  description?: string | null;
  motiveCodes?: string[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface AdminAiPromptUpdateResponse {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: string;
  version: string;
  updatedAt: string;
}

export interface AdminAiPromptStatusBody {
  status: 'active' | 'inactive' | 'archived';
}

export interface AdminAiPromptStatusResponse {
  id: string;
  status: string;
  previousActiveId: string | null;
}

export interface AdminAiPromptCloneBody {
  newVersion: string;
  name?: string;
}

export interface AdminAiPromptCloneResponse {
  id: string;
  name: string;
  slug: string;
  version: string;
  status: string;
  createdAt: string;
}

export interface AdminAiPromptDiffResponse {
  promptA: AdminAiPromptDiffItem;
  promptB: AdminAiPromptDiffItem;
}

export interface AdminAiPromptDiffItem {
  id: string;
  name: string;
  version: string;
  systemPrompt: string;
  userPromptTemplate: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

export interface AdminAiPromptDeleteResponse {
  success: boolean;
  id: string;
}

export const PROMPT_TYPE_LABELS: Record<PromptType, string> = {
  defesa_previa: 'Defesa Prévia',
  recurso_1a_instancia: 'Recurso 1ª Instância',
  recurso_2a_instancia: 'Recurso 2ª Instância',
};

export const PROMPT_STATUS_LABELS: Record<PromptStatus, string> = {
  draft: 'Rascunho',
  active: 'Ativo',
  inactive: 'Inativo',
  archived: 'Arquivado',
};

export const PROMPT_STATUS_COLORS: Record<PromptStatus, string> = {
  draft: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  archived: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};
