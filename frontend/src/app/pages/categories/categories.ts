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
      next: (data) => { this.categories = Array.isArray(data) ? data : []; this.loading = false; this.cdr.detectChanges(); },
      error: (err) => {
        this.error = err.status === 401 ? 'Session expired. Please log in again.'
                   : err.status === 403 ? 'You do not have permission to view categories.'
                   : err.status === 0   ? 'Cannot reach server. Check your connection.'
                   : 'Failed to load categories.';
        this.loading = false;
        this.toast.error(this.error);
        this.cdr.detectChanges();
      }
    });
  }

  openAddForm() {
    this.editingCategory = null;
    this.formData = { name: '', description: '' };
    this.formError = '';
    this.showForm = true;
    this.cdr.detectChanges();
  }

  editCategory(category: any) {
    this.editingCategory = category;
    this.formData = { ...category };
    this.formError = '';
    this.showForm = true;
    this.cdr.detectChanges();
  }

  closeForm() {
    this.showForm = false;
    this.editingCategory = null;
    this.formError = '';
    this.cdr.detectChanges();
  }

  validateForm(): string {
    if (!this.formData.name?.trim()) return 'Category name is required.';
    return '';
  }

  saveCategory() {
    const err = this.validateForm();
    if (err) { this.formError = err; this.cdr.detectChanges(); return; }

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
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.formError = err.status === 409 ? 'A category with this name already exists.'
                       : err.status === 403 ? 'You do not have permission to do this.'
                       : err.status === 400 ? 'Invalid data. Please check your inputs.'
                       : err.error?.message || 'Failed to save category.';
        this.toast.error(this.formError);
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmDelete(category: any) {
    this.deleteTarget = category;
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
    this.categoryService.delete(id).subscribe({
      next: () => {
        this.toast.success(`"${name}" deleted successfully.`);
        this.loadCategories();
        this.deleteTarget = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        const msg = err.status === 403 ? 'You do not have permission to delete categories.'
                  : err.status === 404 ? 'This category was already deleted. Refreshing the list.'
                  : err.status === 409 ? 'This category is used by products and cannot be deleted.'
                  : 'We could not delete this category. Please try again.';
        this.toast.error(msg);
        if (err.status === 404) this.loadCategories();
        this.deleteTarget = null;
        this.cdr.detectChanges();
      }
    });
  }
}
