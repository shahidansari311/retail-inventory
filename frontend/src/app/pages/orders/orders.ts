import { Component, OnInit , ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order';
import { CustomerService } from '../../services/customer';
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
  customers: any[] = [];
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
    private customerService: CustomerService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { 
    this.loadOrders(); 
    this.loadCustomers();
  }

  loadOrders() {
    this.loading = true;
    this.error = '';
    this.orderService.getAll().subscribe({
      next: (data) => { this.orders = Array.isArray(data) ? data : []; this.loading = false; this.cdr.detectChanges(); },
      error: (err) => {
        this.error = err.status === 401 ? 'Your session has expired. Please log in again.'
                   : err.status === 403 ? 'You do not have permission to view orders.'
                   : err.status === 0 ? 'Cannot reach the server. Check your internet and try again.'
                   : 'We could not load orders. Please try again.';
        this.loading = false;
        this.toast.error(this.error);
        this.cdr.detectChanges();
      }
    });
  }

  loadCustomers() {
    this.customerService.getAll().subscribe({
      next: (data) => { this.customers = data; this.cdr.detectChanges(); },
      error: (err) => { console.error('Failed to load customers', err); }
    });
  }

  openAddForm() {
    this.editingOrder = null;
    this.formData = { customerId: null, orderDate: new Date().toISOString().slice(0,10), status: 'PENDING', totalAmount: 0 };
    this.formError = '';
    this.showForm = true;
    this.cdr.detectChanges();
  }

  editOrder(order: any) {
    this.editingOrder = order;
    this.formData = {
      customerId: order.customer?.id ?? order.customerId ?? null,
      orderDate: order.orderDate ? String(order.orderDate).slice(0, 10) : '',
      status: order.status ?? 'PENDING',
      totalAmount: order.totalAmount ?? 0,
      items: order.items ?? []
    };
    this.formError = '';
    this.showForm = true;
    this.cdr.detectChanges();
  }

  closeForm() {
    this.showForm = false;
    this.editingOrder = null;
    this.formError = '';
    this.cdr.detectChanges();
  }

  saveOrder() {
    if (!this.formData.customerId) {
      this.formError = 'Please select a customer.';
      this.toast.warning(this.formError);
      this.cdr.detectChanges();
      return;
    }
    if (this.formData.totalAmount == null || Number(this.formData.totalAmount) < 0) {
      this.formError = 'Total amount cannot be negative.';
      this.cdr.detectChanges();
      return;
    }
    this.saving = true;
    this.formError = '';

    const payload = { ...this.formData };
    if (payload.orderDate && payload.orderDate.length === 10) {
      payload.orderDate = payload.orderDate + 'T00:00:00';
    }
    
    // Map customerId to customer object
    if (payload.customerId) {
      payload.customer = { id: Number(payload.customerId) };
      delete payload.customerId;
    }
    if (!payload.items) {
      payload.items = [];
    }

    const action = this.editingOrder
      ? this.orderService.update(this.editingOrder.id, payload)
      : this.orderService.create(payload);

    action.subscribe({
      next: () => {
        this.toast.success(this.editingOrder ? 'Order updated!' : 'Order created!');
        this.loadOrders();
        this.closeForm();
        this.saving = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        let msg = err.error?.message || 'Failed to save order.';
        if (msg.includes('JSON parse error') || msg.includes('DateTimeParseException')) {
          msg = 'Invalid date format provided. Please select a valid date.';
        } else if (msg.length > 100) {
          msg = 'A server error occurred while saving the order. Please check your inputs.';
        }
        this.formError = msg;
        this.toast.error(msg);
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  getCustomerLabel(order: any): string {
    if (order?.customer?.name) return `${order.customer.name} (ID: ${order.customer.id})`;
    if (order?.customer?.id != null) return `Customer #${order.customer.id}`;
    if (order?.customerId != null) {
      const found = this.customers.find(c => c.id === order.customerId);
      return found ? `${found.name} (ID: ${found.id})` : `Customer #${order.customerId}`;
    }
    return '—';
  }

  confirmDelete(order: any) {
    this.deleteTarget = order;
    this.deleteConfirming = true;
    this.cdr.detectChanges();
  }

  cancelDelete() {
    this.deleteTarget = null;
    this.deleteConfirming = false;
    this.cdr.detectChanges();
  }

  executeDelete() {
    if (!this.deleteTarget) return;
    this.orderService.delete(this.deleteTarget.id).subscribe({
      next: () => {
        this.toast.success('Order deleted successfully.');
        this.loadOrders();
        this.cancelDelete();
        this.cdr.detectChanges();
      },
      error: (err) => {
        const msg = err.status === 404 ? 'This order was already deleted. Refreshing the list.'
                  : err.status === 403 ? 'You do not have permission to delete orders.'
                  : err.status === 409 ? 'This order is in use and cannot be deleted.'
                  : 'We could not delete this order. Please try again.';
        this.toast.error(msg);
        if (err.status === 404) this.loadOrders();
        this.cancelDelete();
        this.cdr.detectChanges();
      }
    });
  }
}
