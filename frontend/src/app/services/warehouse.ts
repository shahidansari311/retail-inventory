import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WarehouseService {
  private apiUrl = environment.apiUrl + '/warehouses';
  constructor(private http: HttpClient) {}
  getAll(): Observable<any[]> { return this.http.get<any[]>(this.apiUrl); }
  getById(id: number): Observable<any> { return this.http.get(`${this.apiUrl}/${id}`); }
  create(warehouse: any): Observable<any> { return this.http.post(this.apiUrl, warehouse); }
  update(id: number, warehouse: any): Observable<any> { return this.http.put(`${this.apiUrl}/${id}`, warehouse); }
  delete(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/${id}`); }
}
