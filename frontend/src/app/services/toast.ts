import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  private add(type: Toast['type'], message: string, duration = 4000) {
    const id = ++this.counter;
    const toast: Toast = { id, type, message, duration };
    this.toastsSubject.next([...this.toastsSubject.value, toast]);
    if (duration > 0) setTimeout(() => this.remove(id), duration);
    return id;
  }

  success(message: string) { return this.add('success', message); }
  error(message: string)   { return this.add('error', message, 6000); }
  warning(message: string) { return this.add('warning', message, 5000); }
  info(message: string)    { return this.add('info', message); }

  remove(id: number) {
    this.toastsSubject.next(this.toastsSubject.value.filter(t => t.id !== id));
  }
}
