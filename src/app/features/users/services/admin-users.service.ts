import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AdminUsersListQuery,
  AdminUsersListResponse,
  AdminUserDetail,
  AdminUserUpdateBody,
  AdminUserUpdateResponse,
  AdminUserDeleteResponse,
} from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/admin/users`;

  listUsers(query: AdminUsersListQuery = {}): Observable<AdminUsersListResponse> {
    let params = new HttpParams();

    if (query.page) {
      params = params.set('page', query.page.toString());
    }
    if (query.limit) {
      params = params.set('limit', query.limit.toString());
    }
    if (query.q) {
      params = params.set('q', query.q);
    }
    if (query.status) {
      params = params.set('status', query.status);
    }
    if (query.role) {
      params = params.set('role', query.role);
    }

    return this.http.get<AdminUsersListResponse>(this.baseUrl, { params });
  }

  getUserById(id: string): Observable<AdminUserDetail> {
    return this.http.get<AdminUserDetail>(`${this.baseUrl}/${id}`);
  }

  updateUser(id: string, body: AdminUserUpdateBody): Observable<AdminUserUpdateResponse> {
    return this.http.patch<AdminUserUpdateResponse>(`${this.baseUrl}/${id}`, body);
  }

  deleteUser(id: string): Observable<AdminUserDeleteResponse> {
    return this.http.delete<AdminUserDeleteResponse>(`${this.baseUrl}/${id}`);
  }
}
