import { Component, OnInit , ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../services/inventory';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.html',
  styleUrls: ['./inventory.scss']
})
export class Inventory implements OnInit {
  inventoryItems: any[] = [];
  loading = false;
  saving = false;
  error = '';

  showForm = false;
  editingInventory: any = null;
  formData: any = { productId: null, warehouseId: null, quantity: 0 };
  formError = '';

  deleteTarget: any = null;
  deleteConfirming = false;

  constructor(
    private inventoryService: InventoryService,
    private toast: ToastService
  , private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadInventory(); }

  loadInventory() {
    this.loading = true;
    this.error = '';
    this.inventoryService.getAll().subscribe({
      next: (data) => { this.inventoryItems = data; this.loading = false; },
      error: (err) => {
        this.error = err.status === 401 ? 'Session expired. Please log in again.'
                   : err.status === 403 ? 'You do not have permission to view inventory.'
                   : err.status === 0   ? 'Cannot reach server. Check your connection.'
                   : 'Failed to load inventory.';
        this.loading = false;
        this.toast.error(this.error);
      }
    });
  }

  openAddForm() {
    this.editingInventory = null;
    this.formData = { productId: null, warehouseId: null, quantity: 0 };
    this.formError = '';
    this.showForm = true;
  }

  editInventory(item: any) {
    this.editingInventory = item;
    this.formData = { ...item };
    this.formError = '';
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingInventory = null;
    this.formError = '';
  }

  validateForm(): string {
    if (!this.formData.productId) return 'Product ID is required.';
    if (!this.formData.warehouseId) return 'Warehouse ID is required.';
    if (this.formData.quantity < 0) return 'Quantity cannot be negative.';
    return '';
  }

  saveInventory() {
    const err = this.validateForm();
    if (err) { this.formError = err; return; }

    this.saving = true;
    this.formError = '';
    const action = this.editingInventory
      ? this.inventoryService.update(this.editingInventory.id, this.formData)
      : this.inventoryService.create(this.formData);

    action.subscribe({
      next: () => {
        this.toast.success(this.editingInventory ? 'Inventory updated successfully!' : 'Inventory created successfully!');
        this.loadInventory();
        this.closeForm();
        this.saving = false;
      },
      error: (err) => {
        this.formError = err.status === 403 ? 'You do not have permission to do this.'
                       : err.status === 400 ? 'Invalid data. Please check your inputs.'
                       : err.error?.message || 'Failed to save inventory.';
        this.toast.error(this.formError);
        this.saving = false;
      }
    });
  }

  confirmDelete(item: any) {
    this.deleteTarget = item;
    this.deleteConfirming = true;
  }

  cancelDelete() {
    this.deleteTarget = null;
    this.deleteConfirming = false;
  }

  executeDelete() {
    if (!this.deleteTarget) return;
    const id = this.deleteTarget.id;
    this.deleteConfirming = false;
    this.inventoryService.delete(id).subscribe({
      next: () => {
        this.toast.success(`Inventory record deleted successfully.`);
        this.loadInventory();
        this.deleteTarget = null;
      },
      error: (err) => {
        const msg = err.status === 403 ? 'You do not have permission to delete this inventory record.'
                  : err.status === 404 ? 'Inventory record not found — it may have already been deleted.'
                  : 'Failed to delete inventory record.';
        this.toast.error(msg);
        this.deleteTarget = null;
      }
    });
  }
}
