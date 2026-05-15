import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type {
  AuthTokenEnvelope,
  GenerateLessonRequest,
  PaginatedUsersEnvelope,
} from '../models/http-contracts';

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly api_root = environment.api_public_base;

  constructor(private readonly http: HttpClient) {}

  private authorized_headers(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token ?? ''}`,
      }),
    };
  }

  fetchUsers(page = 1, limit = 10): Observable<PaginatedUsersEnvelope> {
    return this.http.get<PaginatedUsersEnvelope>(
      `${this.api_root}/users?page=${page}&limit=${limit}`,
      this.authorized_headers(),
    );
  }

  getSubCategories(branchId: string): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.api_root}/sub-categories/${branchId}`);
  }

  register(payload: Record<string, unknown>): Observable<AuthTokenEnvelope> {
    return this.http.post<AuthTokenEnvelope>(`${this.api_root}/users/register`, payload);
  }

  login(credentials: Record<string, unknown>): Observable<AuthTokenEnvelope> {
    return this.http.post<AuthTokenEnvelope>(`${this.api_root}/users/login`, credentials);
  }

  generateLesson(body: GenerateLessonRequest): Observable<unknown> {
    return this.http.post(`${this.api_root}/ai/generate`, body, this.authorized_headers());
  }

  getUserHistory(learnerId: string): Observable<unknown> {
    return this.http.get(`${this.api_root}/ai/history/${learnerId}`, this.authorized_headers());
  }

  getAllHistory(page = 1, limit = 10): Observable<unknown> {
    return this.http.get(`${this.api_root}/ai/all?page=${page}&limit=${limit}`, this.authorized_headers());
  }

  getCategories(): Observable<unknown> {
    return this.http.get(`${this.api_root}/categories`);
  }

  createCategory(body: { name: string }): Observable<unknown> {
    return this.http.post(`${this.api_root}/categories`, body, this.authorized_headers());
  }
}
