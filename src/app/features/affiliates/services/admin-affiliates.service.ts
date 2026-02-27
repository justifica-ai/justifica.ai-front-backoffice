import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AdminAffiliatesListQuery,
  AdminAffiliatesListResponse,
  AdminAffiliateDetail,
  AdminAffiliateUpdateBody,
  AdminAffiliateUpdateResponse,
  AdminWithdrawalActionBody,
  AdminWithdrawalActionResponse,
  AdminPendingWithdrawalsQuery,
  AdminPendingWithdrawalsResponse,
} from '../models/affiliate.model';

@Injectable({ providedIn: 'root' })
export class AdminAffiliatesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/admin/affiliates`;

  listAffiliates(query: AdminAffiliatesListQuery = {}): Observable<AdminAffiliatesListResponse> {
    let params = new HttpParams();

    if (query.page) {
      params = params.set('page', query.page.toString());
    }
    if (query.limit) {
      params = params.set('limit', query.limit.toString());
    }
    if (query.status) {
      params = params.set('status', query.status);
    }
    if (query.q) {
      params = params.set('q', query.q);
    }

    return this.http.get<AdminAffiliatesListResponse>(this.baseUrl, { params });
  }

  getAffiliateById(id: string): Observable<AdminAffiliateDetail> {
    return this.http.get<AdminAffiliateDetail>(`${this.baseUrl}/${id}`);
  }

  updateAffiliate(id: string, body: AdminAffiliateUpdateBody): Observable<AdminAffiliateUpdateResponse> {
    return this.http.patch<AdminAffiliateUpdateResponse>(`${this.baseUrl}/${id}`, body);
  }

  listPendingWithdrawals(query: AdminPendingWithdrawalsQuery = {}): Observable<AdminPendingWithdrawalsResponse> {
    let params = new HttpParams();

    if (query.page) {
      params = params.set('page', query.page.toString());
    }
    if (query.limit) {
      params = params.set('limit', query.limit.toString());
    }

    return this.http.get<AdminPendingWithdrawalsResponse>(`${this.baseUrl}/withdrawals/pending`, { params });
  }

  processWithdrawal(
    affiliateId: string,
    withdrawalId: string,
    body: AdminWithdrawalActionBody,
  ): Observable<AdminWithdrawalActionResponse> {
    return this.http.post<AdminWithdrawalActionResponse>(
      `${this.baseUrl}/${affiliateId}/withdrawals/${withdrawalId}`,
      body,
    );
  }
}
