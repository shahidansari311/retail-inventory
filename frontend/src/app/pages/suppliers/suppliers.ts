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
      next: (data) => { this.suppliers = data; this.loading = false; },
      error: (err) => {
        this.error = 'Failed to load suppliers.';
        this.loading = false;
        this.toast.error(this.error);
      }
    });
  }

  openAddForm() {
    this.editingSupplier = null;
    this.formData = { name: '', contactEmail: '', contactPhone: '', address: '' };
    this.formError = '';
    this.showForm = true;
  }

  editSupplier(supplier: any) {
    this.editingSupplier = supplier;
    this.formData = { ...supplier };
    this.formError = '';
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingSupplier = null;
    this.formError = '';
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
      },
      error: (err) => {
        this.formError = err.error?.message || 'Failed to save supplier.';
        this.toast.error(this.formError);
        this.saving = false;
      }
    });
  }

  confirmDelete(supplier: any) {
    this.deleteTarget = supplier;
    this.deleteConfirming = true;
  }

  cancelDelete() {
    this.deleteTarget = null;
    this.deleteConfirming = false;
  }

  executeDelete() {
    if (!this.deleteTarget) return;
    this.supplierService.delete(this.deleteTarget.id).subscribe({
      next: () => {
        this.toast.success('Supplier deleted successfully.');
        this.loadSuppliers();
        this.cancelDelete();
      },
      error: (err) => {
        this.toast.error('Failed to delete supplier.');
        this.cancelDelete();
      }
    });
  }
}
