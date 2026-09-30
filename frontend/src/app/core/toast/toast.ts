import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.scss'
})
export class ToastComponent implements OnInit {
  toasts: Toast[] = [];

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toastService.toasts$.subscribe(toasts => this.toasts = toasts);
  }

  dismiss(id: number) {
    this.toastService.remove(id);
  }

  icon(type: string): string {
    const icons: any = {
      success: 'fas fa-circle-check',
      error:   'fas fa-circle-xmark',
      warning: 'fas fa-triangle-exclamation',
      info:    'fas fa-circle-info'
    };
    return icons[type] || 'fas fa-circle-info';
  }
}
