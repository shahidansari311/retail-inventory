import { Component, OnInit , ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PurchaseOrderService } from '../../services/purchase-order';
import { SupplierService } from '../../services/supplier';
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
  suppliers: any[] = [];
  loading = false;
  saving = false;
  error = '';

  showForm = false;
  editingPO: any = null;
  formData: any = { supplierId: null, orderDate: '', status: 'PENDING', totalAmount: 0 };
  formError = '';

  deleteTarget: any = null;
  deleteConfirming = false;

  constructor(
    private poService: PurchaseOrderService,
    private supplierService: SupplierService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { 
    this.loadPOs(); 
    this.loadSuppliers();
  }

  loadPOs() {
    this.loading = true;
    this.error = '';
    this.poService.getAll().subscribe({
      next: (data) => { this.purchaseOrders = Array.isArray(data) ? data : []; this.loading = false; this.cdr.detectChanges(); },
      error: (err) => {
        this.error = err.status === 401 ? 'Your session has expired. Please log in again.'
                   : err.status === 403 ? 'You do not have permission to view purchase orders.'
                   : err.status === 0 ? 'Cannot reach the server. Check your internet and try again.'
                   : 'We could not load purchase orders. Please try again.';
        this.loading = false;
        this.toast.error(this.error);
        this.cdr.detectChanges();
      }
    });
  }

  loadSuppliers() {
    this.supplierService.getAll().subscribe({
      next: (data) => { this.suppliers = data; this.cdr.detectChanges(); },
      error: (err) => { console.error('Failed to load suppliers', err); }
    });
  }

  openAddForm() {
    this.editingPO = null;
    this.formData = { supplierId: null, orderDate: new Date().toISOString().slice(0,10), status: 'PENDING', totalAmount: 0 };
    this.formError = '';
    this.showForm = true;
    this.cdr.detectChanges();
  }

  editPO(po: any) {
    this.editingPO = po;
    this.formData = {
      supplierId: po.supplier?.id ?? po.supplierId ?? null,
      orderDate: po.orderDate ? String(po.orderDate).slice(0, 10) : '',
      status: po.status ?? 'PENDING',
      totalAmount: po.totalAmount ?? 0,
      items: po.items ?? []
    };
    this.formError = '';
    this.showForm = true;
    this.cdr.detectChanges();
  }

  closeForm() {
    this.showForm = false;
    this.editingPO = null;
    this.formError = '';
    this.cdr.detectChanges();
  }

  savePO() {
    if (!this.formData.supplierId) {
      this.formError = 'Please select a supplier.';
      this.toast.warning(this.formError);
      this.cdr.detectChanges();
      return;
    }
    this.saving = true;
    this.formError = '';

    const payload = { ...this.formData };
    if (payload.orderDate && payload.orderDate.length === 10) {
      payload.orderDate = payload.orderDate + 'T00:00:00';
    }

    // Map supplierId to supplier object
    if (payload.supplierId) {
      payload.supplier = { id: Number(payload.supplierId) };
      delete payload.supplierId;
    }
    if (!payload.items) {
      payload.items = [];
    }

    const action = this.editingPO
      ? this.poService.update(this.editingPO.id, payload)
      : this.poService.create(payload);

    action.subscribe({
      next: () => {
        this.toast.success(this.editingPO ? 'Purchase Order updated!' : 'Purchase Order created!');
        this.loadPOs();
        this.closeForm();
        this.saving = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        let msg = err.error?.message || 'Failed to save purchase order.';
        if (msg.includes('JSON parse error') || msg.includes('DateTimeParseException')) {
          msg = 'Invalid date format provided. Please select a valid date.';
        } else if (msg.length > 100) {
          msg = 'A server error occurred while saving the purchase order. Please check your inputs.';
        }
        this.formError = msg;
        this.toast.error(msg);
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  getSupplierLabel(po: any): string {
    if (po?.supplier?.name) return `${po.supplier.name} (ID: ${po.supplier.id})`;
    if (po?.supplier?.id != null) return `Supplier #${po.supplier.id}`;
    if (po?.supplierId != null) {
      const found = this.suppliers.find(s => s.id === po.supplierId);
      return found ? `${found.name} (ID: ${found.id})` : `Supplier #${po.supplierId}`;
    }
    return '—';
  }

  confirmDelete(po: any) {
    this.deleteTarget = po;
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
    this.poService.delete(this.deleteTarget.id).subscribe({
      next: () => {
        this.toast.success('Purchase Order deleted successfully.');
        this.loadPOs();
        this.cancelDelete();
        this.cdr.detectChanges();
      },
      error: (err) => {
        const msg = err.status === 404 ? 'This purchase order was already deleted. Refreshing the list.'
                  : err.status === 403 ? 'You do not have permission to delete purchase orders.'
                  : err.status === 409 ? 'This purchase order is in use and cannot be deleted.'
                  : 'We could not delete this purchase order. Please try again.';
        this.toast.error(msg);
        if (err.status === 404) this.loadPOs();
        this.cancelDelete();
        this.cdr.detectChanges();
      }
    });
  }
}
