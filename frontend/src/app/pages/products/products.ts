import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product';

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
  error = '';
  
  showForm = false;
  editingProduct: any = null;
  formData: any = { name: '', description: '', sku: '', price: 0, quantity: 0 };

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.error = '';
    this.productService.getAll().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load products';
        this.loading = false;
      }
    });
  }

  openAddForm() {
    this.editingProduct = null;
    this.formData = { name: '', description: '', sku: '', price: 0, quantity: 0 };
    this.showForm = true;
  }

  editProduct(product: any) {
    this.editingProduct = product;
    this.formData = { ...product };
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingProduct = null;
  }

  saveProduct() {
    this.loading = true;
    if (this.editingProduct) {
      this.productService.update(this.editingProduct.id, this.formData).subscribe({
        next: () => {
          this.loadProducts();
          this.closeForm();
        },
        error: (err) => {
          this.error = 'Failed to update product';
          this.loading = false;
        }
      });
    } else {
      this.productService.create(this.formData).subscribe({
        next: () => {
          this.loadProducts();
          this.closeForm();
        },
        error: (err) => {
          this.error = 'Failed to create product';
          this.loading = false;
        }
      });
    }
  }

  deleteProduct(id: number) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.loading = true;
      this.productService.delete(id).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: (err) => {
          this.error = 'Failed to delete product';
          this.loading = false;
        }
      });
    }
  }
}
