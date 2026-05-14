/** Typed shapes for the Angular client (subset aligned with backend contracts). */

export interface AuthTokenEnvelope {
  success: boolean;
  token: string;
  data?: unknown;
}

export interface PaginatedUsersEnvelope {
  success: boolean;
  data: unknown[];
  total: number;
  page: number;
  pages: number;
  count?: number;
}

export interface EducationalGenerationRequestBody {
  category_id: string;
  sub_category_id?: string;
  prompt: string;
}
