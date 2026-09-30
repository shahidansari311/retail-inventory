import { Component, OnInit , ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../services/category';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.html',
  styleUrls: ['./categories.scss']
})
export class Categories implements OnInit {
  categories: any[] = [];
  loading = false;
  saving = false;
  error = '';

  showForm = false;
  editingCategory: any = null;
  formData: any = { name: '', description: '' };
  formError = '';

  deleteTarget: any = null;
  deleteConfirming = false;

  constructor(
    private categoryService: CategoryService,
    private toast: ToastService
  , private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadCategories(); }

  loadCategories() {
    this.loading = true;
    this.error = '';
    this.categoryService.getAll().subscribe({
      next: (data) => { this.categories = data; this.loading = false; },
      error: (err) => {
        this.error = err.status === 401 ? 'Session expired. Please log in again.'
                   : err.status === 403 ? 'You do not have permission to view categories.'
                   : err.status === 0   ? 'Cannot reach server. Check your connection.'
                   : 'Failed to load categories.';
        this.loading = false;
        this.toast.error(this.error);
      }
    });
  }

  openAddForm() {
    this.editingCategory = null;
    this.formData = { name: '', description: '' };
    this.formError = '';
    this.showForm = true;
  }

  editCategory(category: any) {
    this.editingCategory = category;
    this.formData = { ...category };
    this.formError = '';
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingCategory = null;
    this.formError = '';
  }

  validateForm(): string {
    if (!this.formData.name?.trim()) return 'Category name is required.';
    return '';
  }

  saveCategory() {
    const err = this.validateForm();
    if (err) { this.formError = err; return; }

    this.saving = true;
    this.formError = '';
    const action = this.editingCategory
      ? this.categoryService.update(this.editingCategory.id, this.formData)
      : this.categoryService.create(this.formData);

    action.subscribe({
      next: () => {
        this.toast.success(this.editingCategory ? 'Category updated successfully!' : 'Category created successfully!');
        this.loadCategories();
        this.closeForm();
        this.saving = false;
      },
      error: (err) => {
        this.formError = err.status === 409 ? 'A category with this name already exists.'
                       : err.status === 403 ? 'You do not have permission to do this.'
                       : err.status === 400 ? 'Invalid data. Please check your inputs.'
                       : err.error?.message || 'Failed to save category.';
        this.toast.error(this.formError);
        this.saving = false;
      }
    });
  }

  confirmDelete(category: any) {
    this.deleteTarget = category;
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
    this.categoryService.delete(id).subscribe({
      next: () => {
        this.toast.success(`"${name}" deleted successfully.`);
        this.loadCategories();
        this.deleteTarget = null;
      },
      error: (err) => {
        const msg = err.status === 403 ? 'You do not have permission to delete this category.'
                  : err.status === 404 ? 'Category not found — it may have already been deleted.'
                  : err.status === 409 ? 'Cannot delete category because it is in use.'
                  : 'Failed to delete category.';
        this.toast.error(msg);
        this.deleteTarget = null;
      }
    });
  }
}
