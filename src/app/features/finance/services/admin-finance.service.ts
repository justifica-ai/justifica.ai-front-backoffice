import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AdminTransactionsListQuery,
  AdminTransactionsListResponse,
  TransactionDetail,
  AdminFinancialReportQuery,
  FinancialReportResponse,
} from '../models/finance.model';

@Injectable({ providedIn: 'root' })
export class AdminFinanceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/admin/finance`;

  listTransactions(query: AdminTransactionsListQuery): Observable<AdminTransactionsListResponse> {
    let params = new HttpParams()
      .set('page', (query.page ?? 1).toString())
      .set('limit', (query.limit ?? 20).toString());

    if (query.status) {
      params = params.set('status', query.status);
    }
    if (query.from) {
      params = params.set('from', query.from);
    }
    if (query.to) {
      params = params.set('to', query.to);
    }
    if (query.q) {
      params = params.set('q', query.q);
    }

    return this.http.get<AdminTransactionsListResponse>(`${this.baseUrl}/transactions`, { params });
  }

  getTransactionById(id: string): Observable<TransactionDetail> {
    return this.http.get<TransactionDetail>(`${this.baseUrl}/transactions/${id}`);
  }

  getFinancialReport(query: AdminFinancialReportQuery): Observable<FinancialReportResponse> {
    const params = new HttpParams()
      .set('from', query.from)
      .set('to', query.to)
      .set('format', query.format ?? 'json');

    return this.http.get<FinancialReportResponse>(`${this.baseUrl}/report`, { params });
  }

  exportReportCsv(from: string, to: string): void {
    const params = new HttpParams()
      .set('from', from)
      .set('to', to)
      .set('format', 'csv');

    this.http.get(`${this.baseUrl}/report`, {
      params,
      responseType: 'blob',
    }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-financeiro-${from.slice(0, 10)}_${to.slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      },
    });
  }
}
