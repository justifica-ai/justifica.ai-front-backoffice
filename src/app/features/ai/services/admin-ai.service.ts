import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type {
  AdminAiProvidersListResponse,
  AdminAiProvidersListQuery,
  AdminAiProviderDetail,
  AdminAiProviderCreateBody,
  AdminAiProviderCreateResponse,
  AdminAiProviderUpdateBody,
  AdminAiProviderUpdateResponse,
  AdminAiProviderDeleteResponse,
  AdminAiProviderTestResponse,
  AdminAiModelsListResponse,
  AdminAiModelsListQuery,
  AdminAiModelDetail,
  AdminAiModelCreateBody,
  AdminAiModelCreateResponse,
  AdminAiModelUpdateBody,
  AdminAiModelUpdateResponse,
  AdminAiModelDeleteResponse,
  AdminAiModelsReorderBody,
  AdminAiModelsReorderResponse,
} from '../models/ai.model';

@Injectable({ providedIn: 'root' })
export class AdminAiService {
  private readonly http = inject(HttpClient);
  private readonly providersUrl = `${environment.apiUrl}/api/admin/ai/providers`;
  private readonly modelsUrl = `${environment.apiUrl}/api/admin/ai/models`;

  // ═══════ Providers ═══════

  listProviders(query: AdminAiProvidersListQuery): Observable<AdminAiProvidersListResponse> {
    let params = new HttpParams()
      .set('page', query.page.toString())
      .set('limit', query.limit.toString());

    if (query.status) {
      params = params.set('status', query.status);
    }

    return this.http.get<AdminAiProvidersListResponse>(this.providersUrl, { params });
  }

  getProviderById(id: string): Observable<AdminAiProviderDetail> {
    return this.http.get<AdminAiProviderDetail>(`${this.providersUrl}/${id}`);
  }

  createProvider(body: AdminAiProviderCreateBody): Observable<AdminAiProviderCreateResponse> {
    return this.http.post<AdminAiProviderCreateResponse>(this.providersUrl, body);
  }

  updateProvider(id: string, body: AdminAiProviderUpdateBody): Observable<AdminAiProviderUpdateResponse> {
    return this.http.patch<AdminAiProviderUpdateResponse>(`${this.providersUrl}/${id}`, body);
  }

  deleteProvider(id: string): Observable<AdminAiProviderDeleteResponse> {
    return this.http.delete<AdminAiProviderDeleteResponse>(`${this.providersUrl}/${id}`);
  }

  testConnection(id: string): Observable<AdminAiProviderTestResponse> {
    return this.http.post<AdminAiProviderTestResponse>(`${this.providersUrl}/${id}/test-connection`, {});
  }

  // ═══════ Models ═══════

  listModels(query: AdminAiModelsListQuery): Observable<AdminAiModelsListResponse> {
    let params = new HttpParams()
      .set('page', query.page.toString())
      .set('limit', query.limit.toString());

    if (query.providerId) {
      params = params.set('providerId', query.providerId);
    }
    if (query.active) {
      params = params.set('active', query.active);
    }

    return this.http.get<AdminAiModelsListResponse>(this.modelsUrl, { params });
  }

  getModelById(id: string): Observable<AdminAiModelDetail> {
    return this.http.get<AdminAiModelDetail>(`${this.modelsUrl}/${id}`);
  }

  createModel(body: AdminAiModelCreateBody): Observable<AdminAiModelCreateResponse> {
    return this.http.post<AdminAiModelCreateResponse>(this.modelsUrl, body);
  }

  updateModel(id: string, body: AdminAiModelUpdateBody): Observable<AdminAiModelUpdateResponse> {
    return this.http.patch<AdminAiModelUpdateResponse>(`${this.modelsUrl}/${id}`, body);
  }

  deleteModel(id: string): Observable<AdminAiModelDeleteResponse> {
    return this.http.delete<AdminAiModelDeleteResponse>(`${this.modelsUrl}/${id}`);
  }

  reorderModels(body: AdminAiModelsReorderBody): Observable<AdminAiModelsReorderResponse> {
    return this.http.patch<AdminAiModelsReorderResponse>(`${this.modelsUrl}/reorder`, body);
  }
}
