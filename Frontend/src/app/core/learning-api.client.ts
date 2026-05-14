import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import type {
  AuthTokenEnvelope,
  EducationalGenerationRequestBody,
  PaginatedUsersEnvelope,
} from '../models/http-contracts';

@Injectable({ providedIn: 'root' })
export class LearningApiClient {
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

  fetchOperatorDirectoryPage(page = 1, limit = 10): Observable<PaginatedUsersEnvelope> {
    return this.http.get<PaginatedUsersEnvelope>(
      `${this.api_root}/users?page=${page}&limit=${limit}`,
      this.authorized_headers(),
    );
  }

  fetchTopicsForBranch(branchId: string): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.api_root}/sub-categories/${branchId}`);
  }

  submitRegistrationEnvelope(payload: Record<string, unknown>): Observable<AuthTokenEnvelope> {
    return this.http.post<AuthTokenEnvelope>(`${this.api_root}/users/register`, payload);
  }

  establishSession(credentials: Record<string, unknown>): Observable<AuthTokenEnvelope> {
    return this.http.post<AuthTokenEnvelope>(`${this.api_root}/users/login`, credentials);
  }

  submitEducationalContentRequest(body: EducationalGenerationRequestBody): Observable<unknown> {
    return this.http.post(`${this.api_root}/ai/generate`, body, this.authorized_headers());
  }

  fetchLearnerTimeline(learnerId: string): Observable<unknown> {
    return this.http.get(`${this.api_root}/ai/history/${learnerId}`, this.authorized_headers());
  }

  fetchGlobalStudyLedgerPage(page = 1, limit = 10): Observable<unknown> {
    return this.http.get(`${this.api_root}/ai/all?page=${page}&limit=${limit}`, this.authorized_headers());
  }

  fetchCategoryBranches(): Observable<unknown> {
    return this.http.get(`${this.api_root}/categories`);
  }

  proposeCategoryBranch(body: { name: string }): Observable<unknown> {
    return this.http.post(`${this.api_root}/categories`, body, this.authorized_headers());
  }
}
