import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type {
  AdminCouponsListResponse,
  AdminCouponsListQuery,
  AdminCouponDetail,
  AdminCouponCreateBody,
  AdminCouponCreateResponse,
  AdminCouponUpdateBody,
  AdminCouponUpdateResponse,
} from '../models/coupon.model';

@Injectable({ providedIn: 'root' })
export class AdminCouponsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/admin/coupons`;

  listCoupons(query: AdminCouponsListQuery): Observable<AdminCouponsListResponse> {
    let params = new HttpParams()
      .set('page', query.page.toString())
      .set('limit', query.limit.toString());

    if (query.status) {
      params = params.set('status', query.status);
    }
    if (query.type) {
      params = params.set('type', query.type);
    }
    if (query.q) {
      params = params.set('q', query.q);
    }

    return this.http.get<AdminCouponsListResponse>(this.baseUrl, { params });
  }

  getCouponById(id: string): Observable<AdminCouponDetail> {
    return this.http.get<AdminCouponDetail>(`${this.baseUrl}/${id}`);
  }

  createCoupon(body: AdminCouponCreateBody): Observable<AdminCouponCreateResponse> {
    return this.http.post<AdminCouponCreateResponse>(this.baseUrl, body);
  }

  updateCoupon(id: string, body: AdminCouponUpdateBody): Observable<AdminCouponUpdateResponse> {
    return this.http.patch<AdminCouponUpdateResponse>(`${this.baseUrl}/${id}`, body);
  }
}
