import { Component, OnInit , ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WarehouseService } from '../../services/warehouse';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-warehouses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './warehouses.html',
  styleUrls: ['./warehouses.scss']
})
export class Warehouses implements OnInit {
  warehouses: any[] = [];
  loading = false;
  saving = false;
  error = '';

  showForm = false;
  editingWarehouse: any = null;
  formData: any = { name: '', location: '', capacity: null };
  formError = '';

  deleteTarget: any = null;
  deleteConfirming = false;

  constructor(
    private warehouseService: WarehouseService,
    private toast: ToastService
  , private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadWarehouses(); }

  loadWarehouses() {
    this.loading = true;
    this.error = '';
    this.warehouseService.getAll().subscribe({
      next: (data) => { this.warehouses = data; this.loading = false; this.cdr.detectChanges(); },
      error: (err) => {
        this.error = err.status === 401 ? 'Session expired. Please log in again.'
                   : err.status === 403 ? 'You do not have permission to view warehouses.'
                   : err.status === 0   ? 'Cannot reach server. Check your connection.'
                   : 'Failed to load warehouses.';
        this.loading = false;
        this.toast.error(this.error);
        this.cdr.detectChanges();
      }
    });
  }

  openAddForm() {
    this.editingWarehouse = null;
    this.formData = { name: '', location: '', capacity: null };
    this.formError = '';
    this.showForm = true;
    this.cdr.detectChanges();
  }

  editWarehouse(warehouse: any) {
    this.editingWarehouse = warehouse;
    this.formData = { name: warehouse.name ?? '', location: warehouse.location ?? '', capacity: warehouse.capacity ?? null };
    this.formError = '';
    this.showForm = true;
    this.cdr.detectChanges();
  }

  closeForm() {
    this.showForm = false;
    this.editingWarehouse = null;
    this.formError = '';
    this.cdr.detectChanges();
  }

  validateForm(): string {
    if (!this.formData.name?.trim()) return 'Please enter a warehouse name.';
    if (!this.formData.location?.trim()) return 'Please enter a location.';
    if (this.formData.capacity != null && Number(this.formData.capacity) < 0) return 'Capacity cannot be negative.';
    return '';
  }

  saveWarehouse() {
    const err = this.validateForm();
    if (err) { this.formError = err; this.toast.warning(err); this.cdr.detectChanges(); return; }

    this.saving = true;
    this.formError = '';
    const payload: any = {
      name: this.formData.name?.trim(),
      location: this.formData.location?.trim(),
      capacity: this.formData.capacity != null && this.formData.capacity !== '' ? Number(this.formData.capacity) : null
    };
    const action = this.editingWarehouse
      ? this.warehouseService.update(this.editingWarehouse.id, payload)
      : this.warehouseService.create(payload);

    action.subscribe({
      next: () => {
        this.toast.success(this.editingWarehouse ? 'Warehouse updated successfully!' : 'Warehouse added successfully!');
        this.loadWarehouses();
        this.closeForm();
        this.saving = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.formError = err.error?.message || (err.status === 403 ? 'You do not have permission to do this. Please ask your manager.'
                       : err.status === 0 ? 'Cannot reach the server. Check your internet and try again.'
                       : 'We could not save this warehouse. Please try again.');
        this.toast.error(this.formError);
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmDelete(warehouse: any) {
    this.deleteTarget = warehouse;
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
    const id = this.deleteTarget.id;
    const name = this.deleteTarget.name;
    this.deleteConfirming = false;
    this.warehouseService.delete(id).subscribe({
      next: () => {
        this.toast.success(`"${name}" deleted successfully.`);
        this.loadWarehouses();
        this.deleteTarget = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        const msg = err.status === 403 ? 'You do not have permission to delete warehouses.'
                  : err.status === 404 ? 'This warehouse was already deleted. Refreshing the list.'
                  : err.status === 409 ? 'This warehouse is used by inventory and cannot be deleted.'
                  : 'We could not delete this warehouse. Please try again.';
        this.toast.error(msg);
        if (err.status === 404) this.loadWarehouses();
        this.deleteTarget = null;
        this.cdr.detectChanges();
      }
    });
  }
}
