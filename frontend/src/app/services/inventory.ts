import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private apiUrl = environment.apiUrl + '/inventory';
  constructor(private http: HttpClient) {}
  getAll(): Observable<any[]> { return this.http.get<any[]>(this.apiUrl); }
  getById(id: number): Observable<any> { return this.http.get(`${this.apiUrl}/${id}`); }
  create(inventory: any): Observable<any> { return this.http.post(this.apiUrl, inventory); }
  update(id: number, inventory: any): Observable<any> { return this.http.put(`${this.apiUrl}/${id}`, inventory); }
  delete(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/${id}`); }
}
