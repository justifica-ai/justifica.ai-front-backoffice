import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AdminAuditLogsListQuery,
  AdminAuditLogsListResponse,
  AuditLogDetail,
} from '../models/audit-log.model';

@Injectable({ providedIn: 'root' })
export class AdminAuditLogsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/admin/audit-logs`;

  listLogs(query: AdminAuditLogsListQuery): Observable<AdminAuditLogsListResponse> {
    let params = new HttpParams()
      .set('page', (query.page ?? 1).toString())
      .set('limit', (query.limit ?? 20).toString());

    if (query.action) {
      params = params.set('action', query.action);
    }
    if (query.userId) {
      params = params.set('userId', query.userId);
    }
    if (query.resourceType) {
      params = params.set('resourceType', query.resourceType);
    }
    if (query.from) {
      params = params.set('from', query.from);
    }
    if (query.to) {
      params = params.set('to', query.to);
    }

    return this.http.get<AdminAuditLogsListResponse>(this.baseUrl, { params });
  }

  getLogById(id: string): Observable<AuditLogDetail> {
    return this.http.get<AuditLogDetail>(`${this.baseUrl}/${id}`);
  }
}
