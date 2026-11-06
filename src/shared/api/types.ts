export interface ApiResponse<T> {
  code: number;
  message: string;
  data?: T;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  phone: string;
}

export interface PresetParams {
  negative_prompt?: string;
  cfg_scale?: number;
  steps?: number;
  sampler?: string;
  [key: string]: unknown;
}

export interface ImageStyle {
  id: string;
  name: string;
  display_name: string;
  description: string;
  preset_params: PresetParams;
  sort_order: number;
  preview_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type GenerationMode = "simple" | "pro";
export type GenerationStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export interface SimpleGenerateInput {
  prompt: string;
  style_id: string;
}

export interface ProGenerateInput {
  prompt: string;
  negative_prompt: string;
  width: number;
  height: number;
  cfg_scale: number;
  steps: number;
  sampler: string;
  seed: number;
}

export interface GenerateResponse {
  record_id: string;
  status: GenerationStatus;
}

export interface GenerationState {
  record_id: string;
  status: GenerationStatus;
  image_url?: string;
  thumbnail_url?: string;
  seed?: number;
  duration_ms?: number;
  error_message?: string;
  prompt?: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  cfg_scale?: number;
  steps?: number;
  sampler?: string;
}

export interface GenerationRecord {
  id: string;
  user_id: string;
  mode: GenerationMode;
  prompt: string;
  negative_prompt: string;
  style_id: string | null;
  width: number;
  height: number;
  cfg_scale: number;
  steps: number;
  sampler: string;
  seed: number;
  image_url: string;
  thumbnail_url: string;
  status: GenerationStatus;
  error_message: string;
  duration_ms: number;
  created_at: string;
  updated_at: string;
  style?: ImageStyle | null;
}

export interface HistoryList {
  records: GenerationRecord[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export const API_CODES = {
  success: 0,
  badRequest: 40000,
  unauthorized: 40100,
  tokenExpired: 40101,
  forbidden: 40300,
  notFound: 40400,
  conflict: 40900,
  generationFailed: 42000,
  generationTimeout: 42001,
  generationBusy: 42002,
  rateLimited: 42900,
  historyNotFound: 44000,
  internal: 50000,
} as const;
