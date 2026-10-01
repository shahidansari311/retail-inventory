import { Component, OnInit , ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupplierService } from '../../services/supplier';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './suppliers.html',
  styleUrls: ['./suppliers.scss']
})
export class Suppliers implements OnInit {
  suppliers: any[] = [];
  loading = false;
  saving = false;
  error = '';

  showForm = false;
  editingSupplier: any = null;
  formData: any = { name: '', contactEmail: '', contactPhone: '', address: '' };
  formError = '';

  deleteTarget: any = null;
  deleteConfirming = false;

  constructor(private supplierService: SupplierService, private toast: ToastService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadSuppliers(); }

  loadSuppliers() {
    this.loading = true;
    this.error = '';
    this.supplierService.getAll().subscribe({
      next: (data) => { this.suppliers = Array.isArray(data) ? data : []; this.loading = false; this.cdr.detectChanges(); },
      error: (err) => {
        this.error = 'We could not load suppliers. Please try again.';
        this.loading = false;
        this.toast.error(this.error);
        this.cdr.detectChanges();
      }
    });
  }

  openAddForm() {
    this.editingSupplier = null;
    this.formData = { name: '', contactEmail: '', contactPhone: '', address: '' };
    this.formError = '';
    this.showForm = true;
    this.cdr.detectChanges();
  }

  editSupplier(supplier: any) {
    this.editingSupplier = supplier;
    this.formData = { ...supplier };
    this.formError = '';
    this.showForm = true;
    this.cdr.detectChanges();
  }

  closeForm() {
    this.showForm = false;
    this.editingSupplier = null;
    this.formError = '';
    this.cdr.detectChanges();
  }

  saveSupplier() {
    this.saving = true;
    this.formError = '';
    const action = this.editingSupplier
      ? this.supplierService.update(this.editingSupplier.id, this.formData)
      : this.supplierService.create(this.formData);

    action.subscribe({
      next: () => {
        this.toast.success(this.editingSupplier ? 'Supplier updated!' : 'Supplier created!');
        this.loadSuppliers();
        this.closeForm();
        this.saving = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.formError = err.error?.message || 'We could not save this supplier. Please check your inputs and try again.';
        this.toast.error(this.formError);
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmDelete(supplier: any) {
    this.deleteTarget = supplier;
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
    this.supplierService.delete(this.deleteTarget.id).subscribe({
      next: () => {
        this.toast.success('Supplier deleted successfully.');
        this.loadSuppliers();
        this.cancelDelete();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toast.error(err.status===404?'This supplier was already deleted. Refreshing the list.':err.status===403?'You do not have permission to delete suppliers.':'We could not delete this supplier. Please try again.');
        this.cancelDelete();
      }
    });
  }
}
