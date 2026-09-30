import { Component, OnInit , ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.html',
  styleUrls: ['./orders.scss']
})
export class Orders implements OnInit {
  orders: any[] = [];
  loading = false;
  saving = false;
  error = '';

  showForm = false;
  editingOrder: any = null;
  formData: any = { customerId: null, orderDate: '', status: 'PENDING', totalAmount: 0 };
  formError = '';

  deleteTarget: any = null;
  deleteConfirming = false;

  constructor(
    private orderService: OrderService,
    private toast: ToastService
  , private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadOrders(); }

  loadOrders() {
    this.loading = true;
    this.error = '';
    this.orderService.getAll().subscribe({
      next: (data) => { this.orders = data; this.loading = false; },
      error: (err) => {
        this.error = 'Failed to load orders.';
        this.loading = false;
        this.toast.error(this.error);
      }
    });
  }

  openAddForm() {
    this.editingOrder = null;
    this.formData = { customerId: null, orderDate: new Date().toISOString().slice(0,10), status: 'PENDING', totalAmount: 0 };
    this.formError = '';
    this.showForm = true;
  }

  editOrder(order: any) {
    this.editingOrder = order;
    this.formData = { ...order };
    this.formError = '';
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingOrder = null;
    this.formError = '';
  }

  saveOrder() {
    this.saving = true;
    this.formError = '';
    const action = this.editingOrder
      ? this.orderService.update(this.editingOrder.id, this.formData)
      : this.orderService.create(this.formData);

    action.subscribe({
      next: () => {
        this.toast.success(this.editingOrder ? 'Order updated!' : 'Order created!');
        this.loadOrders();
        this.closeForm();
        this.saving = false;
      },
      error: (err) => {
        this.formError = err.error?.message || 'Failed to save order.';
        this.toast.error(this.formError);
        this.saving = false;
      }
    });
  }

  confirmDelete(order: any) {
    this.deleteTarget = order;
    this.deleteConfirming = true;
  }

  cancelDelete() {
    this.deleteTarget = null;
    this.deleteConfirming = false;
  }

  executeDelete() {
    if (!this.deleteTarget) return;
    this.orderService.delete(this.deleteTarget.id).subscribe({
      next: () => {
        this.toast.success('Order deleted successfully.');
        this.loadOrders();
        this.cancelDelete();
      },
      error: (err) => {
        this.toast.error('Failed to delete order.');
        this.cancelDelete();
      }
    });
  }
}
