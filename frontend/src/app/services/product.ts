import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = environment.apiUrl + '/products';
  constructor(private http: HttpClient) {}
  getAll(): Observable<any[]> { return this.http.get<any[]>(this.apiUrl); }
  getById(id: number): Observable<any> { return this.http.get(`${this.apiUrl}/${id}`); }
  create(product: any): Observable<any> { return this.http.post(this.apiUrl, product); }
  update(id: number, product: any): Observable<any> { return this.http.put(`${this.apiUrl}/${id}`, product); }
  delete(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/${id}`); }
}
