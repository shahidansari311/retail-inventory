import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.html',
  styleUrls: ['./products.scss']
})
export class Products implements OnInit {
  products: any[] = [];
  loading = false;
  saving = false;
  error = '';

  showForm = false;
  editingProduct: any = null;
  formData: any = { name: '', description: '', sku: '', price: 0, quantity: 0 };
  formError = '';

  // Delete confirmation
  deleteTarget: any = null;
  deleteConfirming = false;

  constructor(
    private productService: ProductService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.loadProducts(); }

  loadProducts() {
    this.loading = true;
    this.error = '';
    this.productService.getAll().subscribe({
      next: (data) => { 
        this.products = data; 
        this.loading = false; 
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.status === 401 ? 'Session expired. Please log in again.'
                   : err.status === 403 ? 'You do not have permission to view products.'
                   : err.status === 0   ? 'Cannot reach server. Check your connection.'
                   : 'Failed to load products.';
        this.loading = false;
        this.cdr.detectChanges();
        this.toast.error(this.error);
      }
    });
  }

  openAddForm() {
    this.editingProduct = null;
    this.formData = { name: '', description: '', sku: '', price: 0, quantity: 0 };
    this.formError = '';
    this.showForm = true;
  }

  editProduct(product: any) {
    this.editingProduct = product;
    this.formData = { ...product };
    this.formError = '';
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingProduct = null;
    this.formError = '';
  }

  validateForm(): string {
    if (!this.formData.name?.trim()) return 'Product name is required.';
    if (!this.formData.sku?.trim())  return 'SKU is required.';
    if (this.formData.price < 0)     return 'Price cannot be negative.';
    if (this.formData.quantity < 0)  return 'Quantity cannot be negative.';
    return '';
  }

  saveProduct() {
    const err = this.validateForm();
    if (err) { this.formError = err; return; }

    this.saving = true;
    this.formError = '';
    const action = this.editingProduct
      ? this.productService.update(this.editingProduct.id, this.formData)
      : this.productService.create(this.formData);

    action.subscribe({
      next: () => {
        this.toast.success(this.editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
        this.loadProducts();
        this.closeForm();
        this.saving = false;
      },
      error: (err) => {
        this.formError = err.status === 409 ? 'A product with this SKU already exists.'
                       : err.status === 403 ? 'You do not have permission to do this.'
                       : err.status === 400 ? 'Invalid data. Please check your inputs.'
                       : err.error?.message || 'Failed to save product.';
        this.toast.error(this.formError);
        this.saving = false;
      }
    });
  }

  confirmDelete(product: any) {
    this.deleteTarget = product;
    this.deleteConfirming = true;
  }

  cancelDelete() {
    this.deleteTarget = null;
    this.deleteConfirming = false;
  }

  executeDelete() {
    if (!this.deleteTarget) return;
    const id = this.deleteTarget.id;
    const name = this.deleteTarget.name;
    this.deleteConfirming = false;
    this.productService.delete(id).subscribe({
      next: () => {
        this.toast.success(`"${name}" deleted successfully.`);
        this.loadProducts();
        this.deleteTarget = null;
      },
      error: (err) => {
        const msg = err.status === 403 ? 'You do not have permission to delete this product.'
                  : err.status === 404 ? 'Product not found — it may have already been deleted.'
                  : 'Failed to delete product.';
        this.toast.error(msg);
        this.deleteTarget = null;
      }
    });
  }
}
