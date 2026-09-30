import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private apiUrl = environment.apiUrl + '/categories';
  constructor(private http: HttpClient) {}
  getAll(): Observable<any[]> { return this.http.get<any[]>(this.apiUrl); }
  getById(id: number): Observable<any> { return this.http.get(`${this.apiUrl}/${id}`); }
  create(category: any): Observable<any> { return this.http.post(this.apiUrl, category); }
  update(id: number, category: any): Observable<any> { return this.http.put(`${this.apiUrl}/${id}`, category); }
  delete(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/${id}`); }
}
