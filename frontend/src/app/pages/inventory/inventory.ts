import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../services/inventory';
import { ProductService } from '../../services/product';
import { WarehouseService } from '../../services/warehouse';
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
  products: any[] = [];
  warehouses: any[] = [];
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
    private productService: ProductService,
    private warehouseService: WarehouseService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { 
    this.loadInventory(); 
    this.loadProducts();
    this.loadWarehouses();
  }

  loadInventory() {
    this.loading = true;
    this.error = '';
    this.inventoryService.getAll().subscribe({
      next: (data) => { 
        this.inventoryItems = data; 
        this.loading = false; 
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.status === 401 ? 'Session expired. Please log in again.'
                   : err.status === 403 ? 'You do not have permission to view inventory.'
                   : err.status === 0   ? 'Cannot reach server. Check your connection.'
                   : 'Failed to load inventory.';
        this.loading = false;
        this.cdr.detectChanges();
        this.toast.error(this.error);
      }
    });
  }

  loadProducts() {
    this.productService.getAll().subscribe({
      next: (data) => { this.products = data; this.cdr.detectChanges(); },
      error: (err) => { console.error('Failed to load products', err); }
    });
  }

  loadWarehouses() {
    this.warehouseService.getAll().subscribe({
      next: (data) => { this.warehouses = data; this.cdr.detectChanges(); },
      error: (err) => { console.error('Failed to load warehouses', err); }
    });
  }

  openAddForm() {
    this.editingInventory = null;
    this.formData = { productId: null, warehouseId: null, quantity: 0 };
    this.formError = '';
    this.showForm = true;
    this.cdr.detectChanges();
  }

  editInventory(item: any) {
    this.editingInventory = item;
    this.formData = { ...item };
    this.formError = '';
    this.showForm = true;
    this.cdr.detectChanges();
  }

  closeForm() {
    this.showForm = false;
    this.editingInventory = null;
    this.formError = '';
    this.cdr.detectChanges();
  }

  validateForm(): string {
    if (!this.formData.productId) return 'Product ID is required.';
    if (!this.formData.warehouseId) return 'Warehouse ID is required.';
    if (this.formData.quantity < 0) return 'Quantity cannot be negative.';
    return '';
  }

  saveInventory() {
    const err = this.validateForm();
    if (err) { this.formError = err; this.cdr.detectChanges(); return; }

    this.saving = true;
    this.formError = '';
    
    const payload = { ...this.formData };
    if (payload.productId) {
      payload.product = { id: Number(payload.productId) };
      delete payload.productId;
    }
    if (payload.warehouseId) {
      payload.warehouse = { id: Number(payload.warehouseId) };
      delete payload.warehouseId;
    }

    const action = this.editingInventory
      ? this.inventoryService.update(this.editingInventory.id, payload)
      : this.inventoryService.create(payload);

    action.subscribe({
      next: () => {
        this.toast.success(this.editingInventory ? 'Inventory updated successfully!' : 'Inventory created successfully!');
        this.loadInventory();
        this.closeForm();
        this.saving = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.formError = err.status === 403 ? 'You do not have permission to do this.'
                       : err.status === 400 ? 'Invalid data. Please check your inputs.'
                       : err.error?.message || 'Failed to save inventory.';
        this.toast.error(this.formError);
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmDelete(item: any) {
    this.deleteTarget = item;
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
        this.cdr.detectChanges();
      }
    });
  }
}
