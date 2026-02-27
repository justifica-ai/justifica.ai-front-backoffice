import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AdminSettingsListResponse,
  AdminSettingsUpdateBody,
  AdminSettingsUpdateResponse,
} from '../models/settings.model';

@Injectable({ providedIn: 'root' })
export class AdminSettingsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/admin/settings`;

  listSettings(group?: string): Observable<AdminSettingsListResponse> {
    let params = new HttpParams();
    if (group) {
      params = params.set('group', group);
    }
    return this.http.get<AdminSettingsListResponse>(this.baseUrl, { params });
  }

  updateSettings(body: AdminSettingsUpdateBody): Observable<AdminSettingsUpdateResponse> {
    return this.http.patch<AdminSettingsUpdateResponse>(this.baseUrl, body);
  }
}
