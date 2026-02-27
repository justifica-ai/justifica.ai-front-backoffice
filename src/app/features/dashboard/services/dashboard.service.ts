import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DashboardQuery, DashboardResponse } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/admin/dashboard`;

  getDashboardMetrics(query: DashboardQuery = {}): Observable<DashboardResponse> {
    let params = new HttpParams();

    if (query.period) {
      params = params.set('period', query.period);
    }
    if (query.from) {
      params = params.set('from', query.from);
    }
    if (query.to) {
      params = params.set('to', query.to);
    }

    return this.http.get<DashboardResponse>(this.baseUrl, { params });
  }
}
