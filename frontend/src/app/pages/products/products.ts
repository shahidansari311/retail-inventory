import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product';
import { CategoryService } from '../../services/category';
import { SupplierService } from '../../services/supplier';
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
  categories: any[] = [];
  suppliers: any[] = [];
  loading = false;
  saving = false;
  error = '';

  showForm = false;
  editingProduct: any = null;
  formData: any = { name: '', description: '', sku: '', price: 0, quantity: 0, categoryId: null, supplierId: null };
  formError = '';

  // Delete confirmation
  deleteTarget: any = null;
  deleteConfirming = false;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private supplierService: SupplierService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.loadProducts(); this.loadCategories(); this.loadSuppliers(); }

  loadCategories() {
    this.categoryService.getAll().subscribe({
      next: (data) => { this.categories = Array.isArray(data) ? data : []; this.cdr.detectChanges(); },
      error: () => { this.categories = []; }
    });
  }

  loadSuppliers() {
    this.supplierService.getAll().subscribe({
      next: (data) => { this.suppliers = Array.isArray(data) ? data : []; this.cdr.detectChanges(); },
      error: () => { this.suppliers = []; }
    });
  }

  getCategoryLabel(p: any): string {
    return p?.category?.name ?? p?.categoryName ?? '—';
  }

  getSupplierLabel(p: any): string {
    return p?.supplier?.name ?? p?.supplierName ?? '—';
  }

  loadProducts() {
    this.loading = true;
    this.error = '';
    this.productService.getAll().subscribe({
      next: (data) => { 
        this.products = Array.isArray(data) ? data : []; 
        this.loading = false; 
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.status === 401 ? 'Your session has expired. Please log in again.'
                   : err.status === 403 ? 'You do not have permission to view products.'
                   : err.status === 0 ? 'Cannot reach the server. Check your internet and try again.'
                   : 'We could not load products. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
        this.toast.error(this.error);
      }
    });
  }

  openAddForm() {
    this.editingProduct = null;
    this.formData = { name: '', description: '', sku: '', price: 0, quantity: 0, categoryId: null, supplierId: null };
    this.formError = '';
    this.showForm = true;
    this.cdr.detectChanges();
  }

  editProduct(product: any) {
    this.editingProduct = product;
    this.formData = {
      name: product.name ?? '',
      description: product.description ?? '',
      sku: product.sku ?? '',
      price: product.price ?? 0,
      quantity: product.quantity ?? 0,
      categoryId: product.category?.id ?? product.categoryId ?? null,
      supplierId: product.supplier?.id ?? product.supplierId ?? null
    };
    this.formError = '';
    this.showForm = true;
    this.cdr.detectChanges();
  }

  closeForm() {
    this.showForm = false;
    this.editingProduct = null;
    this.formError = '';
    this.cdr.detectChanges();
  }

  validateForm(): string {
    if (!this.formData.name?.trim()) return 'Please enter a product name.';
    if (!this.formData.sku?.trim())  return 'Please enter a SKU (e.g. WM-001).';
    if (this.formData.price == null || Number(this.formData.price) < 0) return 'Price cannot be negative. Please enter 0 or more.';
    if (this.formData.quantity == null || Number(this.formData.quantity) < 0) return 'Quantity cannot be negative. Please enter 0 or more.';
    return '';
  }

  saveProduct() {
    const err = this.validateForm();
    if (err) { this.formError = err; this.toast.warning(err); this.cdr.detectChanges(); return; }

    this.saving = true;
    this.formError = '';
    const payload: any = {
      name: this.formData.name?.trim(),
      description: this.formData.description?.trim() || null,
      sku: this.formData.sku?.trim(),
      price: Number(this.formData.price),
      quantity: Number(this.formData.quantity)
    };
    if (this.formData.categoryId) payload.category = { id: Number(this.formData.categoryId) };
    if (this.formData.supplierId) payload.supplier = { id: Number(this.formData.supplierId) };
    const action = this.editingProduct
      ? this.productService.update(this.editingProduct.id, payload)
      : this.productService.create(payload);

    action.subscribe({
      next: () => {
        this.toast.success(this.editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
        this.loadProducts();
        this.closeForm();
        this.saving = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.formError = err.status === 409 ? 'A product with this SKU already exists. Please use a different SKU.'
                       : err.status === 403 ? 'You do not have permission to do this. Please ask your manager.'
                       : err.status === 400 ? (err.error?.message || 'Please check your inputs and try again.')
                       : err.status === 0 ? 'Cannot reach the server. Check your internet and try again.'
                       : (err.error?.message || 'We could not save this product. Please try again.');
        this.toast.error(this.formError);
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmDelete(product: any) {
    this.deleteTarget = product;
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
    this.productService.delete(id).subscribe({
      next: () => {
        this.toast.success(`"${name}" deleted successfully.`);
        this.loadProducts();
        this.deleteTarget = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        const msg = err.status === 403 ? 'You do not have permission to delete products.'
                  : err.status === 404 ? 'This product was already deleted. Refreshing the list.'
                  : err.status === 409 ? 'This product is used in inventory or orders, so it cannot be deleted.'
                  : err.status === 0 ? 'Cannot reach the server. Check your internet and try again.'
                  : 'We could not delete this product. Please try again.';
        this.toast.error(msg);
        if (err.status === 404) this.loadProducts();
        this.deleteTarget = null;
        this.cdr.detectChanges();
      }
    });
  }
}
