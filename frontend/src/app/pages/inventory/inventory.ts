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
        this.inventoryItems = Array.isArray(data) ? data : []; 
        this.loading = false; 
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = this.friendlyLoadError(err, 'inventory');
        this.loading = false;
        this.cdr.detectChanges();
        this.toast.error(this.error);
      }
    });
  }

  getProductLabel(item: any): string {
    if (item?.product?.name) return `${item.product.name} (ID: ${item.product.id})`;
    if (item?.product?.id != null) return `Product #${item.product.id}`;
    if (item?.productId != null) {
      const found = this.products.find(p => p.id === item.productId);
      return found ? `${found.name} (ID: ${found.id})` : `Product #${item.productId}`;
    }
    return '—';
  }

  getWarehouseLabel(item: any): string {
    if (item?.warehouse?.name) return `${item.warehouse.name} (ID: ${item.warehouse.id})`;
    if (item?.warehouse?.id != null) return `Warehouse #${item.warehouse.id}`;
    if (item?.warehouseId != null) {
      const found = this.warehouses.find(w => w.id === item.warehouseId);
      return found ? `${found.name} (ID: ${found.id})` : `Warehouse #${item.warehouseId}`;
    }
    return '—';
  }

  friendlyLoadError(err: any, what: string): string {
    if (err.status === 401) return 'Your session has expired. Please log in again.';
    if (err.status === 403) return `You do not have permission to view ${what}. Please ask your manager.`;
    if (err.status === 0) return 'Cannot reach the server. Check your internet and try again.';
    if (err.status === 404) return `We could not find ${what}. It may have been removed.`;
    if (err.status >= 500) return 'Our server is having trouble right now. Please try again in a moment.';
    return `We could not load ${what}. Please try again.`;
  }

  friendlySaveError(err: any): string {
    if (err.status === 400 || err.status === 409) return err.error?.message || 'Please check your inputs and try again.';
    if (err.status === 403) return 'You do not have permission to do this. Please ask your manager.';
    if (err.status === 404) return 'This record no longer exists. Please refresh the list.';
    if (err.status === 0) return 'Cannot reach the server. Check your internet and try again.';
    if (err.status >= 500) return 'Our server is having trouble saving. Please try again in a moment.';
    return err.error?.message || 'We could not save. Please check your inputs and try again.';
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
    this.formData = {
      productId: item.product?.id ?? item.productId ?? null,
      warehouseId: item.warehouse?.id ?? item.warehouseId ?? null,
      quantity: item.quantity ?? 0,
      reorderLevel: item.reorderLevel ?? null
    };
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
    if (this.formData.productId == null) return 'Please select a product.';
    if (this.formData.warehouseId == null) return 'Please select a warehouse.';
    if (this.formData.quantity == null || this.formData.quantity < 0) return 'Quantity cannot be negative. Please enter 0 or more.';
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
        this.toast.success(this.editingInventory ? 'Inventory updated successfully!' : 'Inventory record added successfully!');
        this.loadInventory();
        this.closeForm();
        this.saving = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.formError = this.friendlySaveError(err);
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
        this.cdr.detectChanges();
      },
      error: (err) => {
        const msg = err.status === 403 ? 'You do not have permission to delete this. Please ask your manager.'
                  : err.status === 404 ? 'This record was already deleted. Refreshing the list.'
                  : err.status === 409 ? 'This record is in use and cannot be deleted.'
                  : err.status === 0 ? 'Cannot reach the server. Check your internet and try again.'
                  : 'We could not delete this record. Please try again.';
        this.toast.error(msg);
        if (err.status === 404) this.loadInventory();
        this.deleteTarget = null;
        this.cdr.detectChanges();
      }
    });
  }
}
