import { Component, OnInit , ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockMovementService } from '../../services/stock-movement';
import { ProductService } from '../../services/product';
import { WarehouseService } from '../../services/warehouse';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-stock-movements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-movements.html',
  styleUrls: ['./stock-movements.scss']
})
export class StockMovements implements OnInit {
  movements: any[] = [];
  products: any[] = [];
  warehouses: any[] = [];
  loading = false;
  saving = false;
  error = '';

  showForm = false;
  formData: any = { productId: null, warehouseId: null, movementType: 'IN', quantity: 1, reason: '' };
  formError = '';

  constructor(
    private movementService: StockMovementService,
    private productService: ProductService,
    private warehouseService: WarehouseService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { 
    this.loadMovements(); 
    this.loadProducts();
    this.loadWarehouses();
  }

  loadMovements() {
    this.loading = true;
    this.error = '';
    this.movementService.getAll().subscribe({
      next: (data) => { this.movements = Array.isArray(data) ? data : []; this.loading = false; this.cdr.detectChanges(); },
      error: (err) => {
        this.error = err.status === 401 ? 'Your session has expired. Please log in again.'
                   : err.status === 403 ? 'You do not have permission to view stock movements.'
                   : err.status === 0 ? 'Cannot reach the server. Check your internet and try again.'
                   : 'We could not load stock movements. Please try again.';
        this.loading = false;
        this.toast.error(this.error);
        this.cdr.detectChanges();
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
    this.formData = { productId: null, warehouseId: null, movementType: 'IN', quantity: 1, reason: '' };
    this.formError = '';
    this.showForm = true;
    this.cdr.detectChanges();
  }

  closeForm() {
    this.showForm = false;
    this.formError = '';
    this.cdr.detectChanges();
  }

  getMovementType(m: any): string {
    return m?.movementType ?? m?.type ?? '—';
  }

  getProductLabel(m: any): string {
    if (m?.product?.name) return `${m.product.name} (ID: ${m.product.id})`;
    if (m?.product?.id != null) return `#${m.product.id}`;
    if (m?.productId != null) {
      const found = this.products.find(p => p.id === m.productId);
      return found ? `${found.name} (ID: ${found.id})` : `#${m.productId}`;
    }
    return '—';
  }

  getWarehouseLabel(m: any): string {
    if (m?.warehouse?.name) return `${m.warehouse.name} (ID: ${m.warehouse.id})`;
    if (m?.warehouse?.id != null) return `Warehouse #${m.warehouse.id}`;
    if (m?.warehouseId != null) {
      const found = this.warehouses.find(w => w.id === m.warehouseId);
      return found ? `${found.name} (ID: ${found.id})` : `Warehouse #${m.warehouseId}`;
    }
    return '—';
  }

  saveMovement() {
    if (this.formData.productId == null) {
      this.formError = 'Please select a product.';
      this.toast.warning(this.formError);
      this.cdr.detectChanges();
      return;
    }
    if (this.formData.warehouseId == null) {
      this.formError = 'Please select a warehouse.';
      this.toast.warning(this.formError);
      this.cdr.detectChanges();
      return;
    }
    if (!this.formData.quantity || Number(this.formData.quantity) < 1) {
      this.formError = 'Quantity must be at least 1.';
      this.cdr.detectChanges();
      return;
    }
    this.saving = true;
    this.formError = '';
    
    const payload = {
      product: { id: Number(this.formData.productId) },
      warehouse: { id: Number(this.formData.warehouseId) },
      type: this.formData.movementType,
      movementType: this.formData.movementType,
      quantity: Number(this.formData.quantity),
      reason: this.formData.reason?.trim() || null
    };

    this.movementService.create(payload).subscribe({
      next: () => {
        this.toast.success('Stock movement recorded successfully!');
        this.loadMovements();
        this.closeForm();
        this.saving = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.formError = err.error?.message || 'We could not record this movement. Please check your inputs and try again.';
        this.toast.error(this.formError);
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }
}
