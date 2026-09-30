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
      next: (data) => { this.movements = data; this.loading = false; this.cdr.detectChanges(); },
      error: (err) => {
        this.error = 'Failed to load stock movements.';
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

  saveMovement() {
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

    this.movementService.create(payload).subscribe({
      next: () => {
        this.toast.success('Stock movement recorded successfully!');
        this.loadMovements();
        this.closeForm();
        this.saving = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.formError = err.error?.message || 'Failed to record stock movement.';
        this.toast.error(this.formError);
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }
}
