/** HTTP contracts shared between controllers and clients (subset). */

export interface RegisterIdentityBody {
  id: string;
  name: string;
  phone: string;
  role?: 'user' | 'admin';
}

export interface AuthenticateIdentityBody {
  id: string;
  name: string;
  phone: string;
}

export interface IssueEducationalContentBody {
  category_id: string;
  sub_category_id?: string;
  prompt?: string;
  user_id?: string;
}

export interface PaginatedEnvelope<T> {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: T;
}
