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
      next: (data) => { this.orders = data; this.loading = false; this.cdr.detectChanges(); },
      error: (err) => {
        this.error = 'Failed to load orders.';
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
    this.formData = { ...order };
    // Handle date formatting if it comes as a full ISO string
    if (this.formData.orderDate && this.formData.orderDate.length > 10) {
      this.formData.orderDate = this.formData.orderDate.slice(0, 10);
    }
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
      },
      error: (err) => {
        this.toast.error('Failed to delete order.');
        this.cancelDelete();
      }
    });
  }
}
