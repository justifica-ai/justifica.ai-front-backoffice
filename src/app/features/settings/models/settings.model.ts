// ═══════ Setting Types ═══════

export type SettingType = 'string' | 'number' | 'boolean' | 'json';

export interface SettingItem {
  readonly key: string;
  readonly value: string;
  readonly type: SettingType;
  readonly description: string | null;
  readonly group: string | null;
  readonly updatedBy: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface SettingsGroup {
  readonly group: string | null;
  readonly settings: readonly SettingItem[];
}

// ═══════ API Responses ═══════

export interface AdminSettingsListResponse {
  readonly data: readonly SettingsGroup[];
  readonly total: number;
}

export interface AdminSettingsUpdateBody {
  readonly settings: readonly { readonly key: string; readonly value: string }[];
}

export interface AdminSettingsUpdateResponse {
  readonly updated: number;
  readonly settings: readonly SettingItem[];
}

// ═══════ Group Labels & Icons ═══════

export const SETTINGS_GROUP_LABELS: Record<string, string> = {
  pricing: 'Preços',
  limits: 'Limites',
  pix: 'PIX',
  ai: 'Inteligência Artificial',
  landing: 'Landing Page',
  legal: 'Jurídico',
};

export const SETTINGS_GROUP_ORDER: readonly string[] = [
  'pricing',
  'limits',
  'pix',
  'ai',
  'landing',
  'legal',
];

export const SETTINGS_GROUP_ICONS: Record<string, string> = {
  pricing: 'banknote',
  limits: 'shield-alert',
  pix: 'qr-code',
  ai: 'brain',
  landing: 'layout-dashboard',
  legal: 'scale',
};
