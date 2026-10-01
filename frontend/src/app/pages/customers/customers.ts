import { Component, OnInit , ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../services/customer';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.html',
  styleUrls: ['./customers.scss']
})
export class Customers implements OnInit {
  customers: any[] = [];
  loading = false;
  saving = false;
  error = '';

  showForm = false;
  editingCustomer: any = null;
  formData: any = { name: '', email: '', phone: '', address: '' };
  formError = '';

  deleteTarget: any = null;
  deleteConfirming = false;

  constructor(private customerService: CustomerService, private toast: ToastService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadCustomers(); }

  loadCustomers() {
    this.loading = true;
    this.error = '';
    this.customerService.getAll().subscribe({
      next: (data) => { this.customers = Array.isArray(data) ? data : []; this.loading = false; this.cdr.detectChanges(); },
      error: (err) => {
        this.error = 'We could not load customers. Please try again.';
        this.loading = false;
        this.toast.error(this.error);
        this.cdr.detectChanges();
      }
    });
  }

  openAddForm() {
    this.editingCustomer = null;
    this.formData = { name: '', email: '', phone: '', address: '' };
    this.formError = '';
    this.showForm = true;
    this.cdr.detectChanges();
  }

  editCustomer(customer: any) {
    this.editingCustomer = customer;
    this.formData = { ...customer };
    this.formError = '';
    this.showForm = true;
    this.cdr.detectChanges();
  }

  closeForm() {
    this.showForm = false;
    this.editingCustomer = null;
    this.formError = '';
    this.cdr.detectChanges();
  }

  saveCustomer() {
    this.saving = true;
    this.formError = '';
    const action = this.editingCustomer
      ? this.customerService.update(this.editingCustomer.id, this.formData)
      : this.customerService.create(this.formData);

    action.subscribe({
      next: () => {
        this.toast.success(this.editingCustomer ? 'Customer updated!' : 'Customer created!');
        this.loadCustomers();
        this.closeForm();
        this.saving = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.formError = err.error?.message || 'We could not save this customer. Please check your inputs and try again.';
        this.toast.error(this.formError);
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmDelete(customer: any) {
    this.deleteTarget = customer;
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
    this.customerService.delete(this.deleteTarget.id).subscribe({
      next: () => {
        this.toast.success('Customer deleted successfully.');
        this.loadCustomers();
        this.cancelDelete();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toast.error(err.status===404?'This customer was already deleted. Refreshing the list.':err.status===403?'You do not have permission to delete customers.':'We could not delete this customer. Please try again.');
        this.cancelDelete();
      }
    });
  }
}
