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
  formData: any = { name: '', location: '' };
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
    this.formData = { name: '', location: '' };
    this.formError = '';
    this.showForm = true;
    this.cdr.detectChanges();
  }

  editWarehouse(warehouse: any) {
    this.editingWarehouse = warehouse;
    this.formData = { ...warehouse };
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
    if (!this.formData.name?.trim()) return 'Warehouse name is required.';
    if (!this.formData.location?.trim()) return 'Location is required.';
    return '';
  }

  saveWarehouse() {
    const err = this.validateForm();
    if (err) { this.formError = err; this.cdr.detectChanges(); return; }

    this.saving = true;
    this.formError = '';
    const action = this.editingWarehouse
      ? this.warehouseService.update(this.editingWarehouse.id, this.formData)
      : this.warehouseService.create(this.formData);

    action.subscribe({
      next: () => {
        this.toast.success(this.editingWarehouse ? 'Warehouse updated successfully!' : 'Warehouse created successfully!');
        this.loadWarehouses();
        this.closeForm();
        this.saving = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.formError = err.status === 409 ? 'A warehouse with this name already exists.'
                       : err.status === 403 ? 'You do not have permission to do this.'
                       : err.status === 400 ? 'Invalid data. Please check your inputs.'
                       : err.error?.message || 'Failed to save warehouse.';
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
      },
      error: (err) => {
        const msg = err.status === 403 ? 'You do not have permission to delete this warehouse.'
                  : err.status === 404 ? 'Warehouse not found — it may have already been deleted.'
                  : err.status === 409 ? 'Cannot delete warehouse because it is in use.'
                  : 'Failed to delete warehouse.';
        this.toast.error(msg);
        this.deleteTarget = null;
        this.cdr.detectChanges();
      }
    });
  }
}
