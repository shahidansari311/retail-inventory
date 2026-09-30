import { Component, OnInit , ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PurchaseOrderService } from '../../services/purchase-order';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-purchase-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './purchase-orders.html',
  styleUrls: ['./purchase-orders.scss']
})
export class PurchaseOrders implements OnInit {
  purchaseOrders: any[] = [];
  loading = false;
  saving = false;
  error = '';

  showForm = false;
  editingPO: any = null;
  formData: any = { supplierId: null, orderDate: '', status: 'PENDING', totalAmount: 0 };
  formError = '';

  deleteTarget: any = null;
  deleteConfirming = false;

  constructor(private poService: PurchaseOrderService, private toast: ToastService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadPOs(); }

  loadPOs() {
    this.loading = true;
    this.error = '';
    this.poService.getAll().subscribe({
      next: (data) => { this.purchaseOrders = data; this.loading = false; },
      error: (err) => {
        this.error = 'Failed to load purchase orders.';
        this.loading = false;
        this.toast.error(this.error);
      }
    });
  }

  openAddForm() {
    this.editingPO = null;
    this.formData = { supplierId: null, orderDate: new Date().toISOString().slice(0,10), status: 'PENDING', totalAmount: 0 };
    this.formError = '';
    this.showForm = true;
  }

  editPO(po: any) {
    this.editingPO = po;
    this.formData = { ...po };
    this.formError = '';
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingPO = null;
    this.formError = '';
  }

  savePO() {
    this.saving = true;
    this.formError = '';
    const action = this.editingPO
      ? this.poService.update(this.editingPO.id, this.formData)
      : this.poService.create(this.formData);

    action.subscribe({
      next: () => {
        this.toast.success(this.editingPO ? 'Purchase Order updated!' : 'Purchase Order created!');
        this.loadPOs();
        this.closeForm();
        this.saving = false;
      },
      error: (err) => {
        this.formError = err.error?.message || 'Failed to save purchase order.';
        this.toast.error(this.formError);
        this.saving = false;
      }
    });
  }

  confirmDelete(po: any) {
    this.deleteTarget = po;
    this.deleteConfirming = true;
  }

  cancelDelete() {
    this.deleteTarget = null;
    this.deleteConfirming = false;
  }

  executeDelete() {
    if (!this.deleteTarget) return;
    this.poService.delete(this.deleteTarget.id).subscribe({
      next: () => {
        this.toast.success('Purchase Order deleted successfully.');
        this.loadPOs();
        this.cancelDelete();
      },
      error: (err) => {
        this.toast.error('Failed to delete purchase order.');
        this.cancelDelete();
      }
    });
  }
}
